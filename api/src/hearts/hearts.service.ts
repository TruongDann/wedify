import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GiftType,
  HeartTopupStatus,
  HeartTransactionKind,
  InvitationStatus,
} from '@prisma/client';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_GIFT_ITEMS,
  DEFAULT_HEART_BUY_VND,
  DEFAULT_HEART_CASHOUT_VND,
  HEART_PACKAGES,
} from './hearts.constants';
import { CreateTopupDto, SendGiftDto } from './dto/hearts.dto';

@Injectable()
export class HeartsService implements OnModuleInit {
  private readonly logger = new Logger(HeartsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // Tao san danh muc qua tang mac dinh neu bang con trong (khong can chay seed).
  async onModuleInit() {
    try {
      const count = await this.prisma.giftItem.count();
      if (count === 0) {
        await this.prisma.giftItem.createMany({ data: DEFAULT_GIFT_ITEMS });
        this.logger.log('Đã tạo danh mục quà tặng mặc định');
      }
    } catch (err) {
      this.logger.warn(`Không thể khởi tạo danh mục quà tặng: ${(err as Error).message}`);
    }
  }

  private get buyRate() {
    return Number(this.config.get('HEART_BUY_VND')) || DEFAULT_HEART_BUY_VND;
  }

  private get cashoutRate() {
    return Number(this.config.get('HEART_CASHOUT_VND')) || DEFAULT_HEART_CASHOUT_VND;
  }

  private get sandboxEnabled() {
    return this.config.get('NODE_ENV') !== 'production' || this.config.get('PAYMENT_SANDBOX') === 'true';
  }

  async catalog() {
    const gifts = await this.prisma.giftItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { code: true, name: true, emoji: true, heartPrice: true, animationType: true },
    });
    return {
      gifts,
      packages: HEART_PACKAGES,
      buyRateVnd: this.buyRate,
      cashoutRateVnd: this.cashoutRate,
    };
  }

  async getMine(userId: string) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    return {
      heartBalance: wallet.heartBalance,
      receivedHearts: wallet.receivedHearts,
      balance: wallet.balance,
      buyRateVnd: this.buyRate,
      cashoutRateVnd: this.cashoutRate,
    };
  }

  // ---- Nap tien mua tim ---------------------------------------------------------------------

  async createTopup(userId: string, dto: CreateTopupDto) {
    const topup = await this.prisma.heartTopup.create({
      data: {
        userId,
        hearts: dto.hearts,
        amountVnd: dto.hearts * this.buyRate,
        paymentCode: `WD${randomBytes(5).toString('hex').toUpperCase()}`,
      },
    });

    const bankName = this.config.get<string>('PLATFORM_BANK_NAME');
    const accountNumber = this.config.get<string>('PLATFORM_BANK_ACCOUNT');
    const accountHolder = this.config.get<string>('PLATFORM_BANK_HOLDER');
    const bank = bankName && accountNumber ? { bankName, accountNumber, accountHolder } : null;

    return {
      ...topup,
      bank,
      qrUrl: bank
        ? `https://img.vietqr.io/image/${encodeURIComponent(bankName!)}-${encodeURIComponent(accountNumber!)}-compact2.png?amount=${topup.amountVnd}&addInfo=${topup.paymentCode}&accountName=${encodeURIComponent(accountHolder ?? '')}`
        : null,
      sandbox: this.sandboxEnabled,
    };
  }

  listTopups(userId: string) {
    return this.prisma.heartTopup.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // Cong tim CHI MOT LAN: updateMany co dieu kien status=PENDING lam khoa idempotent o muc DB
  // (webhook goi lap lai se khong cong lan 2).
  private async settleTopup(where: { id?: string; userId?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const topup = await tx.heartTopup.findFirst({ where });
      if (!topup) throw new NotFoundException('Không tìm thấy đơn nạp');

      const claimed = await tx.heartTopup.updateMany({
        where: { id: topup.id, status: HeartTopupStatus.PENDING },
        data: { status: HeartTopupStatus.PAID, paidAt: new Date() },
      });
      if (claimed.count === 0) return { topup, alreadyPaid: true };

      await tx.wallet.upsert({
        where: { userId: topup.userId },
        update: { heartBalance: { increment: topup.hearts } },
        create: { userId: topup.userId, heartBalance: topup.hearts },
      });
      await tx.heartTransaction.create({
        data: {
          userId: topup.userId,
          kind: HeartTransactionKind.TOPUP,
          hearts: topup.hearts,
          vndAmount: topup.amountVnd,
          refId: topup.id,
        },
      });
      return { topup: { ...topup, status: HeartTopupStatus.PAID }, alreadyPaid: false };
    });
  }

  // CHI cho moi truong thu nghiem: tu xac nhan don nap khi chua tich hop cong thanh toan that.
  async sandboxConfirm(userId: string, topupId: string) {
    if (!this.sandboxEnabled) {
      throw new ForbiddenException('Chế độ thanh toán thử nghiệm đã tắt');
    }
    return this.settleTopup({ id: topupId, userId });
  }

  // Webhook tu cong thanh toan / ngan hang. Bat buoc cau hinh PAYMENT_WEBHOOK_SECRET.
  async handleTopupWebhook(payload: { paymentCode: string; amount: number; signature: string }) {
    const secret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET');
    if (!secret) throw new ServiceUnavailableException('Chưa cấu hình PAYMENT_WEBHOOK_SECRET');

    const expected = createHmac('sha256', secret)
      .update(JSON.stringify({ paymentCode: payload.paymentCode, amount: payload.amount }))
      .digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(String(payload.signature));
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('Chữ ký không hợp lệ');
    }

    const topup = await this.prisma.heartTopup.findUnique({ where: { paymentCode: payload.paymentCode } });
    if (!topup) throw new NotFoundException('Không tìm thấy đơn nạp');
    if (payload.amount < topup.amountVnd) {
      throw new BadRequestException('Số tiền thanh toán không đủ');
    }
    return this.settleTopup({ id: topup.id });
  }

  // ---- Tang qua -----------------------------------------------------------------------------

  async sendGift(userId: string, slug: string, dto: SendGiftDto) {
    const [invitation, item, sender] = await Promise.all([
      this.prisma.invitation.findUnique({ where: { slug } }),
      this.prisma.giftItem.findUnique({ where: { code: dto.giftCode } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ]);
    if (!invitation || invitation.status !== InvitationStatus.PUBLISHED) {
      throw new NotFoundException('Thiệp không tồn tại hoặc chưa được công bố');
    }
    if (!item || !item.isActive) throw new NotFoundException('Quà tặng không tồn tại');
    // Chan tu tang qua cho minh - tranh quay vong "nap tien -> tang -> doi ra tien".
    if (invitation.userId === userId) {
      throw new ForbiddenException('Bạn không thể tự tặng quà cho thiệp của mình');
    }

    const senderName = sender?.name?.trim() || sender?.email?.split('@')[0] || 'Khách';
    const message = dto.message?.trim() || '';

    return this.prisma.$transaction(async (tx) => {
      // Tru tim co dieu kien so du -> an toan khi gui nhieu request dong thoi.
      const debited = await tx.wallet.updateMany({
        where: { userId, heartBalance: { gte: item.heartPrice } },
        data: { heartBalance: { decrement: item.heartPrice } },
      });
      if (debited.count === 0) throw new BadRequestException('Số dư tim không đủ, vui lòng nạp thêm');

      await tx.wallet.upsert({
        where: { userId: invitation.userId },
        update: { receivedHearts: { increment: item.heartPrice } },
        create: { userId: invitation.userId, receivedHearts: item.heartPrice },
      });

      const gift = await tx.gift.create({
        data: {
          invitationId: invitation.id,
          type: GiftType.VIRTUAL_GIFT,
          amount: item.heartPrice * this.cashoutRate,
          hearts: item.heartPrice,
          giftItemId: item.id,
          animationType: item.animationType,
          senderUserId: userId,
          senderName,
          message: message || null,
        },
      });

      const wish = await tx.wish.create({
        data: {
          invitationId: invitation.id,
          guestName: senderName,
          message: message || `Đã tặng ${item.name}`,
          giftCode: item.code,
        },
        select: { id: true, guestName: true, message: true, giftCode: true, createdAt: true },
      });

      await tx.heartTransaction.createMany({
        data: [
          { userId, kind: HeartTransactionKind.GIFT_SENT, hearts: item.heartPrice, refId: gift.id },
          { userId: invitation.userId, kind: HeartTransactionKind.GIFT_RECEIVED, hearts: item.heartPrice, refId: gift.id },
        ],
      });

      const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });
      return { gift, wish, heartBalance: wallet.heartBalance, animationType: item.animationType };
    });
  }

  // ---- Host doi tim nhan duoc ra tien -------------------------------------------------------

  async exchange(userId: string, hearts: number) {
    return this.prisma.$transaction(async (tx) => {
      const debited = await tx.wallet.updateMany({
        where: { userId, receivedHearts: { gte: hearts } },
        data: { receivedHearts: { decrement: hearts } },
      });
      if (debited.count === 0) throw new BadRequestException('Số tim nhận được không đủ để đổi');

      const vnd = hearts * this.cashoutRate;
      await tx.wallet.update({ where: { userId }, data: { balance: { increment: vnd } } });
      await tx.heartTransaction.create({
        data: { userId, kind: HeartTransactionKind.EXCHANGE, hearts, vndAmount: vnd },
      });
      return { exchangedHearts: hearts, vnd, wallet: await tx.wallet.findUniqueOrThrow({ where: { userId } }) };
    });
  }

  history(userId: string) {
    return this.prisma.heartTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

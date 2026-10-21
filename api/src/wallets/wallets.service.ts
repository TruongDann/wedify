import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WithdrawalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async getMyWallet(userId: string) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
      include: { withdrawals: { orderBy: { requestedAt: 'desc' } } },
    });
    return wallet;
  }

  async getMyWithdrawals(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      return [];
    }

    return this.prisma.withdrawal.findMany({
      where: { walletId: wallet.id },
      orderBy: { requestedAt: 'desc' },
    });
  }

  // "Reserve" so tien ngay luc yeu cau (tru khoi balance kha dung) - tranh Host xin rut 2 lan
  // cung 1 khoan tien trong luc cho Admin duyet (muc 3.15: "duyet payout").
  async requestWithdrawal(userId: string, dto: RequestWithdrawalDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < dto.amount) {
      throw new BadRequestException('Số dư ví không đủ để rút');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: dto.amount } },
      });
      return tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          amount: dto.amount,
          bankInfo: dto.bankInfo as never,
          status: WithdrawalStatus.PENDING,
        },
      });
    });
  }

  // ---- Admin (muc 3.15: "Quan ly vi/qua ao va yeu cau rut tien cua Host: duyet payout") ----

  findAllWithdrawals(status?: WithdrawalStatus) {
    return this.prisma.withdrawal.findMany({
      where: status ? { status } : {},
      include: { wallet: { include: { user: { select: { email: true, name: true } } } } },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async updateWithdrawalStatus(id: string, status: WithdrawalStatus) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
    });
    if (!withdrawal) throw new NotFoundException('Không tìm thấy yêu cầu rút tiền');

    // Tu choi -> hoan tien lai vao vi (da tru luc request), cac trang thai khac khong dong den balance.
    if (status === WithdrawalStatus.REJECTED && withdrawal.status !== WithdrawalStatus.REJECTED) {
      await this.prisma.$transaction([
        this.prisma.wallet.update({
          where: { id: withdrawal.walletId },
          data: { balance: { increment: withdrawal.amount } },
        }),
        this.prisma.withdrawal.update({
          where: { id },
          data: { status, processedAt: new Date() },
        }),
      ]);
    } else {
      await this.prisma.withdrawal.update({
        where: { id },
        data: { status, processedAt: new Date() },
      });
    }

    return this.prisma.withdrawal.findUnique({ where: { id } });
  }
}

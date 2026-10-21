import { Injectable } from '@nestjs/common';
import { GiftType } from '@prisma/client';
import { InvitationsService } from '../invitations/invitations.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecordGiftDto } from './dto/record-gift.dto';

@Injectable()
export class GiftsService {
  constructor(
    private prisma: PrismaService,
    private invitationsService: InvitationsService,
  ) {}

  // BANK_QR: tien chuyen THANG vao tai khoan ngan hang rieng cua Host (ngoai he thong) - o day
  // chi luu LAI de Host xem thong ke, KHONG dung vao Wallet (khong phai tien do platform giu ho).
  async recordBankQrGift(invitationId: string, userId: string, dto: RecordGiftDto) {
    await this.invitationsService.assertAccess(invitationId, userId);
    return this.prisma.gift.create({
      data: {
        invitationId,
        guestId: dto.guestId,
        type: GiftType.BANK_QR,
        amount: dto.amount,
      },
    });
  }

  // VIRTUAL_GIFT: khach mua qua ao bang tien that qua cong thanh toan (VNPay/Momo/PayOS...).
  // CHI duoc goi tu webhook cong thanh toan da xac minh chu ky (xem payments-webhook stub) -
  // KHONG duoc expose thanh REST endpoint cho FE goi truc tiep, tranh gia mao "da thanh toan".
  async recordVirtualGiftFromWebhook(
    invitationId: string,
    guestId: string | null,
    amount: number,
    animationType?: string,
  ) {
    const invitation = await this.prisma.invitation.findUniqueOrThrow({
      where: { id: invitationId },
    });

    return this.prisma.$transaction(async (tx) => {
      const gift = await tx.gift.create({
        data: { invitationId, guestId, type: GiftType.VIRTUAL_GIFT, amount, animationType },
      });
      await tx.wallet.upsert({
        where: { userId: invitation.userId },
        update: { balance: { increment: amount } },
        create: { userId: invitation.userId, balance: amount },
      });
      return gift;
    });
  }

  async findAllForInvitation(invitationId: string, userId: string) {
    await this.invitationsService.assertAccess(invitationId, userId);
    const gifts = await this.prisma.gift.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
    });

    const totalBankQr = gifts
      .filter((g) => g.type === GiftType.BANK_QR)
      .reduce((sum, g) => sum + g.amount, 0);
    const totalVirtual = gifts
      .filter((g) => g.type === GiftType.VIRTUAL_GIFT)
      .reduce((sum, g) => sum + g.amount, 0);

    return { gifts, totalBankQr, totalVirtual, total: totalBankQr + totalVirtual };
  }
}

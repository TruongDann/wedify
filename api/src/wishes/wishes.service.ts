import { Injectable, NotFoundException } from '@nestjs/common';
import { InvitationsService } from '../invitations/invitations.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishDto } from './dto/create-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    private prisma: PrismaService,
    private invitationsService: InvitationsService,
  ) {}

  // Guest-facing (PUBLIC) - guest de lai loi chuc ngay tren thiep, luu ca guestName tai thoi
  // diem gui (khong doc lai qua relation Guest phong khi Guest bi xoa sau nay - muc 5 data model).
  async createByGuestToken(guestToken: string, dto: CreateWishDto) {
    const guest = await this.prisma.guest.findUnique({
      where: { personalizedToken: guestToken },
    });
    if (!guest) throw new NotFoundException('Link không hợp lệ');

    return this.prisma.wish.create({
      data: {
        invitationId: guest.invitationId,
        guestId: guest.id,
        guestName: guest.name,
        message: dto.message,
      },
    });
  }

  // Guest-facing (PUBLIC) - hien danh sach loi chuc CONG KHAI tren trang thiep (bo qua da an).
  async findPublicBySlug(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
    });
    if (!invitation) throw new NotFoundException('Không tìm thấy thiệp');

    return this.prisma.wish.findMany({
      where: { invitationId: invitation.id, isHidden: false },
      orderBy: { createdAt: 'desc' },
      select: { id: true, guestName: true, message: true, createdAt: true },
    });
  }

  // Host-facing - xem TOAN BO loi chuc (ca da an) de tu duyet (muc 3.8).
  async findAllForHost(invitationId: string, userId: string) {
    await this.invitationsService.assertAccess(invitationId, userId);
    return this.prisma.wish.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setHidden(id: string, userId: string, isHidden: boolean) {
    const wish = await this.prisma.wish.findUnique({ where: { id } });
    if (!wish) throw new NotFoundException('Không tìm thấy lời chúc');
    await this.invitationsService.assertAccess(wish.invitationId, userId);
    return this.prisma.wish.update({ where: { id }, data: { isHidden } });
  }
}

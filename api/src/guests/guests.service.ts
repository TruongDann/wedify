import { Injectable, NotFoundException } from '@nestjs/common';
import { InvitationsService } from '../invitations/invitations.service';
import { PrismaService } from '../prisma/prisma.service';
import { BulkCreateGuestDto } from './dto/bulk-create-guest.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Injectable()
export class GuestsService {
  constructor(
    private prisma: PrismaService,
    private invitationsService: InvitationsService,
  ) {}

  async create(invitationId: string, userId: string, dto: CreateGuestDto) {
    await this.invitationsService.assertAccess(invitationId, userId);
    return this.prisma.guest.create({ data: { invitationId, ...dto } });
  }

  async bulkCreate(invitationId: string, userId: string, dto: BulkCreateGuestDto) {
    await this.invitationsService.assertAccess(invitationId, userId);
    const result = await this.prisma.guest.createMany({
      data: dto.guests.map((g) => ({ invitationId, ...g })),
    });
    return { created: result.count };
  }

  async findAllByInvitation(invitationId: string, userId: string) {
    await this.invitationsService.assertAccess(invitationId, userId);
    return this.prisma.guest.findMany({
      where: { invitationId },
      include: { rsvp: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, userId: string, dto: UpdateGuestDto) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) throw new NotFoundException('Không tìm thấy khách mời');
    await this.invitationsService.assertAccess(guest.invitationId, userId);
    return this.prisma.guest.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) throw new NotFoundException('Không tìm thấy khách mời');
    await this.invitationsService.assertAccess(guest.invitationId, userId);
    return this.prisma.guest.delete({ where: { id } });
  }

  async markSent(id: string, userId: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) throw new NotFoundException('Không tìm thấy khách mời');
    await this.invitationsService.assertAccess(guest.invitationId, userId);
    return this.prisma.guest.update({
      where: { id },
      data: { sentAt: new Date() },
    });
  }

  // Guest-facing (PUBLIC) - khach mo link ca nhan hoa /t/{personalizedToken}. Tra ve ca
  // ten/cach xung ho (muc 3.3: "Moi anh Huy") lan thong tin thiep de FE render 1 lan goi.
  async findByToken(token: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { personalizedToken: token },
      include: {
        invitation: true,
        rsvp: true,
      },
    });
    if (!guest) throw new NotFoundException('Link không hợp lệ');

    if (!guest.viewedAt) {
      await this.prisma.guest.update({
        where: { id: guest.id },
        data: { viewedAt: new Date() },
      });
    }

    return guest;
  }
}

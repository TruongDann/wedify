import { NotFoundException, Injectable } from '@nestjs/common';
import { RsvpStatus } from '@prisma/client';
import { InvitationsService } from '../invitations/invitations.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitRsvpDto } from './dto/submit-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(
    private prisma: PrismaService,
    private invitationsService: InvitationsService,
  ) {}

  // Guest-facing (PUBLIC) - guest bam "Co tham du/Khong tham du" tren trang thiep ca nhan hoa.
  async submit(guestToken: string, dto: SubmitRsvpDto) {
    const guest = await this.prisma.guest.findUnique({
      where: { personalizedToken: guestToken },
    });
    if (!guest) throw new NotFoundException('Link không hợp lệ');

    return this.prisma.rsvp.upsert({
      where: { guestId: guest.id },
      update: {
        status: dto.status,
        numberOfCompanions: dto.numberOfCompanions ?? 0,
        note: dto.note,
        respondedAt: new Date(),
      },
      create: {
        guestId: guest.id,
        status: dto.status,
        numberOfCompanions: dto.numberOfCompanions ?? 0,
        note: dto.note,
        respondedAt: new Date(),
      },
    });
  }

  // Host-facing - thong ke tong hop (muc 3.6: da gui/da xem/da xac nhan/tu choi/chua phan hoi).
  async statsForInvitation(invitationId: string, userId: string) {
    await this.invitationsService.assertAccess(invitationId, userId);

    const guests = await this.prisma.guest.findMany({
      where: { invitationId },
      include: { rsvp: true },
    });

    const total = guests.length;
    const sent = guests.filter((g) => g.sentAt).length;
    const viewed = guests.filter((g) => g.viewedAt).length;
    const attending = guests.filter(
      (g) => g.rsvp?.status === RsvpStatus.ATTENDING,
    );
    const notAttending = guests.filter(
      (g) => g.rsvp?.status === RsvpStatus.NOT_ATTENDING,
    ).length;
    const pending = total - attending.length - notAttending;
    const totalCompanions = attending.reduce(
      (sum, g) => sum + (g.rsvp?.numberOfCompanions ?? 0),
      0,
    );

    return {
      total,
      sent,
      viewed,
      attending: attending.length,
      notAttending,
      pending,
      totalAttendeesIncludingCompanions: attending.length + totalCompanions,
    };
  }
}

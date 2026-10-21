import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CollaboratorRole, GiftType, InvitationStatus, RsvpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

const COMBINING_DIACRITICS_REGEX = /[̀-ͯ]/g;

function slugify(text: string): string {
  return text
    // "đ"/"Đ" la CHU CAI RIENG trong tieng Viet, khong phai nguyen am+dau nen NFD KHONG tach
    // duoc (khac voi "ă/â/ê/ô/ơ/ư" tach duoc qua normalize) - phai thay tay truoc.
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS_REGEX, '') // bo dau con lai sau khi normalize NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  private async resolveTemplateId(templateId?: string): Promise<string | undefined> {
    const value = templateId?.trim();
    if (!value) return undefined;

    const template = await this.prisma.template.findUnique({
      where: { id: value },
      select: { id: true },
    });

    return template ? value : undefined;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'thiep';
    for (let attempt = 0; attempt < 20; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 8);
      const candidate = `${base}-${suffix}`;
      const existing = await this.prisma.invitation.findUnique({
        where: { slug: candidate },
      });
      if (!existing) return candidate;
    }
    throw new BadRequestException('Không tạo được link thiệp, vui lòng thử lại');
  }

  // Kiem tra userId co quyen xem/sua invitation nay khong (chinh chu hoac collaborator),
  // nem ForbiddenException/NotFoundException neu khong hop le. Tra ve role de controller/service
  // khac quyet dinh them (vd chi OWNER moi duoc xoa/moi collaborator).
  async assertAccess(
    invitationId: string,
    userId: string,
  ): Promise<'OWNER' | CollaboratorRole> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { collaborators: true },
    });
    if (!invitation) throw new NotFoundException('Không tìm thấy thiệp');

    if (invitation.userId === userId) return 'OWNER';
    const collab = invitation.collaborators.find((c) => c.userId === userId);
    if (!collab) {
      throw new ForbiddenException('Bạn không có quyền truy cập thiệp này');
    }
    return collab.role;
  }

  async create(userId: string, dto: CreateInvitationDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { plan: true },
    });

    const ownedCount = await this.prisma.invitation.count({
      where: { userId },
    });
    if (user.plan && ownedCount >= user.plan.maxInvitations) {
      throw new BadRequestException(
        `Gói ${user.plan.name} chỉ cho phép tạo tối đa ${user.plan.maxInvitations} thiệp. Vui lòng nâng cấp gói.`,
      );
    }

    const validTemplateId = await this.resolveTemplateId(dto.templateId);
    const slug = await this.generateUniqueSlug(dto.title);
    return this.prisma.invitation.create({
      data: {
        userId,
        slug,
        title: dto.title,
        templateId: validTemplateId,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        location: dto.location,
        profileJson: (dto.profileJson ?? {}) as never,
        contentJson: dto.contentJson as never,
        status: InvitationStatus.DRAFT,
      },
    });
  }

  // "Thiệp đã tạo" (muc /thiep-online/khach-hang) - ca thiep so huu lan thiep duoc chia se quyen.
  findMine(userId: string) {
    return this.prisma.invitation.findMany({
      where: {
        OR: [{ userId }, { collaborators: { some: { userId } } }],
      },
      include: {
        template: { select: { id: true, name: true, thumbnailUrl: true } },
        _count: { select: { guests: true, wishes: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    await this.assertAccess(id, userId);
    return this.prisma.invitation.findUniqueOrThrow({
      where: { id },
      include: { collaborators: { include: { user: { select: { id: true, email: true, name: true } } } } },
    });
  }

  // Guest-facing - hoan toan public, khong qua JwtAuthGuard (xem @Public() o controller).
  // Tang view_count moi lan xem, dung de doi soat gioi han luot xem theo goi (muc 4.1).
  async findBySlug(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
    });
    if (!invitation || invitation.status !== InvitationStatus.PUBLISHED) {
      throw new NotFoundException('Thiệp không tồn tại hoặc chưa được công bố');
    }
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new NotFoundException('Thiệp đã hết hạn hiển thị');
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { viewCount: { increment: 1 } },
    });

    return invitation;
  }

  async update(id: string, userId: string, dto: UpdateInvitationDto) {
    await this.assertAccess(id, userId);
    const validTemplateId = await this.resolveTemplateId(dto.templateId);

    return this.prisma.invitation.update({
      where: { id },
      data: {
        ...dto,
        templateId: validTemplateId,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        profileJson: dto.profileJson ? (dto.profileJson as never) : undefined,
        contentJson: dto.contentJson as never,
      },
    });
  }

  async publish(id: string, userId: string) {
    const role = await this.assertAccess(id, userId);
    if (role === CollaboratorRole.EDITOR) {
      throw new ForbiddenException('Chỉ chủ thiệp mới có thể công bố thiệp');
    }

    const invitation = await this.prisma.invitation.findUniqueOrThrow({
      where: { id },
      include: { user: { include: { plan: true } } },
    });
    const months = invitation.user.plan?.storageDurationMonths ?? 6;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    return this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.PUBLISHED, expiresAt },
    });
  }

  async remove(id: string, userId: string) {
    const role = await this.assertAccess(id, userId);
    if (role !== 'OWNER') {
      throw new ForbiddenException('Chỉ chủ thiệp mới có thể xóa thiệp');
    }
    return this.prisma.invitation.delete({ where: { id } });
  }

  // Tong hop moi tuong tac khach da de lai tren thiep (host xem): qua nhan duoc tu ai, ai tham du,
  // loi chuc, khach moi... Chi chu thiep / nguoi duoc chia se quyen moi xem duoc.
  async getActivity(id: string, userId: string) {
    await this.assertAccess(id, userId);

    const [invitation, gifts, guests, wishes, giftItems] = await Promise.all([
      this.prisma.invitation.findUniqueOrThrow({
        where: { id },
        select: { id: true, title: true, slug: true, status: true, viewCount: true, eventDate: true },
      }),
      this.prisma.gift.findMany({
        where: { invitationId: id },
        orderBy: { createdAt: 'desc' },
        include: { giftItem: { select: { name: true, emoji: true } }, guest: { select: { name: true } } },
      }),
      this.prisma.guest.findMany({
        where: { invitationId: id },
        orderBy: { createdAt: 'desc' },
        include: { rsvp: true },
      }),
      this.prisma.wish.findMany({ where: { invitationId: id }, orderBy: { createdAt: 'desc' } }),
      this.prisma.giftItem.findMany({ select: { code: true, name: true, emoji: true } }),
    ]);

    const itemByCode = new Map(giftItems.map((item) => [item.code, item]));

    const virtualGifts = gifts.filter((g) => g.type === GiftType.VIRTUAL_GIFT);
    const bankGifts = gifts.filter((g) => g.type === GiftType.BANK_QR);

    const answered = guests.filter((g) => g.rsvp && g.rsvp.status !== RsvpStatus.PENDING);
    const attending = answered.filter((g) => g.rsvp!.status === RsvpStatus.ATTENDING);
    const companions = attending.reduce((sum, g) => sum + (g.rsvp!.numberOfCompanions ?? 0), 0);

    return {
      invitation,
      summary: {
        views: invitation.viewCount,
        wishes: wishes.length,
        guests: guests.length,
        guestsViewed: guests.filter((g) => g.viewedAt).length,
        gifts: virtualGifts.length,
        giftHearts: virtualGifts.reduce((sum, g) => sum + g.hearts, 0),
        giftValueVnd: virtualGifts.reduce((sum, g) => sum + g.amount, 0),
        bankTransfers: bankGifts.length,
        bankTransferVnd: bankGifts.reduce((sum, g) => sum + g.amount, 0),
        rsvpAttending: attending.length,
        rsvpNotAttending: answered.length - attending.length,
        rsvpCompanions: companions,
        // Tong so nguoi du kien den (nguoi xac nhan + nguoi di cung)
        expectedPeople: attending.length + companions,
      },
      gifts: gifts.map((g) => ({
        id: g.id,
        type: g.type,
        senderName: g.senderName ?? g.guest?.name ?? 'Ẩn danh',
        giftName: g.giftItem?.name ?? (g.type === GiftType.BANK_QR ? 'Chuyển khoản' : 'Quà tặng'),
        emoji: g.giftItem?.emoji ?? (g.type === GiftType.BANK_QR ? '💵' : '🎁'),
        hearts: g.hearts,
        amount: g.amount,
        message: g.message,
        createdAt: g.createdAt,
      })),
      rsvps: answered
        .sort((a, b) => (b.rsvp!.respondedAt?.getTime() ?? 0) - (a.rsvp!.respondedAt?.getTime() ?? 0))
        .map((g) => ({
          id: g.id,
          name: g.name,
          honorific: g.honorific,
          status: g.rsvp!.status,
          companions: g.rsvp!.numberOfCompanions,
          note: g.rsvp!.note,
          respondedAt: g.rsvp!.respondedAt,
        })),
      wishes: wishes.map((w) => ({
        id: w.id,
        guestName: w.guestName,
        message: w.message,
        isHidden: w.isHidden,
        createdAt: w.createdAt,
        gift: w.giftCode ? (itemByCode.get(w.giftCode) ?? { code: w.giftCode, name: 'Quà tặng', emoji: '🎁' }) : null,
      })),
      guests: guests.map((g) => ({
        id: g.id,
        name: g.name,
        honorific: g.honorific,
        group: g.group,
        sentAt: g.sentAt,
        viewedAt: g.viewedAt,
        rsvpStatus: g.rsvp?.status ?? RsvpStatus.PENDING,
      })),
    };
  }

  // ---- Collaboration (muc 3.11) ----

  async addCollaborator(id: string, userId: string, dto: AddCollaboratorDto) {
    const role = await this.assertAccess(id, userId);
    if (role !== 'OWNER') {
      throw new ForbiddenException('Chỉ chủ thiệp mới có thể mời người quản lý chung');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!targetUser) {
      throw new NotFoundException('Không tìm thấy người dùng với email này');
    }

    return this.prisma.invitationCollaborator.upsert({
      where: { invitationId_userId: { invitationId: id, userId: targetUser.id } },
      update: { role: dto.role ?? CollaboratorRole.EDITOR },
      create: {
        invitationId: id,
        userId: targetUser.id,
        role: dto.role ?? CollaboratorRole.EDITOR,
      },
    });
  }

  async removeCollaborator(id: string, userId: string, collaboratorUserId: string) {
    const role = await this.assertAccess(id, userId);
    if (role !== 'OWNER') {
      throw new ForbiddenException('Chỉ chủ thiệp mới có thể gỡ người quản lý chung');
    }
    return this.prisma.invitationCollaborator.delete({
      where: {
        invitationId_userId: { invitationId: id, userId: collaboratorUserId },
      },
    });
  }
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InvitationStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { CreateAdminInvitationDto, UpdateAdminInvitationDto } from './dto/admin-invitation.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

const PAGE_SIZE = 20;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async lookups() {
    const [users, plans, templates, components, categories, styles] = await Promise.all([
      this.prisma.user.findMany({
        where: { isLocked: false }, orderBy: { createdAt: 'desc' }, take: 500,
        select: { id: true, email: true, name: true },
      }),
      this.prisma.plan.findMany({
        orderBy: { price: 'asc' }, select: { id: true, name: true, tier: true, price: true },
      }),
      this.prisma.template.findMany({
        where: { isActive: true }, orderBy: { name: 'asc' },
        select: { id: true, name: true, tier: true, category: { select: { name: true } } },
      }),
      this.prisma.component.findMany({
        where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, type: true, category: true, tier: true },
      }),
      this.prisma.templateCategory.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
      this.prisma.templateStyle.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
    ]);
    return { users, plans, templates: templates.map(template => ({ ...template, category: template.category.name })), components, categories, styles };
  }

  async createUser(dto: CreateAdminUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã tồn tại');
    const { password, ...data } = dto;
    return this.prisma.user.create({
      data: {
        ...data,
        passwordHash: await bcrypt.hash(password, 12),
        wallet: { create: { balance: 0 } },
      },
      select: { id: true, email: true, name: true, phone: true, role: true, planId: true, createdAt: true },
    });
  }

  async updateUser(id: string, dto: UpdateAdminUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy người dùng');
    return this.prisma.user.update({
      where: { id }, data: dto,
      select: { id: true, email: true, name: true, phone: true, role: true, planId: true, isLocked: true },
    });
  }

  async deleteUser(id: string) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy người dùng');
    // Xóa mềm để giữ nguyên thiệp, thanh toán và dữ liệu đối soát liên quan.
    return this.prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.oAuthAccount.deleteMany({ where: { userId: id } });
      return tx.user.update({
        where: { id },
        data: {
          email: `deleted+${id}@deleted.local`, passwordHash: null, name: 'Tài khoản đã xóa',
          phone: null, avatarUrl: null, isLocked: true,
        },
        select: { id: true, email: true, name: true, isLocked: true },
      });
    });
  }

  async createInvitation(dto: CreateAdminInvitationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Không tìm thấy chủ sở hữu');
    const slugBase = dto.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'thiep';
    return this.prisma.invitation.create({
      data: {
        ...dto, slug: `${slugBase.slice(0, 50)}-${randomUUID().slice(0, 8)}`,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        contentJson: dto.contentJson as never,
      },
    });
  }

  async updateInvitation(id: string, dto: UpdateAdminInvitationDto) {
    const exists = await this.prisma.invitation.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy thiệp');
    return this.prisma.invitation.update({
      where: { id },
      data: {
        ...dto, eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        contentJson: dto.contentJson as never,
      },
    });
  }

  async deleteInvitation(id: string) {
    const exists = await this.prisma.invitation.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy thiệp');
    return this.prisma.invitation.delete({ where: { id } });
  }

  async dashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [users, invitations, published, templates, pendingWithdrawals, pendingAffiliates,
      wishes, gifts, revenue, recentUsers, recentInvitations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.invitation.count(),
      this.prisma.invitation.count({ where: { status: InvitationStatus.PUBLISHED } }),
      this.prisma.template.count({ where: { isActive: true } }),
      this.prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      this.prisma.affiliatePartner.count({ where: { status: 'PENDING' } }),
      this.prisma.wish.count(),
      this.prisma.gift.aggregate({ _sum: { amount: true }, _count: true }),
      this.prisma.subscription.aggregate({
        where: { paymentStatus: PaymentStatus.PAID, startedAt: { gte: startOfMonth } },
        _sum: { amountPaid: true },
      }),
      this.prisma.user.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, createdAt: true, role: true },
      }),
      this.prisma.invitation.findMany({
        take: 5, orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, slug: true, status: true, viewCount: true, updatedAt: true },
      }),
    ]);
    return {
      metrics: {
        users, invitations, published, templates, wishes,
        gifts: gifts._count, giftValue: gifts._sum.amount ?? 0,
        monthlyRevenue: revenue._sum.amountPaid ?? 0,
        pendingWithdrawals, pendingAffiliates,
      },
      recentUsers,
      recentInvitations,
    };
  }

  async invitations(search?: string, status?: InvitationStatus, page = 1) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          template: { select: { name: true, tier: true } },
          _count: { select: { guests: true, wishes: true, gifts: true } },
        },
      }),
      this.prisma.invitation.count({ where }),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async subscriptions(status?: PaymentStatus, page = 1) {
    const where = status ? { paymentStatus: status } : {};
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' }, include: {
          user: { select: { id: true, email: true, name: true } },
          plan: true,
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    const subscription = await this.prisma.subscription.create({
      data: { ...dto, expiresAt: new Date(dto.expiresAt), paymentStatus: dto.paymentStatus ?? PaymentStatus.PENDING },
    });
    if (subscription.paymentStatus === PaymentStatus.PAID) {
      await this.prisma.user.update({
        where: { id: subscription.userId },
        data: { planId: subscription.planId, planExpiresAt: subscription.expiresAt },
      });
    }
    return subscription;
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    const current = await this.prisma.subscription.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Không tìm thấy subscription');
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined },
    });
    if (updated.paymentStatus === PaymentStatus.PAID) {
      await this.prisma.user.update({
        where: { id: updated.userId },
        data: { planId: updated.planId, planExpiresAt: updated.expiresAt },
      });
    }
    return updated;
  }

  async deleteSubscription(id: string) {
    const exists = await this.prisma.subscription.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy subscription');
    return this.prisma.subscription.delete({ where: { id } });
  }

  async gifts(page = 1) {
    const [items, total] = await Promise.all([
      this.prisma.gift.findMany({
        skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, orderBy: { createdAt: 'desc' },
        include: {
          invitation: { select: { title: true, slug: true } },
          guest: { select: { name: true } },
        },
      }),
      this.prisma.gift.count(),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async wishes(hidden?: string, page = 1) {
    const where = hidden === 'true' ? { isHidden: true } : hidden === 'false' ? { isHidden: false } : {};
    const [items, total] = await Promise.all([
      this.prisma.wish.findMany({
        where, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, orderBy: { createdAt: 'desc' },
        include: { invitation: { select: { title: true, slug: true } } },
      }),
      this.prisma.wish.count({ where }),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async setWishHidden(id: string, isHidden: boolean) {
    const exists = await this.prisma.wish.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy lời chúc');
    return this.prisma.wish.update({ where: { id }, data: { isHidden } });
  }

  async deleteWish(id: string) {
    const exists = await this.prisma.wish.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy lời chúc');
    return this.prisma.wish.delete({ where: { id } });
  }

  async deleteAffiliate(id: string) {
    const exists = await this.prisma.affiliatePartner.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy affiliate');
    await this.prisma.affiliateConversion.deleteMany({ where: { affiliateId: id } });
    return this.prisma.affiliatePartner.delete({ where: { id } });
  }

  async health() {
    const started = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy', database: 'connected', uptimeSeconds: Math.floor(process.uptime()),
      databaseLatencyMs: Date.now() - started, timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    };
  }
}

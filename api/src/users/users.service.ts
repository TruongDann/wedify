import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PAGE_SIZE = 20;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.prisma.user.update({ where: { id: userId }, data: dto });
    return this.getProfile(userId);
  }

  // Danh sach user cho Admin Panel (muc 3.15): tim kiem + phan trang.
  async findAll(search?: string, page = 1) {
    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isLocked: true,
          planId: true,
          createdAt: true,
          plan: { select: { tier: true, name: true } },
          _count: { select: { invitations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        plan: true,
        invitations: {
          select: { id: true, slug: true, title: true, status: true, createdAt: true },
        },
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }

  async setLocked(id: string, isLocked: boolean) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { isLocked },
        select: { id: true, email: true, isLocked: true },
      });
      if (isLocked) await tx.session.deleteMany({ where: { userId: id } });
      return user;
    });
  }
}

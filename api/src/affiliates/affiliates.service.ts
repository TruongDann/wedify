import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AffiliateStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_COMMISSION_RATE = 0.1; // 10% - Admin co the chinh lai qua updateCommissionRate

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  private generateReferralCode(userId: string): string {
    return `WD-${userId.slice(0, 6).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
  }

  // Host dang ky tham gia affiliate (muc 3.13) - o trang thai PENDING cho Admin duyet.
  async apply(userId: string) {
    const existing = await this.prisma.affiliatePartner.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('Bạn đã đăng ký chương trình affiliate rồi');
    }

    return this.prisma.affiliatePartner.create({
      data: {
        userId,
        referralCode: this.generateReferralCode(userId),
        commissionRate: DEFAULT_COMMISSION_RATE,
        status: AffiliateStatus.PENDING,
      },
    });
  }

  async getMyDashboard(userId: string) {
    const affiliate = await this.prisma.affiliatePartner.findUnique({
      where: { userId },
      include: { conversions: { orderBy: { convertedAt: 'desc' } } },
    });
    if (!affiliate) {
      throw new NotFoundException('Bạn chưa đăng ký chương trình affiliate');
    }

    const totalCommission = affiliate.conversions.reduce(
      (sum, c) => sum + c.commissionAmount,
      0,
    );
    return { ...affiliate, totalCommission, totalConversions: affiliate.conversions.length };
  }

  // ---- Admin (muc 3.15: "duyet doi tac, tinh va chi tra hoa hong") ----

  findAll(status?: AffiliateStatus) {
    return this.prisma.affiliatePartner.findMany({
      where: status ? { status } : {},
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: AffiliateStatus) {
    const affiliate = await this.prisma.affiliatePartner.findUnique({ where: { id } });
    if (!affiliate) throw new NotFoundException('Không tìm thấy đối tác affiliate');
    return this.prisma.affiliatePartner.update({ where: { id }, data: { status } });
  }

  // Ghi nhan 1 luot chuyen doi (user moi dang ky qua link gioi thieu, tinh hoa hong theo % hien tai).
  // TODO: goi ham nay ngay sau khi AuthService.register() xac dinh duoc referral code trong query
  // param dang ky (vd ?ref=WD-ABC123) - chua noi vao AuthService o ban dau nay.
  async recordConversion(referralCode: string, referredUserId: string) {
    const affiliate = await this.prisma.affiliatePartner.findUnique({
      where: { referralCode },
    });
    if (!affiliate || affiliate.status !== AffiliateStatus.APPROVED) return null;

    const plan = await this.prisma.user.findUnique({
      where: { id: referredUserId },
      include: { plan: true },
    });
    const commissionAmount = Math.round(
      (plan?.plan?.price ?? 0) * affiliate.commissionRate,
    );

    return this.prisma.affiliateConversion.create({
      data: { affiliateId: affiliate.id, referredUserId, commissionAmount },
    });
  }
}

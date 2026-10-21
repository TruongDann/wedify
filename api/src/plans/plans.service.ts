import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  // Public - trang /pricing doc danh sach nay, KHONG hardcode o frontend.
  findAll() {
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  async update(tier: PlanTier, dto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findUnique({ where: { tier } });
    if (!plan) throw new NotFoundException('Không tìm thấy gói dịch vụ');
    return this.prisma.plan.update({ where: { tier }, data: dto });
  }
}

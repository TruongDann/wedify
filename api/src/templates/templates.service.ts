import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  // Public - thu vien mau (muc 3.4), loc theo category/tier de FE dung cho /templates/{category}.
  findAll(category?: string, tier?: PlanTier) {
    return this.prisma.template.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(tier ? { tier } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Không tìm thấy mẫu thiệp');
    return template;
  }

  create(dto: CreateTemplateDto) {
    // contentJson la Record<string, unknown> (DTO) - Prisma doi kieu InputJsonValue rieng, ep
    // kieu tai day la du (da validate cau truc qua class-validator @IsObject() o DTO roi).
    return this.prisma.template.create({ data: dto as never });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findOne(id);
    return this.prisma.template.update({ where: { id }, data: dto as never });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Xoa mem (isActive=false) thay vi xoa cung - tranh vo lien ket voi Invitation da tao tu mau nay.
    return this.prisma.template.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

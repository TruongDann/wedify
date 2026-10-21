import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  // Public - thu vien mau (muc 3.4), loc theo category/tier de FE dung cho /templates/{category}.
  async findAll(category?: string, tier?: PlanTier) {
    const templates = await this.prisma.template.findMany({
      where: {
        isActive: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(tier ? { tier } : {}),
      },
      include: { category: true, style: true },
      orderBy: { createdAt: 'desc' },
    });
    return templates.map((template) => this.serialize(template));
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id }, include: { category: true, style: true } });
    if (!template) throw new NotFoundException('Không tìm thấy mẫu thiệp');
    return this.serialize(template);
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

  private serialize(template: Record<string, unknown> & { category: { name: string; slug: string }; style: { name: string; slug: string } | null }) {
    return { ...template, category: template.category.name, categorySlug: template.category.slug, style: template.style?.name ?? null, styleSlug: template.style?.slug ?? null };
  }
}

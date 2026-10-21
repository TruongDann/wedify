import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

const DEFAULT_COMPONENT_SEED = [
  {
    id: 'seed-heart-frame',
    name: 'Heart Frame',
    type: 'shape',
    category: 'wedding',
    description: 'Khung trái tim lãng mạn cho thiệp cưới',
    tier: PlanTier.PREMIUM,
    thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=400&fit=crop',
    configJson: [
      { id: 'heart-frame-1', label: 'Frame chính', value: 'heart', tier: PlanTier.PREMIUM, isActive: true },
      { id: 'heart-frame-2', label: 'Màu nhấn', value: '#f472b6', tier: PlanTier.PREMIUM, isActive: true },
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'seed-rose-garland',
    name: 'Rose Garland',
    type: 'image',
    category: 'wedding',
    description: 'Hoa hồng trang trí nền',
    tier: PlanTier.BASIC,
    thumbnailUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&h=400&fit=crop',
    configJson: [
      { id: 'rose-garland-1', label: 'Ảnh nền', value: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486', tier: PlanTier.BASIC, isActive: true },
      { id: 'rose-garland-2', label: 'Hiệu ứng', value: 'zoom', tier: PlanTier.BASIC, isActive: true },
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'seed-sparkle-badge',
    name: 'Sparkle Badge',
    type: 'text',
    category: 'birthday',
    description: 'Badge chúc mừng phát sáng',
    tier: PlanTier.FREE,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop',
    configJson: [
      { id: 'sparkle-badge-1', label: 'Văn bản', value: 'Happy Birthday', tier: PlanTier.FREE, isActive: true },
      { id: 'sparkle-badge-2', label: 'Màu', value: '#f59e0b', tier: PlanTier.FREE, isActive: true },
    ],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'seed-luxury-vine',
    name: 'Luxury Vine',
    type: 'shape',
    category: 'luxury',
    description: 'Mảng hoa cao cấp',
    tier: PlanTier.PREMIUM,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=400&fit=crop',
    configJson: [
      { id: 'luxury-vine-1', label: 'Mẫu hoa', value: 'vine', tier: PlanTier.PREMIUM, isActive: true },
      { id: 'luxury-vine-2', label: 'Phù hợp', value: 'luxury', tier: PlanTier.PREMIUM, isActive: true },
    ],
    isActive: true,
    sortOrder: 4,
  },
] as const;

@Injectable()
export class ComponentsService {
  constructor(private prisma: PrismaService) {}

  private async ensureSeededComponents(category?: string, tier?: PlanTier) {
    const where = {
      isActive: true,
      ...(category ? { category: { equals: category } } : {}),
      ...(tier ? { tier } : {}),
    };

    const count = await this.prisma.component.count({ where });
    if (count > 0) return;

    const filtered = DEFAULT_COMPONENT_SEED.filter((item) => {
      const categoryMatch = category ? item.category === category : true;
      const tierMatch = tier ? item.tier === tier : true;
      return categoryMatch && tierMatch;
    });

    if (filtered.length === 0) return;

    await this.prisma.component.createMany({
      data: filtered.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        category: item.category,
        description: item.description,
        tier: item.tier,
        thumbnailUrl: item.thumbnailUrl,
        configJson: item.configJson as any,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
      })),
    });
  }

  async findAll(category?: string, tier?: PlanTier) {
    try {
      await this.ensureSeededComponents(category, tier);

      const rows = await this.prisma.component.findMany({
        where: {
          isActive: true,
          ...(category ? { category: { equals: category } } : {}),
          ...(tier ? { tier } : {}),
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });

      if (rows.length > 0) return rows;
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
      if (code !== 'P2021') {
        throw error;
      }
    }

    const filtered = DEFAULT_COMPONENT_SEED.filter((item) => {
      const categoryMatch = category ? item.category === category : true;
      const tierMatch = tier ? item.tier === tier : true;
      return categoryMatch && tierMatch;
    });

    return filtered.map((item) => ({ ...item, configJson: item.configJson ?? {} }));
  }

  async findOne(id: string) {
    const component = await this.prisma.component.findUnique({ where: { id } });
    if (!component) throw new NotFoundException('Không tìm thấy component');
    return component;
  }

  create(dto: CreateComponentDto) {
    const data: any = { ...dto };
    data.configJson = dto.configJson ?? {};
    return this.prisma.component.create({ data });
  }

  async update(id: string, dto: UpdateComponentDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.configJson !== undefined) {
      data.configJson = dto.configJson;
    }
    return this.prisma.component.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.component.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

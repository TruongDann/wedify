import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateTaxonomyDto, UpdateTemplateTaxonomyDto } from './dto/template-taxonomy.dto';

@Injectable()
export class TemplateTaxonomiesService {
  constructor(private prisma: PrismaService) {}

  private slug(name: string) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  categories() { return this.prisma.templateCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
  styles() { return this.prisma.templateStyle.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }

  createCategory(dto: CreateTemplateTaxonomyDto) { return this.prisma.templateCategory.create({ data: { ...dto, slug: this.slug(dto.name) } }).catch(() => { throw new ConflictException('Tên hoặc slug danh mục đã tồn tại'); }); }
  createStyle(dto: CreateTemplateTaxonomyDto) { return this.prisma.templateStyle.create({ data: { ...dto, slug: this.slug(dto.name) } }).catch(() => { throw new ConflictException('Tên hoặc slug phong cách đã tồn tại'); }); }

  async updateCategory(id: string, dto: UpdateTemplateTaxonomyDto) {
    await this.ensureCategory(id); return this.prisma.templateCategory.update({ where: { id }, data: { ...dto, ...(dto.name ? { slug: this.slug(dto.name) } : {}) } });
  }
  async updateStyle(id: string, dto: UpdateTemplateTaxonomyDto) {
    await this.ensureStyle(id); return this.prisma.templateStyle.update({ where: { id }, data: { ...dto, ...(dto.name ? { slug: this.slug(dto.name) } : {}) } });
  }
  async removeCategory(id: string) {
    await this.ensureCategory(id); const used = await this.prisma.template.count({ where: { categoryId: id } });
    if (used) throw new ConflictException(`Danh mục đang được sử dụng bởi ${used} mẫu`);
    return this.prisma.templateCategory.delete({ where: { id } });
  }
  async removeStyle(id: string) {
    await this.ensureStyle(id); const used = await this.prisma.template.count({ where: { styleId: id } });
    if (used) throw new ConflictException(`Phong cách đang được sử dụng bởi ${used} mẫu`);
    return this.prisma.templateStyle.delete({ where: { id } });
  }
  private async ensureCategory(id: string) { if (!await this.prisma.templateCategory.findUnique({ where: { id } })) throw new NotFoundException('Không tìm thấy danh mục'); }
  private async ensureStyle(id: string) { if (!await this.prisma.templateStyle.findUnique({ where: { id } })) throw new NotFoundException('Không tìm thấy phong cách'); }
}

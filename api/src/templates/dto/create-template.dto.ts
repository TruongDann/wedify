import { ApiProperty } from '@nestjs/swagger';
import { PlanTier } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Hoa hồng lãng mạn' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'ID danh mục mẫu' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: 'ID phong cách mẫu', required: false })
  @IsOptional()
  @IsUUID()
  styleId?: string;

  @ApiProperty({ enum: PlanTier, default: PlanTier.FREE })
  @IsEnum(PlanTier)
  tier!: PlanTier;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  thumbnailUrl!: string;

  @ApiProperty({
    description: 'Snapshot { canvasSettings, elements[] } dung chung shape voi frontend editor',
  })
  @IsObject()
  contentJson!: Record<string, unknown>;
}

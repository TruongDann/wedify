import { ApiProperty } from '@nestjs/swagger';
import { PlanTier } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Hoa hồng lãng mạn' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'wedding' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'romantic', required: false })
  @IsOptional()
  @IsString()
  style?: string;

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

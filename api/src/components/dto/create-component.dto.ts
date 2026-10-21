import { ApiProperty } from '@nestjs/swagger';
import { PlanTier } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateComponentDto {
  @ApiProperty({ example: 'Heart Frame' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'shape' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 'wedding' })
  @IsString()
  category!: string;

  @ApiProperty({ required: false, example: 'Khung trái tim lãng mạn' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PlanTier, default: PlanTier.FREE })
  @IsEnum(PlanTier)
  tier!: PlanTier;

  @ApiProperty({ required: false, example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  thumbnailUrl?: string;

  @ApiProperty({ required: false, example: [{ id: 'text-1', label: 'Tiêu đề', value: 'Mình yêu nhau', tier: 'FREE' }] })
  @IsOptional()
  configJson?: unknown;
}

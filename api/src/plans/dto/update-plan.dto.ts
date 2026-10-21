import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

// Admin chinh gia/gioi han goi (muc 3.15 + luu y SRS: "khong hardcode, thiet ke bang plans linh
// hoat" - moi truong bat buoc optional de cho phep sua tung phan khong can gui lai toan bo).
export class UpdatePlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxImages?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxViews?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxInvitations?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  storageDurationMonths?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasWatermarkRemoval?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasCustomMusic?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasCustomFont?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasZenAi?: boolean;
}

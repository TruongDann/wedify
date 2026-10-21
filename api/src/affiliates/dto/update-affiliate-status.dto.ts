import { ApiProperty } from '@nestjs/swagger';
import { AffiliateStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateAffiliateStatusDto {
  @ApiProperty({ enum: AffiliateStatus })
  @IsEnum(AffiliateStatus)
  status!: AffiliateStatus;
}

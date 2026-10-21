import { ApiProperty } from '@nestjs/swagger';
import { WithdrawalStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateWithdrawalStatusDto {
  @ApiProperty({ enum: WithdrawalStatus })
  @IsEnum(WithdrawalStatus)
  status!: WithdrawalStatus;
}

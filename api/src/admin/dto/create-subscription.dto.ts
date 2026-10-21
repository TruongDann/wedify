import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty() @IsString() userId!: string;
  @ApiProperty() @IsString() planId!: string;
  @ApiProperty() @IsDateString() expiresAt!: string;
  @ApiProperty() @IsInt() @Min(0) amountPaid!: number;
  @ApiPropertyOptional({ enum: PaymentStatus }) @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { RsvpStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SubmitRsvpDto {
  @ApiProperty({ enum: RsvpStatus })
  @IsEnum(RsvpStatus)
  status!: RsvpStatus;

  @ApiProperty({ example: 1, required: false, description: 'Số người đi cùng' })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfCompanions?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

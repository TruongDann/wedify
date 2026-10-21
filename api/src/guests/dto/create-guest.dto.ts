import { ApiProperty } from '@nestjs/swagger';
import { GuestGroup } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateGuestDto {
  @ApiProperty({ example: 'Huy' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'anh', required: false, description: 'Cách xưng hô: anh/chị/cô/bác...' })
  @IsOptional()
  @IsString()
  honorific?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'FAMILY', required: false, enum: GuestGroup, description: 'Nhóm khách: FAMILY / FRIEND / COLLEAGUE / OTHER' })
  @IsOptional()
  @IsEnum(GuestGroup)
  group?: GuestGroup;

  @ApiProperty({ example: 'huy@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Khách thân thiết', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

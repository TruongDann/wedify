import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}

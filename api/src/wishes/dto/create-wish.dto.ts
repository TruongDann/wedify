import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateWishDto {
  @ApiProperty({ example: 'Chúc hai bạn trăm năm hạnh phúc!' })
  @IsString()
  @MaxLength(1000)
  message!: string;
}

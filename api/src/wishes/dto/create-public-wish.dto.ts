import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePublicWishDto {
  @ApiProperty({ example: 'Linh' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  guestName!: string;

  @ApiProperty({ example: 'Chúc hai bạn trăm năm hạnh phúc!' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message!: string;
}

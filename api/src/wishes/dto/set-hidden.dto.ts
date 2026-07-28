import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetHiddenDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isHidden!: boolean;
}

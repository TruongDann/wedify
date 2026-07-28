import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetLockedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isLocked!: boolean;
}

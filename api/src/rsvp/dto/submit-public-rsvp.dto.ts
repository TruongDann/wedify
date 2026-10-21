import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { SubmitRsvpDto } from './submit-rsvp.dto';

export class SubmitPublicRsvpDto extends SubmitRsvpDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'Đám cưới Minh Anh & Hoàng Nam' })
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    required: false,
    description: 'Hồ sơ cưới: thông tin cô dâu, chú rể, ngày cưới, ngân hàng, QR...',
    example: {
      groomName: 'Nguyễn Văn An',
      brideName: 'Trần Thị Bình',
      weddingDate: '2026-12-18',
      weddingTime: '18:00',
      location: 'Riverside',
    },
  })
  @IsOptional()
  @IsObject()
  profileJson?: Record<string, unknown>;

  @ApiProperty({
    description: 'Snapshot { canvasSettings, elements[] } - lay tu Zustand store cua editor',
  })
  @IsObject()
  contentJson!: Record<string, unknown>;
}

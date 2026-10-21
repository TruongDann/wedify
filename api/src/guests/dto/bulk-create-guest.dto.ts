import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { CreateGuestDto } from './create-guest.dto';

// Nhap hang loat (muc 3.7: "Import danh sach khach: nhap thu cong hoac upload Excel/CSV").
// FE chiu trach nhiem doc file Excel/CSV thanh mang JSON (vd bang thu vien 'xlsx' phia client)
// roi goi API nay - backend chi nhan JSON, khong tu parse file, tranh phai xu ly nhieu dinh dang
// file khac nhau o server.
export class BulkCreateGuestDto {
  @ApiProperty({ type: [CreateGuestDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateGuestDto)
  @ArrayMinSize(1)
  guests!: CreateGuestDto[];
}

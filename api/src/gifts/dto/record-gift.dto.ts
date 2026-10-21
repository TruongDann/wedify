import { ApiProperty } from '@nestjs/swagger';
import { GiftType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

// Ghi nhan qua mung (muc 3.10). LUU Y: day la ghi nhan THU CONG cho luong "quet QR ngan hang
// chuyen khoan truc tiep" (BANK_QR - tien di THANG tu khach sang tai khoan Host, he thong KHONG
// hoc thay va KHONG tu xac nhan duoc) - Host tu bam xac nhan da nhan tren dashboard.
// Luong VIRTUAL_GIFT (khach mua qua ao bang tien that qua cong thanh toan) PHAI di qua webhook
// cong thanh toan that (xem GiftsService.recordVirtualGiftFromWebhook), KHONG duoc goi endpoint
// nay truc tiep tu FE vi se cho phep gia mao da nhan tien ma khong that su thanh toan.
export class RecordGiftDto {
  @ApiProperty({ enum: GiftType })
  @IsEnum(GiftType)
  type!: GiftType;

  @ApiProperty({ example: 500000 })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  guestId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  animationType?: string;
}

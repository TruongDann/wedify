import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { MAX_TOPUP_HEARTS, MIN_TOPUP_HEARTS } from '../hearts.constants';

export class CreateTopupDto {
  @ApiProperty({ example: 50, description: 'Số tim muốn mua' })
  @IsInt()
  @Min(MIN_TOPUP_HEARTS)
  @Max(MAX_TOPUP_HEARTS)
  hearts!: number;
}

export class SendGiftDto {
  @ApiProperty({ example: 'love-hearts' })
  @IsString()
  giftCode!: string;

  @ApiProperty({ required: false, example: 'Chúc hai bạn trăm năm hạnh phúc!' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class ExchangeHeartsDto {
  @ApiProperty({ example: 100, description: 'Số tim nhận được muốn đổi ra tiền' })
  @IsInt()
  @Min(1)
  hearts!: number;
}

export class TopupWebhookDto {
  @IsString()
  paymentCode!: string;

  @IsInt()
  amount!: number;

  @IsString()
  signature!: string;
}

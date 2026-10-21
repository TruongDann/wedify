import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BankInfoDto {
  @ApiProperty({ example: 'Vietcombank' })
  @IsString()
  bankName!: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  accountNumber!: string;

  @ApiProperty({ example: 'NGUYEN VAN A' })
  @IsString()
  accountHolder!: string;
}

export class RequestWithdrawalDto {
  @ApiProperty({ example: 500000 })
  @IsInt()
  @Min(50000, { message: 'Số tiền rút tối thiểu là 50.000đ' })
  amount!: number;

  @ApiProperty({ type: BankInfoDto })
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo!: BankInfoDto;
}

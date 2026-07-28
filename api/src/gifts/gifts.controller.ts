import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { RecordGiftDto } from './dto/record-gift.dto';
import { GiftsService } from './gifts.service';

@ApiTags('gifts')
@ApiBearerAuth()
@Controller('invitations/:invitationId/gifts')
export class GiftsController {
  constructor(private giftsService: GiftsService) {}

  // Host tu xac nhan da nhan chuyen khoan qua QR ngan hang (xem RecordGiftDto - luu y KHONG
  // dung endpoint nay cho qua ao, luong do phai qua webhook cong thanh toan).
  @Post('bank-qr')
  recordBankQrGift(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecordGiftDto,
  ) {
    return this.giftsService.recordBankQrGift(invitationId, user.sub, dto);
  }

  @Get()
  findAll(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.giftsService.findAllForInvitation(invitationId, user.sub);
  }
}

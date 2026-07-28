import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { GiftsService } from './gifts.service';

interface VirtualGiftWebhookPayload {
  invitationId: string;
  guestId?: string;
  amount: number;
  animationType?: string;
  signature: string; // TODO: chu ky that tu cong thanh toan da chon (VNPay/Momo/PayOS...)
}

// STUB - endpoint webhook cho luong "mua qua ao bang tien that" (muc 3.10.3). Day KHONG PHAI
// tich hop that voi cong thanh toan nao - can lam truoc khi len production:
//   1. Chon cong thanh toan (VNPay/Momo/PayOS - xem non-functional 4.2: tuan thu chuan cong
//      thanh toan VN, KHONG luu thong tin the truc tiep).
//   2. Thay verifySignature() ben duoi bang xac minh chu ky THAT theo tai lieu cong da chon
//      (vd HMAC-SHA256 nhu PayOS - xem pattern da lam o du an 365home-cms PaymentController).
//   3. Idempotency: kiem tra da xu ly giao dich nay chua truoc khi cong tien (tranh cong 2 lan
//      neu cong thanh toan gui webhook trung - xem lai bai hoc tu 365home-cms extra_charge webhook
//      KHONG co idempotency check, la loi da phat hien truoc do).
@ApiExcludeController() // an khoi Swagger docs cong khai - day la endpoint noi bo cho cong thanh toan goi
@Controller('webhooks/payments')
export class PaymentsWebhookController {
  constructor(private giftsService: GiftsService) {}

  private verifySignature(payload: VirtualGiftWebhookPayload): boolean {
    // TODO: thay bang xac minh chu ky HMAC that cua cong thanh toan da chon.
    return Boolean(payload.signature);
  }

  @Public()
  @Post('virtual-gift')
  async handleVirtualGift(@Body() payload: VirtualGiftWebhookPayload) {
    if (!this.verifySignature(payload)) {
      throw new UnauthorizedException('Chữ ký webhook không hợp lệ');
    }

    return this.giftsService.recordVirtualGiftFromWebhook(
      payload.invitationId,
      payload.guestId ?? null,
      payload.amount,
      payload.animationType,
    );
  }
}

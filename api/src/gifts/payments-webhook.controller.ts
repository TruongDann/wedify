import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { createHmac } from 'crypto';
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
  private readonly processed = new Set<string>();

  constructor(
    private readonly giftsService: GiftsService,
    private readonly config: ConfigService,
  ) {}

  private verifySignature(payload: VirtualGiftWebhookPayload): boolean {
    const secret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET');
    // Khong co secret thi tu choi han - truoc day chap nhan moi chu ky, ai cung co the tu cong tien vao vi.
    if (!secret) {
      return false;
    }

    const normalized = {
      invitationId: payload.invitationId,
      guestId: payload.guestId ?? null,
      amount: payload.amount,
      animationType: payload.animationType ?? null,
    };

    const expected = createHmac('sha256', secret)
      .update(JSON.stringify(normalized))
      .digest('hex');

    return payload.signature === expected || payload.signature === expected.toLowerCase();
  }

  @Public()
  @Post('virtual-gift')
  async handleVirtualGift(@Body() payload: VirtualGiftWebhookPayload) {
    if (!payload.signature) {
      throw new UnauthorizedException('Thiếu chữ ký webhook');
    }

    if (!this.verifySignature(payload)) {
      throw new UnauthorizedException('Chữ ký webhook không hợp lệ');
    }

    const dedupeKey = `${payload.invitationId}:${payload.guestId ?? 'anonymous'}:${payload.amount}:${payload.animationType ?? ''}`;
    if (this.processed.has(dedupeKey)) {
      return { message: 'Webhook đã được xử lý trước đó', duplicate: true };
    }

    this.processed.add(dedupeKey);

    return this.giftsService.recordVirtualGiftFromWebhook(
      payload.invitationId,
      payload.guestId ?? null,
      payload.amount,
      payload.animationType,
    );
  }
}

import { Module } from '@nestjs/common';
import { InvitationsModule } from '../invitations/invitations.module';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';
import { PaymentsWebhookController } from './payments-webhook.controller';

@Module({
  imports: [InvitationsModule],
  controllers: [GiftsController, PaymentsWebhookController],
  providers: [GiftsService],
})
export class GiftsModule {}

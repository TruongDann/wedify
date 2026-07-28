import { Module } from '@nestjs/common';
import { InvitationsModule } from '../invitations/invitations.module';
import { WishesController } from './wishes.controller';
import { WishesService } from './wishes.service';

@Module({
  imports: [InvitationsModule],
  controllers: [WishesController],
  providers: [WishesService],
})
export class WishesModule {}

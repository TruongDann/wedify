import { Module } from '@nestjs/common';
import { InvitationsModule } from '../invitations/invitations.module';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';

@Module({
  imports: [InvitationsModule],
  controllers: [GuestsController],
  providers: [GuestsService],
})
export class GuestsModule {}

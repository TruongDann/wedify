import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SubmitPublicRsvpDto } from './dto/submit-public-rsvp.dto';
import { SubmitRsvpDto } from './dto/submit-rsvp.dto';
import { RsvpService } from './rsvp.service';

@ApiTags('rsvp')
@Controller()
export class RsvpController {
  constructor(private rsvpService: RsvpService) {}

  @Public()
  @Post('guest-links/:token/rsvp')
  submit(@Param('token') token: string, @Body() dto: SubmitRsvpDto) {
    return this.rsvpService.submit(token, dto);
  }

  @Public()
  @Post('invitations/by-slug/:slug/rsvp')
  submitPublic(@Param('slug') slug: string, @Body() dto: SubmitPublicRsvpDto) {
    return this.rsvpService.submitBySlug(slug, dto);
  }

  @ApiBearerAuth()
  @Get('invitations/:invitationId/rsvp-stats')
  stats(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rsvpService.statsForInvitation(invitationId, user.sub);
  }
}

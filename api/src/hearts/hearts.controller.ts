import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTopupDto, ExchangeHeartsDto, SendGiftDto, TopupWebhookDto } from './dto/hearts.dto';
import { HeartsService } from './hearts.service';

@ApiTags('hearts')
@Controller()
export class HeartsController {
  constructor(private heartsService: HeartsService) {}

  @Public()
  @Get('hearts/catalog')
  catalog() {
    return this.heartsService.catalog();
  }

  @ApiBearerAuth()
  @Get('hearts/me')
  me(@CurrentUser() user: JwtPayload) {
    return this.heartsService.getMine(user.sub);
  }

  @ApiBearerAuth()
  @Get('hearts/history')
  history(@CurrentUser() user: JwtPayload) {
    return this.heartsService.history(user.sub);
  }

  @ApiBearerAuth()
  @Get('hearts/topups')
  topups(@CurrentUser() user: JwtPayload) {
    return this.heartsService.listTopups(user.sub);
  }

  @ApiBearerAuth()
  @Post('hearts/topups')
  createTopup(@CurrentUser() user: JwtPayload, @Body() dto: CreateTopupDto) {
    return this.heartsService.createTopup(user.sub, dto);
  }

  @ApiBearerAuth()
  @Post('hearts/topups/:id/sandbox-confirm')
  sandboxConfirm(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.heartsService.sandboxConfirm(user.sub, id);
  }

  @ApiBearerAuth()
  @Post('hearts/exchange')
  exchange(@CurrentUser() user: JwtPayload, @Body() dto: ExchangeHeartsDto) {
    return this.heartsService.exchange(user.sub, dto.hearts);
  }

  @ApiBearerAuth()
  @Post('invitations/by-slug/:slug/gifts')
  sendGift(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
    @Body() dto: SendGiftDto,
  ) {
    return this.heartsService.sendGift(user.sub, slug, dto);
  }

  @Public()
  @ApiExcludeEndpoint()
  @Post('webhooks/payments/heart-topup')
  topupWebhook(@Body() dto: TopupWebhookDto) {
    return this.heartsService.handleTopupWebhook(dto);
  }
}

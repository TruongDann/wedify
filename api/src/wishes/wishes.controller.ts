import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreatePublicWishDto } from './dto/create-public-wish.dto';
import { CreateWishDto } from './dto/create-wish.dto';
import { SetHiddenDto } from './dto/set-hidden.dto';
import { WishesService } from './wishes.service';

@ApiTags('wishes')
@Controller()
export class WishesController {
  constructor(private wishesService: WishesService) {}

  @Public()
  @Post('guest-links/:token/wishes')
  create(@Param('token') token: string, @Body() dto: CreateWishDto) {
    return this.wishesService.createByGuestToken(token, dto);
  }

  @Public()
  @Post('invitations/by-slug/:slug/wishes')
  createPublic(@Param('slug') slug: string, @Body() dto: CreatePublicWishDto) {
    return this.wishesService.createBySlug(slug, dto);
  }

  @Public()
  @Get('invitations/by-slug/:slug/wishes')
  findPublic(@Param('slug') slug: string) {
    return this.wishesService.findPublicBySlug(slug);
  }

  @ApiBearerAuth()
  @Get('invitations/:invitationId/wishes')
  findAllForHost(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.wishesService.findAllForHost(invitationId, user.sub);
  }

  @ApiBearerAuth()
  @Patch('wishes/:id/hidden')
  setHidden(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SetHiddenDto,
  ) {
    return this.wishesService.setHidden(id, user.sub, dto.isHidden);
  }
}

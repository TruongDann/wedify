import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { BulkCreateGuestDto } from './dto/bulk-create-guest.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestsService } from './guests.service';

@ApiTags('guests')
@Controller()
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  // Guest-facing: khach mo link ca nhan hoa, KHONG dang nhap.
  @Public()
  @Get('guest-links/:token')
  findByToken(@Param('token') token: string) {
    return this.guestsService.findByToken(token);
  }

  @ApiBearerAuth()
  @Post('invitations/:invitationId/guests')
  create(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateGuestDto,
  ) {
    return this.guestsService.create(invitationId, user.sub, dto);
  }

  @ApiBearerAuth()
  @Post('invitations/:invitationId/guests/bulk')
  bulkCreate(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkCreateGuestDto,
  ) {
    return this.guestsService.bulkCreate(invitationId, user.sub, dto);
  }

  @ApiBearerAuth()
  @Get('invitations/:invitationId/guests')
  findAll(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.guestsService.findAllByInvitation(invitationId, user.sub);
  }

  @ApiBearerAuth()
  @Patch('guests/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateGuestDto,
  ) {
    return this.guestsService.update(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @Post('guests/:id/mark-sent')
  markSent(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.guestsService.markSent(id, user.sub);
  }

  @ApiBearerAuth()
  @Delete('guests/:id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.guestsService.remove(id, user.sub);
  }
}

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
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationsService } from './invitations.service';

@ApiTags('invitations')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(user.sub, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.invitationsService.findMine(user.sub);
  }

  // Guest-facing: trang thiep cong khai, khong dang nhap - GET /invitations/by-slug/:slug
  @Public()
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.invitationsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invitationsService.findOne(id, user.sub);
  }

  // Tong hop tuong tac cua khach (qua tang, tham du, loi chuc, khach moi) - chi host/collaborator
  @Get(':id/activity')
  activity(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invitationsService.getActivity(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.invitationsService.update(id, user.sub, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invitationsService.publish(id, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invitationsService.remove(id, user.sub);
  }

  @Post(':id/collaborators')
  addCollaborator(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddCollaboratorDto,
  ) {
    return this.invitationsService.addCollaborator(id, user.sub, dto);
  }

  @Delete(':id/collaborators/:collaboratorUserId')
  removeCollaborator(
    @Param('id') id: string,
    @Param('collaboratorUserId') collaboratorUserId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invitationsService.removeCollaborator(
      id,
      user.sub,
      collaboratorUserId,
    );
  }
}

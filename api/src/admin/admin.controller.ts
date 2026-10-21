import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InvitationStatus, PaymentStatus, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SetHiddenDto } from '../wishes/dto/set-hidden.dto';
import { AdminService } from './admin.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { CreateAdminInvitationDto, UpdateAdminInvitationDto } from './dto/admin-invitation.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Get('dashboard')
  dashboard() { return this.adminService.dashboard(); }

  @Get('lookups')
  lookups() { return this.adminService.lookups(); }

  @Post('users')
  createUser(@Body() dto: CreateAdminUserDto) { return this.adminService.createUser(dto); }
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) { return this.adminService.updateUser(id, dto); }
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) { return this.adminService.deleteUser(id); }

  @Get('invitations')
  invitations(
    @Query('search') search?: string,
    @Query('status') status?: InvitationStatus,
    @Query('page') page?: string,
  ) { return this.adminService.invitations(search, status, Number(page) || 1); }
  @Post('invitations')
  createInvitation(@Body() dto: CreateAdminInvitationDto) { return this.adminService.createInvitation(dto); }
  @Patch('invitations/:id')
  updateInvitation(@Param('id') id: string, @Body() dto: UpdateAdminInvitationDto) { return this.adminService.updateInvitation(id, dto); }
  @Delete('invitations/:id')
  deleteInvitation(@Param('id') id: string) { return this.adminService.deleteInvitation(id); }

  @Get('subscriptions')
  subscriptions(
    @Query('status') status?: PaymentStatus,
    @Query('page') page?: string,
  ) { return this.adminService.subscriptions(status, Number(page) || 1); }
  @Post('subscriptions')
  createSubscription(@Body() dto: CreateSubscriptionDto) { return this.adminService.createSubscription(dto); }

  @Patch('subscriptions/:id')
  updateSubscription(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.adminService.updateSubscription(id, dto);
  }
  @Delete('subscriptions/:id')
  deleteSubscription(@Param('id') id: string) { return this.adminService.deleteSubscription(id); }

  @Get('gifts')
  gifts(@Query('page') page?: string) { return this.adminService.gifts(Number(page) || 1); }

  @Get('wishes')
  wishes(@Query('hidden') hidden?: string, @Query('page') page?: string) {
    return this.adminService.wishes(hidden, Number(page) || 1);
  }

  @Patch('wishes/:id/hidden')
  setWishHidden(@Param('id') id: string, @Body() dto: SetHiddenDto) {
    return this.adminService.setWishHidden(id, dto.isHidden);
  }
  @Delete('wishes/:id')
  deleteWish(@Param('id') id: string) { return this.adminService.deleteWish(id); }

  @Delete('affiliates/:id')
  deleteAffiliate(@Param('id') id: string) { return this.adminService.deleteAffiliate(id); }

  @Get('system/health')
  health() { return this.adminService.health(); }
}

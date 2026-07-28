import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole, WithdrawalStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';
import { WalletsService } from './wallets.service';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller()
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Get('wallet/me')
  getMyWallet(@CurrentUser() user: JwtPayload) {
    return this.walletsService.getMyWallet(user.sub);
  }

  @Post('wallet/withdrawals')
  requestWithdrawal(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestWithdrawalDto,
  ) {
    return this.walletsService.requestWithdrawal(user.sub, dto);
  }

  // Admin Panel (muc 3.15) - duyet/tu choi/danh dau da chi tra yeu cau rut tien.
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/withdrawals')
  findAllWithdrawals(@Query('status') status?: WithdrawalStatus) {
    return this.walletsService.findAllWithdrawals(status);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/withdrawals/:id')
  updateWithdrawalStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWithdrawalStatusDto,
  ) {
    return this.walletsService.updateWithdrawalStatus(id, dto.status);
  }
}

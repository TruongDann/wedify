import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AffiliateStatus, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { AffiliatesService } from './affiliates.service';
import { UpdateAffiliateStatusDto } from './dto/update-affiliate-status.dto';

@ApiTags('affiliates')
@ApiBearerAuth()
@Controller('affiliates')
export class AffiliatesController {
  constructor(private affiliatesService: AffiliatesService) {}

  @Post('apply')
  apply(@CurrentUser() user: JwtPayload) {
    return this.affiliatesService.apply(user.sub);
  }

  @Get('me')
  getMyDashboard(@CurrentUser() user: JwtPayload) {
    return this.affiliatesService.getMyDashboard(user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query('status') status?: AffiliateStatus) {
    return this.affiliatesService.findAll(status);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAffiliateStatusDto) {
    return this.affiliatesService.updateStatus(id, dto.status);
  }
}

import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { SetLockedDto } from './dto/set-locked.dto';
import { UsersService } from './users.service';

// Toan bo controller nay danh cho Admin Panel (muc 3.15) - quan ly user, khoa/mo tai khoan.
// JwtAuthGuard da gan global (app.module.ts), o day chi can them RolesGuard + @Roles(ADMIN).
@ApiTags('users (admin)')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('page') page?: string) {
    return this.usersService.findAll(search, page ? Number(page) : 1);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/lock')
  setLocked(@Param('id') id: string, @Body() dto: SetLockedDto) {
    return this.usersService.setLocked(id, dto.isLocked);
  }
}

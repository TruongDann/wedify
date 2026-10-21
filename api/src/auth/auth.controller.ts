import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('oauth')
  oauthLogin(@Body() dto: OAuthLoginDto) {
    return this.authService.oauthLogin(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, dto);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub, user.sid);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  logoutAll(@CurrentUser() user: JwtPayload) {
    return this.authService.logoutAll(user.sub);
  }

  @ApiBearerAuth()
  @Get('sessions')
  getSessions(@CurrentUser() user: JwtPayload) {
    return this.authService.getSessions(user.sub, user.sid);
  }

  @ApiBearerAuth()
  @Delete('sessions/:id')
  revokeSession(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.authService.revokeSession(user.sub, id);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('email/send-verification')
  sendEmailVerification(@CurrentUser() user: JwtPayload) {
    return this.authService.sendEmailVerification(user.sub);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('email/resend-verification')
  resendEmailVerification(@CurrentUser() user: JwtPayload) {
    return this.authService.sendEmailVerification(user.sub);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('email/verify')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }
}

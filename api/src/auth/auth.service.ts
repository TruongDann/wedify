import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PlanTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import { ChangePasswordDto } from './dto/change-password.dto';
import { OAuthLoginDto, OAuthProvider } from './dto/oauth-login.dto';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 gio
const EMAIL_VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  private sanitizeUser<T extends { passwordHash: string | null }>(
    user: T,
  ): Omit<T, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async signTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async createSessionTokens(user: {
    id: string;
    email: string;
    role: JwtPayload['role'];
  }) {
    const sid = randomUUID();
    const tokens = await this.signTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      sid,
    });
    const decoded = await this.jwt.verifyAsync<JwtPayload & { exp: number }>(
      tokens.refreshToken,
      { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') },
    );
    await this.prisma.session.create({
      data: {
        id: sid,
        userId: user.id,
        sessionToken: this.hashToken(tokens.refreshToken),
        expires: new Date(decoded.exp * 1000),
      },
    });
    return tokens;
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email này đã được đăng ký');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const freePlan = await this.prisma.plan.findUnique({
      where: { tier: PlanTier.FREE },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        planId: freePlan?.id,
        wallet: { create: { balance: 0 } },
      },
    });

    const hydratedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { plan: true },
    });
    const tokens = await this.createSessionTokens(user);
    return { user: hydratedUser ? this.sanitizeUser(hydratedUser) : this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { plan: true },
    });
    if (!user || !user.passwordHash) {
      // Cung 1 thong bao chung cho ca 2 truong hop (khong ton tai email / dang ky bang OAuth
      // khong co mat khau) - tranh lo thong tin email nao da ton tai trong he thong.
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.isLocked) {
      throw new UnauthorizedException(
        'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên',
      );
    }

    const tokens = await this.createSessionTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async oauthLogin(dto: OAuthLoginDto) {
    const profile = await this.getOAuthProfile(dto.provider, dto.accessToken);
    const account = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: dto.provider,
          providerAccountId: profile.id,
        },
      },
      include: { user: true },
    });

    let user: any = account?.user ?? null;
    if (!user) {
      const existing = await this.prisma.user.findUnique({ where: { email: profile.email } });
      if (existing && !profile.emailVerified) {
        throw new ConflictException(
          'Email đã tồn tại và nhà cung cấp chưa xác nhận email. Hãy đăng nhập bằng mật khẩu.',
        );
      }
      const freePlan = await this.prisma.plan.findUnique({ where: { tier: PlanTier.FREE } });
      user = await this.prisma.$transaction(async (tx) => {
        const linkedUser = existing ??
          (await tx.user.create({
            data: {
              email: profile.email,
              emailVerified: profile.emailVerified ? new Date() : null,
              name: profile.name,
              avatarUrl: profile.avatarUrl,
              planId: freePlan?.id,
              wallet: { create: { balance: 0 } },
            },
          }));
        await tx.oAuthAccount.create({
          data: {
            userId: linkedUser.id,
            provider: dto.provider,
            providerAccountId: profile.id,
          },
        });
        return linkedUser;
      });
      user = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { plan: true },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Không thể tải thông tin người dùng sau khi đăng nhập');
    }
    if (user.isLocked) throw new UnauthorizedException('Tài khoản đã bị khóa');
    const tokens = await this.createSessionTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return { user: this.sanitizeUser(user), ...tokens };
  }

  private async getOAuthProfile(provider: OAuthProvider, accessToken: string) {
    const url = provider === OAuthProvider.GOOGLE
      ? 'https://www.googleapis.com/oauth2/v3/userinfo'
      : `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`;
    const response = await fetch(url, {
      headers: provider === OAuthProvider.GOOGLE
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    if (!response.ok) throw new UnauthorizedException('OAuth token không hợp lệ');
    const data = (await response.json()) as Record<string, unknown>;
    const id = String(data.sub ?? data.id ?? '');
    const email = typeof data.email === 'string' ? data.email.toLowerCase() : '';
    if (!id || !email) {
      throw new UnauthorizedException('Nhà cung cấp OAuth không trả về email hợp lệ');
    }
    const picture = data.picture as Record<string, unknown> | string | undefined;
    const facebookPicture = typeof picture === 'object'
      ? (picture.data as Record<string, unknown> | undefined)?.url
      : undefined;
    return {
      id,
      email,
      name: typeof data.name === 'string' ? data.name : undefined,
      avatarUrl: typeof picture === 'string'
        ? picture
        : typeof facebookPicture === 'string' ? facebookPicture : undefined,
      emailVerified: provider === OAuthProvider.GOOGLE ? data.email_verified === true : false,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.isLocked) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc đã bị khóa');
    }

    if (!payload.sid) throw new UnauthorizedException('Refresh token không có session hợp lệ');
    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: user.id,
        sessionToken: this.hashToken(refreshToken),
        expires: { gt: new Date() },
      },
    });
    if (!session) throw new UnauthorizedException('Refresh token đã bị thu hồi');

    const tokens = await this.signTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      sid: session.id,
    });
    const decoded = await this.jwt.verifyAsync<JwtPayload & { exp: number }>(
      tokens.refreshToken,
      { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') },
    );
    const rotated = await this.prisma.session.updateMany({
      where: { id: session.id, sessionToken: session.sessionToken },
      data: {
        sessionToken: this.hashToken(tokens.refreshToken),
        expires: new Date(decoded.exp * 1000),
      },
    });
    if (rotated.count !== 1) {
      throw new UnauthorizedException('Refresh token đã được sử dụng');
    }
    return tokens;
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { plan: true },
    });
    return this.sanitizeUser(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // Luon tra ve thong bao thanh cong du email co ton tai hay khong - tranh lo email nao
    // da dang ky (enumeration attack).
    if (!user) {
      return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
    }

    await this.prisma.verificationToken.deleteMany({
      where: { identifier: user.email, type: 'password_reset' },
    });
    const token = randomUUID();
    await this.prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        type: 'password_reset',
        expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, token);

    return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.verificationToken.findFirst({
      where: { token: dto.token, type: 'password_reset' },
    });
    if (!record || record.expires < new Date()) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email: record.identifier },
        data: { passwordHash },
      }),
      this.prisma.verificationToken.delete({ where: { id: record.id } }),
      this.prisma.session.deleteMany({
        where: { user: { email: record.identifier } },
      }),
    ]);

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Tài khoản chưa thiết lập mật khẩu');
    }
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    if (await bcrypt.compare(dto.newPassword, user.passwordHash)) {
      throw new ConflictException('Mật khẩu mới phải khác mật khẩu hiện tại');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.session.deleteMany({ where: { userId } }),
    ]);
    return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  async logout(userId: string, sessionId: string) {
    if (sessionId) {
      await this.prisma.session.deleteMany({ where: { id: sessionId, userId } });
    }
    return { message: 'Đăng xuất thành công' };
  }

  async logoutAll(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
    return { message: 'Đã đăng xuất khỏi tất cả thiết bị' };
  }

  getSessions(userId: string, currentSessionId: string) {
    return this.prisma.session.findMany({
      where: { userId, expires: { gt: new Date() } },
      select: { id: true, expires: true },
      orderBy: { expires: 'desc' },
    }).then((sessions) => sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    })));
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.session.deleteMany({
      where: { id: sessionId, userId },
    });
    if (!result.count) throw new UnauthorizedException('Session không tồn tại');
    return { message: 'Đã thu hồi session' };
  }

  async sendEmailVerification(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.emailVerified) return { message: 'Email đã được xác minh' };
    await this.prisma.verificationToken.deleteMany({
      where: { identifier: user.email, type: 'email_verify' },
    });
    const token = randomUUID();
    await this.prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        type: 'email_verify',
        expires: new Date(Date.now() + EMAIL_VERIFY_TOKEN_TTL_MS),
      },
    });
    await this.emailService.sendEmailVerificationEmail(user.email, token);
    return { message: 'Nếu email hợp lệ, liên kết xác minh đã được gửi.' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.verificationToken.findFirst({
      where: { token, type: 'email_verify' },
    });
    if (!record || record.expires < new Date()) {
      throw new UnauthorizedException('Token xác minh không hợp lệ hoặc đã hết hạn');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
      }),
      this.prisma.verificationToken.delete({ where: { id: record.id } }),
    ]);
    return { message: 'Xác minh email thành công' };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  sid: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  // Gia tri tra ve o day duoc Passport gan vao request.user - xem CurrentUser decorator.
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sid) throw new UnauthorizedException('Token không có session hợp lệ');
    const [user, session] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { email: true, role: true, isLocked: true },
      }),
      this.prisma.session.findFirst({
        where: { id: payload.sid, userId: payload.sub, expires: { gt: new Date() } },
        select: { id: true },
      }),
    ]);
    if (!user || user.isLocked || !session) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
    }
    // Không tin role/email cũ trong token sau khi Admin thay đổi tài khoản.
    payload.email = user.email;
    payload.role = user.role;
    return payload;
  }
}

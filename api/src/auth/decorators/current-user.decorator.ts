import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../strategies/jwt.strategy';

// Dung trong controller: findMine(@CurrentUser() user: JwtPayload) - lay thang user da duoc
// JwtStrategy.validate() gan vao request.user, khong phai query lai DB moi lan can biet userId.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

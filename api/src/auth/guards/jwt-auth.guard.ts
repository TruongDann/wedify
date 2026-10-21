import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Gan APP_GUARD global trong app.module.ts - MOI route mac dinh yeu cau Bearer token hop le,
// tru route nao gan @Public(). An toan hon cach cu (tung route tu quyet dinh co check hay khong):
// quen gan guard cho 1 route moi la lo du lieu, con quen gan @Public() chi lam route ay bi chan
// nham - loi de phat hien va sua ngay, khong am tham lo du lieu.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

import { SetMetadata } from '@nestjs/common';

// Danh dau route KHONG can JWT (JwtAuthGuard duoc gan GLOBAL trong app.module.ts - moi route
// mac dinh yeu cau dang nhap, chi route nao gan @Public() moi duoc bo qua). Dung cho: register,
// login, refresh, xem thiep cong khai (/invitations/by-slug/:slug), RSVP/wish cua guest...
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

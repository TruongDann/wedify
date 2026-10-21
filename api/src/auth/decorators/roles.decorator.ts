import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// Dung cho cac route Admin Panel (muc 3.15): @Roles(UserRole.ADMIN) ket hop RolesGuard.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

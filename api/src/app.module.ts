import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { AuthModule } from './auth/auth.module';
import { ComponentsModule } from './components/components.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GiftsModule } from './gifts/gifts.module';
import { HeartsModule } from './hearts/hearts.module';
import { GuestsModule } from './guests/guests.module';
import { InvitationsModule } from './invitations/invitations.module';
import { PlansModule } from './plans/plans.module';
import { PrismaModule } from './prisma/prisma.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { TemplatesModule } from './templates/templates.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { WishesModule } from './wishes/wishes.module';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlansModule,
    TemplatesModule,
    ComponentsModule,
    InvitationsModule,
    GuestsModule,
    RsvpModule,
    WishesModule,
    GiftsModule,
    HeartsModule,
    WalletsModule,
    AffiliatesModule,
    AdminModule,
    UploadsModule,
  ],
  providers: [
    // JwtAuthGuard gan GLOBAL - MOI route mac dinh yeu cau Bearer token hop le, tru route nao
    // gan @Public() (xem auth/decorators/public.decorator.ts). An toan hon de tung controller
    // tu quyet dinh co check hay khong - them route moi ma quen gan guard la lo du lieu ngay.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}

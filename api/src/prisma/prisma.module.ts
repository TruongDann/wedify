import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() - moi module con lai (Auth, Users, Invitations...) can PrismaService de query DB,
// khai bao Global de khong phai import PrismaModule lap lai o tung module con.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

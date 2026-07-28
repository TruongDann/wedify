/**
 * Seed du lieu tham chieu bat buoc phai co truoc khi User dau tien dang ky:
 * 3 goi dich vu Free/Basic/Premium theo dung bang gia trong SRS (muc 3.12.1).
 * Chay: npm run db:seed
 *
 * Luu y: gia/gioi han lay tu trang pricing tai thoi diem khao sat (co khuyen mai tam thoi) -
 * SRS tu ghi chu can lam ro voi business owner truoc khi chot cung, nen coi day la GIA TRI
 * KHOI TAO, sua lai qua Admin Panel (module Quan ly Plan) khi co so lieu chinh thuc.
 */
import { PrismaClient, PlanTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans: Array<{
    tier: PlanTier;
    name: string;
    price: number;
    maxImages: number;
    maxViews: number;
    maxInvitations: number;
    storageDurationMonths: number;
    templateTierAccess: PlanTier;
    hasWatermarkRemoval: boolean;
    hasCustomMusic: boolean;
    hasCustomFont: boolean;
    hasZenAi: boolean;
  }> = [
    {
      tier: PlanTier.FREE,
      name: "Free",
      price: 0,
      maxImages: 10,
      maxViews: 300,
      maxInvitations: 1,
      storageDurationMonths: 6,
      templateTierAccess: PlanTier.FREE,
      hasWatermarkRemoval: false,
      hasCustomMusic: false,
      hasCustomFont: false,
      hasZenAi: false,
    },
    {
      tier: PlanTier.BASIC,
      name: "Basic",
      price: 169000,
      maxImages: 50,
      maxViews: 10000,
      maxInvitations: 5, // SRS ghi 3-5, chua khop giua landing/FAQ - can chot lai voi business owner
      storageDurationMonths: 24,
      templateTierAccess: PlanTier.BASIC,
      hasWatermarkRemoval: true,
      hasCustomMusic: true,
      hasCustomFont: true,
      hasZenAi: true,
    },
    {
      tier: PlanTier.PREMIUM,
      name: "Premium",
      price: 269000,
      maxImages: 100,
      maxViews: 50000,
      maxInvitations: 10, // SRS ghi 5-10, chua khop giua landing/FAQ - can chot lai voi business owner
      storageDurationMonths: 60,
      templateTierAccess: PlanTier.PREMIUM,
      hasWatermarkRemoval: true,
      hasCustomMusic: true,
      hasCustomFont: true,
      hasZenAi: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  console.log(`Da seed ${plans.length} goi dich vu: Free, Basic, Premium.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

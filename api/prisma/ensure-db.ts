/**
 * Chạy sau `prisma db push` khi khởi động dev: nếu DB còn trống (chưa có gói dịch vụ) thì nạp dữ liệu nền.
 * Không làm gì nếu DB đã có dữ liệu, nên chạy lại bao nhiêu lần cũng an toàn.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.plan.count();
  await prisma.$disconnect();
  if (plans > 0) {
    console.log("DB đã có dữ liệu nền, bỏ qua seed.");
    return;
  }
  console.log("DB trống - đang nạp dữ liệu nền (gói dịch vụ, mẫu, tài khoản admin)...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

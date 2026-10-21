import { normalizePlanTier } from "@/lib/auth";

/**
 * Tính năng "Dùng mẫu này" (điền thông tin để tạo thiệp) dành cho gói Premium.
 * Đặt NEXT_PUBLIC_REQUIRE_PREMIUM=false để mở cho mọi tài khoản (vd. khi thử nghiệm).
 * Lưu ý: đây là kiểm tra ở giao diện, chưa chặn ở API.
 */
export const REQUIRE_PREMIUM = process.env.NEXT_PUBLIC_REQUIRE_PREMIUM !== "false";

export const isPremiumProfile = (profile: unknown): boolean => {
  const data = profile as { plan?: { tier?: string }; tier?: string; planTier?: string } | null;
  const tier = data?.plan?.tier ?? data?.tier ?? data?.planTier ?? null;
  return normalizePlanTier(typeof tier === "string" ? tier : null) === "PREMIUM";
};

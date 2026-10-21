/**
 * Ảnh động (sticker chuyển động) — Google "Noto Emoji Animation".
 * Giấy phép CC BY 4.0: phải ghi nguồn. Trang thiệp tự hiện dòng ghi nguồn khi có dùng ảnh loại này.
 * https://googlefonts.github.io/noto-emoji-animation/
 */
export const NOTO_ANIMATED_ATTRIBUTION = "Ảnh động: Google Noto Emoji Animation (CC BY 4.0)";

export const notoAnimatedUrl = (codepoint: string) => `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/512.webp`;

export const isNotoAnimatedSrc = (src?: string) => Boolean(src && src.includes("fonts.gstatic.com/s/e/notoemoji/"));

export interface AnimatedSticker {
  code: string;
  label: string;
  group: "love" | "flower" | "party" | "sparkle";
}

export const ANIMATED_STICKERS: AnimatedSticker[] = [
  { code: "1f496", label: "Tim lấp lánh", group: "love" },
  { code: "1f493", label: "Tim đập", group: "love" },
  { code: "1f495", label: "Hai trái tim", group: "love" },
  { code: "1f49d", label: "Tim ruy băng", group: "love" },
  { code: "2764", label: "Tim đỏ", group: "love" },
  { code: "1f48d", label: "Nhẫn cưới", group: "love" },
  { code: "1f48b", label: "Nụ hôn", group: "love" },
  { code: "1f48c", label: "Thư tình", group: "love" },
  { code: "1f60d", label: "Mắt trái tim", group: "love" },
  { code: "1f970", label: "Yêu thương", group: "love" },
  { code: "1f54a", label: "Chim bồ câu", group: "love" },
  { code: "1f64f", label: "Cảm ơn", group: "love" },
  { code: "1f490", label: "Bó hoa", group: "flower" },
  { code: "1f339", label: "Hoa hồng", group: "flower" },
  { code: "1f338", label: "Hoa anh đào", group: "flower" },
  { code: "1f337", label: "Hoa tulip", group: "flower" },
  { code: "1f340", label: "Cỏ bốn lá", group: "flower" },
  { code: "1f98b", label: "Bướm", group: "flower" },
  { code: "1f308", label: "Cầu vồng", group: "flower" },
  { code: "1f31e", label: "Mặt trời", group: "flower" },
  { code: "1f382", label: "Bánh sinh nhật", group: "party" },
  { code: "1f389", label: "Pháo giấy", group: "party" },
  { code: "1f38a", label: "Confetti", group: "party" },
  { code: "1f388", label: "Bóng bay", group: "party" },
  { code: "1f381", label: "Hộp quà", group: "party" },
  { code: "1f942", label: "Cụng ly", group: "party" },
  { code: "1f37e", label: "Champagne", group: "party" },
  { code: "1f973", label: "Tiệc tùng", group: "party" },
  { code: "1f386", label: "Pháo hoa", group: "party" },
  { code: "1f3b6", label: "Nốt nhạc", group: "party" },
  { code: "2728", label: "Lấp lánh", group: "sparkle" },
  { code: "1f31f", label: "Sao sáng", group: "sparkle" },
  { code: "2b50", label: "Ngôi sao", group: "sparkle" },
  { code: "1f4ab", label: "Xoáy sao", group: "sparkle" },
  { code: "1f525", label: "Lửa", group: "sparkle" },
  { code: "1f451", label: "Vương miện", group: "sparkle" },
  { code: "1f4af", label: "100 điểm", group: "sparkle" },
];

export const ANIMATED_GROUP_LABELS: Record<AnimatedSticker["group"], string> = {
  love: "Tình yêu",
  flower: "Hoa & thiên nhiên",
  party: "Tiệc tùng",
  sparkle: "Lấp lánh",
};

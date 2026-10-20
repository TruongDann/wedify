import type { AnimationType } from "@/types/editor";

/** Thời lượng mặc định (giây) của hiệu ứng xuất hiện — dùng chung cho editor (Konva) và trang xem thiệp (CSS). */
export const DEFAULT_APPEAR_DURATION: Partial<Record<AnimationType, number>> = {
  fadeIn: 1,
  slideIn: 0.8,
  slideUp: 1.2,
  slideDown: 1.2,
  slideLeft: 1.2,
  slideRight: 1.2,
  zoom: 0.6,
  bounce: 1,
};

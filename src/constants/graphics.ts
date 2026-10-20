import { GRAPHICS_MANIFEST } from "@/data/graphicsManifest";

export interface GraphicCategory {
  /** Trùng tên thư mục trong public/graphics */
  id: string;
  label: string;
}

/** Thứ tự hiển thị trong tab Đồ họa. */
export const GRAPHIC_CATEGORIES: GraphicCategory[] = [
  { id: "wedding-elements", label: "Yếu tố đám cưới" },
  { id: "wedding-flowers", label: "Hoa cưới" },
  { id: "hearts", label: "Trái tim" },
  { id: "characters", label: "Nhân vật" },
  { id: "text-combos", label: "Kết hợp chữ" },
  { id: "numbers-and-letters", label: "Số và chữ cái" },
  { id: "borders", label: "Đường viền" },
  { id: "dividers", label: "Đường phân cách" },
  { id: "shapes", label: "Hình dạng" },
  { id: "stars", label: "Ngôi sao" },
  { id: "sun", label: "Mặt trời" },
  { id: "space-decor", label: "Trang trí không gian" },
  { id: "featured-festivals", label: "Lễ hội nổi bật" },
  { id: "birthday", label: "Chúc mừng sinh nhật" },
  { id: "mother-and-baby", label: "Mẹ và bé" },
  { id: "vietnamese-culture", label: "Văn hóa Việt" },
  { id: "maps", label: "Bản đồ" },
  { id: "flowchart-icons", label: "Biểu tượng lưu đồ" },
];

export const getGraphicUrl = (categoryId: string, file: string) =>
  `/graphics/${categoryId}/${encodeURIComponent(file)}`;

export const getGraphicUrls = (categoryId: string): string[] =>
  (GRAPHICS_MANIFEST[categoryId] ?? []).map((f) => getGraphicUrl(categoryId, f));

/**
 * Sticker, and image constants for wedding card editor
 */

export interface Sticker {
  id: number;
  src: string;
  category: string;
}

// Available stickers
export const STICKERS: Sticker[] = [
  {
    id: 1,
    src: "https://img.icons8.com/color/96/wedding-rings.png",
    category: "wedding",
  },
  {
    id: 2,
    src: "https://img.icons8.com/color/96/champagne.png",
    category: "wedding",
  },
  {
    id: 3,
    src: "https://img.icons8.com/color/96/wedding-cake.png",
    category: "wedding",
  },
  {
    id: 4,
    src: "https://img.icons8.com/color/96/rose-bouquet.png",
    category: "flowers",
  },
  {
    id: 5,
    src: "https://img.icons8.com/color/96/flower.png",
    category: "flowers",
  },
  {
    id: 6,
    src: "https://img.icons8.com/color/96/butterfly.png",
    category: "nature",
  },
  {
    id: 7,
    src: "https://img.icons8.com/color/96/dove.png",
    category: "nature",
  },
  {
    id: 8,
    src: "https://img.icons8.com/color/96/sparkling-diamond.png",
    category: "wedding",
  },
];

// Stock images from Unsplash — bản đủ nét để chèn vào thiệp; ô xem trước dùng stockThumb()
export const STOCK_IMAGES: string[] = [
  "/assets/images/stock/nhan-vat-01.webp",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1600&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1600&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=80",
];

/** Ảnh thu nhỏ cho ô thư viện (Unsplash tự đổi kích thước theo tham số w) */
export const stockThumb = (src: string) =>
  src.includes("images.unsplash.com") ? src.replace(/w=\d+/, "w=240") : src;

export interface Decoration {
  id: string;
  name: string;
  src: string;
  /** Kích thước mặc định khi thêm vào thiệp */
  width: number;
  height: number;
}

/** Họa tiết SVG tự vẽ trong public/assets/images/decor — dùng tự do, không phụ thuộc nguồn ngoài. */
export const DECORATIONS: Decoration[] = [
  { id: "laurel-left", name: "Cành lá trái", src: "/assets/images/decor/laurel-left.svg", width: 30, height: 60 },
  { id: "laurel-right", name: "Cành lá phải", src: "/assets/images/decor/laurel-right.svg", width: 30, height: 60 },
  { id: "wreath", name: "Vòng nguyệt quế", src: "/assets/images/decor/wreath.svg", width: 160, height: 160 },
  { id: "divider-flourish", name: "Đường chia hoa văn", src: "/assets/images/decor/divider-flourish.svg", width: 300, height: 40 },
  { id: "divider-heart", name: "Đường chia trái tim", src: "/assets/images/decor/divider-heart.svg", width: 300, height: 30 },
  { id: "blob-soft", name: "Nền giọt mềm", src: "/assets/images/decor/blob-soft.svg", width: 280, height: 280 },
  { id: "wave-band", name: "Dải lượn", src: "/assets/images/decor/wave-band.svg", width: 500, height: 120 },
  { id: "frame-thin", name: "Khung viền mảnh", src: "/assets/images/decor/frame-thin.svg", width: 300, height: 400 },
  { id: "doves", name: "Đôi chim", src: "/assets/images/decor/doves.svg", width: 120, height: 75 },
];

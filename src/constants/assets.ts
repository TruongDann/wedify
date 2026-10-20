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

// Stock images from Unsplash
export const STOCK_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=200",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=200",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200",
];

export interface Decoration {
  id: string;
  name: string;
  src: string;
  /** Kích thước mặc định khi thêm vào thiệp */
  width: number;
  height: number;
}

/** Họa tiết SVG tự vẽ trong public/decor — dùng tự do, không phụ thuộc nguồn ngoài. */
export const DECORATIONS: Decoration[] = [
  { id: "laurel-left", name: "Cành lá trái", src: "/decor/laurel-left.svg", width: 30, height: 60 },
  { id: "laurel-right", name: "Cành lá phải", src: "/decor/laurel-right.svg", width: 30, height: 60 },
  { id: "wreath", name: "Vòng nguyệt quế", src: "/decor/wreath.svg", width: 160, height: 160 },
  { id: "divider-flourish", name: "Đường chia hoa văn", src: "/decor/divider-flourish.svg", width: 300, height: 40 },
  { id: "divider-heart", name: "Đường chia trái tim", src: "/decor/divider-heart.svg", width: 300, height: 30 },
  { id: "blob-soft", name: "Nền giọt mềm", src: "/decor/blob-soft.svg", width: 280, height: 280 },
  { id: "wave-band", name: "Dải lượn", src: "/decor/wave-band.svg", width: 500, height: 120 },
  { id: "frame-thin", name: "Khung viền mảnh", src: "/decor/frame-thin.svg", width: 300, height: 400 },
  { id: "doves", name: "Đôi chim", src: "/decor/doves.svg", width: 120, height: 75 },
];

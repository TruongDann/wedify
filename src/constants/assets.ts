/**
 * Shape, sticker, and image constants for wedding card editor
 */

import { ShapeElement } from "@/types/editor";

export interface ShapeConfig {
  type: ShapeElement["shapeType"];
  icon: React.ReactNode;
  label: string;
}

export interface Sticker {
  id: number;
  src: string;
  category: string;
}

// Available shapes for the editor
// Icon will be imported in component
export const SHAPES_CONFIG: Array<{
  type: ShapeElement["shapeType"];
  label: string;
}> = [
  { type: "rectangle", label: "Chữ nhật" },
  { type: "circle", label: "Tròn" },
  { type: "triangle", label: "Tam giác" },
  { type: "heart", label: "Tim" },
  { type: "star", label: "Sao" },
  { type: "line", label: "Đường" },
];

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

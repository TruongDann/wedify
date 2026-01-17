/**
 * Shape constants for wedding card editor
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

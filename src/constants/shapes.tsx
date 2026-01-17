/**
 * Shape constants for wedding card editor
 */

import React from "react";
import { ShapeElement } from "@/types/editor";
import { BorderOutlined, HeartOutlined, StarOutlined } from "@ant-design/icons";

export interface ShapeConfig {
  type: ShapeElement["shapeType"];
  icon: React.ReactNode;
  label: string;
}

// Shapes with icons for the editor
export const SHAPES: ShapeConfig[] = [
  { type: "rectangle", icon: <BorderOutlined />, label: "Chữ nhật" },
  { type: "circle", icon: "○", label: "Tròn" },
  { type: "triangle", icon: "△", label: "Tam giác" },
  { type: "heart", icon: <HeartOutlined />, label: "Tim" },
  { type: "star", icon: <StarOutlined />, label: "Sao" },
  { type: "line", icon: "—", label: "Đường" },
];

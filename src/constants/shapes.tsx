/**
 * Shape constants for wedding card editor
 */

import React from "react";
import { Circle, Triangle, Minus } from "lucide-react";
import { BorderOutlined, HeartOutlined, StarOutlined } from "@ant-design/icons";
import { ShapeElement } from "@/types/editor";

export interface ShapeConfig {
  type: ShapeElement["shapeType"];
  icon: React.ReactNode;
  label: string;
}

// Shapes with icons for the editor
export const SHAPES: ShapeConfig[] = [
  { type: "rectangle", icon: <BorderOutlined />, label: "Chữ nhật" },
  { type: "circle", icon: <Circle size={28} strokeWidth={2} />, label: "Tròn" },
  {
    type: "triangle",
    icon: <Triangle size={28} strokeWidth={2} />,
    label: "Tam giác",
  },
  { type: "heart", icon: <HeartOutlined />, label: "Tim" },
  { type: "star", icon: <StarOutlined />, label: "Sao" },
  { type: "line", icon: <Minus size={28} strokeWidth={2} />, label: "Đường" },
];

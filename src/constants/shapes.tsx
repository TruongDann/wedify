/**
 * Shape constants for wedding card editor
 */

import React from "react";
import {
  Circle,
  Triangle,
  Minus,
  Diamond,
  Pentagon,
  Hexagon,
  ArrowRight,
  Cloud,
  MessageSquare,
  Plus,
  CircleDot,
} from "lucide-react";
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
  { type: "circle", icon: <Circle size={24} strokeWidth={2} />, label: "Tròn" },
  {
    type: "triangle",
    icon: <Triangle size={24} strokeWidth={2} />,
    label: "Tam giác",
  },
  {
    type: "diamond",
    icon: <Diamond size={24} strokeWidth={2} />,
    label: "Kim cương",
  },
  {
    type: "pentagon",
    icon: <Pentagon size={24} strokeWidth={2} />,
    label: "Ngũ giác",
  },
  {
    type: "hexagon",
    icon: <Hexagon size={24} strokeWidth={2} />,
    label: "Lục giác",
  },
  { type: "heart", icon: <HeartOutlined />, label: "Tim" },
  { type: "star", icon: <StarOutlined />, label: "Sao" },
  {
    type: "arrow",
    icon: <ArrowRight size={24} strokeWidth={2} />,
    label: "Mũi tên",
  },
  {
    type: "cloud",
    icon: <Cloud size={24} strokeWidth={2} />,
    label: "Đám mây",
  },
  {
    type: "speechBubble",
    icon: <MessageSquare size={24} strokeWidth={2} />,
    label: "Bong bóng",
  },
  {
    type: "cross",
    icon: <Plus size={24} strokeWidth={2} />,
    label: "Dấu cộng",
  },
  {
    type: "ring",
    icon: <CircleDot size={24} strokeWidth={2} />,
    label: "Vòng tròn",
  },
  { type: "line", icon: <Minus size={24} strokeWidth={2} />, label: "Đường" },
];

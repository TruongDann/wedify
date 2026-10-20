/**
 * Animation effects configuration for the wedding card editor
 * Centralized location for all animation effects
 */

import React from "react";
import {
  BorderOutlined,
  ArrowUpOutlined,
  ExpandOutlined,
  SwapOutlined,
  RetweetOutlined,
} from "@ant-design/icons";

export interface AnimationEffect {
  id: "none" | "fadeInAll" | "slideUpAll" | "scaleInAll" | "slideSideMix" | "fadeInSequence";
  name: string;
  icon: React.ReactNode | string;
  description: string;
}

/**
 * Hiệu ứng áp cho cả thiệp — mỗi lựa chọn đặt lại hiệu ứng xuất hiện của mọi phần tử
 * (xem applyAnimationPreset trong panels/left/EffectsTab.tsx).
 */
export const ANIMATION_EFFECTS: AnimationEffect[] = [
  {
    id: "none",
    name: "Không có",
    icon: React.createElement(BorderOutlined, { className: "text-2xl" }),
    description: "Tắt hiệu ứng của mọi phần tử",
  },
  {
    id: "fadeInAll",
    name: "Hiện dần",
    icon: "⋮⋮⋮⋮",
    description: "Mọi phần tử hiện dần khi cuộn tới",
  },
  {
    id: "slideUpAll",
    name: "Trượt lên",
    icon: React.createElement(ArrowUpOutlined, {
      className: "text-2xl text-blue-500",
    }),
    description: "Mọi phần tử trượt lên khi cuộn tới",
  },
  {
    id: "scaleInAll",
    name: "Phóng to",
    icon: React.createElement(ExpandOutlined, {
      className: "text-2xl text-pink-500",
    }),
    description: "Mọi phần tử phóng to khi cuộn tới",
  },
  {
    id: "slideSideMix",
    name: "Trượt hai bên",
    icon: React.createElement(SwapOutlined, {
      className: "text-2xl text-pink-400",
    }),
    description: "Bên trái trượt sang phải, bên phải trượt sang trái, ở giữa trượt lên",
  },
  {
    id: "fadeInSequence",
    name: "Lần lượt",
    icon: React.createElement(RetweetOutlined, {
      className: "text-2xl text-indigo-500",
    }),
    description: "Các phần tử cùng hàng hiện lần lượt từ trái qua phải",
  },
];


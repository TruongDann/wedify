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
  ArrowRightOutlined,
} from "@ant-design/icons";

export interface AnimationEffect {
  id: string;
  name: string;
  icon: React.ReactNode | string;
  description: string;
}

/**
 * Available animation effects for the editor
 * Add or modify effects here for easier maintenance
 */
export const ANIMATION_EFFECTS: AnimationEffect[] = [
  {
    id: "none",
    name: "None",
    icon: React.createElement(BorderOutlined, { className: "text-2xl" }),
    description: "Không có hiệu ứng",
  },
  {
    id: "fadeInAll",
    name: "Fade In All",
    icon: "⋮⋮⋮⋮",
    description: "Hiển thị dần tất cả",
  },
  {
    id: "slideUpAll",
    name: "Slide Up All",
    icon: React.createElement(ArrowUpOutlined, { className: "text-2xl text-blue-500" }),
    description: "Trượt lên tất cả",
  },
  {
    id: "scaleInAll",
    name: "Scale In All",
    icon: React.createElement(ExpandOutlined, { className: "text-2xl text-pink-500" }),
    description: "Phóng to tất cả",
  },
  {
    id: "flipInAll",
    name: "Flip In All",
    icon: React.createElement(SwapOutlined, { className: "text-2xl text-pink-400" }),
    description: "Lật vào tất cả",
  },
  {
    id: "slideUpMix",
    name: "Slide Up Mix",
    icon: React.createElement(RetweetOutlined, { className: "text-2xl text-indigo-500" }),
    description: "Trượt lên hỗn hợp",
  },
  {
    id: "fadeInMix",
    name: "Fade In Mix",
    icon: React.createElement(ArrowRightOutlined, { className: "text-2xl text-pink-400" }),
    description: "Hiển thị dần hỗn hợp",
  },
];

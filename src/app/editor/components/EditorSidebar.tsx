"use client";

import React from "react";
import { Tooltip } from "antd";
import {
  CalendarDays,
  CircleHelp,
  Image as ImageIcon,
  LayoutTemplate,
  Music,
  PanelsTopLeft,
  Shapes,
  Sparkles,
  SwatchBook,
  Type,
  type LucideIcon,
} from "lucide-react";

export type TabKey =
  | "text"
  | "image"
  | "stock"
  | "background"
  | "music"
  | "widget"
  | "blocks"
  | "template"
  | "effect";

interface TabConfig {
  key: TabKey;
  icon: LucideIcon;
  label: string;
  tooltip?: string;
}

const tabs: TabConfig[] = [
  { key: "text", icon: Type, label: "Văn bản", tooltip: "Thêm văn bản" },
  { key: "image", icon: ImageIcon, label: "Hình ảnh", tooltip: "Tải lên hình ảnh" },
  {
    key: "stock",
    icon: Shapes,
    label: "Đồ họa",
    tooltip: "Họa tiết, hình dạng, sticker trang trí",
  },
  { key: "background", icon: SwatchBook, label: "Nền", tooltip: "Thay đổi nền" },
  { key: "music", icon: Music, label: "Âm nhạc", tooltip: "Thêm nhạc nền" },
  {
    key: "widget",
    icon: CalendarDays,
    label: "Tiện ích",
    tooltip: "Lịch, đếm ngược, xác nhận tham dự, bản đồ",
  },
  {
    key: "blocks",
    icon: PanelsTopLeft,
    label: "Khối mẫu",
    tooltip: "Chèn phần dựng sẵn: ảnh bìa, ngày cưới, địa điểm...",
  },
  { key: "template", icon: LayoutTemplate, label: "Mẫu", tooltip: "Chọn mẫu thiệp" },
  {
    key: "effect",
    icon: Sparkles,
    label: "Hiệu ứng",
    tooltip: "Hiệu ứng động, hiệu ứng rơi, màn mở thiệp",
  },
];

const railButton =
  "w-full h-14 flex flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-1.5 text-xs transition-colors";

// Component cho mỗi tab item
interface SidebarTabItemProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: () => void;
}

const SidebarTabItem: React.FC<SidebarTabItemProps> = ({
  tab,
  isActive,
  onClick,
}) => {
  const Icon = tab.icon;
  return (
    <Tooltip title={tab.tooltip} placement="right" mouseEnterDelay={0.4}>
      <button
        type="button"
        className={`${railButton} ${
          isActive
            ? "bg-surface-muted text-link"
            : "text-ink hover:bg-surface-muted"
        }`}
        onClick={onClick}
      >
        <Icon size={20} strokeWidth={1.6} />
        <span>{tab.label}</span>
      </button>
    </Tooltip>
  );
};

interface EditorSidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="w-sidebar bg-white border-r border-line flex flex-col shrink-0 p-1">
      <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto min-h-0 scrollbar-hide">
        {tabs.map((tab) => (
          <SidebarTabItem
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onClick={() => onTabChange(tab.key)}
          />
        ))}
      </div>
      <Tooltip title="Trung tâm hỗ trợ" placement="right">
        <button
          type="button"
          className={`${railButton} text-ink-3 hover:bg-surface-muted hover:text-ink`}
        >
          <CircleHelp size={20} strokeWidth={1.6} />
          <span>Hỗ trợ</span>
        </button>
      </Tooltip>
    </nav>
  );
};

export default EditorSidebar;

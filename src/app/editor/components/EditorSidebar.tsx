"use client";

import React from "react";
import { Tooltip } from "antd";
import {
  FontSizeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  BlockOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { userAuth } from "@/lib/auth";

export type TabKey =
  | "text"
  | "image"
  | "stock"
  | "background"
  | "music"
  | "widget"
  | "template"
  | "effect";

interface TabConfig {
  key: TabKey;
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
}

const tabs: TabConfig[] = [
  {
    key: "text",
    icon: <FontSizeOutlined />,
    label: "Văn bản",
    tooltip: "Thêm văn bản",
  },
  {
    key: "image",
    icon: <PictureOutlined />,
    label: "Hình ảnh",
    tooltip: "Tải lên hình ảnh",
  },
  {
    key: "stock",
    icon: <AppstoreOutlined />,
    label: "Stock",
    tooltip: "Thư viện ảnh stock",
  },
  {
    key: "background",
    icon: <BgColorsOutlined />,
    label: "Nền",
    tooltip: "Thay đổi nền",
  },
  {
    key: "music",
    icon: <CustomerServiceOutlined />,
    label: "Âm nhạc",
    tooltip: "Cần gói Premium",
  },
  {
    key: "widget",
    icon: <CalendarOutlined />,
    label: "Tiện ích",
    tooltip: "Cần gói Premium",
  },
  {
    key: "template",
    icon: <BlockOutlined />,
    label: "Mẫu",
    tooltip: "Chọn mẫu thiệp",
  },
  {
    key: "effect",
    icon: <ThunderboltOutlined />,
    label: "Hiệu ứng",
    tooltip: "Cần gói Premium",
  },
];

const TOOL_ACCESS: Record<TabKey, string> = {
  text: "FREE",
  image: "FREE",
  stock: "BASIC",
  background: "FREE",
  music: "PREMIUM",
  widget: "PREMIUM",
  template: "FREE",
  effect: "PREMIUM",
};

// Component cho mỗi tab item
interface SidebarTabItemProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: () => void;
}

const SidebarTabItem: React.FC<SidebarTabItemProps & { disabled?: boolean }> = ({
  tab,
  isActive,
  onClick,
  disabled = false,
}) => (
  <Tooltip title={disabled ? `${tab.tooltip} · Gói hiện tại không đủ` : tab.tooltip} placement="right">
    <button
      className={`flex flex-col items-center justify-center py-3 px-2 gap-1 transition-colors border-l-2 ${
        disabled
          ? "cursor-not-allowed border-l-transparent text-gray-300 opacity-60"
          : isActive
            ? "bg-pink-50 border-l-primary text-primary"
            : "border-l-transparent text-gray-600 hover:bg-gray-50"
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type="button"
    >
      <span className="text-lg">{disabled ? <LockOutlined /> : tab.icon}</span>
      <span className="text-xs font-medium">{tab.label}</span>
    </button>
  </Tooltip>
);

// Component cho nút hỗ trợ
const SupportButton: React.FC = () => (
  <div className="p-2 border-t border-gray-100">
    <Tooltip title="Trung tâm hỗ trợ" placement="right">
      <button className="flex flex-col items-center justify-center w-full py-3 gap-1 text-gray-500 hover:text-primary hover:bg-pink-50 rounded-lg transition-colors">
        <QuestionCircleOutlined className="text-xl" />
        <span className="text-xs font-medium">Hỗ trợ</span>
      </button>
    </Tooltip>
  </div>
);

interface EditorSidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const currentPlan = userAuth.getCurrentPlanTier();
  const visibleTabs = tabs.filter((tab) => userAuth.hasPlanAccess(TOOL_ACCESS[tab.key]));

  return (
    <div className="w-sidebar bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="flex-1 flex flex-col py-2 overflow-y-auto min-h-0 scrollbar-hide">
        {tabs.map((tab) => {
          const disabled = !userAuth.hasPlanAccess(TOOL_ACCESS[tab.key]);
          return (
            <SidebarTabItem
              key={tab.key}
              tab={tab}
              isActive={!disabled && activeTab === tab.key}
              disabled={disabled}
              onClick={() => onTabChange(tab.key)}
            />
          );
        })}
      </div>
      <div className="border-t border-gray-100 px-2 py-2 text-[10px] uppercase tracking-[0.12em] text-gray-400 text-center">
        {currentPlan === "FREE" ? "Gói miễn phí" : currentPlan === "BASIC" ? "Gói Basic" : "Gói Premium"}
      </div>
      <SupportButton />
    </div>
  );
};

export default EditorSidebar;

"use client";

import React from "react";
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
} from "@ant-design/icons";

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
}

const tabs: TabConfig[] = [
  { key: "text", icon: <FontSizeOutlined />, label: "Văn bản" },
  { key: "image", icon: <PictureOutlined />, label: "Hình ảnh" },
  { key: "stock", icon: <AppstoreOutlined />, label: "Stock" },
  { key: "background", icon: <BgColorsOutlined />, label: "Nền" },
  { key: "music", icon: <CustomerServiceOutlined />, label: "Âm nhạc" },
  { key: "widget", icon: <CalendarOutlined />, label: "Tiện ích" },
  { key: "template", icon: <BlockOutlined />, label: "Mẫu" },
  { key: "effect", icon: <ThunderboltOutlined />, label: "Hiệu ứng" },
];

interface EditorSidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-18 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="flex-1 flex flex-col py-2 overflow-y-auto min-h-0 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex flex-col items-center justify-center py-3 px-2 gap-1 transition-colors border-l-2 ${
              activeTab === tab.key
                ? "bg-pink-50 border-l-primary text-primary"
                : "border-l-transparent text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom support button */}
      <div className="p-2 border-t border-gray-100">
        <button className="flex flex-col items-center justify-center w-full py-3 gap-1 text-gray-500 hover:text-primary hover:bg-pink-50 rounded-lg transition-colors">
          <QuestionCircleOutlined className="text-xl" />
          <span className="text-xs font-medium">Hỗ trợ</span>
        </button>
      </div>
    </div>
  );
};

export default EditorSidebar;

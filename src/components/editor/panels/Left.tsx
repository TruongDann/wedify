"use client";

import React, { useEffect } from "react";
import { CalendarOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { preloadCommonFonts } from "@/utils/fontLoader";
import { EmptyState } from "../shared";
import {
  TextTab,
  ImageTab,
  StockTab,
  BackgroundTab,
  MusicTab,
  TemplateTab,
} from "./left/index";

interface LeftProps {
  activeTab: string;
}

const Left: React.FC<LeftProps> = ({ activeTab }) => {
  useEffect(() => {
    preloadCommonFonts();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "text":
        return <TextTab />;

      case "image":
        return <ImageTab />;
      case "stock":
        return <StockTab />;
      case "background":
        return <BackgroundTab />;
      case "template":
        return <TemplateTab />;
      case "music":
        return <MusicTab />;
      case "widget":
        return (
          <EmptyState icon={<CalendarOutlined />} text="Tiện ích sắp ra mắt" />
        );
      case "effect":
        return (
          <EmptyState
            icon={<ThunderboltOutlined />}
            text="Hiệu ứng sắp ra mắt"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

export default Left;

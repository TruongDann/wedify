"use client";

import React, { useEffect } from "react";
import { CalendarOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  isOpen: boolean;
  onToggle: () => void;
}

const Left: React.FC<LeftProps> = ({ activeTab, isOpen, onToggle }) => {
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
    <div className="relative shrink-0">
      {/* Panel Content */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 h-full ${
          isOpen ? "w-72" : "w-0 border-r-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto w-72">{renderContent()}</div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 left-full -ml-1 z-20 flex items-center justify-center"
      >
        <svg width="24" height="72" viewBox="0 0 24 72" fill="none">
          <path
            d="M0 0H4C6 0 8 1 10 4L22 30C24 34 24 38 22 42L10 68C8 71 6 72 4 72H0V0Z"
            fill="white"
          />
        </svg>
        <span className="absolute">
          {isOpen ? (
            <ChevronLeft size={14} className="text-gray-400" />
          ) : (
            <ChevronRight size={14} className="text-gray-400" />
          )}
        </span>
      </button>
    </div>
  );
};

export default Left;

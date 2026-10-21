"use client";

import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { preloadCommonFonts } from "@/utils/fontLoader";
import {
  TextTab,
  ImageTab,
  StockTab,
  BackgroundTab,
  MusicTab,
  TemplateTab,
  EffectsTab,
  WidgetTab,
  BlocksTab,
} from "./left/index";

interface LeftProps {
  activeTab: string;
  isOpen: boolean;
  onToggle: () => void;
}

// Tiêu đề + mô tả ngắn ở đầu mỗi panel
const PANEL_META: Record<string, { title: string; description?: string }> = {
  text: { title: "Văn bản", description: "Bấm để thêm chữ vào thiệp." },
  image: { title: "Hình ảnh", description: "Bấm vào ảnh để thêm vào thiệp." },
  stock: { title: "Đồ họa", description: "Bấm vào họa tiết để thêm vào thiệp." },
  background: { title: "Nền" },
  music: { title: "Âm nhạc" },
  widget: { title: "Tiện ích", description: "Bấm vào tiện ích để thêm vào thiệp." },
  blocks: { title: "Khối mẫu", description: "Bấm để thêm phần dựng sẵn vào cuối thiệp." },
  template: { title: "Mẫu", description: "Xem trước và bắt đầu nhanh từ mẫu có sẵn." },
  effect: { title: "Hiệu ứng", description: "Chọn loại hiệu ứng cho thiệp." },
};

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
      case "blocks":
        return <BlocksTab />;
      case "template":
        return <TemplateTab />;
      case "music":
        return <MusicTab />;
      case "widget":
        return <WidgetTab />;
      case "effect":
        return <EffectsTab />;
      default:
        return null;
    }
  };

  const meta = PANEL_META[activeTab];

  return (
    <div className="relative shrink-0">
      {/* Panel Content */}
      <div
        className={`bg-white border-r border-line flex flex-col overflow-hidden transition-all duration-300 h-full ${
          isOpen ? "w-[294px]" : "w-0 border-r-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto w-[294px] flex flex-col">
          {meta && (
            <header className="px-4 pt-4.5 pb-1 shrink-0">
              <h2 className="text-lg font-semibold text-ink leading-6">
                {meta.title}
              </h2>
              {meta.description && (
                <p className="text-[13px] leading-5 text-ink-3 mt-0.5">
                  {meta.description}
                </p>
              )}
            </header>
          )}
          <div className="flex-1 min-h-0">{renderContent()}</div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Thu gọn panel" : "Mở panel"}
        className="absolute top-1/2 -translate-y-1/2 left-full z-20 w-4 h-14 flex items-center justify-center bg-white border border-l-0 border-line rounded-r-lg text-ink-3 hover:text-ink transition-colors"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>
  );
};

export default Left;

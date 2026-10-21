"use client";

import React, { useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Dropdown } from "antd";
import {
  createImageElement,
  createShapeElement,
  createTextElement,
  useEditorStore,
} from "@/store/editorStore";
import { loadGoogleFonts } from "@/utils/fontLoader";
import { ANIMATED_GROUP_LABELS, ANIMATED_STICKERS, NOTO_ANIMATED_ATTRIBUTION, notoAnimatedUrl, type AnimatedSticker } from "@/constants/animatedStock";
import { ANIMATED_PRESETS } from "@/data/animatedPresets";
import { EXTRA_STOCK_CATEGORIES, ExtraStock } from "./StockExtras";
import { STICKERS, STOCK_IMAGES } from "@/constants/assets";
import { SHAPES } from "@/constants/shapes";
import { ShapeElement } from "@/types/editor";

type CategoryType = string;

/** Tạm ẩn các mục stock thêm sau (code vẫn giữ nguyên, bỏ khỏi danh sách này để bật lại). */
const HIDDEN_CATEGORIES = new Set(["animated", "motion", "notes"]);

const CATEGORIES = [
  { id: "all" as CategoryType, label: "Tất cả" },
  { id: "animated" as CategoryType, label: "Ảnh động" },
  { id: "motion" as CategoryType, label: "Hình động" },
  { id: "wedding-elements" as CategoryType, label: "Yếu tố đám cưới" },
  { id: "people" as CategoryType, label: "Nhân vật" },
  { id: "flowers" as CategoryType, label: "Hoa cưới" },
  { id: "shapes" as CategoryType, label: "Hình dạng" },
  { id: "notes" as CategoryType, label: "Chữ hỷ" },
  { id: "hearts" as CategoryType, label: "Trái tim" },
];

/** Chữ hỷ và chữ trang trí đám cưới — dạng văn bản nên đổi màu/kích thước/font tuỳ ý. */
const HY_ITEMS: Array<{ label: string; content: string; fontFamily: string; fontSize: number; color: string; backgroundColor?: string; round?: boolean; fontWeight?: number }> = [
  { label: "Hỷ đỏ", content: "囍", fontFamily: "Ma Shan Zheng", fontSize: 120, color: "#dc2626" },
  { label: "Hỷ vàng", content: "囍", fontFamily: "Zhi Mang Xing", fontSize: 120, color: "#d4a017" },
  { label: "Hỷ huy hiệu", content: "囍", fontFamily: "Noto Serif SC", fontSize: 70, color: "#ffffff", backgroundColor: "#b91c1c", round: true, fontWeight: 700 },
  { label: "Hỷ xanh", content: "囍", fontFamily: "Liu Jian Mao Cao", fontSize: 120, color: "#14532d" },
  { label: "Hỷ nâu", content: "囍", fontFamily: "Long Cang", fontSize: 120, color: "#7c2d12" },
  { label: "Hỷ vàng huy hiệu", content: "囍", fontFamily: "Noto Serif SC", fontSize: 70, color: "#7f1d1d", backgroundColor: "#f5d77a", round: true, fontWeight: 700 },
  { label: "Phúc", content: "福", fontFamily: "Ma Shan Zheng", fontSize: 110, color: "#dc2626" },
  { label: "Ái", content: "愛", fontFamily: "Zhi Mang Xing", fontSize: 110, color: "#be185d" },
  { label: "Thank you", content: "Thank you", fontFamily: "Great Vibes", fontSize: 54, color: "#be123c" },
  { label: "Our wedding", content: "OUR WEDDING", fontFamily: "Montserrat", fontSize: 26, color: "#be123c", fontWeight: 700 },
  { label: "Vu quy", content: "Vu Quy", fontFamily: "Dancing Script", fontSize: 60, color: "#9f1239" },
  { label: "Thành hôn", content: "Thành Hôn", fontFamily: "Dancing Script", fontSize: 60, color: "#9f1239" },
  { label: "Tân hôn", content: "Tân Hôn", fontFamily: "Pacifico", fontSize: 44, color: "#be185d" },
  { label: "Save the date", content: "Save the date", fontFamily: "Allura", fontSize: 56, color: "#a16207" },
  { label: "Just married", content: "JUST MARRIED", fontFamily: "Bangers", fontSize: 36, color: "#db2777" },
  { label: "Happy wedding", content: "Happy Wedding", fontFamily: "Pinyon Script", fontSize: 54, color: "#7c2d12" },
];

export const StockTab: React.FC = () => {
  const { addElement } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: 1 | -1) => tabsRef.current?.scrollBy({ left: direction * 180, behavior: "smooth" });

  const handleAddSticker = (src: string) => {
    addElement(
      createImageElement(src, {
        size: { width: 80, height: 80 },
      }),
    );
  };

  const handleAddStockImage = (src: string) => {
    addElement(createImageElement(src, { size: { width: 200, height: 200 } }));
  };

  const handleAddHy = async (item: (typeof HY_ITEMS)[number]) => {
    await loadGoogleFonts([item.fontFamily]);
    const size = item.round ? Math.round(item.fontSize * 1.9) : Math.round(item.fontSize * Math.max(1.4, item.content.length * 0.62));
    addElement(
      createTextElement({
        content: item.content,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        fontWeight: item.fontWeight ?? 400,
        color: item.color,
        backgroundColor: item.backgroundColor ?? "transparent",
        borderRadius: item.round
          ? { topLeft: size, topRight: size, bottomLeft: size, bottomRight: size }
          : { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
        size: { width: size, height: item.round ? size : Math.round(item.fontSize * 1.6) },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        position: { x: 200, y: 200 },
      }),
    );
  };

  // Tải sẵn font chữ hỷ để ô xem trước hiển thị đúng
  React.useEffect(() => {
    if (selectedCategory === "notes") void loadGoogleFonts(HY_ITEMS.map((item) => item.fontFamily));
  }, [selectedCategory]);

  const handleAddAnimated = (sticker: AnimatedSticker) => {
    addElement(
      createImageElement(notoAnimatedUrl(sticker.code), {
        alt: sticker.label,
        size: { width: 140, height: 140 },
        position: { x: 230, y: 220 },
        animation: { enabled: true, continuous: false, type: "zoomIn", delay: 0 },
      }),
    );
  };

  const handleAddPreset = (presetId: string) => {
    const preset = ANIMATED_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    const canvasWidth = useEditorStore.getState().canvasSettings.width || 600;
    // Thêm cả cụm; mỗi phần tử vẫn chỉnh/di chuyển riêng được
    preset.build(canvasWidth, 220).forEach((element) => {
      const { id: _id, zIndex: _z, ...rest } = element as unknown as Record<string, unknown>;
      void _id;
      void _z;
      addElement(rest as unknown as Parameters<typeof addElement>[0]);
    });
  };

  const handleAddShape = (shapeType: ShapeElement["shapeType"]) => {
    addElement(createShapeElement(shapeType));
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    payload: Record<string, any>,
  ) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/wedify-element",
      JSON.stringify(payload),
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100 px-2 pt-4 pb-2">
        <button type="button" aria-label="Cuộn danh mục sang trái" onClick={() => scrollTabs(-1)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
          <ChevronLeft size={16} />
        </button>
        <div
          ref={tabsRef}
          className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-hide"
          onWheel={(e) => {
            // Lăn chuột dọc trên thanh danh mục thì cuộn ngang
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) tabsRef.current?.scrollBy({ left: e.deltaY });
          }}
        >
          {CATEGORIES.filter((cat) => !HIDDEN_CATEGORIES.has(cat.id)).map((cat) => (
            <button
              key={cat.id}
              className={`px-3 py-1.5 text-sm rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button type="button" aria-label="Cuộn danh mục sang phải" onClick={() => scrollTabs(1)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Show all sections when "Tất cả" is selected */}
        {selectedCategory === "all" && (
          <>
            {/* Yếu tố đám cưới Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Yếu tố đám cưới
                </h3>
                <button 
                  className="text-sm text-gray-500 hover:text-primary"
                  onClick={() => setSelectedCategory("wedding-elements")}
                >
                  Xem thêm
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {STICKERS.slice(0, 6).map((sticker) => (
                  <div
                    key={sticker.id}
                    draggable
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                    onDragStart={(event) =>
                      handleDragStart(event, {
                        type: "image",
                        src: sticker.src,
                        size: { width: 80, height: 80 },
                      })
                    }
                    onClick={() => handleAddSticker(sticker.src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sticker.src}
                      alt={`Sticker ${sticker.id}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Nhân vật Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nhân vật
                </h3>
                <button 
                  className="text-sm text-gray-500 hover:text-primary"
                  onClick={() => setSelectedCategory("people")}
                >
                  Xem thêm
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {STOCK_IMAGES.slice(0, 3).map((src, index) => (
                  <div
                    key={index}
                    draggable
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-gray-50"
                    onDragStart={(event) =>
                      handleDragStart(event, {
                        type: "image",
                        src,
                        size: { width: 200, height: 200 },
                      })
                    }
                    onClick={() => handleAddStockImage(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Person ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hình dạng Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hình dạng
                </h3>
                <button 
                  className="text-sm text-gray-500 hover:text-primary"
                  onClick={() => setSelectedCategory("shapes")}
                >
                  Xem thêm
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {SHAPES.slice(0, 6).map((shape) => (
                  <button
                    key={shape.type}
                    draggable
                    onDragStart={(event) =>
                      handleDragStart(event, {
                        type: "shape",
                        shapeType: shape.type,
                        size: { width: 120, height: 120 },
                      })
                    }
                    onClick={() => handleAddShape(shape.type)}
                    className="aspect-square rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 p-3 group bg-gray-50"
                  >
                    <div className="text-2xl text-gray-600 group-hover:text-primary transition-colors">
                      {shape.icon}
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
                      {shape.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Yếu tố đám cưới category */}
        {selectedCategory === "wedding-elements" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Yếu tố đám cưới
              </h3>
              <button 
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                onClick={() => setSelectedCategory("all")}
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.map((sticker) => (
                <div
                  key={sticker.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                  onClick={() => handleAddSticker(sticker.src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sticker.src}
                    alt={`Sticker ${sticker.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nhân vật category */}
        {selectedCategory === "people" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nhân vật
              </h3>
              <button 
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                onClick={() => setSelectedCategory("all")}
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_IMAGES.map((src, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-gray-50"
                  onClick={() => handleAddStockImage(src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Person ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hoa cưới category */}
        {selectedCategory === "flowers" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hoa cưới
              </h3>
              <button 
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                onClick={() => setSelectedCategory("all")}
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.slice(0, 9).map((sticker) => (
                <div
                  key={sticker.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                  onClick={() => handleAddSticker(sticker.src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sticker.src}
                    alt={`Flower ${sticker.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hình dạng category */}
        {selectedCategory === "shapes" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hình dạng
              </h3>
              <button 
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                onClick={() => setSelectedCategory("all")}
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SHAPES.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => handleAddShape(shape.type)}
                  className="aspect-square rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 p-3 group bg-gray-50"
                >
                  <div className="text-2xl text-gray-600 group-hover:text-primary transition-colors">
                    {shape.icon}
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
                    {shape.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {EXTRA_STOCK_CATEGORIES.some((cat) => cat.id === selectedCategory) ? (
          <ExtraStock category={selectedCategory} onBack={() => setSelectedCategory("all")} />
        ) : null}

        {/* Ảnh động */}
        {selectedCategory === "animated" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ảnh động</h3>
              <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1" onClick={() => setSelectedCategory("all")}>
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            {(Object.keys(ANIMATED_GROUP_LABELS) as AnimatedSticker["group"][]).map((group) => (
              <div key={group} className="mb-4">
                <div className="mb-2 text-xs font-medium text-gray-500">{ANIMATED_GROUP_LABELS[group]}</div>
                <div className="grid grid-cols-3 gap-2">
                  {ANIMATED_STICKERS.filter((sticker) => sticker.group === group).map((sticker) => (
                    <button
                      key={sticker.code}
                      type="button"
                      onClick={() => handleAddAnimated(sticker)}
                      title={sticker.label}
                      className="aspect-square rounded-lg border border-gray-200 bg-gray-50 p-2 transition-all hover:border-primary hover:bg-primary/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={notoAnimatedUrl(sticker.code)} alt={sticker.label} loading="lazy" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[10px] leading-relaxed text-gray-400">{NOTO_ANIMATED_ATTRIBUTION}. Dòng ghi nguồn tự hiện trên trang thiệp.</p>
          </div>
        )}

        {/* Hình động tự vẽ */}
        {selectedCategory === "motion" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình động</h3>
              <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1" onClick={() => setSelectedCategory("all")}>
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATED_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAddPreset(preset.id)}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-xs text-gray-600 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-3xl">{preset.icon}</span>
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-gray-400">Cụm hình tự vẽ — thêm vào rồi kéo, đổi màu hoặc đổi hiệu ứng từng phần tử ở panel bên phải.</p>
          </div>
        )}

        {/* Chữ hỷ category */}
        {selectedCategory === "notes" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Chữ hỷ
              </h3>
              <button 
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                onClick={() => setSelectedCategory("all")}
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {HY_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleAddHy(item)}
                  className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 p-2 transition-all hover:border-primary hover:bg-primary/5"
                  title={item.label}
                >
                  <span
                    style={{
                      fontFamily: item.fontFamily,
                      color: item.backgroundColor ? item.color : item.color,
                      fontSize: Math.min(item.fontSize * 0.5, 44),
                      fontWeight: item.fontWeight ?? 400,
                      lineHeight: 1.1,
                      background: item.backgroundColor,
                      borderRadius: item.round ? "9999px" : undefined,
                      padding: item.round ? "8px 12px" : undefined,
                    }}
                  >
                    {item.content}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trái tim category */}
        {selectedCategory === "hearts" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Trái tim
              </h3>
              <button 
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                onClick={() => setSelectedCategory("all")}
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.slice(0, 12).map((sticker) => (
                <div
                  key={sticker.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                  onClick={() => handleAddSticker(sticker.src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sticker.src}
                    alt={`Heart ${sticker.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

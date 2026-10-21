"use client";

import React, { useEffect, useState } from "react";
import { App } from "antd";
import { ArrowLeft } from "lucide-react";
import { createImageElement, createTextElement, useEditorStore } from "@/store/editorStore";
import { STOCK_EMOJI_CATEGORIES, stockEmojiUrl } from "@/constants/stockEmoji";
import {
  STOCK_COLORS,
  STOCK_FRAMES,
  STOCK_PATTERNS,
  STOCK_PATTERN_PALETTES,
  STOCK_TEXT_GROUPS,
  svgUri,
  type StockTextCombo,
} from "@/constants/stockVector";
import { loadGoogleFonts } from "@/utils/fontLoader";
import {
  ANIMATED_GROUP_LABELS,
  ANIMATED_STICKERS,
  NOTO_ANIMATED_ATTRIBUTION,
  notoAnimatedUrl,
  type AnimatedSticker,
} from "@/constants/animatedStock";
import { ANIMATED_PRESETS } from "@/data/animatedPresets";

/** Các danh mục stock mở rộng: sticker (Noto Emoji), khung viền, nền họa tiết, kết hợp chữ. */
export const EXTRA_STOCK_CATEGORIES: Array<{ id: string; label: string }> = [
  { id: "animated", label: "Ảnh động" },
  { id: "motion", label: "Hình động" },
  ...STOCK_EMOJI_CATEGORIES.map((category) => ({ id: category.id, label: category.label })),
  { id: "frames", label: "Khung viền" },
  { id: "patterns", label: "Nền họa tiết" },
  { id: "combos", label: "Kết hợp chữ" },
];

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="mb-3 flex items-center justify-between">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary" onClick={onBack}>
      <ArrowLeft size={14} /> Quay lại
    </button>
  </div>
);

const tile = "aspect-square rounded-lg border border-gray-200 bg-gray-50 p-2 transition-all hover:border-primary hover:bg-primary/5";

export const ExtraStock: React.FC<{ category: string; onBack: () => void }> = ({ category, onBack }) => {
  const { message } = App.useApp();
  const { addElement, canvasSettings, setCanvasSettings } = useEditorStore();
  const canvasWidth = canvasSettings.width || 600;
  const [frameColor, setFrameColor] = useState(STOCK_COLORS[0]);
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Tải sẵn font để ô xem trước "Kết hợp chữ" hiển thị đúng kiểu chữ
  useEffect(() => {
    if (category === "combos") void loadGoogleFonts(STOCK_TEXT_GROUPS.flatMap((group) => group.items.map((item) => item.fontFamily)));
  }, [category]);

  const centered = (width: number) => ({ x: Math.max(0, Math.round((canvasWidth - width) / 2)), y: 200 });

  const addImage = (src: string, width: number, height: number, alt: string) => {
    const w = Math.min(width, canvasWidth - 40);
    const h = Math.round((height * w) / width);
    addElement(
      createImageElement(src, {
        alt,
        size: { width: w, height: h },
        position: centered(w),
        animation: { enabled: true, continuous: false, type: "zoom", delay: 0 },
      }),
    );
  };

  const addText = async (item: StockTextCombo) => {
    await loadGoogleFonts([item.fontFamily]);
    const chars = Array.from(item.content).length;
    const width = Math.min(canvasWidth - 40, Math.max(120, Math.round(chars * item.fontSize * (/[一-鿿]/.test(item.content) ? 1.05 : 0.62))));
    addElement(
      createTextElement({
        content: item.content,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        fontWeight: item.fontWeight ?? 400,
        fontStyle: item.italic ? "italic" : "normal",
        letterSpacing: item.letterSpacing ?? 0,
        color: item.color,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        size: { width, height: Math.round(item.fontSize * 1.5) },
        position: centered(width),
        animation: { enabled: true, continuous: false, type: "slideUp", delay: 0 },
      }),
    );
  };

  const addAnimated = (sticker: AnimatedSticker) => {
    addElement(
      createImageElement(notoAnimatedUrl(sticker.code), {
        alt: sticker.label,
        size: { width: 140, height: 140 },
        position: { x: Math.round((canvasWidth - 140) / 2), y: 220 },
        animation: { enabled: true, continuous: false, type: "zoom", delay: 0 },
      }),
    );
  };

  const addPreset = (presetId: string) => {
    const preset = ANIMATED_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    // Thêm cả cụm; mỗi phần tử vẫn kéo/đổi màu/đổi hiệu ứng riêng được
    preset.build(canvasWidth, 220).forEach((element) => {
      const { id: _id, zIndex: _zIndex, ...rest } = element as unknown as Record<string, unknown>;
      void _id;
      void _zIndex;
      addElement(rest as unknown as Parameters<typeof addElement>[0]);
    });
  };

  // ---------------------------------------------------------------- Ảnh động
  if (category === "animated") {
    return (
      <div className="mb-6">
        <Header title="Ảnh động" onBack={onBack} />
        {(Object.keys(ANIMATED_GROUP_LABELS) as AnimatedSticker["group"][]).map((group) => (
          <div key={group} className="mb-4">
            <div className="mb-2 text-xs font-medium text-gray-500">{ANIMATED_GROUP_LABELS[group]}</div>
            <div className="grid grid-cols-3 gap-2">
              {ANIMATED_STICKERS.filter((sticker) => sticker.group === group).map((sticker) => (
                <button key={sticker.code} type="button" title={sticker.label} className={tile} onClick={() => addAnimated(sticker)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={notoAnimatedUrl(sticker.code)} alt={sticker.label} loading="lazy" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[10px] leading-relaxed text-gray-400">{NOTO_ANIMATED_ATTRIBUTION}. Dòng ghi nguồn tự hiện trên trang thiệp.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- Hình động tự vẽ
  if (category === "motion") {
    return (
      <div className="mb-6">
        <Header title="Hình động" onBack={onBack} />
        <div className="grid grid-cols-2 gap-2">
          {ANIMATED_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => addPreset(preset.id)}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-xs text-gray-600 transition-all hover:border-primary hover:bg-primary/5"
            >
              <span className="text-3xl">{preset.icon}</span>
              {preset.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-gray-400">Cụm hình tự vẽ — thêm vào rồi kéo, đổi màu hoặc đổi hiệu ứng từng phần tử ở panel bên phải.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- Sticker
  const emojiCategory = STOCK_EMOJI_CATEGORIES.find((item) => item.id === category);
  if (emojiCategory) {
    return (
      <div className="mb-6">
        <Header title={emojiCategory.label} onBack={onBack} />
        <div className="grid grid-cols-3 gap-2">
          {emojiCategory.items.map((item) => (
            <button key={item.code} type="button" title={item.label} className={tile} onClick={() => addImage(stockEmojiUrl(item.code), 160, 160, item.label)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stockEmojiUrl(item.code)} alt={item.label} loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-gray-400">Sticker: Google Noto Emoji (Apache 2.0). Là hình vector nên phóng to không vỡ.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- Khung viền
  if (category === "frames") {
    return (
      <div className="mb-6">
        <Header title="Khung viền" onBack={onBack} />
        <div className="mb-3 flex flex-wrap gap-2">
          {STOCK_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Màu ${color}`}
              onClick={() => setFrameColor(color)}
              className="h-6 w-6 rounded-full border-2"
              style={{ background: color, borderColor: frameColor === color ? "#ef4565" : "#d1d5db", boxShadow: frameColor === color ? "0 0 0 2px #fff inset" : undefined }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STOCK_FRAMES.map((frame) => (
            <button
              key={frame.id}
              type="button"
              title={frame.label}
              className={`${tile} ${frameColor === "#ffffff" ? "!bg-gray-400" : ""}`}
              onClick={() => addImage(svgUri(frame.svg(frameColor)), frame.width, frame.height, frame.label)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={svgUri(frame.svg(frameColor))} alt={frame.label} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-gray-400">Chọn màu rồi bấm khung để thêm. Kéo để đổi kích thước — khung là hình vector nên luôn sắc nét.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- Nền họa tiết
  if (category === "patterns") {
    const palette = STOCK_PATTERN_PALETTES[paletteIndex];
    return (
      <div className="mb-6">
        <Header title="Nền họa tiết" onBack={onBack} />
        <div className="mb-3 flex flex-wrap gap-2">
          {STOCK_PATTERN_PALETTES.map((item, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Bảng màu ${index + 1}`}
              onClick={() => setPaletteIndex(index)}
              className="h-7 w-7 overflow-hidden rounded-full border-2"
              style={{ borderColor: paletteIndex === index ? "#ef4565" : "#d1d5db", background: `linear-gradient(135deg, ${item.bg} 50%, ${item.ink} 50%)` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STOCK_PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              title={pattern.label}
              className="overflow-hidden rounded-lg border border-gray-200 transition-all hover:border-primary"
              style={{ aspectRatio: "3 / 4" }}
              onClick={() => {
                setCanvasSettings({ backgroundImage: svgUri(pattern.svg(palette.bg, palette.ink)) });
                message.success(`Đã đặt nền "${pattern.label}"`);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={svgUri(pattern.svg(palette.bg, palette.ink))} alt={pattern.label} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-primary hover:text-primary"
          onClick={() => {
            setCanvasSettings({ backgroundImage: null });
            message.success("Đã gỡ nền họa tiết");
          }}
        >
          Gỡ nền họa tiết
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------- Kết hợp chữ
  if (category === "combos") {
    return (
      <div className="mb-6">
        <Header title="Kết hợp chữ" onBack={onBack} />
        {STOCK_TEXT_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="mb-2 text-xs font-medium text-gray-500">{group.label}</div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <button
                  key={`${group.label}-${item.label}`}
                  type="button"
                  title={item.label}
                  onClick={() => addText(item)}
                  className="flex min-h-[64px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white px-2 py-2 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span
                    style={{
                      fontFamily: item.fontFamily,
                      color: item.color,
                      fontSize: Math.min(item.fontSize * 0.5, 28),
                      fontWeight: item.fontWeight ?? 400,
                      fontStyle: item.italic ? "italic" : "normal",
                      letterSpacing: (item.letterSpacing ?? 0) / 3,
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    {item.content}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

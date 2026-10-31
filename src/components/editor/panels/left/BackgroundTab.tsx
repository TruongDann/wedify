"use client";

import React, { useState } from "react";
import { ImagePlus, Pipette, X } from "lucide-react";
import { Popover, Upload } from "antd";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { useEditorStore } from "@/store/editorStore";
import { COLOR_PALETTE, GRADIENT_PALETTE } from "@/constants/colors";
import { STOCK_IMAGES, stockThumb } from "@/constants/assets";
import { PanelTabs, SectionTitle, Tile } from "./ui";

const CHECKER =
  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)";

const checkerStyle: React.CSSProperties = {
  backgroundImage: CHECKER,
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
};

// Style hiển thị một giá trị nền (màu, gradient, trong suốt)
const fillStyle = (value: string): React.CSSProperties =>
  value === "transparent"
    ? checkerStyle
    : value.startsWith("linear-gradient")
      ? { backgroundImage: value }
      : { backgroundColor: value };

export const BackgroundTab: React.FC = () => {
  const { setCanvasSettings, canvasSettings } = useEditorStore();
  const [bgSubTab, setBgSubTab] = useState<"color" | "image">("color");

  const bgColor = canvasSettings.backgroundColor || "#FFFFFF";
  const bgImage = canvasSettings.backgroundImage;
  const isGradient = bgColor.startsWith("linear-gradient");
  const pickerColor =
    bgColor === "transparent" || isGradient ? "#FFFFFF" : bgColor;

  // Chọn màu thì bỏ ảnh nền để màu hiển thị được
  const applyColor = (color: string) =>
    setCanvasSettings({ backgroundColor: color, backgroundImage: null });

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCanvasSettings({ backgroundImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
    return false;
  };

  const current = bgImage
    ? { label: "Hình nền", meta: "Ảnh" }
    : bgColor === "transparent"
      ? { label: "Trong suốt", meta: "Không có nền" }
      : isGradient
        ? { label: "Gradient", meta: "Màu chuyển" }
        : { label: "Màu trơn", meta: bgColor.toUpperCase() };

  const customPicker = (
    <div className="w-56">
      <HexColorPicker
        color={pickerColor}
        onChange={applyColor}
        style={{ width: "100%" }}
      />
      <div className="flex items-center gap-2 mt-3">
        <span
          className="w-8 h-8 rounded-lg shrink-0 shadow-[inset_0_0_0_1px_var(--color-line)]"
          style={{ backgroundColor: pickerColor }}
        />
        <HexColorInput
          color={pickerColor}
          onChange={applyColor}
          prefixed
          className="flex-1 min-w-0 h-8 px-3 text-sm border border-line rounded-lg uppercase focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );

  const tabs = [
    { key: "color" as const, label: "Màu nền" },
    { key: "image" as const, label: "Hình nền" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Nền đang dùng */}
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center gap-3 rounded-xl border border-line py-2.5 pl-2.5 pr-2">
          <span
            className="w-10 h-10 rounded-lg shrink-0 bg-cover bg-center shadow-[inset_0_0_0_1px_var(--color-line)]"
            style={
              bgImage ? { backgroundImage: `url(${bgImage})` } : fillStyle(bgColor)
            }
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-ink-3">Nền đang dùng</div>
            <div className="text-sm font-medium text-ink leading-5">
              {current.label}
            </div>
            <div className="text-xs text-ink-3 truncate">{current.meta}</div>
          </div>
          {bgImage && (
            <button
              type="button"
              title="Xóa ảnh nền"
              onClick={() => setCanvasSettings({ backgroundImage: null })}
              className="w-7 h-7 rounded-full flex items-center justify-center text-ink-3 hover:bg-surface-muted hover:text-ink"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Màu nền / Hình nền */}
      <PanelTabs tabs={tabs} active={bgSubTab} onChange={setBgSubTab} />

      <div className="flex-1 overflow-y-auto">
        {bgSubTab === "color" && (
          <div className="p-4 space-y-6">
            {/* Màu trơn */}
            <section>
              <SectionTitle
                title="Màu trơn"
                action={
                  <Popover
                    content={customPicker}
                    trigger="click"
                    placement="bottomRight"
                    arrow={false}
                  >
                    <button
                      type="button"
                      className="h-8 px-3 rounded-full flex items-center gap-1.5 text-[13px] font-semibold text-ink-2 hover:bg-surface-muted"
                    >
                      <Pipette size={14} />
                      Màu tùy chỉnh
                    </button>
                  </Popover>
                }
              />
              <div className="grid grid-cols-6 gap-2">
                {COLOR_PALETTE.map((item) => (
                  <Tile
                    key={item.color}
                    title={item.isTransparent ? "Trong suốt" : item.color}
                    selected={!bgImage && bgColor.toLowerCase() === item.color.toLowerCase()}
                    onClick={() => applyColor(item.color)}
                    className="aspect-square p-0.75"
                  >
                    <span
                      className="block w-full h-full rounded-[7px]"
                      style={fillStyle(item.color)}
                    />
                  </Tile>
                ))}
              </div>
            </section>

            {/* Gradient */}
            <section>
              <SectionTitle title="Gradient" />
              <div className="grid grid-cols-6 gap-2">
                {GRADIENT_PALETTE.map((item, index) => (
                  <Tile
                    key={item.gradient}
                    title={`Gradient ${index + 1}`}
                    selected={!bgImage && bgColor === item.gradient}
                    onClick={() => applyColor(item.gradient)}
                    className="aspect-square p-0.75"
                  >
                    <span
                      className="block w-full h-full rounded-[7px]"
                      style={{ backgroundImage: item.gradient }}
                    />
                  </Tile>
                ))}
              </div>
            </section>
          </div>
        )}

        {bgSubTab === "image" && (
          <div className="p-4 grid grid-cols-3 gap-2">
            {/* Ảnh của bạn */}
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleBackgroundUpload}
              className="block [&_.ant-upload]:block! [&_.ant-upload]:w-full [&_.ant-upload]:h-full"
            >
              <button
                type="button"
                className="w-full aspect-square rounded-[10px] border border-dashed border-line-strong bg-surface-subtle text-link flex flex-col items-center justify-center gap-1 p-2 text-[13px] font-medium leading-4 hover:bg-surface-muted transition-colors"
              >
                <ImagePlus size={18} />
                Ảnh của bạn
              </button>
            </Upload>

            {/* Ảnh tải lên (không có trong thư viện) */}
            {bgImage && !STOCK_IMAGES.includes(bgImage) && (
              <Tile
                title="Ảnh của bạn"
                selected
                onClick={() => undefined}
                className="aspect-square bg-surface-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bgImage}
                  alt="Ảnh nền đã tải lên"
                  className="w-full h-full object-cover rounded-[9px]"
                />
              </Tile>
            )}

            {STOCK_IMAGES.map((src, index) => (
              <Tile
                key={src}
                title={`Hình nền ${index + 1}`}
                selected={bgImage === src}
                onClick={() => setCanvasSettings({ backgroundImage: src })}
                className="aspect-square bg-surface-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stockThumb(src)}
                  alt={`Hình nền ${index + 1}`}
                  className="w-full h-full object-cover rounded-[9px]"
                />
              </Tile>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

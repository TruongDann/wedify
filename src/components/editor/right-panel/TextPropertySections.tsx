"use client";

import React from "react";
import { Slider, ColorPicker, Select, Switch, Button, Input } from "antd";
import {
  FontColorsOutlined,
  MinusOutlined,
  PlusOutlined,
  BoxPlotOutlined,
  BorderOuterOutlined,
  CopyOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  DragOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { TextElement } from "@/types/editor";
import { loadGoogleFont } from "@/utils/fontLoader";
import { FONTS } from "@/constants/fonts";
import {
  SectionHeader,
  PropertyRow,
  TextStyleButtons,
  AlignButtons,
  PositionGrid,
} from "../shared";

const { Option } = Select;

interface TextStyleSectionProps {
  element: TextElement;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<TextElement>) => void;
}

export const TextStyleSection: React.FC<TextStyleSectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Kiểu chữ"
      sectionKey="style"
      icon={<FontColorsOutlined />}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
    {isExpanded && (
      <div className="px-4 pt-3 pb-4">
        <TextStyleButtons element={element} onUpdate={onUpdate} />

        <PropertyRow label="Căn chỉnh">
          <AlignButtons
            textAlign={element.textAlign}
            onUpdate={(value) => onUpdate({ textAlign: value })}
          />
        </PropertyRow>

        <PropertyRow label="Cỡ chữ">
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() =>
                onUpdate({ fontSize: Math.max(8, element.fontSize - 1) })
              }
            >
              <MinusOutlined className="text-xs" />
            </button>
            <input
              type="number"
              className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={element.fontSize}
              onChange={(e) =>
                onUpdate({ fontSize: Number(e.target.value) || 16 })
              }
            />
            <button
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => onUpdate({ fontSize: element.fontSize + 1 })}
            >
              <PlusOutlined className="text-xs" />
            </button>
          </div>
        </PropertyRow>

        <PropertyRow label="Font">
          <Select
            value={element.fontFamily}
            onChange={async (value) => {
              await loadGoogleFont(value);
              setTimeout(() => onUpdate({ fontFamily: value }), 50);
            }}
            className="flex-1"
            virtual={false}
          >
            {FONTS.map((font) => (
              <Option key={font.name} value={font.name}>
                <span style={{ fontFamily: font.name }}>{font.label}</span>
              </Option>
            ))}
          </Select>
        </PropertyRow>

        <PropertyRow label="Màu chữ">
          <ColorPicker
            value={element.color}
            onChange={(color) => onUpdate({ color: color.toHexString() })}
          />
        </PropertyRow>

        <PropertyRow label="Màu nền">
          <div className="flex items-center gap-2">
            <ColorPicker
              value={element.backgroundColor || "transparent"}
              onChange={(color) =>
                onUpdate({ backgroundColor: color.toHexString() })
              }
            />
            <Button onClick={() => onUpdate({ backgroundColor: "transparent" })}>
              Trong suốt
            </Button>
          </div>
        </PropertyRow>

        <PropertyRow label="Độ mờ">
          <Slider
            value={element.opacity}
            onChange={(value) => onUpdate({ opacity: value })}
            min={0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {element.opacity.toFixed(2)}
          </span>
        </PropertyRow>
      </div>
    )}
  </div>
);

interface PaddingSectionProps {
  element: TextElement;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<TextElement>) => void;
  paddingLinked: boolean;
  setPaddingLinked: (linked: boolean) => void;
}

export const PaddingSection: React.FC<PaddingSectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
  paddingLinked,
  setPaddingLinked,
}) => {
  const padding = element.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  const handlePaddingChange = (key: keyof typeof padding, value: number) => {
    if (paddingLinked) {
      onUpdate({
        padding: { top: value, right: value, bottom: value, left: value },
      });
    } else {
      onUpdate({ padding: { ...padding, [key]: value } });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Khoảng đệm"
        sectionKey="padding"
        icon={<BoxPlotOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-4">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Khoảng đệm (Padding)</span>
              <button
                className={`p-1.5 rounded transition-colors ${
                  paddingLinked
                    ? "text-primary bg-primary/10"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setPaddingLinked(!paddingLinked)}
                title={paddingLinked ? "Đồng bộ: BẬT" : "Đồng bộ: TẮT"}
              >
                <LinkOutlined />
              </button>
            </div>

            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={padding.top}
                min={0}
                onChange={(e) =>
                  handlePaddingChange("top", Number(e.target.value) || 0)
                }
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={padding.left}
                  min={0}
                  onChange={(e) =>
                    handlePaddingChange("left", Number(e.target.value) || 0)
                  }
                />
                <div className="w-14 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 font-medium">
                  Block
                </div>
                <input
                  type="number"
                  className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={padding.right}
                  min={0}
                  onChange={(e) =>
                    handlePaddingChange("right", Number(e.target.value) || 0)
                  }
                />
              </div>
              <input
                type="number"
                className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={padding.bottom}
                min={0}
                onChange={(e) =>
                  handlePaddingChange("bottom", Number(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <PropertyRow label="Khoảng cách dòng">
            <Slider
              value={element.lineHeight}
              onChange={(value) => onUpdate({ lineHeight: value })}
              min={0.8}
              max={3}
              step={0.1}
              className="flex-1"
            />
          </PropertyRow>
          <PropertyRow label="Khoảng cách chữ">
            <Slider
              value={element.letterSpacing}
              onChange={(value) => onUpdate({ letterSpacing: value })}
              min={-5}
              max={20}
              step={0.5}
              className="flex-1"
            />
          </PropertyRow>
        </div>
      )}
    </div>
  );
};

interface BorderProps {
  width: number;
  color: string;
  style: "solid" | "dashed" | "dotted" | "none";
  position: "all" | "top" | "bottom" | "left" | "right";
}

interface BorderRadiusProps {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

interface BorderSectionProps {
  border: BorderProps;
  borderRadius: BorderRadiusProps;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: { border?: BorderProps; borderRadius?: BorderRadiusProps }) => void;
  borderRadiusLinked: boolean;
  setBorderRadiusLinked: (linked: boolean) => void;
}

export const BorderSection: React.FC<BorderSectionProps> = ({
  border,
  borderRadius,
  isExpanded,
  onToggle,
  onUpdate,
  borderRadiusLinked,
  setBorderRadiusLinked,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Đường viền"
      sectionKey="border"
      icon={<BorderOuterOutlined />}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
    {isExpanded && (
      <div className="px-4 pt-3 pb-4 space-y-3">
        <PropertyRow label="Size">
          <input
            type="number"
            className="w-20 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={border.width}
            min={0}
            max={20}
            onChange={(e) =>
              onUpdate({
                border: { ...border, width: Number(e.target.value) || 0 },
              })
            }
          />
        </PropertyRow>

        <PropertyRow label="Màu">
          <ColorPicker
            value={border.color}
            onChange={(color) =>
              onUpdate({ border: { ...border, color: color.toHexString() } })
            }
          />
        </PropertyRow>

        <PropertyRow label="Kiểu">
          <Select
            value={border.style}
            onChange={(value) =>
              onUpdate({ border: { ...border, style: value } })
            }
            className="flex-1"
          >
            <Option value="solid">Nét liền</Option>
            <Option value="dashed">Nét đứt</Option>
            <Option value="dotted">Chấm</Option>
            <Option value="none">Không có</Option>
          </Select>
        </PropertyRow>

        <PropertyRow label="Vị trí">
          <Select
            value={border.position}
            onChange={(value) =>
              onUpdate({ border: { ...border, position: value } })
            }
            className="flex-1"
          >
            <Option value="all">Toàn bộ</Option>
            <Option value="top">Trên</Option>
            <Option value="bottom">Dưới</Option>
            <Option value="left">Trái</Option>
            <Option value="right">Phải</Option>
          </Select>
        </PropertyRow>

        {/* Bo góc */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bo góc</span>
            <button
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                borderRadiusLinked
                  ? "bg-primary/10 text-primary border border-primary"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
              onClick={() => setBorderRadiusLinked(!borderRadiusLinked)}
            >
              <LinkOutlined />
              <span>{borderRadiusLinked ? "Đồng bộ" : "Riêng"}</span>
            </button>
          </div>

          {borderRadiusLinked ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Tất cả</span>
              <input
                type="number"
                className="flex-1 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={borderRadius.topLeft}
                min={0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  onUpdate({
                    borderRadius: {
                      topLeft: val,
                      topRight: val,
                      bottomLeft: val,
                      bottomRight: val,
                    },
                  });
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { label: "TL", key: "topLeft" },
                  { label: "TR", key: "topRight" },
                  { label: "BL", key: "bottomLeft" },
                  { label: "BR", key: "bottomRight" },
                ] as const
              ).map((item) => (
                <div key={item.key} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <input
                    type="number"
                    className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={borderRadius[item.key]}
                    min={0}
                    onChange={(e) =>
                      onUpdate({
                        borderRadius: {
                          ...borderRadius,
                          [item.key]: Number(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

interface ShadowProps {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  color: string;
}

interface ShadowSectionProps {
  shadow: ShadowProps;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: { shadow: ShadowProps }) => void;
}

export const ShadowSection: React.FC<ShadowSectionProps> = ({
  shadow,
  isExpanded,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Đổ bóng"
      sectionKey="shadow"
      icon={<CopyOutlined />}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
    {isExpanded && (
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Đổ bóng</span>
          <Switch
            checked={shadow.enabled}
            onChange={(checked) =>
              onUpdate({ shadow: { ...shadow, enabled: checked } })
            }
          />
        </div>

        {shadow.enabled && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">X</span>
                <input
                  type="number"
                  className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={shadow.x}
                  onChange={(e) =>
                    onUpdate({
                      shadow: { ...shadow, x: Number(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Y</span>
                <input
                  type="number"
                  className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={shadow.y}
                  onChange={(e) =>
                    onUpdate({
                      shadow: { ...shadow, y: Number(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>

            <PropertyRow label="Blur">
              <Slider
                value={shadow.blur}
                onChange={(v) => onUpdate({ shadow: { ...shadow, blur: v } })}
                min={0}
                max={50}
                className="flex-1"
              />
            </PropertyRow>

            <PropertyRow label="Màu">
              <ColorPicker
                value={shadow.color}
                onChange={(color) =>
                  onUpdate({ shadow: { ...shadow, color: color.toHexString() } })
                }
              />
            </PropertyRow>
          </>
        )}
      </div>
    )}
  </div>
);

interface LinkSectionProps {
  hyperlink: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: { hyperlink: string }) => void;
}

export const LinkSection: React.FC<LinkSectionProps> = ({
  hyperlink,
  isExpanded,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Liên kết"
      sectionKey="link"
      icon={<LinkOutlined />}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
    {isExpanded && (
      <div className="px-4 pt-3 pb-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500">Hyperlink (Tùy chọn)</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={hyperlink}
            onChange={(e) => onUpdate({ hyperlink: e.target.value })}
            placeholder="https://example.com"
            prefix={<LinkOutlined className="text-gray-400" />}
          />
          <Button
            icon={<ExportOutlined />}
            disabled={!hyperlink}
            onClick={() => window.open(hyperlink, "_blank")}
            title="Mở liên kết"
          />
        </div>
      </div>
    )}
  </div>
);

interface AnimationProps {
  enabled: boolean;
  continuous: boolean;
  type: "none" | "fadeIn" | "slideIn" | "bounce" | "pulse" | "shake" | "zoom";
}

interface AnimationSectionProps {
  animation: AnimationProps;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: { animation: AnimationProps }) => void;
}

export const AnimationSection: React.FC<AnimationSectionProps> = ({
  animation,
  isExpanded,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Hiệu ứng chuyển động"
      sectionKey="animation"
      icon={<PlayCircleOutlined />}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
    {isExpanded && (
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Bật hiệu ứng</span>
          <Switch
            checked={animation.enabled}
            onChange={(checked) =>
              onUpdate({ animation: { ...animation, enabled: checked } })
            }
          />
        </div>

        {animation.enabled && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chuyển động liên tục</span>
              <Switch
                checked={animation.continuous}
                onChange={(checked) =>
                  onUpdate({ animation: { ...animation, continuous: checked } })
                }
              />
            </div>

            <PropertyRow label="Loại chuyển động">
              <Select
                value={animation.type}
                onChange={(value) =>
                  onUpdate({ animation: { ...animation, type: value } })
                }
                className="flex-1"
              >
                <Option value="none">Không có</Option>
                <Option value="fadeIn">Fade In</Option>
                <Option value="slideIn">Slide In</Option>
                <Option value="bounce">Bounce</Option>
                <Option value="pulse">Pulse</Option>
                <Option value="shake">Shake</Option>
                <Option value="zoom">Zoom</Option>
              </Select>
            </PropertyRow>
          </>
        )}
      </div>
    )}
  </div>
);

interface PositionSectionProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onPositionChange: (key: "x" | "y", value: number) => void;
  onSizeChange: (key: "width" | "height", value: number) => void;
  onRotationChange: (value: number) => void;
}

export const PositionSection: React.FC<PositionSectionProps> = ({
  position,
  size,
  rotation,
  isExpanded,
  onToggle,
  onPositionChange,
  onSizeChange,
  onRotationChange,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Vị trí & Kích thước"
      sectionKey="position"
      icon={<DragOutlined />}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
    {isExpanded && (
      <div className="px-4 pt-3 pb-4">
        <PositionGrid
          position={position}
          size={size}
          onPositionChange={onPositionChange}
          onSizeChange={onSizeChange}
        />
        <PropertyRow label="Xoay">
          <Slider
            value={rotation}
            onChange={onRotationChange}
            min={-180}
            max={180}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-10">{rotation}°</span>
        </PropertyRow>
      </div>
    )}
  </div>
);

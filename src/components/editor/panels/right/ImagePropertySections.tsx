"use client";

import React from "react";
import { Button, Slider, Select, Switch, Input, ColorPicker } from "antd";
import {
  EditOutlined,
  CameraOutlined,
  ThunderboltOutlined,
  BgColorsOutlined,
  BoxPlotOutlined,
  BorderOuterOutlined,
  CopyOutlined,
  LinkOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  DragOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ImageElement, EditorElement } from "@/types/editor";

const { Option } = Select;

// ==================== Types ====================

interface FilterProps {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
}

interface PaddingProps {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

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

interface ShadowProps {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  color: string;
}

interface AnimationProps {
  enabled: boolean;
  continuous: boolean;
  type: "none" | "fadeIn" | "slideIn" | "bounce" | "pulse" | "shake" | "zoom";
}

interface SectionHeaderProps {
  title: string;
  sectionKey: string;
  icon?: React.ReactNode;
  expandedSections: string[];
  onToggle: (key: string) => void;
}

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
}

// ==================== Shared Components ====================

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  sectionKey,
  icon,
  expandedSections,
  onToggle,
}) => (
  <div
    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
    onClick={() => onToggle(sectionKey)}
  >
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <span className="font-medium text-sm">{title}</span>
    </div>
    <span
      className={`text-gray-400 transition-transform ${expandedSections.includes(sectionKey) ? "rotate-180" : ""}`}
    >
      ▼
    </span>
  </div>
);

const PropertyRow: React.FC<PropertyRowProps> = ({ label, children }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="text-sm text-gray-600 w-24 shrink-0">{label}</span>
    {children}
  </div>
);

// ==================== Image Action Section ====================

interface ImageActionSectionProps {
  onCropImage: () => void;
  onSwitchToImageTab: () => void;
}

export const ImageActionSection: React.FC<ImageActionSectionProps> = ({
  onCropImage,
  onSwitchToImageTab,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="px-4 py-3 font-medium text-sm border-b border-gray-100">
      <div className="flex items-center gap-2">
        <EditOutlined className="text-gray-500" />
        <span>Tùy chỉnh</span>
      </div>
    </div>
    <div className="px-4 py-3">
      <div className="flex gap-2 mb-2">
        <Button
          type="primary"
          icon={<CameraOutlined />}
          className="flex-1"
          onClick={onCropImage}
        >
          Cắt ảnh
        </Button>
        <Button
          icon={<CameraOutlined />}
          className="flex-1"
          onClick={onSwitchToImageTab}
        >
          Đổi ảnh
        </Button>
      </div>
      <Button
        block
        className="bg-linear-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
      >
        <ThunderboltOutlined /> Xóa nền (AI)
      </Button>
    </div>
  </div>
);

// ==================== Image Filter Section ====================

interface ImageFilterSectionProps {
  filters: FilterProps;
  opacity: number;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
}

export const ImageFilterSection: React.FC<ImageFilterSectionProps> = ({
  filters,
  opacity,
  expandedSections,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Màu sắc"
      sectionKey="imageColors"
      icon={<BgColorsOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("imageColors") && (
      <div className="px-4 pt-3 pb-4 space-y-3">
        <PropertyRow label="Độ sáng">
          <Slider
            value={filters.brightness}
            onChange={(value) =>
              onUpdate({ filters: { ...filters, brightness: value } })
            }
            min={0}
            max={200}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {filters.brightness}%
          </span>
        </PropertyRow>

        <PropertyRow label="Độ tương phản">
          <Slider
            value={filters.contrast}
            onChange={(value) =>
              onUpdate({ filters: { ...filters, contrast: value } })
            }
            min={0}
            max={200}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {filters.contrast}%
          </span>
        </PropertyRow>

        <PropertyRow label="Độ bão hòa">
          <Slider
            value={filters.saturation}
            onChange={(value) =>
              onUpdate({ filters: { ...filters, saturation: value } })
            }
            min={0}
            max={200}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {filters.saturation}%
          </span>
        </PropertyRow>

        <PropertyRow label="Làm mờ">
          <Slider
            value={filters.blur}
            onChange={(value) =>
              onUpdate({ filters: { ...filters, blur: value } })
            }
            min={0}
            max={20}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">{filters.blur}px</span>
        </PropertyRow>

        <PropertyRow label="Đen trắng">
          <Slider
            value={filters.grayscale}
            onChange={(value) =>
              onUpdate({ filters: { ...filters, grayscale: value } })
            }
            min={0}
            max={100}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {filters.grayscale}%
          </span>
        </PropertyRow>

        <PropertyRow label="Độ mờ">
          <Slider
            value={opacity}
            onChange={(value) => onUpdate({ opacity: value })}
            min={0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {opacity.toFixed(2)}
          </span>
        </PropertyRow>

        <Button
          onClick={() =>
            onUpdate({
              filters: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                blur: 0,
                grayscale: 0,
              },
            })
          }
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    )}
  </div>
);

// ==================== Image Padding Section ====================

interface ImagePaddingSectionProps {
  padding: PaddingProps;
  paddingLinked: boolean;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
  onTogglePaddingLinked: () => void;
}

export const ImagePaddingSection: React.FC<ImagePaddingSectionProps> = ({
  padding,
  paddingLinked,
  expandedSections,
  onToggle,
  onUpdate,
  onTogglePaddingLinked,
}) => {
  const handlePaddingChange = (side: keyof PaddingProps, value: number) => {
    if (paddingLinked) {
      onUpdate({
        padding: { top: value, right: value, bottom: value, left: value },
      });
    } else {
      onUpdate({ padding: { ...padding, [side]: value } });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Khoảng đệm"
        sectionKey="imagePadding"
        icon={<BoxPlotOutlined />}
        expandedSections={expandedSections}
        onToggle={onToggle}
      />
      {expandedSections.includes("imagePadding") && (
        <div className="px-4 pt-3 pb-4">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">
                Khoảng đệm (Padding)
              </span>
              <button
                className={`p-1.5 rounded transition-colors ${
                  paddingLinked
                    ? "text-primary bg-primary/10"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={onTogglePaddingLinked}
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
        </div>
      )}
    </div>
  );
};

// ==================== Image Border Section ====================

interface ImageBorderSectionProps {
  border: BorderProps;
  borderRadius: BorderRadiusProps;
  borderRadiusLinked: boolean;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
  onToggleBorderRadiusLinked: () => void;
}

export const ImageBorderSection: React.FC<ImageBorderSectionProps> = ({
  border,
  borderRadius,
  borderRadiusLinked,
  expandedSections,
  onToggle,
  onUpdate,
  onToggleBorderRadiusLinked,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Đường viền"
      sectionKey="imageBorder"
      icon={<BorderOuterOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("imageBorder") && (
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
              onClick={onToggleBorderRadiusLinked}
              title={borderRadiusLinked ? "Đồng bộ: BẬT" : "Đồng bộ: TẮT"}
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
              {[
                { label: "TL", key: "topLeft", value: borderRadius.topLeft },
                { label: "TR", key: "topRight", value: borderRadius.topRight },
                {
                  label: "BL",
                  key: "bottomLeft",
                  value: borderRadius.bottomLeft,
                },
                {
                  label: "BR",
                  key: "bottomRight",
                  value: borderRadius.bottomRight,
                },
              ].map((item) => (
                <div key={item.key} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <input
                    type="number"
                    className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={item.value}
                    min={0}
                    onChange={(e) => {
                      const newValue = Number(e.target.value) || 0;
                      onUpdate({
                        borderRadius: { ...borderRadius, [item.key]: newValue },
                      });
                    }}
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

// ==================== Image Shadow Section ====================

interface ImageShadowSectionProps {
  shadow: ShadowProps;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
}

export const ImageShadowSection: React.FC<ImageShadowSectionProps> = ({
  shadow,
  expandedSections,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Đổ bóng"
      sectionKey="imageShadow"
      icon={<CopyOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("imageShadow") && (
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
                onChange={(v) =>
                  onUpdate({ shadow: { ...shadow, blur: v } })
                }
                min={0}
                max={50}
                className="flex-1"
              />
            </PropertyRow>

            <PropertyRow label="Màu">
              <ColorPicker
                value={shadow.color}
                onChange={(color) =>
                  onUpdate({
                    shadow: { ...shadow, color: color.toHexString() },
                  })
                }
              />
            </PropertyRow>
          </>
        )}
      </div>
    )}
  </div>
);

// ==================== Image Link Section ====================

interface ImageLinkSectionProps {
  hyperlink: string;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
}

export const ImageLinkSection: React.FC<ImageLinkSectionProps> = ({
  hyperlink,
  expandedSections,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Liên kết"
      sectionKey="imageLink"
      icon={<LinkOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("imageLink") && (
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

// ==================== Image Animation Section ====================

interface ImageAnimationSectionProps {
  animation: AnimationProps;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
}

export const ImageAnimationSection: React.FC<ImageAnimationSectionProps> = ({
  animation,
  expandedSections,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Hiệu ứng chuyển động"
      sectionKey="imageAnimation"
      icon={<PlayCircleOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("imageAnimation") && (
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

// ==================== Image Position Section ====================

interface ImagePositionSectionProps {
  element: ImageElement;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
  onPositionUpdate: (key: "x" | "y", value: number) => void;
  onSizeUpdate: (key: "width" | "height", value: number) => void;
}

export const ImagePositionSection: React.FC<ImagePositionSectionProps> = ({
  element,
  expandedSections,
  onToggle,
  onUpdate,
  onPositionUpdate,
  onSizeUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Vị trí & Kích thước"
      sectionKey="imagePosition"
      icon={<DragOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("imagePosition") && (
      <div className="px-4 pt-3 pb-4">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {
              label: "X",
              value: element.position.x,
              onChange: (v: number) => onPositionUpdate("x", v),
            },
            {
              label: "Y",
              value: element.position.y,
              onChange: (v: number) => onPositionUpdate("y", v),
            },
            {
              label: "W",
              value: element.size.width,
              onChange: (v: number) => onSizeUpdate("width", v),
            },
            {
              label: "H",
              value: element.size.height,
              onChange: (v: number) => onSizeUpdate("height", v),
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{item.label}</span>
              <input
                type="number"
                className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={Math.round(item.value)}
                onChange={(e) => item.onChange(Number(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
        <PropertyRow label="Xoay">
          <Slider
            value={element.rotation}
            onChange={(value) => onUpdate({ rotation: value })}
            min={-180}
            max={180}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-10">{element.rotation}°</span>
        </PropertyRow>
      </div>
    )}
  </div>
);

// ==================== Delete Button ====================

interface DeleteButtonProps {
  onDelete: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => (
  <div className="pt-1">
    <Button danger block icon={<DeleteOutlined />} onClick={onDelete}>
      Xóa phần tử
    </Button>
  </div>
);

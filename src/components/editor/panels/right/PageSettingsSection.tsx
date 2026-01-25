"use client";

import React from "react";
import {
  Input,
  Select,
  ColorPicker,
  Slider,
  message,
} from "antd";
import {
  FileImageOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  LinkOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import { COLOR_PALETTE } from "@/constants/colors";

const { Option } = Select;

// ==================== Types ====================

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

interface CardInfoSectionProps {
  cardTitle: string;
  cardCategory: string;
  cardStatus: string;
  previewImage: string;
  onTitleChange?: (title: string) => void;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onPreviewImageChange?: (image: string) => void;
  expandedSections: string[];
  onToggle: (key: string) => void;
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

// ==================== Card Info Section ====================

export const CardInfoSection: React.FC<CardInfoSectionProps> = ({
  cardTitle,
  cardCategory,
  cardStatus,
  previewImage,
  onTitleChange,
  onCategoryChange,
  onStatusChange,
  onPreviewImageChange,
  expandedSections,
  onToggle,
}) => {
  const handlePreviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        onPreviewImageChange?.(imageData);
        message.success("Đã tải lên ảnh preview!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Thông tin thiệp"
        sectionKey="cardInfo"
        icon={<FileImageOutlined />}
        expandedSections={expandedSections}
        onToggle={onToggle}
      />
      {expandedSections.includes("cardInfo") && (
        <div className="px-4 pt-3 pb-4">
          <PropertyRow label="Tên thiệp">
            <Input
              value={cardTitle}
              onChange={(e) => onTitleChange?.(e.target.value)}
              placeholder="Nhập tên thiệp..."
              className="flex-1"
            />
          </PropertyRow>

          <PropertyRow label="Danh mục">
            <Select
              value={cardCategory}
              onChange={onCategoryChange}
              className="flex-1"
            >
              <Option value="wedding">Thiệp cưới</Option>
              <Option value="birthday">Sinh nhật</Option>
              <Option value="invitation">Thiệp mời</Option>
              <Option value="greeting">Thiệp chúc mừng</Option>
              <Option value="other">Khác</Option>
            </Select>
          </PropertyRow>

          <PropertyRow label="Trạng thái">
            <Select
              value={cardStatus}
              onChange={onStatusChange}
              className="flex-1"
            >
              <Option value="draft">Bản nháp</Option>
              <Option value="published">Đã xuất bản</Option>
              <Option value="archived">Đã lưu trữ</Option>
            </Select>
          </PropertyRow>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600 block mb-2">
              Ảnh preview
            </span>
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded border border-gray-200"
                />
                <button
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  onClick={() => onPreviewImageChange?.("")}
                >
                  <DeleteOutlined style={{ fontSize: 12 }} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <UploadOutlined className="text-2xl text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">
                  Click để tải ảnh preview
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePreviewImageUpload}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Canvas Size Section ====================

interface CanvasSizeSectionProps {
  expandedSections: string[];
  onToggle: (key: string) => void;
  sizeLinked: boolean;
  onToggleSizeLinked: () => void;
}

export const CanvasSizeSection: React.FC<CanvasSizeSectionProps> = ({
  expandedSections,
  onToggle,
  sizeLinked,
  onToggleSizeLinked,
}) => {
  const { canvasSettings, setCanvasSettings } = useEditorStore();
  const canvasWidth = canvasSettings.width;
  const canvasHeight = canvasSettings.height;

  const handleSizeChange = (dimension: "width" | "height", value: number) => {
    if (sizeLinked) {
      const ratio =
        dimension === "width"
          ? value / canvasWidth
          : value / canvasHeight;
      setCanvasSettings({
        width: dimension === "width" ? value : Math.round(canvasWidth * ratio),
        height: dimension === "height" ? value : Math.round(canvasHeight * ratio),
      });
    } else {
      setCanvasSettings({ [dimension]: value });
    }
  };

  const PRESET_SIZES = [
    { label: "Instagram Post", width: 1080, height: 1080 },
    { label: "Instagram Story", width: 1080, height: 1920 },
    { label: "Facebook Post", width: 1200, height: 630 },
    { label: "A4 Dọc", width: 2480, height: 3508 },
    { label: "A4 Ngang", width: 3508, height: 2480 },
    { label: "Thiệp cưới", width: 1200, height: 1800 },
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Kích thước canvas"
        sectionKey="canvasSize"
        icon={<ExpandOutlined />}
        expandedSections={expandedSections}
        onToggle={onToggle}
      />
      {expandedSections.includes("canvasSize") && (
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">Kích thước (px)</span>
            <button
              className={`p-1.5 rounded transition-colors ${
                sizeLinked
                  ? "text-primary bg-primary/10"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              onClick={onToggleSizeLinked}
              title={sizeLinked ? "Giữ tỷ lệ: BẬT" : "Giữ tỷ lệ: TẮT"}
            >
              <LinkOutlined />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <span className="text-xs text-gray-400 block mb-1">Rộng</span>
              <input
                type="number"
                className="w-full h-9 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={canvasWidth}
                onChange={(e) =>
                  handleSizeChange("width", Number(e.target.value) || 100)
                }
              />
            </div>
            <div>
              <span className="text-xs text-gray-400 block mb-1">Cao</span>
              <input
                type="number"
                className="w-full h-9 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={canvasHeight}
                onChange={(e) =>
                  handleSizeChange("height", Number(e.target.value) || 100)
                }
              />
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-2">
              Kích thước có sẵn
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SIZES.map((preset) => (
                <button
                  key={preset.label}
                  className={`px-2 py-2 text-xs rounded border transition-all text-left ${
                    canvasWidth === preset.width &&
                    canvasHeight === preset.height
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setCanvasSettings({
                      width: preset.width,
                      height: preset.height,
                    })
                  }
                >
                  <span className="block font-medium">{preset.label}</span>
                  <span className="text-gray-400">
                    {preset.width}×{preset.height}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Background Section ====================

interface BackgroundSectionProps {
  expandedSections: string[];
  onToggle: (key: string) => void;
}

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  expandedSections,
  onToggle,
}) => {
  const { canvasSettings, setCanvasSettings } = useEditorStore();
  const backgroundColor = canvasSettings.backgroundColor;
  const backgroundImage = canvasSettings.backgroundImage;
  const backgroundSize = canvasSettings.backgroundSize;

  const handleBackgroundImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCanvasSettings({ backgroundImage: event.target?.result as string });
        message.success("Đã tải lên ảnh nền!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Nền"
        sectionKey="background"
        icon={<BgColorsOutlined />}
        expandedSections={expandedSections}
        onToggle={onToggle}
      />
      {expandedSections.includes("background") && (
        <div className="px-4 pt-3 pb-4 space-y-4">
          {/* Màu nền */}
          <div>
            <PropertyRow label="Màu nền">
              <ColorPicker
                value={backgroundColor}
                onChange={(color) =>
                  setCanvasSettings({ backgroundColor: color.toHexString() })
                }
              />
            </PropertyRow>

            <div className="grid grid-cols-8 gap-1 mt-2">
              {COLOR_PALETTE.slice(0, 16).map((item) => (
                <button
                  key={item.color}
                  className={`w-6 h-6 rounded-sm border transition-all ${
                    backgroundColor === item.color
                      ? "border-primary ring-1 ring-primary"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: item.color }}
                  onClick={() =>
                    setCanvasSettings({ backgroundColor: item.color })
                  }
                />
              ))}
            </div>
          </div>

          {/* Ảnh nền */}
          <div className="pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600 block mb-2">Ảnh nền</span>

            {backgroundImage ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={backgroundImage}
                    alt="Background"
                    className="w-full h-24 object-cover rounded border border-gray-200"
                  />
                  <button
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    onClick={() => setCanvasSettings({ backgroundImage: null })}
                  >
                    <DeleteOutlined style={{ fontSize: 12 }} />
                  </button>
                </div>

                <PropertyRow label="Hiển thị">
                  <Select
                    value={backgroundSize}
                    onChange={(value) =>
                      setCanvasSettings({ backgroundSize: value })
                    }
                    className="flex-1"
                  >
                    <Option value="cover">Phủ kín</Option>
                    <Option value="contain">Vừa khung</Option>
                    <Option value="auto">Gốc</Option>
                  </Select>
                </PropertyRow>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <UploadOutlined className="text-xl text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">
                  Click để tải ảnh nền
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBackgroundImageUpload}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Main Page Settings Component ====================

interface PageSettingsProps {
  cardTitle: string;
  cardCategory: string;
  cardStatus: string;
  previewImage: string;
  onTitleChange?: (title: string) => void;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onPreviewImageChange?: (image: string) => void;
  expandedSections: string[];
  onToggle: (key: string) => void;
  sizeLinked: boolean;
  onToggleSizeLinked: () => void;
}

export const PageSettings: React.FC<PageSettingsProps> = ({
  cardTitle,
  cardCategory,
  cardStatus,
  previewImage,
  onTitleChange,
  onCategoryChange,
  onStatusChange,
  onPreviewImageChange,
  expandedSections,
  onToggle,
  sizeLinked,
  onToggleSizeLinked,
}) => (
  <div className="p-3 space-y-3">
    <CardInfoSection
      cardTitle={cardTitle}
      cardCategory={cardCategory}
      cardStatus={cardStatus}
      previewImage={previewImage}
      onTitleChange={onTitleChange}
      onCategoryChange={onCategoryChange}
      onStatusChange={onStatusChange}
      onPreviewImageChange={onPreviewImageChange}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />

    <CanvasSizeSection
      expandedSections={expandedSections}
      onToggle={onToggle}
      sizeLinked={sizeLinked}
      onToggleSizeLinked={onToggleSizeLinked}
    />

    <BackgroundSection expandedSections={expandedSections} onToggle={onToggle} />
  </div>
);

"use client";

import React, { useState, useRef } from "react";
import {
  Slider,
  Select,
  ColorPicker,
  Button,
  Switch,
  Modal,
  Input,
} from "antd";
import {
  EditOutlined,
  BoldOutlined,
  CameraOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownOutlined,
  RightOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CopyOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CaretDownOutlined,
  FontColorsOutlined,
  BorderOuterOutlined,
  RadiusSettingOutlined,
  BoxPlotOutlined,
  DragOutlined,
  PlayCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import {
  TextElement,
  ImageElement,
  ShapeElement,
  EditorElement,
} from "@/types/editor";
import { loadGoogleFont } from "@/utils/fontLoader";

const { Option } = Select;

const FONTS = [
  // Wedding Script Fonts - Font chữ viết tay cho thiệp cưới
  { name: "Dancing Script", label: "Dancing Script", category: "script" },
  { name: "Great Vibes", label: "Great Vibes", category: "script" },
  { name: "Parisienne", label: "Parisienne", category: "script" },
  { name: "Allura", label: "Allura", category: "script" },
  { name: "Sacramento", label: "Sacramento", category: "script" },
  { name: "Alex Brush", label: "Alex Brush", category: "script" },
  { name: "Tangerine", label: "Tangerine", category: "script" },
  { name: "Pinyon Script", label: "Pinyon Script", category: "script" },
  { name: "Satisfy", label: "Satisfy", category: "script" },
  { name: "Cookie", label: "Cookie", category: "script" },
  { name: "Kaushan Script", label: "Kaushan Script", category: "script" },
  { name: "Amatic SC", label: "Amatic SC", category: "script" },

  // Elegant Serif - Font serif sang trọng
  { name: "Playfair Display", label: "Playfair Display", category: "serif" },
  {
    name: "Cormorant Garamond",
    label: "Cormorant Garamond",
    category: "serif",
  },
  { name: "Lora", label: "Lora", category: "serif" },
  { name: "Crimson Text", label: "Crimson Text", category: "serif" },
  { name: "Libre Baskerville", label: "Libre Baskerville", category: "serif" },
  { name: "EB Garamond", label: "EB Garamond", category: "serif" },
  { name: "Merriweather", label: "Merriweather", category: "serif" },
  { name: "Cinzel", label: "Cinzel", category: "serif" },
  { name: "Cardo", label: "Cardo", category: "serif" },

  // Modern Sans-Serif - Font hiện đại
  { name: "Montserrat", label: "Montserrat", category: "sans-serif" },
  { name: "Raleway", label: "Raleway", category: "sans-serif" },
  { name: "Poppins", label: "Poppins", category: "sans-serif" },
  { name: "Open Sans", label: "Open Sans", category: "sans-serif" },
  { name: "Roboto", label: "Roboto", category: "sans-serif" },
  { name: "Josefin Sans", label: "Josefin Sans", category: "sans-serif" },
  { name: "Quicksand", label: "Quicksand", category: "sans-serif" },

  // Decorative Fonts - Font trang trí
  { name: "Lobster", label: "Lobster", category: "decorative" },
  { name: "Righteous", label: "Righteous", category: "decorative" },
  { name: "Abril Fatface", label: "Abril Fatface", category: "decorative" },

  // Vietnamese Fonts - Font tiếng Việt
  { name: "Be Vietnam Pro", label: "Be Vietnam Pro", category: "vietnamese" },
  { name: "Philosopher", label: "Philosopher", category: "vietnamese" },

  // Classic Fonts - Font hệ thống
  { name: "Arial", label: "Arial", category: "system" },
  { name: "Times New Roman", label: "Times New Roman", category: "system" },
  { name: "Georgia", label: "Georgia", category: "system" },
];

const CATEGORIES = [
  { value: "wedding", label: "Thiệp cưới" },
  { value: "birthday", label: "Thiệp sinh nhật" },
  { value: "baby", label: "Thiệp đầy tháng" },
  { value: "party", label: "Thiệp tiệc" },
  { value: "invitation", label: "Thiệp mời" },
  { value: "other", label: "Khác" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Nháp", icon: <EditOutlined /> },
  { value: "public", label: "Công khai", icon: <EyeOutlined /> },
  { value: "private", label: "Riêng tư", icon: <EyeInvisibleOutlined /> },
];

interface RightPanelProps {
  cardTitle?: string;
  cardCategory?: string;
  cardStatus?: string;
  previewImage?: string;
  onTitleChange?: (title: string) => void;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onPreviewImageChange?: (image: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  cardTitle = "Thiệp cưới của tôi",
  cardCategory = "wedding",
  cardStatus = "draft",
  previewImage = "",
  onTitleChange,
  onCategoryChange,
  onStatusChange,
  onPreviewImageChange,
}) => {
  const { elements, selectedElementId, updateElement, deleteElement } =
    useEditorStore();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "textEffect",
    "style",
    "padding",
    "border",
    "borderRadius",
    "shadow",
    "link",
    "animation",
    "position",
    "colors",
  ]);

  // Settings toggles
  const [showInLibrary, setShowInLibrary] = useState(true);
  const [allowCopy, setAllowCopy] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // Padding & Border Radius sync toggles
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [borderRadiusLinked, setBorderRadiusLinked] = useState(true);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(cardTitle);
  const [editPreviewImage, setEditPreviewImage] = useState(previewImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const openEditModal = () => {
    setEditTitle(cardTitle);
    setEditPreviewImage(previewImage);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    onTitleChange?.(editTitle);
    onPreviewImageChange?.(editPreviewImage);
    setIsEditModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleUpdate = (updates: Partial<EditorElement>) => {
    if (selectedElement) {
      updateElement(selectedElement.id, updates);
    }
  };

  const handlePositionUpdate = (key: "x" | "y", value: number) => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        position: { ...selectedElement.position, [key]: value },
      });
    }
  };

  const handleSizeUpdate = (key: "width" | "height", value: number) => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        size: { ...selectedElement.size, [key]: value },
      });
    }
  };

  // Section Header Component
  const SectionHeader = ({
    title,
    sectionKey,
    icon,
  }: {
    title: string;
    sectionKey: string;
    icon?: React.ReactNode;
  }) => (
    <div
      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium text-sm ${
        expandedSections.includes(sectionKey) ? "border-b border-gray-100" : ""
      }`}
      onClick={() => toggleSection(sectionKey)}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span>{title}</span>
      </div>
      {expandedSections.includes(sectionKey) ? (
        <DownOutlined className="text-xs" />
      ) : (
        <RightOutlined className="text-xs" />
      )}
    </div>
  );

  // Property Row Component
  const PropertyRow = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-sm text-gray-600 w-24 shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">{children}</div>
    </div>
  );

  // Render page settings when no element is selected
  const renderPageSettings = () => (
    <>
      {/* Category & Status */}
      <div className="border-b border-gray-100 p-4 space-y-4">
        <PropertyRow label="Danh mục">
          <Select
            value={cardCategory}
            onChange={onCategoryChange}
            className="flex-1"
            suffixIcon={<CaretDownOutlined />}
          >
            {CATEGORIES.map((cat) => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </PropertyRow>

        <PropertyRow label="Trạng thái">
          <Select
            value={cardStatus}
            onChange={onStatusChange}
            className="flex-1"
            suffixIcon={<CaretDownOutlined />}
          >
            {STATUS_OPTIONS.map((status) => (
              <Option key={status.value} value={status.value}>
                <span className="flex items-center gap-2">
                  {status.icon}
                  <span>{status.label}</span>
                </span>
              </Option>
            ))}
          </Select>
        </PropertyRow>
      </div>

      {/* Preview Card - Social Share Preview */}
      <div className="border-b border-gray-100 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-sm">Bản xem trước</span>
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="h-8 px-3 text-xs font-medium"
            onClick={openEditModal}
          >
            Chỉnh sửa
          </Button>
        </div>

        {/* Preview Card */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Preview Image */}
          <div className="aspect-video bg-gray-800 relative overflow-hidden">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center text-white">
                <span className="text-lg font-serif italic opacity-80">
                  Wedify
                </span>
                <span className="text-xs opacity-60 mt-1">
                  Make your love story
                </span>
              </div>
            )}
          </div>

          {/* Preview Info */}
          <div className="p-3">
            <p className="text-sm font-medium text-gray-800">
              {cardTitle || "Chưa có tiêu đề"}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Đây là cách trang của bạn sẽ hiển thị khi được chia sẻ trên Facebook,
          Zalo, Messenger hoặc các mạng xã hội khác.
        </p>
      </div>

      {/* Edit Preview Modal */}
      <Modal
        title="Chỉnh sửa bản xem trước"
        open={isEditModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={400}
      >
        <div className="space-y-4 py-2">
          {/* Preview Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình đại diện
            </label>
            <div
              className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {editPreviewImage ? (
                <>
                  <img
                    src={editPreviewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CameraOutlined className="text-white text-2xl" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <CameraOutlined className="text-3xl mb-2" />
                  <span className="text-sm">Click để tải ảnh lên</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {editPreviewImage && (
              <Button
                danger
                className="mt-2"
                onClick={() => setEditPreviewImage("")}
              >
                Xóa ảnh
              </Button>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              size="large"
            />
          </div>
        </div>
      </Modal>

      {/* Premium Features Card */}
      <div className="border-b border-gray-100 p-4">
        <div className="border border-blue-200 rounded-xl p-4 bg-linear-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-3">
            <CrownOutlined className="text-amber-500 text-lg" />
            <span className="font-semibold">Tính năng cao cấp</span>
          </div>
          <ul className="space-y-2 mb-4">
            {[
              "Xóa watermark",
              "Xuất HD không giới hạn",
              "Truy cập mẫu Premium",
              "Hỗ trợ ưu tiên",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircleOutlined className="text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Settings Toggles */}
      <div className="border-b border-gray-100">
        <div className="px-4 py-3 font-medium text-sm border-b border-gray-50">
          Cài đặt
        </div>
        <div className="p-4 space-y-3">
          {[
            {
              icon: <EyeOutlined />,
              label: "Hiển thị trong thư viện",
              value: showInLibrary,
              onChange: setShowInLibrary,
            },
            {
              icon: <CopyOutlined />,
              label: "Cho phép sao chép",
              value: allowCopy,
              onChange: setAllowCopy,
            },
            {
              icon: <LinkOutlined />,
              label: "Tự động lưu",
              value: autoSave,
              onChange: setAutoSave,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              <Switch checked={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <Button icon={<CopyOutlined />} block>
          Nhân đôi trang
        </Button>
        <Button icon={<LinkOutlined />} block>
          Sao chép liên kết
        </Button>
      </div>
    </>
  );

  // Text Style Buttons
  const TextStyleButtons = ({ element }: { element: TextElement }) => (
    <div className="flex gap-1 mb-3">
      {[
        {
          icon: <BoldOutlined />,
          active: element.fontWeight >= 700,
          onClick: () =>
            handleUpdate({
              fontWeight: element.fontWeight >= 700 ? 400 : 700,
            }),
          title: "Đậm",
        },
        {
          icon: <ItalicOutlined />,
          active: element.fontStyle === "italic",
          onClick: () =>
            handleUpdate({
              fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
            }),
          title: "Nghiêng",
        },
        {
          icon: <StrikethroughOutlined />,
          active: element.textDecoration === "line-through",
          onClick: () =>
            handleUpdate({
              textDecoration:
                element.textDecoration === "line-through"
                  ? "none"
                  : "line-through",
            }),
          title: "Gạch ngang",
        },
        {
          icon: <UnderlineOutlined />,
          active: element.textDecoration === "underline",
          onClick: () =>
            handleUpdate({
              textDecoration:
                element.textDecoration === "underline" ? "none" : "underline",
            }),
          title: "Gạch chân",
        },
      ].map((btn, i) => (
        <button
          key={i}
          className={`w-9 h-9 flex items-center justify-center rounded border transition-colors ${
            btn.active
              ? "bg-primary/10 border-primary text-primary"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={btn.onClick}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );

  // Align Buttons
  const AlignButtons = ({ element }: { element: TextElement }) => (
    <div className="flex gap-1">
      {[
        { icon: <AlignLeftOutlined />, value: "left" as const },
        { icon: <AlignCenterOutlined />, value: "center" as const },
        { icon: <AlignRightOutlined />, value: "right" as const },
      ].map((btn) => (
        <button
          key={btn.value}
          className={`w-9 h-9 flex items-center justify-center rounded border transition-colors ${
            element.textAlign === btn.value
              ? "bg-primary/10 border-primary text-primary"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleUpdate({ textAlign: btn.value })}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );

  // Position Grid
  const PositionGrid = ({
    position,
    size,
  }: {
    position: { x: number; y: number };
    size: { width: number; height: number };
  }) => (
    <div className="grid grid-cols-4 gap-2 mb-3">
      {[
        {
          label: "X",
          value: position.x,
          onChange: (v: number) => handlePositionUpdate("x", v),
        },
        {
          label: "Y",
          value: position.y,
          onChange: (v: number) => handlePositionUpdate("y", v),
        },
        {
          label: "W",
          value: size.width,
          onChange: (v: number) => handleSizeUpdate("width", v),
        },
        {
          label: "H",
          value: size.height,
          onChange: (v: number) => handleSizeUpdate("height", v),
        },
      ].map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 uppercase">{item.label}</span>
          <input
            type="number"
            className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={Math.round(item.value)}
            onChange={(e) => item.onChange(Number(e.target.value) || 0)}
          />
        </div>
      ))}
    </div>
  );

  // Render text element properties
  const renderTextProperties = (element: TextElement) => {
    // Default values for new properties
    const padding = element.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const border = element.border || {
      width: 0,
      color: "#000000",
      style: "solid" as const,
      position: "all" as const,
    };
    const borderRadius = element.borderRadius || {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };
    const shadow = element.shadow || {
      enabled: false,
      x: 0,
      y: 4,
      blur: 8,
      color: "rgba(0,0,0,0.2)",
    };
    const hyperlink = element.hyperlink || "";
    const animation = element.animation || {
      enabled: false,
      continuous: false,
      type: "none" as const,
    };
    const textEffect = element.textEffect || {
      type: "none" as const,
      offset: 50,
      direction: -45,
      blur: 0,
      transparency: 40,
      color: "#000000",
      intensity: 50,
      spread: 50,
      curveAmount: 0,
    };

    // Text effect presets
    const TEXT_EFFECT_STYLES = [
      { type: "none", label: "Không", preview: "Ag" },
      { type: "shadow", label: "Shadow", preview: "Ag" },
      { type: "lift", label: "Lift", preview: "Ag" },
    ] as const;

    const TEXT_EFFECT_COLORS = [
      { type: "hollow", label: "Hollow", preview: "Ag" },
      { type: "splice", label: "Splice", preview: "Ag" },
      { type: "outline", label: "Outline", preview: "Ag" },
    ] as const;

    const TEXT_EFFECT_SPECIAL = [
      { type: "echo", label: "Echo", preview: "Ag" },
      { type: "glitch", label: "Glitch", preview: "Ag" },
      { type: "neon", label: "Neon", preview: "Ag" },
    ] as const;

    return (
      <div className="p-3 space-y-3">
        {/* Hiệu ứng chữ (Text Effects) - Canva Style */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Hiệu ứng chữ"
            sectionKey="textEffect"
            icon={<ThunderboltOutlined />}
          />
          {expandedSections.includes("textEffect") && (
            <div className="px-4 pt-3 pb-4">
              {/* Style section */}
              <div className="mb-4">
                <span className="text-xs text-gray-500 mb-2 block">Kiểu</span>
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_EFFECT_STYLES.map((effect) => (
                    <button
                      key={effect.type}
                      className={`relative h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        textEffect.type === effect.type
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        handleUpdate({
                          textEffect: { ...textEffect, type: effect.type },
                        })
                      }
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{
                          textShadow:
                            effect.type === "shadow"
                              ? "2px 2px 4px rgba(0,0,0,0.3)"
                              : effect.type === "lift"
                              ? "0 4px 8px rgba(0,0,0,0.2)"
                              : "none",
                        }}
                      >
                        {effect.preview}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {effect.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings for Shadow effect */}
              {textEffect.type === "shadow" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Offset">
                    <Slider
                      value={textEffect.offset}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, offset: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.offset}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            offset: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Hướng">
                    <Slider
                      value={textEffect.direction}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, direction: value },
                        })
                      }
                      min={-180}
                      max={180}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.direction}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            direction: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Blur">
                    <Slider
                      value={textEffect.blur}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, blur: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.blur}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            blur: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Độ mờ">
                    <Slider
                      value={textEffect.transparency}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, transparency: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.transparency}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            transparency: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Settings for Lift effect - only Intensity */}
              {textEffect.type === "lift" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Intensity">
                    <Slider
                      value={textEffect.intensity}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, intensity: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.intensity}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            intensity: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Settings for Hollow - Thickness only */}
              {textEffect.type === "hollow" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Thickness">
                    <Slider
                      value={textEffect.intensity}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, intensity: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.intensity}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            intensity: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Settings for Outline - Thickness (max 200) + Color */}
              {textEffect.type === "outline" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Thickness">
                    <Slider
                      value={textEffect.intensity}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, intensity: value },
                        })
                      }
                      min={0}
                      max={200}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.intensity}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            intensity: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Settings for Splice effect - Thickness, Offset, Direction */}
              {textEffect.type === "splice" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Thickness">
                    <Slider
                      value={textEffect.intensity}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, intensity: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.intensity}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            intensity: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Offset">
                    <Slider
                      value={textEffect.offset}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, offset: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.offset}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            offset: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Direction">
                    <Slider
                      value={textEffect.direction}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, direction: value },
                        })
                      }
                      min={-180}
                      max={180}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.direction}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            direction: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Settings for Echo effect - Offset, Direction */}
              {textEffect.type === "echo" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Offset">
                    <Slider
                      value={textEffect.offset}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, offset: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.offset}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            offset: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Direction">
                    <Slider
                      value={textEffect.direction}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, direction: value },
                        })
                      }
                      min={-180}
                      max={180}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.direction}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            direction: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Settings for Glitch effect - Offset, Direction */}
              {textEffect.type === "glitch" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Offset">
                    <Slider
                      value={textEffect.offset}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, offset: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.offset}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            offset: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Direction">
                    <Slider
                      value={textEffect.direction}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, direction: value },
                        })
                      }
                      min={-180}
                      max={180}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.direction}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            direction: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Settings for Neon effect - Intensity, Blur */}
              {textEffect.type === "neon" && (
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
                  <PropertyRow label="Intensity">
                    <Slider
                      value={textEffect.intensity}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, intensity: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.intensity}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            intensity: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>

                  <PropertyRow label="Blur">
                    <Slider
                      value={textEffect.blur}
                      onChange={(value) =>
                        handleUpdate({
                          textEffect: { ...textEffect, blur: value },
                        })
                      }
                      min={0}
                      max={100}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                      value={textEffect.blur}
                      onChange={(e) =>
                        handleUpdate({
                          textEffect: {
                            ...textEffect,
                            blur: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </PropertyRow>
                </div>
              )}

              {/* Color section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Màu</span>
                  <ColorPicker
                    value={textEffect.color}
                    onChange={(color) =>
                      handleUpdate({
                        textEffect: {
                          ...textEffect,
                          color: color.toHexString(),
                        },
                      })
                    }
                    size="small"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_EFFECT_COLORS.map((effect) => (
                    <button
                      key={effect.type}
                      className={`relative h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        textEffect.type === effect.type
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        handleUpdate({
                          textEffect: { ...textEffect, type: effect.type },
                        })
                      }
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{
                          color:
                            effect.type === "hollow"
                              ? "transparent"
                              : effect.type === "splice"
                              ? "#7c3aed"
                              : "#000",
                          WebkitTextStroke:
                            effect.type === "hollow"
                              ? "1px #000"
                              : effect.type === "outline"
                              ? "2px #7c3aed"
                              : "none",
                          textShadow:
                            effect.type === "splice"
                              ? "2px 2px 0 #000"
                              : "none",
                        }}
                      >
                        {effect.preview}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {effect.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special effects section */}
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_EFFECT_SPECIAL.map((effect) => (
                    <button
                      key={effect.type}
                      className={`relative h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        textEffect.type === effect.type
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        handleUpdate({
                          textEffect: { ...textEffect, type: effect.type },
                        })
                      }
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{
                          color:
                            effect.type === "neon"
                              ? "#00ff88"
                              : effect.type === "glitch"
                              ? "#ff0066"
                              : "#000",
                          textShadow:
                            effect.type === "echo"
                              ? "2px 2px 0 rgba(0,0,0,0.2), 4px 4px 0 rgba(0,0,0,0.1)"
                              : effect.type === "neon"
                              ? "0 0 10px #00ff88, 0 0 20px #00ff88"
                              : "none",
                        }}
                      >
                        {effect.preview}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {effect.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shape section */}
              <div>
                <span className="text-xs text-gray-500 mb-2 block">
                  Hình dạng
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                      textEffect.type !== "curve"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      handleUpdate({
                        textEffect: { ...textEffect, type: "none" },
                      })
                    }
                  >
                    <span className="text-lg font-bold tracking-wide">
                      ABCD
                    </span>
                    <span className="text-xs text-gray-500">Thẳng</span>
                  </button>
                  <button
                    className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                      textEffect.type === "curve"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      handleUpdate({
                        textEffect: { ...textEffect, type: "curve" },
                      })
                    }
                  >
                    <span
                      className="text-lg font-bold tracking-wide"
                      style={{
                        transform: "perspective(100px) rotateX(-10deg)",
                      }}
                    >
                      ABCD
                    </span>
                    <span className="text-xs text-gray-500">Cong</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kiểu chữ */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Kiểu chữ"
            sectionKey="style"
            icon={<FontColorsOutlined />}
          />
          {expandedSections.includes("style") && (
            <div className="px-4 pt-3 pb-4">
              <TextStyleButtons element={element} />

              <PropertyRow label="Căn chỉnh">
                <AlignButtons element={element} />
              </PropertyRow>

              <PropertyRow label="Cỡ chữ">
                <div className="flex items-center gap-1">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                    onClick={() =>
                      handleUpdate({
                        fontSize: Math.max(8, element.fontSize - 1),
                      })
                    }
                  >
                    <MinusOutlined className="text-xs" />
                  </button>
                  <input
                    type="number"
                    className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={element.fontSize}
                    onChange={(e) =>
                      handleUpdate({ fontSize: Number(e.target.value) || 16 })
                    }
                  />
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                    onClick={() =>
                      handleUpdate({ fontSize: element.fontSize + 1 })
                    }
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
                    setTimeout(() => {
                      handleUpdate({ fontFamily: value });
                    }, 50);
                  }}
                  className="flex-1"
                >
                  {FONTS.map((font) => (
                    <Option key={font.name} value={font.name}>
                      <span style={{ fontFamily: font.name }}>
                        {font.label}
                      </span>
                    </Option>
                  ))}
                </Select>
              </PropertyRow>

              <PropertyRow label="Màu chữ">
                <ColorPicker
                  value={element.color}
                  onChange={(color) =>
                    handleUpdate({ color: color.toHexString() })
                  }
                />
              </PropertyRow>

              <PropertyRow label="Màu nền">
                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={element.backgroundColor || "transparent"}
                    onChange={(color) =>
                      handleUpdate({ backgroundColor: color.toHexString() })
                    }
                  />
                  <Button
                    onClick={() =>
                      handleUpdate({ backgroundColor: "transparent" })
                    }
                  >
                    Trong suốt
                  </Button>
                </div>
              </PropertyRow>

              <PropertyRow label="Độ mờ">
                <Slider
                  value={element.opacity}
                  onChange={(value) => handleUpdate({ opacity: value })}
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

        {/* Khoảng đệm (Padding) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Khoảng đệm"
            sectionKey="padding"
            icon={<BoxPlotOutlined />}
          />
          {expandedSections.includes("padding") && (
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
                    onClick={() => setPaddingLinked(!paddingLinked)}
                    title={paddingLinked ? "Đồng bộ: BẬT" : "Đồng bộ: TẮT"}
                  >
                    <LinkOutlined />
                  </button>
                </div>

                {/* Cross/Plus layout like CSS box model */}
                <div className="flex flex-col items-center gap-1">
                  {/* Top */}
                  <input
                    type="number"
                    className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={padding.top}
                    min={0}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      if (paddingLinked) {
                        handleUpdate({
                          padding: {
                            top: val,
                            right: val,
                            bottom: val,
                            left: val,
                          },
                        });
                      } else {
                        handleUpdate({ padding: { ...padding, top: val } });
                      }
                    }}
                  />

                  {/* Left - Block - Right */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={padding.left}
                      min={0}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        if (paddingLinked) {
                          handleUpdate({
                            padding: {
                              top: val,
                              right: val,
                              bottom: val,
                              left: val,
                            },
                          });
                        } else {
                          handleUpdate({ padding: { ...padding, left: val } });
                        }
                      }}
                    />
                    <div className="w-14 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 font-medium">
                      Block
                    </div>
                    <input
                      type="number"
                      className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={padding.right}
                      min={0}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        if (paddingLinked) {
                          handleUpdate({
                            padding: {
                              top: val,
                              right: val,
                              bottom: val,
                              left: val,
                            },
                          });
                        } else {
                          handleUpdate({ padding: { ...padding, right: val } });
                        }
                      }}
                    />
                  </div>

                  {/* Bottom */}
                  <input
                    type="number"
                    className="w-14 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={padding.bottom}
                    min={0}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      if (paddingLinked) {
                        handleUpdate({
                          padding: {
                            top: val,
                            right: val,
                            bottom: val,
                            left: val,
                          },
                        });
                      } else {
                        handleUpdate({ padding: { ...padding, bottom: val } });
                      }
                    }}
                  />
                </div>
              </div>

              <PropertyRow label="Khoảng cách dòng">
                <Slider
                  value={element.lineHeight}
                  onChange={(value) => handleUpdate({ lineHeight: value })}
                  min={0.8}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
              </PropertyRow>
              <PropertyRow label="Khoảng cách chữ">
                <Slider
                  value={element.letterSpacing}
                  onChange={(value) => handleUpdate({ letterSpacing: value })}
                  min={-5}
                  max={20}
                  step={0.5}
                  className="flex-1"
                />
              </PropertyRow>
            </div>
          )}
        </div>

        {/* Đường viền */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Đường viền"
            sectionKey="border"
            icon={<BorderOuterOutlined />}
          />
          {expandedSections.includes("border") && (
            <div className="px-4 pt-3 pb-4 space-y-3">
              <PropertyRow label="Size">
                <input
                  type="number"
                  className="w-20 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={border.width}
                  min={0}
                  max={20}
                  onChange={(e) =>
                    handleUpdate({
                      border: { ...border, width: Number(e.target.value) || 0 },
                    })
                  }
                />
              </PropertyRow>

              <PropertyRow label="Màu">
                <ColorPicker
                  value={border.color}
                  onChange={(color) =>
                    handleUpdate({
                      border: { ...border, color: color.toHexString() },
                    })
                  }
                />
              </PropertyRow>

              <PropertyRow label="Kiểu">
                <Select
                  value={border.style}
                  onChange={(value) =>
                    handleUpdate({ border: { ...border, style: value } })
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
                    handleUpdate({ border: { ...border, position: value } })
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
                    title={borderRadiusLinked ? "Đồng bộ: BẬT" : "Đồng bộ: TẮT"}
                  >
                    <LinkOutlined />
                    <span>{borderRadiusLinked ? "Đồng bộ" : "Riêng"}</span>
                  </button>
                </div>

                {borderRadiusLinked ? (
                  // Single input for all corners
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Tất cả</span>
                    <input
                      type="number"
                      className="flex-1 h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={borderRadius.topLeft}
                      min={0}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        handleUpdate({
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
                  // Individual inputs
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        label: "TL",
                        key: "topLeft",
                        value: borderRadius.topLeft,
                      },
                      {
                        label: "TR",
                        key: "topRight",
                        value: borderRadius.topRight,
                      },
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
                      <div
                        key={item.key}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-xs text-gray-400">
                          {item.label}
                        </span>
                        <input
                          type="number"
                          className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          value={item.value}
                          min={0}
                          onChange={(e) => {
                            const newValue = Number(e.target.value) || 0;
                            handleUpdate({
                              borderRadius: {
                                topLeft: borderRadius.topLeft,
                                topRight: borderRadius.topRight,
                                bottomLeft: borderRadius.bottomLeft,
                                bottomRight: borderRadius.bottomRight,
                                [item.key]: newValue,
                              },
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

        {/* Đổ bóng (Shadow) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Đổ bóng"
            sectionKey="shadow"
            icon={<CopyOutlined />}
          />
          {expandedSections.includes("shadow") && (
            <div className="px-4 pt-3 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Đổ bóng</span>
                <Switch
                  checked={shadow.enabled}
                  onChange={(checked) =>
                    handleUpdate({ shadow: { ...shadow, enabled: checked } })
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
                          handleUpdate({
                            shadow: {
                              ...shadow,
                              x: Number(e.target.value) || 0,
                            },
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
                          handleUpdate({
                            shadow: {
                              ...shadow,
                              y: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <PropertyRow label="Blur">
                    <Slider
                      value={shadow.blur}
                      onChange={(v) =>
                        handleUpdate({ shadow: { ...shadow, blur: v } })
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
                        handleUpdate({
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

        {/* Liên kết (Hyperlink) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Liên kết"
            sectionKey="link"
            icon={<LinkOutlined />}
          />
          {expandedSections.includes("link") && (
            <div className="px-4 pt-3 pb-4">
              <div className="mb-2">
                <span className="text-xs text-gray-500">
                  Hyperlink (Tùy chọn)
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={hyperlink}
                  onChange={(e) => handleUpdate({ hyperlink: e.target.value })}
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

        {/* Hiệu ứng chuyển động (Animation) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Hiệu ứng chuyển động"
            sectionKey="animation"
            icon={<PlayCircleOutlined />}
          />
          {expandedSections.includes("animation") && (
            <div className="px-4 pt-3 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bật hiệu ứng</span>
                <Switch
                  checked={animation.enabled}
                  onChange={(checked) =>
                    handleUpdate({
                      animation: { ...animation, enabled: checked },
                    })
                  }
                />
              </div>

              {animation.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Chuyển động liên tục
                    </span>
                    <Switch
                      checked={animation.continuous}
                      onChange={(checked) =>
                        handleUpdate({
                          animation: { ...animation, continuous: checked },
                        })
                      }
                    />
                  </div>

                  <PropertyRow label="Loại chuyển động">
                    <Select
                      value={animation.type}
                      onChange={(value) =>
                        handleUpdate({
                          animation: { ...animation, type: value },
                        })
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

        {/* Position */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Vị trí & Kích thước"
            sectionKey="position"
            icon={<DragOutlined />}
          />
          {expandedSections.includes("position") && (
            <div className="px-4 pt-3 pb-4">
              <PositionGrid position={element.position} size={element.size} />
              <PropertyRow label="Xoay">
                <Slider
                  value={element.rotation}
                  onChange={(value) => handleUpdate({ rotation: value })}
                  min={-180}
                  max={180}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-10">
                  {element.rotation}°
                </span>
              </PropertyRow>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <div className="pt-1">
          <Button
            danger
            block
            icon={<DeleteOutlined />}
            onClick={() => selectedElement && deleteElement(selectedElement.id)}
          >
            Xóa phần tử
          </Button>
        </div>
      </div>
    );
  };

  // Render image element properties
  const renderImageProperties = (element: ImageElement) => (
    <>
      {/* Kích thước */}
      <div className="border-b border-gray-100">
        <SectionHeader title="Kích thước" sectionKey="size" />
        {expandedSections.includes("size") && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "W",
                  value: element.size.width,
                  key: "width" as const,
                },
                {
                  label: "H",
                  value: element.size.height,
                  key: "height" as const,
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase">
                    {item.label}
                  </span>
                  <input
                    type="number"
                    className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={Math.round(item.value)}
                    onChange={(e) =>
                      handleSizeUpdate(item.key, Number(e.target.value) || 100)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Position */}
      <div className="border-b border-gray-100">
        <SectionHeader title="Vị trí" sectionKey="position" />
        {expandedSections.includes("position") && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "X", value: element.position.x, key: "x" as const },
                { label: "Y", value: element.position.y, key: "y" as const },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase">
                    {item.label}
                  </span>
                  <input
                    type="number"
                    className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={Math.round(item.value)}
                    onChange={(e) =>
                      handlePositionUpdate(
                        item.key,
                        Number(e.target.value) || 0
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <PropertyRow label="Xoay">
              <Slider
                value={element.rotation}
                onChange={(value) => handleUpdate({ rotation: value })}
                min={-180}
                max={180}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-10">
                {element.rotation}°
              </span>
            </PropertyRow>
          </div>
        )}
      </div>

      {/* Hiệu ứng */}
      <div className="border-b border-gray-100">
        <SectionHeader title="Hiệu ứng" sectionKey="effects" />
        {expandedSections.includes("effects") && (
          <div className="px-4 pb-4">
            <PropertyRow label="Độ mờ">
              <Slider
                value={element.opacity}
                onChange={(value) => handleUpdate({ opacity: value })}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />
            </PropertyRow>
            <PropertyRow label="Bo góc">
              <Slider
                value={element.borderRadius || 0}
                onChange={(value) => handleUpdate({ borderRadius: value })}
                min={0}
                max={50}
                className="flex-1"
              />
            </PropertyRow>
          </div>
        )}
      </div>

      {/* Delete Button */}
      <div className="p-4">
        <Button
          danger
          block
          icon={<DeleteOutlined />}
          onClick={() => selectedElement && deleteElement(selectedElement.id)}
        >
          Xóa phần tử
        </Button>
      </div>
    </>
  );

  // Render shape element properties
  const renderShapeProperties = (element: ShapeElement) => (
    <>
      {/* Màu sắc */}
      <div className="border-b border-gray-100">
        <SectionHeader title="Màu sắc" sectionKey="colors" />
        {expandedSections.includes("colors") && (
          <div className="px-4 pb-4">
            <PropertyRow label="Màu nền">
              <ColorPicker
                value={element.fill}
                onChange={(color) =>
                  handleUpdate({ fill: color.toHexString() })
                }
              />
            </PropertyRow>
            <PropertyRow label="Màu viền">
              <ColorPicker
                value={element.stroke}
                onChange={(color) =>
                  handleUpdate({ stroke: color.toHexString() })
                }
              />
            </PropertyRow>
            <PropertyRow label="Độ dày viền">
              <Slider
                value={element.strokeWidth}
                onChange={(value) => handleUpdate({ strokeWidth: value })}
                min={0}
                max={20}
                className="flex-1"
              />
            </PropertyRow>
          </div>
        )}
      </div>

      {/* Vị trí & Kích thước */}
      <div className="border-b border-gray-100">
        <SectionHeader title="Vị trí & Kích thước" sectionKey="position" />
        {expandedSections.includes("position") && (
          <div className="px-4 pb-4">
            <PositionGrid position={element.position} size={element.size} />
            <PropertyRow label="Xoay">
              <Slider
                value={element.rotation}
                onChange={(value) => handleUpdate({ rotation: value })}
                min={-180}
                max={180}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-10">
                {element.rotation}°
              </span>
            </PropertyRow>
            <PropertyRow label="Độ mờ">
              <Slider
                value={element.opacity}
                onChange={(value) => handleUpdate({ opacity: value })}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />
            </PropertyRow>
          </div>
        )}
      </div>

      {/* Delete Button */}
      <div className="p-4">
        <Button
          danger
          block
          icon={<DeleteOutlined />}
          onClick={() => selectedElement && deleteElement(selectedElement.id)}
        >
          Xóa phần tử
        </Button>
      </div>
    </>
  );

  const renderProperties = () => {
    if (!selectedElement) return renderPageSettings();

    switch (selectedElement.type) {
      case "text":
        return renderTextProperties(selectedElement as TextElement);
      case "image":
        return renderImageProperties(selectedElement as ImageElement);
      case "shape":
        return renderShapeProperties(selectedElement as ShapeElement);
      default:
        return renderPageSettings();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden h-full">
      {/* Header */}
      <div className="h-12 px-4 border-b border-gray-200 flex items-center gap-2 shrink-0">
        <EditOutlined className="text-gray-400" />
        <span className="font-semibold text-sm">
          {selectedElement ? "Tùy chỉnh phần tử" : "Tùy chỉnh"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">{renderProperties()}</div>
    </div>
  );
};

export default RightPanel;

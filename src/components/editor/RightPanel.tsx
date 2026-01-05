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
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import {
  TextElement,
  ImageElement,
  ShapeElement,
  EditorElement,
} from "@/types/editor";

const { Option } = Select;

const FONTS = [
  { name: "Dancing Script", label: "Dancing Script" },
  { name: "Great Vibes", label: "Great Vibes" },
  { name: "Playfair Display", label: "Playfair Display" },
  { name: "Cormorant Garamond", label: "Cormorant Garamond" },
  { name: "Montserrat", label: "Montserrat" },
  { name: "Lora", label: "Lora" },
  { name: "Arial", label: "Arial" },
  { name: "Times New Roman", label: "Times New Roman" },
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
  }: {
    title: string;
    sectionKey: string;
  }) => (
    <div
      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium text-sm"
      onClick={() => toggleSection(sectionKey)}
    >
      <span>{title}</span>
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

    return (
      <>
        {/* Kiểu chữ */}
        <div className="border-b border-gray-100">
          <SectionHeader title="Kiểu chữ" sectionKey="style" />
          {expandedSections.includes("style") && (
            <div className="px-4 pb-4">
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
                  onChange={(value) => handleUpdate({ fontFamily: value })}
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
        <div className="border-b border-gray-100">
          <SectionHeader title="Khoảng đệm" sectionKey="padding" />
          {expandedSections.includes("padding") && (
            <div className="px-4 pb-4">
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

        {/* Đường viền (Border) */}
        <div className="border-b border-gray-100">
          <SectionHeader title="Đường viền" sectionKey="border" />
          {expandedSections.includes("border") && (
            <div className="px-4 pb-4 space-y-3">
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
            </div>
          )}
        </div>

        {/* Bo góc (Border Radius) */}
        <div className="border-b border-gray-100">
          <SectionHeader title="Bo góc" sectionKey="borderRadius" />
          {expandedSections.includes("borderRadius") && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Bo góc</span>
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
          )}
        </div>

        {/* Đổ bóng (Shadow) */}
        <div className="border-b border-gray-100">
          <SectionHeader title="Đổ bóng" sectionKey="shadow" />
          {expandedSections.includes("shadow") && (
            <div className="px-4 pb-4 space-y-3">
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
        <div className="border-b border-gray-100">
          <SectionHeader title="Liên kết" sectionKey="link" />
          {expandedSections.includes("link") && (
            <div className="px-4 pb-4">
              <div className="mb-2">
                <span className="text-xs text-gray-500">
                  Hyperlink (Tùy chọn)
                </span>
              </div>
              <Input
                value={hyperlink}
                onChange={(e) => handleUpdate({ hyperlink: e.target.value })}
                placeholder="https://example.com"
                prefix={<LinkOutlined className="text-gray-400" />}
              />
            </div>
          )}
        </div>

        {/* Hiệu ứng chuyển động (Animation) */}
        <div className="border-b border-gray-100">
          <SectionHeader title="Hiệu ứng chuyển động" sectionKey="animation" />
          {expandedSections.includes("animation") && (
            <div className="px-4 pb-4 space-y-3">
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

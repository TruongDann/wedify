"use client";

import React, { useState } from "react";
import {
  Search,
  Type,
  MoreHorizontal,
  Video,
  Play,
  X,
  Crown,
  Music,
  Trash2,
} from "lucide-react";
import { Button, Upload, Input, Tabs } from "antd";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  PictureOutlined,
  HeartOutlined,
  StarOutlined,
  BorderOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  FolderOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  useEditorStore,
  createTextElement,
  createImageElement,
  createShapeElement,
} from "@/store/editorStore";
import { ShapeElement } from "@/types/editor";

// Music Library
const MUSIC_LIBRARY = [
  { id: 1, name: "50 Năm Về Sau", artist: "Unknown", duration: "03:54" },
  { id: 2, name: "A Little Love", artist: "Unknown", duration: "03:11" },
  { id: 3, name: "A Thousand Years", artist: "Unknown", duration: "04:48" },
  { id: 4, name: "All of Me", artist: "Unknown", duration: "04:30" },
  { id: 5, name: "Beautiful In White", artist: "Unknown", duration: "03:58" },
  {
    id: 6,
    name: "Can't Help Falling In Love",
    artist: "Unknown",
    duration: "03:07",
  },
  { id: 7, name: "Perfect", artist: "Unknown", duration: "04:23" },
  { id: 8, name: "Thinking Out Loud", artist: "Unknown", duration: "04:41" },
];

// Shapes
const SHAPES: {
  type: ShapeElement["shapeType"];
  icon: React.ReactNode;
  label: string;
}[] = [
  { type: "rectangle", icon: <BorderOutlined />, label: "Chữ nhật" },
  { type: "circle", icon: "○", label: "Tròn" },
  { type: "triangle", icon: "△", label: "Tam giác" },
  { type: "heart", icon: <HeartOutlined />, label: "Tim" },
  { type: "star", icon: <StarOutlined />, label: "Sao" },
  { type: "line", icon: "—", label: "Đường" },
];

// Stickers
const STICKERS = [
  {
    id: 1,
    src: "https://img.icons8.com/color/96/wedding-rings.png",
    category: "wedding",
  },
  {
    id: 2,
    src: "https://img.icons8.com/color/96/champagne.png",
    category: "wedding",
  },
  {
    id: 3,
    src: "https://img.icons8.com/color/96/wedding-cake.png",
    category: "wedding",
  },
  {
    id: 4,
    src: "https://img.icons8.com/color/96/rose-bouquet.png",
    category: "flowers",
  },
  {
    id: 5,
    src: "https://img.icons8.com/color/96/flower.png",
    category: "flowers",
  },
  {
    id: 6,
    src: "https://img.icons8.com/color/96/butterfly.png",
    category: "nature",
  },
  {
    id: 7,
    src: "https://img.icons8.com/color/96/dove.png",
    category: "nature",
  },
  {
    id: 8,
    src: "https://img.icons8.com/color/96/sparkling-diamond.png",
    category: "wedding",
  },
];

// Stock images
const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=200",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=200",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200",
];

// Color palette for background
const COLOR_PALETTE = [
  // Row 1: Transparent, blacks, grays, white
  { color: "transparent", isTransparent: true },
  { color: "#000000" },
  { color: "#4A4A4A" },
  { color: "#7A7A7A" },
  { color: "#B8B8B8" },
  { color: "#FFFFFF" },
  // Row 2: Vibrant colors
  { color: "#E53935" },
  { color: "#8E24AA" },
  { color: "#1E88E5" },
  { color: "#00897B" },
  { color: "#43A047" },
  { color: "#00ACC1" },
  // Row 3: Medium tones
  { color: "#FF5722" },
  { color: "#7B1FA2" },
  { color: "#2196F3" },
  { color: "#26A69A" },
  { color: "#4CAF50" },
  { color: "#FF9800" },
  // Row 4: Lighter vibrant
  { color: "#F48FB1" },
  { color: "#CE93D8" },
  { color: "#90CAF9" },
  { color: "#80CBC4" },
  { color: "#C5E1A5" },
  { color: "#FFEE58" },
  // Row 5: Pastel colors
  { color: "#FCE4EC" },
  { color: "#E1BEE7" },
  { color: "#B3E5FC" },
  { color: "#B2DFDB" },
  { color: "#DCEDC8" },
  { color: "#FFF9C4" },
  // Row 6: Very light pastels
  { color: "#FFF8E1" },
  { color: "#E0F7FA" },
  { color: "#F1F8E9" },
  { color: "#FFFDE7" },
  { color: "#FBE9E7" },
  { color: "#F3E5F5" },
];

// Gradient palette for background
const GRADIENT_PALETTE = [
  { gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)" },
  { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  {
    gradient: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)",
  },
  { gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
  { gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)" },
  { gradient: "linear-gradient(135deg, #4481eb 0%, #04befe 100%)" },
  { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { gradient: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)" },
  { gradient: "linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)" },
];

interface LeftPanelProps {
  activeTab: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ activeTab }) => {
  const { addElement, setCanvasSettings, canvasSettings } = useEditorStore();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [musicSubTab, setMusicSubTab] = useState<string>("library");
  const [musicFilter, setMusicFilter] = useState<string>("all");
  const [currentMusic, setCurrentMusic] = useState<{
    name: string;
    artist: string;
    duration: string;
  } | null>({ name: "Lẽ Đường", artist: "Kai Đinh", duration: "04:09" });
  const [imageSubTab, setImageSubTab] = useState<string>("images");
  const [bgSubTab, setBgSubTab] = useState<string>("color");
  const [uploadedMusic, setUploadedMusic] = useState<
    { id: string; name: string; src: string; duration: string }[]
  >([]);

  const handleAddText = (
    options: {
      fontSize?: number;
      fontWeight?: number;
      content?: string;
    } = {}
  ) => {
    addElement(createTextElement(options));
  };

  const handleAddShape = (shapeType: ShapeElement["shapeType"]) => {
    addElement(createShapeElement(shapeType));
  };

  const handleAddSticker = (src: string) => {
    addElement(
      createImageElement(src, {
        size: { width: 80, height: 80 },
      })
    );
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 300;
        const ratio = img.width / img.height;
        const width = Math.min(img.width, maxWidth);
        const height = width / ratio;
        addElement(createImageElement(src, { size: { width, height } }));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCanvasSettings({ backgroundImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleAddStockImage = (src: string) => {
    addElement(createImageElement(src, { size: { width: 200, height: 200 } }));
  };

  // Section Component
  const Section = ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <div className="p-4 border-b border-gray-100">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      )}
      {children}
    </div>
  );

  // Empty State Component
  const EmptyState = ({
    icon,
    text,
  }: {
    icon: React.ReactNode;
    text: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );

  // Text Templates with explicit types
  const TEXT_TEMPLATES: {
    id: string;
    label: string;
    previewContent: React.ReactNode;
    elementOptions: {
      content: string;
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: number;
      fontStyle?: "normal" | "italic";
      color?: string;
      textAlign?: "left" | "center" | "right";
    };
  }[] = [];

  const renderTextTab = () => (
    <>
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative group">
          <Input
            prefix={<Search size={18} className="text-gray-400" />}
            placeholder="Tìm kiếm font và mẫu..."
            className="rounded-xl !py-2 !px-3 !border-gray-200"
            style={{ backgroundColor: "white" }}
          />
        </div>

        {/* Main Add Button */}
        <Button
          type="primary"
          block
          size="large"
          onClick={() => handleAddText()}
          className="!font-medium !text-sm !rounded-md flex items-center justify-center bg-[#8b3dff] hover:!bg-[#7a35e0] h-10 shadow-sm"
          icon={<Type size={18} className="mr-1" />}
        >
          Thêm hộp văn bản
        </Button>

        {/* Default Text Styles */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Kiểu mặc định
          </h3>
          <div className="space-y-3">
            {/* Heading */}
            <div
              className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center group"
              onClick={() =>
                handleAddText({
                  content: "Thêm tiêu đề",
                  fontSize: 32,
                  fontWeight: 700,
                })
              }
            >
              <h1 className="text-2xl font-bold text-gray-800 w-full group-hover:text-black transition-colors">
                Thêm tiêu đề
              </h1>
            </div>

            {/* Subheading */}
            <div
              className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center group"
              onClick={() =>
                handleAddText({
                  content: "Thêm tiêu đề phụ",
                  fontSize: 24,
                  fontWeight: 600,
                })
              }
            >
              <h2 className="text-lg font-semibold text-gray-700 w-full group-hover:text-black transition-colors">
                Thêm tiêu đề phụ
              </h2>
            </div>

            {/* Body Text */}
            <div
              className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center group"
              onClick={() =>
                handleAddText({
                  content: "Thêm văn bản nội dung",
                  fontSize: 16,
                  fontWeight: 400,
                })
              }
            >
              <p className="text-sm text-gray-600 w-full group-hover:text-gray-900 transition-colors">
                Thêm văn bản nội dung
              </p>
            </div>
          </div>
        </div>

        {/* Text Templates */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Mẫu văn bản
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {TEXT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="aspect-[4/3] rounded-xl cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden border border-gray-100 hover:shadow-md"
                onClick={() => handleAddText(template.elementOptions)}
                title={template.label}
              >
                {template.previewContent}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderImageTab = () => (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <Input
          prefix={<Search size={18} className="text-gray-400" />}
          placeholder="Tìm kiếm từ khóa, thẻ, màu sắc"
          className="rounded-full !py-2 !px-4 !border-gray-200"
          style={{ backgroundColor: "white" }}
        />
      </div>

      {/* Upload Button */}
      <div className="px-4 pb-2">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              setUploadedImages((prev) => [src, ...prev]);
            };
            reader.readAsDataURL(file);
            return false;
          }}
          className="block w-full [&_.ant-upload]:w-full"
        >
          <Button
            type="primary"
            size="large"
            className="!font-medium !text-sm !rounded-lg flex items-center justify-center bg-[#8b3dff] hover:!bg-[#7a35e0] h-11 !w-full"
          >
            Tải lên tệp
          </Button>
        </Upload>
      </div>

      {/* Record Yourself Button */}
      <div className="px-4 pb-3">
        <Button
          block
          size="large"
          className="!font-medium !text-sm !rounded-lg h-11 flex items-center justify-center"
        >
          Tự quay video
        </Button>
      </div>

      {/* Tabs: Images, Designs, Folders */}
      <div className="px-4 border-b border-gray-100">
        <Tabs
          activeKey={imageSubTab}
          onChange={setImageSubTab}
          items={[
            {
              key: "images",
              label: (
                <span className="flex items-center gap-1">
                  <PictureOutlined />
                  Hình ảnh
                </span>
              ),
            },
            {
              key: "designs",
              label: (
                <span className="flex items-center gap-1">
                  <AppstoreOutlined />
                  Thiết kế
                </span>
              ),
            },
            {
              key: "folders",
              label: (
                <span className="flex items-center gap-1">
                  <FolderOutlined />
                  Thư mục
                </span>
              ),
            },
          ]}
          className="!mb-0"
          size="small"
        />
      </div>

      {/* Content based on sub-tab */}
      <div className="flex-1 overflow-y-auto p-4">
        {imageSubTab === "images" && (
          <>
            {/* Uploaded Images Grid */}
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((src, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-gray-100"
                    onClick={() => handleImageUpload2(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <PictureOutlined className="text-4xl mb-3" />
                <p className="text-sm text-center">
                  Tải lên hình ảnh để xem tại đây
                </p>
              </div>
            )}
          </>
        )}

        {imageSubTab === "designs" && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AppstoreOutlined className="text-4xl mb-3" />
            <p className="text-sm text-center">
              Thiết kế của bạn sẽ hiển thị tại đây
            </p>
          </div>
        )}

        {imageSubTab === "folders" && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FolderOutlined className="text-4xl mb-3" />
            <p className="text-sm text-center">
              Sắp xếp tệp của bạn vào thư mục
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to add uploaded image to canvas
  const handleImageUpload2 = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 300;
      const ratio = img.width / img.height;
      const width = Math.min(img.width, maxWidth);
      const height = width / ratio;
      addElement(createImageElement(src, { size: { width, height } }));
    };
    img.src = src;
  };

  const renderStockTab = () => (
    <>
      <Section>
        <Input.Search placeholder="Tìm kiếm ảnh stock..." className="mb-4" />
      </Section>

      <Section title="Ảnh cưới">
        <div className="grid grid-cols-2 gap-2">
          {STOCK_IMAGES.map((src, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
              onClick={() => handleAddStockImage(src)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Stock ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </Section>
    </>
  );

  const renderBackgroundTab = () => (
    <div className="flex flex-col h-full">
      {/* Tabs: Màu nền / Hình nền */}
      <div className="border-b border-gray-100">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bgSubTab === "color"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setBgSubTab("color")}
          >
            Màu nền
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bgSubTab === "image"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setBgSubTab("image")}
          >
            Hình nền
          </button>
        </div>
      </div>

      {/* Content based on sub-tab */}
      <div className="flex-1 overflow-y-auto">
        {bgSubTab === "color" && (
          <div className="p-4">
            {/* Current Background Color */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Màu nền hiện tại
              </h3>
              <div
                className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                style={{
                  backgroundColor:
                    canvasSettings.backgroundColor === "transparent"
                      ? undefined
                      : canvasSettings.backgroundColor,
                  backgroundImage:
                    canvasSettings.backgroundColor === "transparent"
                      ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                      : canvasSettings.backgroundColor?.startsWith(
                          "linear-gradient"
                        )
                      ? canvasSettings.backgroundColor
                      : undefined,
                  backgroundSize:
                    canvasSettings.backgroundColor === "transparent"
                      ? "8px 8px"
                      : undefined,
                  backgroundPosition:
                    canvasSettings.backgroundColor === "transparent"
                      ? "0 0, 0 4px, 4px -4px, -4px 0px"
                      : undefined,
                }}
              />
            </div>

            {/* Default Colors */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Màu nền mặc định
              </h3>
              <p className="text-sm text-gray-500 mb-3">Màu đơn</p>

              <div className="grid grid-cols-6 gap-2">
                {COLOR_PALETTE.map((item, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                      canvasSettings.backgroundColor === item.color
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    style={{
                      backgroundColor: item.isTransparent
                        ? undefined
                        : item.color,
                      backgroundImage: item.isTransparent
                        ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                        : undefined,
                      backgroundSize: "8px 8px",
                      backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                    }}
                    onClick={() =>
                      setCanvasSettings({ backgroundColor: item.color })
                    }
                  />
                ))}
              </div>
            </div>

            {/* Gradient Colors */}
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-3">Màu nền gradient</p>

              <div className="grid grid-cols-6 gap-2">
                {GRADIENT_PALETTE.map((item, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                      canvasSettings.backgroundColor === item.gradient
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    style={{
                      backgroundImage: item.gradient,
                    }}
                    onClick={() =>
                      setCanvasSettings({ backgroundColor: item.gradient })
                    }
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Picker - Inline */}
            <div className="pt-4 border-t border-gray-100">
              <div className="color-picker-wrapper">
                <HexColorPicker
                  color={
                    canvasSettings.backgroundColor === "transparent" ||
                    canvasSettings.backgroundColor?.startsWith(
                      "linear-gradient"
                    )
                      ? "#6F42A3"
                      : canvasSettings.backgroundColor
                  }
                  onChange={(color) =>
                    setCanvasSettings({ backgroundColor: color })
                  }
                  style={{ width: "100%" }}
                />
                <div className="flex items-center gap-3 mt-4">
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm shrink-0"
                    style={{
                      backgroundColor:
                        canvasSettings.backgroundColor === "transparent" ||
                        canvasSettings.backgroundColor?.startsWith(
                          "linear-gradient"
                        )
                          ? "#6F42A3"
                          : canvasSettings.backgroundColor,
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        HEX
                      </span>
                      <HexColorInput
                        color={
                          canvasSettings.backgroundColor === "transparent" ||
                          canvasSettings.backgroundColor?.startsWith(
                            "linear-gradient"
                          )
                            ? "6F42A3"
                            : canvasSettings.backgroundColor?.replace("#", "")
                        }
                        onChange={(color) =>
                          setCanvasSettings({ backgroundColor: `#${color}` })
                        }
                        prefixed
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {bgSubTab === "image" && (
          <div className="p-4">
            {/* Upload Background Button */}
            <div className="mb-4">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleBackgroundUpload}
                className="block w-full [&_.ant-upload]:w-full"
              >
                <Button
                  type="primary"
                  size="large"
                  className="!font-medium !text-sm !rounded-lg h-11 !w-full"
                >
                  Tải ảnh nền
                </Button>
              </Upload>
            </div>

            {/* Current Background Image */}
            {canvasSettings.backgroundImage && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  Ảnh nền hiện tại
                </h3>
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={canvasSettings.backgroundImage}
                    alt="Current background"
                    className="w-full h-32 object-cover"
                  />
                  {/* Overlay khi hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                  {/* Nút xóa */}
                  <button
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg backdrop-blur-sm"
                    onClick={() => setCanvasSettings({ backgroundImage: null })}
                    title="Xóa ảnh nền"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Stock Background Images */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Hình nền mẫu
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {STOCK_IMAGES.map((src, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                    onClick={() => setCanvasSettings({ backgroundImage: src })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplateTab = () => (
    <Section title="Mẫu thiệp cưới">
      <div className="grid grid-cols-2 gap-2">
        {[
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&h=280&fit=crop",
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=280&fit=crop",
          "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=200&h=280&fit=crop",
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&h=280&fit=crop",
        ].map((src, index) => (
          <div
            key={index}
            className="aspect-3/4 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Template ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </Section>
  );

  // Render Music Tab
  const renderMusicTab = () => (
    <div className="flex flex-col h-full">
      {/* Tabs: Thư viện nhạc / Nhạc của tôi */}
      <div className="border-b border-gray-100">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              musicSubTab === "library"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMusicSubTab("library")}
          >
            Thư viện nhạc
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              musicSubTab === "mymusic"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMusicSubTab("mymusic")}
          >
            Nhạc của tôi
          </button>
        </div>
      </div>

      {/* Current Music */}
      {currentMusic && (
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Nhạc hiện tại</p>
          <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow transition-shadow">
              <Play size={16} className="text-primary ml-0.5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {currentMusic.name} - {currentMusic.artist}
              </p>
              <p className="text-xs text-gray-500">{currentMusic.duration}</p>
            </div>
            <button
              className="p-1.5 hover:bg-primary/20 rounded transition-colors"
              onClick={() => setCurrentMusic(null)}
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Content based on sub-tab */}
      {musicSubTab === "library" && (
        <>
          {/* Search Bar */}
          <div className="p-4 pb-3">
            <Input
              prefix={<Search size={18} className="text-gray-400" />}
              placeholder="Tìm kiếm bài hát"
              className="rounded-full !py-2 !px-4 !border-gray-200"
              style={{ backgroundColor: "white" }}
            />
          </div>

          {/* Filter Chips */}
          <div
            className="px-4 pb-3 flex gap-2 flex-nowrap overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[
              { key: "all", label: "Tất cả" },
              { key: "international", label: "Nhạc ngoại" },
              { key: "vpop", label: "V-POP" },
            ].map((filter) => (
              <button
                key={filter.key}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  musicFilter === filter.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setMusicFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Music List */}
          <div className="flex-1 overflow-y-auto">
            {MUSIC_LIBRARY.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Play size={16} className="text-gray-600 ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {song.name}
                  </p>
                  <p className="text-xs text-gray-500">{song.duration}</p>
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/30 text-sm text-primary hover:bg-primary/10 transition-colors"
                  onClick={() =>
                    setCurrentMusic({
                      name: song.name,
                      artist: song.artist,
                      duration: song.duration,
                    })
                  }
                >
                  Sử dụng
                  <Crown size={14} className="text-primary" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {musicSubTab === "mymusic" && (
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Upload Button */}
          <Upload
            accept="audio/*"
            showUploadList={false}
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                const newMusic = {
                  id: Date.now().toString(),
                  name: file.name.replace(/\.[^/.]+$/, ""),
                  src,
                  duration: "--:--",
                };
                setUploadedMusic((prev) => [newMusic, ...prev]);
              };
              reader.readAsDataURL(file);
              return false;
            }}
            className="block w-full [&_.ant-upload]:w-full"
          >
            <Button
              type="primary"
              size="large"
              className="!font-medium !text-sm !rounded-lg h-11 !w-full flex items-center justify-center gap-2"
            >
              <Music size={18} />
              Tải nhạc lên
            </Button>
          </Upload>

          {/* Uploaded Music List */}
          {uploadedMusic.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Nhạc đã tải lên
              </h3>
              {uploadedMusic.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <Play size={16} className="text-primary ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {song.name}
                    </p>
                    <p className="text-xs text-gray-500">{song.duration}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      onClick={() =>
                        setCurrentMusic({
                          name: song.name,
                          artist: "Nhạc của tôi",
                          duration: song.duration,
                        })
                      }
                    >
                      Sử dụng
                    </button>
                    <button
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() =>
                        setUploadedMusic((prev) =>
                          prev.filter((m) => m.id !== song.id)
                        )
                      }
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 mt-4">
              <Music size={48} className="mb-3 opacity-50" />
              <p className="text-sm text-center">Tải lên nhạc để xem tại đây</p>
              <p className="text-xs text-center mt-1 text-gray-400">
                Hỗ trợ: MP3, WAV, OGG...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "text":
        return renderTextTab();
      case "image":
        return renderImageTab();
      case "stock":
        return renderStockTab();
      case "background":
        return renderBackgroundTab();
      case "template":
        return renderTemplateTab();
      case "music":
        return renderMusicTab();
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
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

export default LeftPanel;

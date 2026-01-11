"use client";

import React from "react";
import { Search, Type } from "lucide-react";
import { Button, Upload, Input, ColorPicker } from "antd";
import {
  UploadOutlined,
  PictureOutlined,
  HeartOutlined,
  StarOutlined,
  BorderOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  useEditorStore,
  createTextElement,
  createImageElement,
  createShapeElement,
} from "@/store/editorStore";
import { ShapeElement } from "@/types/editor";

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

interface LeftPanelProps {
  activeTab: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ activeTab }) => {
  const { addElement, setCanvasSettings, canvasSettings } = useEditorStore();

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

  const renderTextTab = () => (
    <>
      <div className="p-4 space-y-4">
        {/* Search Bar */}
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
          className="!font-medium !text-sm !rounded-md flex items-center justify-center bg-[#8b3dff] hover:!bg-[#7a35e0]"
          icon={<Type size={18} className="mr-1" />}
        >
          Thêm hộp văn bản
        </Button>

        {/* Default Text Styles */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Kiểu mặc định
          </h3>
          <div className="space-y-3">
            {/* Heading */}
            <div
              className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center"
              onClick={() =>
                handleAddText({
                  content: "Thêm tiêu đề",
                  fontSize: 32,
                  fontWeight: 700,
                })
              }
            >
              <h1 className="text-3xl font-bold text-gray-800 w-full">
                Thêm tiêu đề
              </h1>
            </div>

            {/* Subheading */}
            <div
              className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center"
              onClick={() =>
                handleAddText({
                  content: "Thêm tiêu đề phụ",
                  fontSize: 24,
                  fontWeight: 600,
                })
              }
            >
              <h2 className="text-xl font-semibold text-gray-700 w-full">
                Thêm tiêu đề phụ
              </h2>
            </div>

            {/* Body Text */}
            <div
              className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center"
              onClick={() =>
                handleAddText({
                  content: "Thêm văn bản nội dung",
                  fontSize: 16,
                  fontWeight: 400,
                })
              }
            >
              <p className="text-sm text-gray-600 w-full">
                Thêm văn bản nội dung
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderImageTab = () => (
    <>
      <Section>
        <Upload.Dragger
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImageUpload}
          className="bg-gray-50! border-dashed! border-gray-300! hover:border-primary!"
        >
          <div className="py-4">
            <UploadOutlined className="text-3xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Kéo thả hoặc click để tải ảnh
            </p>
            <p className="text-xs text-gray-400">Hỗ trợ JPG, PNG, GIF</p>
          </div>
        </Upload.Dragger>
      </Section>

      <Section title="Sticker cưới">
        <div className="grid grid-cols-4 gap-2">
          {STICKERS.map((sticker) => (
            <div
              key={sticker.id}
              className="aspect-square bg-gray-50 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-primary/30 flex items-center justify-center"
              onClick={() => handleAddSticker(sticker.src)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sticker.src}
                alt="sticker"
                className="w-10 h-10 object-contain"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Hình khối">
        <div className="grid grid-cols-6 gap-2">
          {SHAPES.map((shape) => (
            <div
              key={shape.type}
              className="aspect-square bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-primary/30 flex items-center justify-center text-lg"
              onClick={() => handleAddShape(shape.type)}
              title={shape.label}
            >
              {shape.icon}
            </div>
          ))}
        </div>
      </Section>
    </>
  );

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
    <>
      <Section title="Màu nền">
        <ColorPicker
          value={canvasSettings.backgroundColor}
          onChange={(color) =>
            setCanvasSettings({ backgroundColor: color.toHexString() })
          }
          showText
          format="hex"
          size="large"
          className="w-full"
        />
      </Section>

      <Section title="Ảnh nền">
        <Upload.Dragger
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleBackgroundUpload}
          className="bg-gray-50! border-dashed! border-gray-300! hover:border-primary!"
        >
          <div className="py-4">
            <PictureOutlined className="text-3xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Tải ảnh nền</p>
          </div>
        </Upload.Dragger>

        {canvasSettings.backgroundImage && (
          <Button
            danger
            block
            className="mt-3"
            onClick={() => setCanvasSettings({ backgroundImage: null })}
          >
            Xóa ảnh nền
          </Button>
        )}
      </Section>

      <Section title="Kích thước">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rộng</label>
            <Input
              type="number"
              value={canvasSettings.width}
              onChange={(e) =>
                setCanvasSettings({ width: Number(e.target.value) })
              }
              suffix="px"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Cao</label>
            <Input
              type="number"
              value={canvasSettings.height}
              onChange={(e) =>
                setCanvasSettings({ height: Number(e.target.value) })
              }
              suffix="px"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button
            size="small"
            onClick={() => setCanvasSettings({ width: 600, height: 800 })}
          >
            Dọc
          </Button>
          <Button
            size="small"
            onClick={() => setCanvasSettings({ width: 800, height: 600 })}
          >
            Ngang
          </Button>
          <Button
            size="small"
            onClick={() => setCanvasSettings({ width: 600, height: 600 })}
          >
            Vuông
          </Button>
          <Button
            size="small"
            onClick={() => setCanvasSettings({ width: 1080, height: 1920 })}
          >
            Story
          </Button>
        </div>
      </Section>
    </>
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
        return (
          <EmptyState
            icon={<CustomerServiceOutlined />}
            text="Tính năng âm nhạc sắp ra mắt"
          />
        );
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

"use client";

import React, { useState } from "react";
import { Search, Type, MoreHorizontal, Video } from "lucide-react";
import { Button, Upload, Input, ColorPicker, Tabs } from "antd";
import {
  UploadOutlined,
  PictureOutlined,
  HeartOutlined,
  StarOutlined,
  BorderOutlined,
  CustomerServiceOutlined,
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageSubTab, setImageSubTab] = useState<string>("images");

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

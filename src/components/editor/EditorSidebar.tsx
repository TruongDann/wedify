"use client";

import React, { useState, useRef } from "react";
import {
  Tabs,
  Button,
  Input,
  Upload,
  message,
  Tooltip,
  Collapse,
  ColorPicker,
} from "antd";
import {
  FontSizeOutlined,
  PictureOutlined,
  StarOutlined,
  AppstoreOutlined,
  HeartOutlined,
  BorderOutlined,
  SmileOutlined,
  UploadOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import {
  useEditorStore,
  createTextElement,
  createImageElement,
  createShapeElement,
} from "@/store/editorStore";
import { ShapeElement } from "@/types/editor";

const { TabPane } = Tabs;
const { Panel } = Collapse;

// Font list cho thiệp cưới
const FONTS = [
  { name: "Dancing Script", label: "Dancing Script" },
  { name: "Great Vibes", label: "Great Vibes" },
  { name: "Playfair Display", label: "Playfair Display" },
  { name: "Cormorant Garamond", label: "Cormorant Garamond" },
  { name: "Montserrat", label: "Montserrat" },
  { name: "Lora", label: "Lora" },
];

// Shape types
const SHAPES: {
  type: ShapeElement["shapeType"];
  icon: React.ReactNode;
  label: string;
}[] = [
  { type: "rectangle", icon: <BorderOutlined />, label: "Hình chữ nhật" },
  { type: "circle", icon: "○", label: "Hình tròn" },
  { type: "triangle", icon: "△", label: "Tam giác" },
  { type: "heart", icon: <HeartOutlined />, label: "Trái tim" },
  { type: "star", icon: <StarOutlined />, label: "Ngôi sao" },
  { type: "line", icon: "—", label: "Đường thẳng" },
];

// Wedding stickers/decorations
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

// Text presets
const TEXT_PRESETS = [
  {
    content: "SAVE THE DATE",
    fontSize: 32,
    fontFamily: "Playfair Display",
    fontWeight: 700,
  },
  {
    content: "Wedding Invitation",
    fontSize: 28,
    fontFamily: "Great Vibes",
    fontWeight: 400,
  },
  {
    content: "Trân trọng kính mời",
    fontSize: 24,
    fontFamily: "Dancing Script",
    fontWeight: 500,
  },
  {
    content: "Cô dâu & Chú rể",
    fontSize: 36,
    fontFamily: "Great Vibes",
    fontWeight: 400,
  },
  {
    content: "Ngày...Tháng...Năm...",
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: 400,
  },
  {
    content: "Địa điểm tổ chức",
    fontSize: 18,
    fontFamily: "Lora",
    fontWeight: 400,
  },
];

const EditorSidebar: React.FC = () => {
  const { addElement, setCanvasSettings, canvasSettings } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = (preset?: (typeof TEXT_PRESETS)[0]) => {
    addElement(
      createTextElement(
        preset
          ? {
              content: preset.content,
              fontSize: preset.fontSize,
              fontFamily: preset.fontFamily,
              fontWeight: preset.fontWeight,
            }
          : undefined
      )
    );
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

        addElement(
          createImageElement(src, {
            size: { width, height },
          })
        );
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setCanvasSettings({ backgroundImage: src });
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div className="editor-sidebar">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-pink-600 m-0">
          🎀 Wedding Editor
        </h2>
      </div>

      <Tabs
        defaultActiveKey="text"
        className="flex-1"
        tabBarStyle={{ padding: "0 16px" }}
      >
        {/* Text Tab */}
        <TabPane
          tab={
            <Tooltip title="Văn bản">
              <FontSizeOutlined />
            </Tooltip>
          }
          key="text"
        >
          <div className="sidebar-content">
            <Button
              type="primary"
              block
              icon={<FontSizeOutlined />}
              onClick={() => handleAddText()}
              className="mb-4"
            >
              Thêm văn bản
            </Button>

            <p className="text-sm text-gray-500 mb-3">Mẫu văn bản có sẵn:</p>
            <div className="space-y-2">
              {TEXT_PRESETS.map((preset, index) => (
                <div
                  key={index}
                  onClick={() => handleAddText(preset)}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-pink-50 hover:border-pink-300 border border-transparent transition-all"
                  style={{
                    fontFamily: preset.fontFamily,
                    fontSize: Math.min(preset.fontSize, 18),
                  }}
                >
                  {preset.content}
                </div>
              ))}
            </div>
          </div>
        </TabPane>

        {/* Image Tab */}
        <TabPane
          tab={
            <Tooltip title="Hình ảnh">
              <PictureOutlined />
            </Tooltip>
          }
          key="image"
        >
          <div className="sidebar-content">
            <Upload.Dragger
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              className="mb-4"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 32, color: "#ec4899" }} />
              </p>
              <p className="ant-upload-text">Kéo thả hoặc click để tải ảnh</p>
              <p className="ant-upload-hint">Hỗ trợ JPG, PNG, GIF</p>
            </Upload.Dragger>
          </div>
        </TabPane>

        {/* Shapes Tab */}
        <TabPane
          tab={
            <Tooltip title="Hình khối">
              <AppstoreOutlined />
            </Tooltip>
          }
          key="shapes"
        >
          <div className="sidebar-content">
            <p className="text-sm text-gray-500 mb-3">Chọn hình khối:</p>
            <div className="element-grid">
              {SHAPES.map((shape) => (
                <Tooltip key={shape.type} title={shape.label}>
                  <div
                    className="element-item"
                    onClick={() => handleAddShape(shape.type)}
                  >
                    {shape.icon}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </TabPane>

        {/* Stickers Tab */}
        <TabPane
          tab={
            <Tooltip title="Sticker">
              <SmileOutlined />
            </Tooltip>
          }
          key="stickers"
        >
          <div className="sidebar-content">
            <p className="text-sm text-gray-500 mb-3">Sticker cưới:</p>
            <div className="sticker-grid">
              {STICKERS.map((sticker) => (
                <div
                  key={sticker.id}
                  className="sticker-item"
                  onClick={() => handleAddSticker(sticker.src)}
                >
                  <img src={sticker.src} alt="sticker" />
                </div>
              ))}
            </div>
          </div>
        </TabPane>

        {/* Background Tab */}
        <TabPane
          tab={
            <Tooltip title="Nền">
              <BgColorsOutlined />
            </Tooltip>
          }
          key="background"
        >
          <div className="sidebar-content">
            <Collapse defaultActiveKey={["color", "image"]} ghost>
              <Panel header="Màu nền" key="color">
                <ColorPicker
                  value={canvasSettings.backgroundColor}
                  onChange={(color) =>
                    setCanvasSettings({ backgroundColor: color.toHexString() })
                  }
                  showText
                  format="hex"
                  className="w-full"
                />
              </Panel>

              <Panel header="Ảnh nền" key="image">
                <Upload.Dragger
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleBackgroundUpload}
                >
                  <p className="ant-upload-drag-icon">
                    <PictureOutlined
                      style={{ fontSize: 24, color: "#ec4899" }}
                    />
                  </p>
                  <p className="ant-upload-text text-sm">Tải ảnh nền</p>
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
              </Panel>

              <Panel header="Kích thước" key="size">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Chiều rộng</label>
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
                    <label className="text-sm text-gray-500">Chiều cao</label>
                    <Input
                      type="number"
                      value={canvasSettings.height}
                      onChange={(e) =>
                        setCanvasSettings({ height: Number(e.target.value) })
                      }
                      suffix="px"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="small"
                      onClick={() =>
                        setCanvasSettings({ width: 600, height: 800 })
                      }
                    >
                      Dọc
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        setCanvasSettings({ width: 800, height: 600 })
                      }
                    >
                      Ngang
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        setCanvasSettings({ width: 600, height: 600 })
                      }
                    >
                      Vuông
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        setCanvasSettings({ width: 1080, height: 1920 })
                      }
                    >
                      Story
                    </Button>
                  </div>
                </div>
              </Panel>
            </Collapse>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default EditorSidebar;

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ConfigProvider, Spin, Button, Tooltip, Dropdown, message } from "antd";
import viVN from "antd/locale/vi_VN";
import {
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  RocketOutlined,
  MenuOutlined,
  FontSizeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  BlockOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  SecurityScanOutlined,
  RightOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import LeftPanel from "@/components/editor/LeftPanel";
import RightPanel from "@/components/editor/RightPanel";
import { useEditorStore } from "@/store/editorStore";

// Dynamic import EditorCanvas vì Konva cần window
const EditorCanvas = dynamic(() => import("@/components/editor/EditorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-100">
      <Spin size="large" />
    </div>
  ),
});

type TabKey =
  | "text"
  | "element"
  | "image"
  | "stock"
  | "background"
  | "music"
  | "widget"
  | "template"
  | "effect";

const tabs: { key: TabKey; icon: React.ReactNode; label: string }[] = [
  { key: "text", icon: <FontSizeOutlined />, label: "Văn bản" },
  { key: "element", icon: <BlockOutlined />, label: "Hình dạng" },
  { key: "image", icon: <PictureOutlined />, label: "Hình ảnh" },
  { key: "stock", icon: <AppstoreOutlined />, label: "Stock" },
  { key: "background", icon: <BgColorsOutlined />, label: "Nền" },
  { key: "music", icon: <CustomerServiceOutlined />, label: "Âm nhạc" },
  { key: "widget", icon: <CalendarOutlined />, label: "Tiện ích" },
  { key: "template", icon: <BlockOutlined />, label: "Mẫu" },
  { key: "effect", icon: <ThunderboltOutlined />, label: "Hiệu ứng" },
];

const EditorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const [canvasHeight, setCanvasHeight] = useState(800);

  // Card settings state
  const [cardTitle, setCardTitle] = useState("Thiệp cưới của tôi");
  const [cardCategory, setCardCategory] = useState("wedding");
  const [cardStatus, setCardStatus] = useState("draft");

  const {
    saveHistory,
    selectElement,
    deleteElement,
    selectedElementId,
    undo,
    redo,
    history,
    historyIndex,
    elements,
  } = useEditorStore();

  // Initialize history
  useEffect(() => {
    saveHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA"
        ) {
          return;
        }
        deleteElement(selectedElementId);
      }

      if (e.key === "Escape") {
        selectElement(null);
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          undo();
        }
        if (e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, deleteElement, selectElement, undo, redo]);

  const handleExport = async (format: "png" | "jpg") => {
    const canvasElement = document.querySelector(
      ".canvas-wrapper canvas"
    ) as HTMLCanvasElement;
    if (!canvasElement) {
      message.error("Không tìm thấy canvas");
      return;
    }

    try {
      message.loading({ content: "Đang xuất ảnh...", key: "export" });
      const dataUrl = canvasElement.toDataURL(`image/${format}`, 1.0);
      const link = document.createElement("a");
      link.download = `wedding-card.${format}`;
      link.href = dataUrl;
      link.click();
      message.success({ content: "Xuất ảnh thành công!", key: "export" });
    } catch {
      message.error({ content: "Có lỗi xảy ra khi xuất ảnh", key: "export" });
    }
  };

  const exportMenuItems = [
    { key: "png", label: "Xuất PNG", onClick: () => handleExport("png") },
    { key: "jpg", label: "Xuất JPG", onClick: () => handleExport("jpg") },
  ];

  // Get image elements for quick replace
  const imageElements = elements.filter((el) => el.type === "image");

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#FFA5B4",
          borderRadius: 6,
        },
      }}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
        {/* Header - Navbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-3 gap-2 z-50 fixed top-0 left-0 right-0">
          {/* Left: Menu + Logo */}
          <Button type="text" icon={<MenuOutlined />} className="px-3 py-2" />

          <Link href="/" className="flex items-center gap-2 ml-2">
            <Image
              src="/logo-web.png"
              alt="Logo"
              width={100}
              height={28}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-2" />

          {/* Actions: Undo, Redo, Security */}
          <div className="flex items-center gap-1 flex-1">
            <Tooltip title="Hoàn tác (Ctrl+Z)">
              <Button
                type="text"
                icon={<UndoOutlined className="text-lg" />}
                onClick={undo}
                disabled={historyIndex <= 0}
              />
            </Tooltip>
            <Tooltip title="Làm lại (Ctrl+Y)">
              <Button
                type="text"
                icon={<RedoOutlined className="text-lg" />}
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              />
            </Tooltip>
            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <Tooltip title="Kiểm tra bảo mật">
              <Button
                type="text"
                icon={<SecurityScanOutlined className="text-lg" />}
              />
            </Tooltip>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Save status */}
            <Tooltip title="Tất cả thay đổi đã được lưu lên cloud">
              <div className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:bg-gray-50 rounded cursor-default transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6.5 19a4.5 4.5 0 0 1-.42-8.98A6 6 0 0 1 18 10a4 4 0 0 1-.18 8H6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs">Đã lưu</span>
              </div>
            </Tooltip>

            {/* Preview button */}
            <Button icon={<EyeOutlined />}>Xem trước</Button>

            {/* Publish button */}
            <Dropdown menu={{ items: exportMenuItems }}>
              <Button type="primary" icon={<RocketOutlined />}>
                Xuất bản
              </Button>
            </Dropdown>

            {/* User avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <Image
                src="/avatar.jpg"
                alt="Avatar"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 mt-14 overflow-hidden">
          {/* Left Sidebar - Toolbox with vertical tabs */}
          <div className="w-18 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="flex-1 flex flex-col py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`flex flex-col items-center justify-center py-3 px-2 gap-1 transition-colors border-l-2 ${
                    activeTab === tab.key
                      ? "bg-pink-50 border-l-primary text-primary"
                      : "border-l-transparent text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Bottom support button */}
            <div className="p-2 border-t border-gray-100">
              <button className="flex flex-col items-center justify-center w-full py-3 gap-1 text-gray-500 hover:text-primary hover:bg-pink-50 rounded-lg transition-colors">
                <QuestionCircleOutlined className="text-xl" />
                <span className="text-xs font-medium">Hỗ trợ</span>
              </button>
            </div>
          </div>

          {/* Left Panel - Content */}
          <LeftPanel activeTab={activeTab} />

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-200 overflow-hidden">
            <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
              <EditorCanvas canvasHeight={canvasHeight} />

              {/* Page Height Resize Control */}
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    onClick={() =>
                      setCanvasHeight((h) => Math.max(400, h - 100))
                    }
                    title="Giảm chiều dài"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Number(e.target.value))}
                    min={400}
                    step={100}
                  />
                  <span className="text-sm text-gray-500">px</span>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    onClick={() => setCanvasHeight((h) => h + 100)}
                    title="Tăng chiều dài"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Replace Bar */}
            <div className="h-20 bg-white border-t border-gray-200 flex items-center px-4 gap-3">
              <div className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-primary">
                <span className="text-sm font-medium">Thay ảnh nhanh</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
              <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                {imageElements.length > 0
                  ? imageElements.map((el) => (
                      <div
                        key={el.id}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer group shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(el as { src?: string }).src || ""}
                          alt="Quick replace"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <PictureOutlined className="text-white text-xl" />
                        </div>
                      </div>
                    ))
                  : [1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer group shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://picsum.photos/100/100?random=${i}`}
                          alt={`Quick ${i}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <PictureOutlined className="text-white text-xl" />
                        </div>
                      </div>
                    ))}
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                <RightOutlined className="text-gray-500" />
              </div>
            </div>
          </div>

          {/* Right Panel - Settings */}
          <RightPanel
            cardTitle={cardTitle}
            cardCategory={cardCategory}
            cardStatus={cardStatus}
            onTitleChange={setCardTitle}
            onCategoryChange={setCardCategory}
            onStatusChange={setCardStatus}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default EditorPage;

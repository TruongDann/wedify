"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Tooltip, Dropdown } from "antd";
import {
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  RocketOutlined,
  MenuOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import { message } from "antd";

interface EditorHeaderProps {
  onPreview?: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onPreview }) => {
  const { undo, redo, history, historyIndex } = useEditorStore();

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

  return (
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
        <Button icon={<EyeOutlined />} onClick={onPreview}>
          Xem trước
        </Button>

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
  );
};

export default EditorHeader;

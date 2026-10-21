"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Tooltip, Dropdown } from "antd";
import {
  ChevronDown,
  CloudAlert,
  CloudCheck,
  Eye,
  LoaderCircle,
  Menu,
  Redo2,
  Rocket,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { message } from "antd";
import type { SaveStatus } from "../useDraftAutosave";

interface EditorHeaderProps {
  onPreview?: () => void;
  /** Mở hộp thoại lưu/xuất bản thiệp lên tài khoản Wedify (API). */
  onPublish?: () => void;
  saveStatus?: SaveStatus;
}

const SAVE_STATUS: Record<
  SaveStatus,
  { label: string; tooltip: string; icon: LucideIcon; tone: string; spin?: boolean }
> = {
  loading: {
    label: "Đang tải",
    tooltip: "Đang mở bản nháp",
    icon: LoaderCircle,
    tone: "bg-surface-muted text-ink-3",
    spin: true,
  },
  saving: {
    label: "Đang lưu",
    tooltip: "Đang lưu thay đổi",
    icon: LoaderCircle,
    tone: "bg-surface-muted text-ink-3",
    spin: true,
  },
  saved: {
    label: "Đã lưu nháp",
    tooltip: "Bản nháp được lưu trên trình duyệt này",
    icon: CloudCheck,
    tone: "bg-surface-muted text-ink-2",
  },
  error: {
    label: "Chưa lưu được",
    tooltip: "Không lưu được bản nháp — bộ nhớ trình duyệt có thể đã đầy",
    icon: CloudAlert,
    tone: "bg-red-50 text-red-600",
  },
};

// Nút icon tròn trong suốt (menu, hoàn tác, làm lại)
const iconBtn =
  "w-9.5 h-9.5 rounded-full flex items-center justify-center text-ink-2 hover:bg-surface-muted transition-colors disabled:text-ink-4 disabled:hover:bg-transparent disabled:cursor-not-allowed";

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onPreview,
  onPublish,
  saveStatus = "saved",
}) => {
  const { undo, redo, history, historyIndex } = useEditorStore();
  const status = SAVE_STATUS[saveStatus];
  const StatusIcon = status.icon;

  const handleExport = async (format: "png" | "jpg") => {
    const canvasElement = document.querySelector(
      ".canvas-wrapper canvas",
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
    { key: "publish", label: "Xuất bản lên Wedify…", onClick: () => onPublish?.() },
    { type: "divider" as const },
    { key: "png", label: "Xuất PNG", onClick: () => handleExport("png") },
    { key: "jpg", label: "Xuất JPG", onClick: () => handleExport("jpg") },
  ];

  return (
    <header className="h-16 bg-white border-b border-line-subtle flex items-center gap-4 px-6 z-50 fixed top-0 left-0 right-0">
      {/* Left: menu, logo, undo/redo */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button type="button" className={`${iconBtn} -ml-2`} aria-label="Menu">
          <Menu size={18} />
        </button>

        <Link href="/" className="flex items-center">
          <Image
            src="/logo-web.png"
            alt="Logo"
            width={106}
            height={28}
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>

        <div className="flex items-center gap-0.5 ml-3">
          <Tooltip title="Hoàn tác (Ctrl+Z)">
            <button
              type="button"
              className={iconBtn}
              onClick={undo}
              disabled={historyIndex <= 0}
              aria-label="Hoàn tác"
            >
              <Undo2 size={17} />
            </button>
          </Tooltip>
          <Tooltip title="Làm lại (Ctrl+Y)">
            <button
              type="button"
              className={iconBtn}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              aria-label="Làm lại"
            >
              <Redo2 size={17} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Trạng thái lưu: cùng chiều cao, bo tròn như các nút bên cạnh */}
        <Tooltip
          title={
            <>
              {status.tooltip}
              <br />
              Bấm Xuất bản để lưu thiết kế vào hệ thống.
            </>
          }
        >
          <div
            className={`h-9.5 px-3.5 mr-1 rounded-full flex items-center gap-1.5 text-[13px] font-medium cursor-default select-none transition-colors ${status.tone}`}
          >
            <StatusIcon
              size={15}
              strokeWidth={2}
              className={status.spin ? "animate-spin" : undefined}
            />
            <span className="hidden sm:inline">{status.label}</span>
          </div>
        </Tooltip>

        <Button
          shape="round"
          icon={<Eye size={16} />}
          onClick={onPreview}
          className="h-9.5! px-4! text-sm!"
        >
          Xem trước
        </Button>

        <Dropdown menu={{ items: exportMenuItems }}>
          <Button
            type="primary"
            shape="round"
              icon={<Rocket size={16} />}
            className="h-9.5! px-4! text-sm!"
          >
            Xuất bản
          </Button>
        </Dropdown>

        {/* User avatar */}
        <button
          type="button"
          className="ml-1 flex items-center gap-1 p-0.5 pr-2 rounded-full border border-line hover:bg-surface-muted transition-colors"
        >
          <Image
            src="/avatar.jpg"
            alt="Avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
          <ChevronDown size={14} className="text-ink-3" />
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;

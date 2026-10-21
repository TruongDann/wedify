"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Tooltip, Dropdown, Modal, App } from "antd";
import {
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  RocketOutlined,
  MenuOutlined,
  SecurityScanOutlined,
  CopyOutlined,
  DeleteOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import { useEditorStore } from "@/store/editorStore";

interface EditorHeaderProps {
  onPreview?: () => void;
  onPublish?: () => Promise<void> | void;
  onSaveDraft?: () => Promise<void> | void;
  publishing?: boolean;
  savingDraft?: boolean;
  draftSavedAt?: string | null;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onPreview,
  onPublish,
  onSaveDraft,
  publishing = false,
  savingDraft = false,
  draftSavedAt = null,
}) => {
  const { message } = App.useApp();
  const {
    undo,
    redo,
    history,
    historyIndex,
    selectedElementId,
    selectedElementIds,
    duplicateElement,
    deleteElement,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    alignSelection,
  } = useEditorStore();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const selectedIds = selectedElementIds.length > 0 ? selectedElementIds : selectedElementId ? [selectedElementId] : [];

  const handlePreview = async () => {
    if (onPreview) {
      onPreview();
      return;
    }

    const canvasElement = document.querySelector(".canvas-wrapper canvas") as HTMLCanvasElement | null;
    if (!canvasElement) {
      message.error("Không tìm thấy canvas để xem trước");
      return;
    }

    const dataUrl = canvasElement.toDataURL("image/png");
    setPreviewUrl(dataUrl);
    setPreviewVisible(true);
  };

  const handleExport = async (format: "png" | "jpg" | "pdf") => {
    const canvasElement = document.querySelector(".canvas-wrapper canvas") as HTMLCanvasElement | null;
    if (!canvasElement) {
      message.error("Không tìm thấy canvas");
      return;
    }

    try {
      message.loading({ content: format === "pdf" ? "Đang xuất PDF..." : "Đang xuất ảnh...", key: "export" });
      const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
      const dataUrl = canvasElement.toDataURL(mimeType, 1.0);

      if (format === "pdf") {
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvasElement.width, canvasElement.height] });
        pdf.addImage(dataUrl, "PNG", 0, 0, canvasElement.width, canvasElement.height);
        pdf.save("wedding-card.pdf");
      } else {
        const link = document.createElement("a");
        link.download = `wedding-card.${format}`;
        link.href = dataUrl;
        link.click();
      }

      message.success({ content: format === "pdf" ? "Xuất PDF thành công!" : "Xuất ảnh thành công!", key: "export" });
    } catch {
      message.error({ content: "Có lỗi xảy ra khi xuất file", key: "export" });
    }
  };

  const exportMenuItems = [
    { key: "png", label: "Xuất PNG", onClick: () => handleExport("png") },
    { key: "jpg", label: "Xuất JPG", onClick: () => handleExport("jpg") },
    { key: "pdf", label: "Xuất PDF", onClick: () => handleExport("pdf") },
  ];

  const handleDuplicate = () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => duplicateElement(id));
    }
  };

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => deleteElement(id));
    }
  };

  const handleAlign = (mode: "left" | "centerX" | "right" | "top" | "centerY" | "bottom") => {
    if (selectedIds.length > 1) {
      alignSelection(mode);
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-2 z-50 fixed top-0 left-0 right-0">
        <div className="w-sidebar flex items-center justify-center shrink-0 border-r border-gray-200 h-full">
          <Button type="text" icon={<MenuOutlined />} className="px-3 py-2" />
        </div>

        <Link href="/" className="flex items-center gap-2 px-3">
          <Image
            src="/logo-web.png"
            alt="Logo"
            width={100}
            height={28}
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-1 flex-1">
          <Tooltip title="Hoàn tác (Ctrl+Z)">
            <Button type="text" icon={<UndoOutlined className="text-lg" />} onClick={undo} disabled={historyIndex <= 0} />
          </Tooltip>
          <Tooltip title="Làm lại (Ctrl+Y)">
            <Button type="text" icon={<RedoOutlined className="text-lg" />} onClick={redo} disabled={historyIndex >= history.length - 1} />
          </Tooltip>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <Tooltip title="Mặt trước">
            <Button type="text" className="font-medium">Mặt trước</Button>
          </Tooltip>
          <Tooltip title="Mặt sau">
            <Button type="text" className="text-gray-500">Mặt sau</Button>
          </Tooltip>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          {selectedIds.length > 0 && (
            <>
              <Tooltip title="Nhân bản">
                <Button type="text" icon={<CopyOutlined />} onClick={handleDuplicate} />
              </Tooltip>

              {selectedIds.length > 1 && (
                <>
                  <Tooltip title="Căn trái">
                    <Button type="text" icon={<AlignLeftOutlined />} onClick={() => handleAlign("left")} />
                  </Tooltip>
                  <Tooltip title="Căn giữa theo chiều ngang">
                    <Button type="text" icon={<AlignCenterOutlined />} onClick={() => handleAlign("centerX")} />
                  </Tooltip>
                  <Tooltip title="Căn phải">
                    <Button type="text" icon={<AlignRightOutlined />} onClick={() => handleAlign("right")} />
                  </Tooltip>
                  <Tooltip title="Căn trên">
                    <Button type="text" icon={<VerticalAlignTopOutlined />} onClick={() => handleAlign("top")} />
                  </Tooltip>
                  <Tooltip title="Căn giữa theo chiều dọc">
                    <Button type="text" icon={<VerticalAlignMiddleOutlined />} onClick={() => handleAlign("centerY")} />
                  </Tooltip>
                  <Tooltip title="Căn dưới">
                    <Button type="text" icon={<VerticalAlignBottomOutlined />} onClick={() => handleAlign("bottom")} />
                  </Tooltip>
                </>
              )}

              <Tooltip title="Đưa lên trên">
                <Button type="text" icon={<VerticalAlignTopOutlined />} onClick={() => selectedIds.forEach((id) => bringToFront(id))} />
              </Tooltip>
              <Tooltip title="Đưa xuống dưới">
                <Button type="text" icon={<VerticalAlignBottomOutlined />} onClick={() => selectedIds.forEach((id) => sendToBack(id))} />
              </Tooltip>
              <Tooltip title="Lớp trên">
                <Button type="text" icon={<ArrowUpOutlined />} onClick={() => selectedIds.forEach((id) => bringForward(id))} />
              </Tooltip>
              <Tooltip title="Lớp dưới">
                <Button type="text" icon={<ArrowDownOutlined />} onClick={() => selectedIds.forEach((id) => sendBackward(id))} />
              </Tooltip>
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} onClick={handleDelete} />
              </Tooltip>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title={draftSavedAt ? `Bản nháp được lưu lúc ${new Date(draftSavedAt).toLocaleString("vi-VN")}` : "Bản nháp chưa được lưu"}>
            <div className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:bg-gray-50 rounded cursor-default transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M6.5 19a4.5 4.5 0 0 1-.42-8.98A6 6 0 0 1 18 10a4 4 0 0 1-.18 8H6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs">{savingDraft ? "Đang lưu..." : draftSavedAt ? "Đã lưu" : "Chưa lưu"}</span>
            </div>
          </Tooltip>

          <Button type="default" onClick={onSaveDraft} loading={savingDraft} className="!border-gray-200">
            Lưu nháp
          </Button>

          <Button icon={<EyeOutlined />} onClick={handlePreview}>Xem trước</Button>

          <Dropdown menu={{ items: exportMenuItems }}>
            <Button icon={<RocketOutlined />}>Xuất ảnh</Button>
          </Dropdown>

          <Button type="primary" icon={<RocketOutlined />} onClick={onPublish} loading={publishing}>Xuất bản</Button>

          <div className="w-9 h-9 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            <Image src="/avatar.jpg" alt="Avatar" width={36} height={36} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <Modal open={previewVisible} onCancel={() => setPreviewVisible(false)} footer={null} width={420} centered title="Xem trước thiệp cưới">
        <div className="flex justify-center rounded-2xl bg-gray-100 p-3">
          <div className="w-[300px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover" /> : null}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditorHeader;

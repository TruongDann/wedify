"use client";

import React, { useRef } from "react";
import { Button, Tooltip, Dropdown, Space, message } from "antd";
import {
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  CopyOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SaveOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import html2canvas from "html2canvas";

const EditorToolbar: React.FC = () => {
  const {
    selectedElementId,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    undo,
    redo,
    clearCanvas,
    history,
    historyIndex,
    canvasSettings,
  } = useEditorStore();

  const handleDelete = () => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
    }
  };

  const handleDuplicate = () => {
    if (selectedElementId) {
      duplicateElement(selectedElementId);
    }
  };

  const handleBringToFront = () => {
    if (selectedElementId) {
      bringToFront(selectedElementId);
    }
  };

  const handleSendToBack = () => {
    if (selectedElementId) {
      sendToBack(selectedElementId);
    }
  };

  const handleExport = async (format: "png" | "jpg") => {
    const canvasElement = document.querySelector(
      ".editor-canvas"
    ) as HTMLElement;
    if (!canvasElement) {
      message.error("Không tìm thấy canvas");
      return;
    }

    try {
      message.loading({ content: "Đang xuất ảnh...", key: "export" });

      // Find the Konva stage canvas
      const konvaCanvas = canvasElement.querySelector("canvas");
      if (!konvaCanvas) {
        message.error("Không tìm thấy canvas");
        return;
      }

      // Create download link
      const dataUrl = konvaCanvas.toDataURL(`image/${format}`, 1.0);
      const link = document.createElement("a");
      link.download = `wedding-card.${format}`;
      link.href = dataUrl;
      link.click();

      message.success({ content: "Xuất ảnh thành công!", key: "export" });
    } catch (error) {
      console.error("Export error:", error);
      message.error({ content: "Có lỗi xảy ra khi xuất ảnh", key: "export" });
    }
  };

  const handleSaveProject = () => {
    const { elements, canvasSettings } = useEditorStore.getState();
    const projectData = {
      version: "1.0",
      canvasSettings,
      elements,
      savedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-card-project.json";
    link.click();
    URL.revokeObjectURL(url);

    message.success("Đã lưu dự án!");
  };

  const exportMenuItems = [
    {
      key: "png",
      label: "Xuất PNG (chất lượng cao)",
      onClick: () => handleExport("png"),
    },
    {
      key: "jpg",
      label: "Xuất JPG",
      onClick: () => handleExport("jpg"),
    },
  ];

  const layerMenuItems = [
    {
      key: "front",
      label: "Đưa lên trên cùng",
      icon: <VerticalAlignTopOutlined />,
      onClick: handleBringToFront,
    },
    {
      key: "back",
      label: "Đưa xuống dưới cùng",
      icon: <VerticalAlignBottomOutlined />,
      onClick: handleSendToBack,
    },
    {
      key: "forward",
      label: "Đưa lên 1 lớp",
      onClick: () => selectedElementId && bringForward(selectedElementId),
    },
    {
      key: "backward",
      label: "Đưa xuống 1 lớp",
      onClick: () => selectedElementId && sendBackward(selectedElementId),
    },
  ];

  return (
    <div className="editor-toolbar">
      {/* History controls */}
      <Tooltip title="Hoàn tác (Ctrl+Z)">
        <Button
          icon={<UndoOutlined />}
          onClick={undo}
          disabled={historyIndex <= 0}
        />
      </Tooltip>
      <Tooltip title="Làm lại (Ctrl+Y)">
        <Button
          icon={<RedoOutlined />}
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        />
      </Tooltip>

      <div className="toolbar-divider" />

      {/* Element controls */}
      <Tooltip title="Nhân đôi">
        <Button
          icon={<CopyOutlined />}
          onClick={handleDuplicate}
          disabled={!selectedElementId}
        />
      </Tooltip>
      <Tooltip title="Xóa">
        <Button
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          disabled={!selectedElementId}
          danger
        />
      </Tooltip>

      <div className="toolbar-divider" />

      {/* Layer controls */}
      <Dropdown menu={{ items: layerMenuItems }} disabled={!selectedElementId}>
        <Button>
          <Space>
            <VerticalAlignTopOutlined />
            Lớp
          </Space>
        </Button>
      </Dropdown>

      <div className="toolbar-divider" />

      {/* Clear */}
      <Tooltip title="Xóa tất cả">
        <Button icon={<ClearOutlined />} onClick={clearCanvas} />
      </Tooltip>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save & Export */}
      <Tooltip title="Lưu dự án">
        <Button icon={<SaveOutlined />} onClick={handleSaveProject} />
      </Tooltip>

      <Dropdown menu={{ items: exportMenuItems }}>
        <Button type="primary" icon={<DownloadOutlined />}>
          Xuất ảnh
        </Button>
      </Dropdown>
    </div>
  );
};

export default EditorToolbar;

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ConfigProvider, Spin } from "antd";
import viVN from "antd/locale/vi_VN";
import Left from "@/components/editor/panels/Left";
import Right from "@/components/editor/panels/Right";
import { useEditorStore } from "@/store/editorStore";
import {
  EditorHeader,
  EditorSidebar,
  QuickReplaceBar,
  CanvasHeightControl,
  type TabKey,
} from "./components";

// Dynamic import EditorCanvas vì Konva cần window
const EditorCanvas = dynamic(() => import("@/components/editor/EditorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-100">
      <Spin size="large" />
    </div>
  ),
});

const EditorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // Card settings state
  const [cardTitle, setCardTitle] = useState("Thiệp cưới của tôi");
  const [cardCategory, setCardCategory] = useState("wedding");
  const [cardStatus, setCardStatus] = useState("draft");

  const {
    saveHistory,
    selectElement,
    deleteElement,
    selectedElementId,
    selectedElementIds,
    undo,
    redo,
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
      // Handle delete for multi-selection
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        (selectedElementId || selectedElementIds.length > 0)
      ) {
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA"
        ) {
          return;
        }
        // Delete all selected elements
        if (selectedElementIds.length > 0) {
          selectedElementIds.forEach((id) => deleteElement(id));
        } else if (selectedElementId) {
          deleteElement(selectedElementId);
        }
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
  }, [
    selectedElementId,
    selectedElementIds,
    deleteElement,
    selectElement,
    undo,
    redo,
  ]);

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
        {/* Header */}
        <EditorHeader />

        {/* Body */}
        <div className="flex flex-1 mt-14 overflow-hidden">
          {/* Left Sidebar - Toolbox with vertical tabs */}
          <EditorSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Left Panel - Content */}
          <Left
            activeTab={activeTab}
            isOpen={isLeftPanelOpen}
            onToggle={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          />

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-200 overflow-hidden">
            <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
              <EditorCanvas canvasHeight={canvasHeight} />

              {/* Page Height Resize Control */}
              <CanvasHeightControl
                height={canvasHeight}
                onChange={setCanvasHeight}
              />
            </div>

            {/* Quick Replace Bar */}
            <QuickReplaceBar elements={elements} />
          </div>

          {/* Right Panel - Settings */}
          <Right
            activeTab={activeTab}
            cardTitle={cardTitle}
            cardCategory={cardCategory}
            cardStatus={cardStatus}
            onTitleChange={setCardTitle}
            onCategoryChange={setCardCategory}
            onStatusChange={setCardStatus}
            onSwitchToImageTab={() => setActiveTab("image")}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default EditorPage;

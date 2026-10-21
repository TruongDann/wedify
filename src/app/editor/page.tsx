"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ConfigProvider, Spin, App } from "antd";
import viVN from "antd/locale/vi_VN";
import Left from "@/components/editor/panels/Left";
import Right from "@/components/editor/panels/Right";
import { useEditorStore } from "@/store/editorStore";
import {
  EditorHeader,
  EditorSidebar,
  PublishModal,
  QuickReplaceBar,
  CanvasHeightControl,
  type TabKey,
} from "./components";
import { useDraftAutosave } from "./useDraftAutosave";
import { userAuth } from "@/lib/auth";
import { FallingEffectLayer } from "@/components/card/FallingEffectLayer";
import { Minus, Plus, RotateCcw } from "lucide-react";
import ElementToolbar from "@/components/editor/ElementToolbar";

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
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [canvasZoom, setCanvasZoom] = useState(1);

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
    canvasSettings,
    setCanvasSettings,
  } = useEditorStore();

  const { status: saveStatus, flush } = useDraftAutosave();

  const changeCanvasZoom = (delta: number) => {
    setCanvasZoom((zoom) => Math.min(2, Math.max(0.25, Math.round((zoom + delta) * 100) / 100)));
  };

  // Lưu / xuất bản lên tài khoản (API)
  const [publishOpen, setPublishOpen] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<Record<string, any> | null>(null);
  const [existingEventDate, setExistingEventDate] = useState<string | undefined>();

  // Mở thiệp đã lưu: /editor?id=...
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id || !userAuth.getAccess()) return;
    setInvitationId(id);
    userAuth
      .apiFetch<{ title?: string; eventDate?: string; profileJson?: Record<string, any>; contentJson?: { elements?: any[]; canvasSettings?: any } }>(`/invitations/${id}`)
      .then((invitation) => {
        if (invitation.title) setCardTitle(invitation.title);
        if (invitation.eventDate) setExistingEventDate(invitation.eventDate.slice(0, 10));
        setExistingProfile(invitation.profileJson && typeof invitation.profileJson === "object" ? invitation.profileJson : null);
        const content = invitation.contentJson;
        if (Array.isArray(content?.elements) && content.elements.length > 0) {
          useEditorStore.setState({
            elements: content.elements,
            canvasSettings: { ...useEditorStore.getState().canvasSettings, ...content.canvasSettings, isMusicPlaying: false },
            selectedElementId: null,
            selectedElementIds: [],
            history: [],
            historyIndex: -1,
          });
          useEditorStore.getState().saveHistory();
        }
      })
      .catch(() => undefined);
  }, []);

  // Lưu ngay rồi mở trang xem thiệp ở tab riêng (tab đó tự cập nhật khi thiệp thay đổi)
  const handlePreview = () => {
    const tab = window.open("/preview", "wedify-preview");
    flush().finally(() => tab?.focus());
  };

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
    <ConfigProvider locale={viVN}>
      <App>
        <div className="flex flex-col h-screen overflow-hidden bg-white text-ink">
          {/* Header */}
          <EditorHeader onPreview={handlePreview} onPublish={() => setPublishOpen(true)} saveStatus={saveStatus} />
          <PublishModal
            open={publishOpen}
            onClose={() => setPublishOpen(false)}
            initialTitle={cardTitle}
            invitationId={invitationId}
            existingProfile={existingProfile}
            initialEventDate={existingEventDate}
            onSaved={(id) => setInvitationId(id)}
          />

          {/* Body */}
          <div className="flex flex-1 mt-16 overflow-hidden">
            {/* Left Sidebar - Toolbox with vertical tabs */}
            <EditorSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Left Panel - Content */}
            <Left
              activeTab={activeTab}
              isOpen={isLeftPanelOpen}
              onToggle={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            />

            {/* Canvas Area */}
            <div className="relative flex-1 min-w-0 flex flex-col bg-canvas overflow-hidden">
                <div
                  className="absolute top-3 right-4 z-40 flex items-center gap-1 rounded-full border border-line bg-white p-1 shadow-lg"
                  role="group"
                  aria-label="Thu phóng khung thiết kế"
                >
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => changeCanvasZoom(-0.1)}
                    disabled={canvasZoom <= 0.25}
                    aria-label="Thu nhỏ"
                    title="Thu nhỏ"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    className="min-w-12 px-1 text-center text-xs font-medium tabular-nums text-ink-2"
                    onClick={() => setCanvasZoom(1)}
                    aria-label={`Thu phóng ${Math.round(canvasZoom * 100)} phần trăm, bấm để đặt lại`}
                    title="Đặt lại về 100%"
                  >
                    {Math.round(canvasZoom * 100)}%
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => changeCanvasZoom(0.1)}
                    disabled={canvasZoom >= 2}
                    aria-label="Phóng to"
                    title="Phóng to"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="mx-0.5 h-5 w-px bg-line" aria-hidden="true" />
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-muted"
                    onClick={() => setCanvasZoom(1)}
                    aria-label="Đặt lại thu phóng"
                    title="Đặt lại"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              <div className="relative flex-1 overflow-auto px-6 pt-14 pb-12 flex flex-col items-center">
                <div className="relative">
                  <div
                    style={{
                      width: canvasSettings.width * canvasZoom,
                      height: canvasSettings.height * canvasZoom,
                    }}
                  >
                    <div
                      style={{
                        width: canvasSettings.width,
                        height: canvasSettings.height,
                        transform: `scale(${canvasZoom})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <EditorCanvas canvasHeight={canvasSettings.height} />
                      {/* Chạy thử hiệu ứng rơi khi đang ở tab Hiệu ứng */}
                      {activeTab === "effect" && canvasSettings.fallingEffect && (
                        <FallingEffectLayer effect={canvasSettings.fallingEffect} />
                      )}
                    </div>
                    <ElementToolbar zoom={canvasZoom} />
                  </div>
                </div>

                {/* Page Height Resize Control */}
                <CanvasHeightControl
                  height={canvasSettings.height}
                  onChange={(height) => setCanvasSettings({ height })}
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
      </App>
    </ConfigProvider>
  );
};

export default EditorPage;

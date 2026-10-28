"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ConfigProvider, Spin, App } from "antd";
import viVN from "antd/locale/vi_VN";
import Left from "@/components/editor/panels/Left";
import Right from "@/components/editor/panels/Right";
import { useEditorStore, createImageElement } from "@/store/editorStore";
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
import { ZoomIn, ZoomOut } from "lucide-react";
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

  // Keyboard shortcuts — đọc store trực tiếp để không phải gắn lại listener mỗi lần chọn
  useEffect(() => {
    // Đang gõ trong ô nhập (kể cả khi sửa chữ trên thiệp) thì để trình duyệt tự xử lý
    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return (
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      );
    };
    let nudged = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const store = useEditorStore.getState();
      const hasSelection =
        !!store.selectedElementId || store.selectedElementIds.length > 0;
      const key = e.key.toLowerCase();

      if ((e.key === "Delete" || e.key === "Backspace") && hasSelection) {
        e.preventDefault();
        store.deleteSelection();
        return;
      }

      if (e.key === "Escape") {
        store.selectElement(null);
        return;
      }

      // Mũi tên: dịch 1px, giữ Shift dịch 10px
      const arrows: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      if (arrows[e.key] && hasSelection) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        store.nudgeSelection(arrows[e.key][0] * step, arrows[e.key][1] * step);
        nudged = true;
        return;
      }

      if (!(e.ctrlKey || e.metaKey)) return;

      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        store.redo();
      } else if (key === "c" && hasSelection) {
        store.copySelection();
      } else if (key === "x" && hasSelection) {
        e.preventDefault();
        store.cutSelection();
      } else if (key === "d" && hasSelection) {
        e.preventDefault();
        store.duplicateSelection();
      } else if (key === "a") {
        e.preventDefault();
        store.selectAll();
      } else if (key === "g" && hasSelection) {
        e.preventDefault();
        if (e.shiftKey) store.ungroupSelection();
        else store.groupSelection();
      }
      // Ctrl+V xử lý ở sự kiện "paste" để dán được cả ảnh chụp màn hình
    };

    // Một lần nhấn giữ mũi tên chỉ ghi một bước hoàn tác
    const handleKeyUp = (e: KeyboardEvent) => {
      if (nudged && e.key.startsWith("Arrow")) {
        nudged = false;
        useEditorStore.getState().saveHistory();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (isTyping(e.target)) return;
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!file) {
        useEditorStore.getState().paste();
        return;
      }
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const { canvasSettings: canvas } = useEditorStore.getState();
          const width = Math.min(img.width, canvas.width * 0.8);
          const height = (width * img.height) / img.width;
          useEditorStore.getState().addElement(
            createImageElement(src, {
              size: { width, height },
              position: {
                x: (canvas.width - width) / 2,
                y: Math.max(0, (canvas.height - height) / 2),
              },
            }),
          );
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

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
              <div className="relative flex-1 min-h-0">
              <div className="pointer-events-none absolute inset-x-3 bottom-3 z-40 flex flex-col items-end gap-3">
              <div
                className="pointer-events-auto flex flex-col items-center gap-2 rounded-full bg-white px-1.5 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
                role="group"
                aria-label="Thu phóng khung thiết kế"
              >
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => changeCanvasZoom(0.1)}
                  disabled={canvasZoom >= 2}
                  aria-label="Phóng to"
                  title="Phóng to"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  className="text-xs tabular-nums text-ink"
                  onClick={() => setCanvasZoom(1)}
                  aria-label={`Thu phóng ${Math.round(canvasZoom * 100)} phần trăm, bấm để đặt lại`}
                  title="Đặt lại về 100%"
                >
                  {Math.round(canvasZoom * 100)}%
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => changeCanvasZoom(-0.1)}
                  disabled={canvasZoom <= 0.25}
                  aria-label="Thu nhỏ"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={18} />
                </button>
              </div>
              <div className="w-full flex justify-start">
                <QuickReplaceBar elements={elements} />
              </div>
              </div>
              <div className="absolute inset-0 overflow-auto px-6 pt-8 pb-44 flex flex-col items-center">
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
              </div>
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

"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { App, ConfigProvider, Spin } from "antd";
import viVN from "antd/locale/vi_VN";
import Left from "@/components/editor/panels/Left";
import Right from "@/components/editor/panels/Right";
import { weddingTemplates } from "@/data/templates";
import { userAuth } from "@/lib/auth";
import { loadEditorState, saveEditorState } from "@/lib/storage";
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

const getDefaultEventDate = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() + 1);
  return now.toISOString().slice(0, 10);
};

const getSelectedTemplateMeta = () => {
  if (typeof window === "undefined") {
    return { templateId: undefined, templateName: "Moonlit Romance" };
  }

  const storedId = localStorage.getItem("selectedTemplateId");
  const storedName = localStorage.getItem("selectedTemplateName");
  const storedThemeRaw = localStorage.getItem("selectedTemplateTheme");
  let parsedTheme: { id?: string; name?: string } | null = null;

  try {
    parsedTheme = storedThemeRaw ? JSON.parse(storedThemeRaw) : null;
  } catch {
    parsedTheme = null;
  }

  const matchedTemplate = weddingTemplates.find((template) =>
    template.id === storedId || template.name === storedName || template.name === parsedTheme?.name,
  );

  return {
    templateId: matchedTemplate?.id ?? storedId ?? undefined,
    templateName: matchedTemplate?.name ?? storedName ?? parsedTheme?.name ?? "Moonlit Romance",
  };
};

const buildInvitationPayload = (title: string, eventDate: string, canvasSettings: any, elements: any[], existingProfile?: Record<string, any> | null) => {
  const { templateId, templateName } = getSelectedTemplateMeta();
  const maxContentHeight = elements.reduce((max: number, item: any) => {
    if (!item) return max;
    return Math.max(max, (item.position?.y ?? 0) + (item.size?.height ?? 0) + 220);
  }, Number(canvasSettings?.height ?? 4200));

  const nextCanvasSettings = {
    ...(canvasSettings ?? {}),
    width: canvasSettings?.width ?? 600,
    height: Math.max(Number(canvasSettings?.height ?? 4200), maxContentHeight),
  };

  return {
    templateId,
    title: title.trim() || "Thiệp cưới của tôi",
    eventDate: eventDate || getDefaultEventDate(),
    location: "Chưa cập nhật",
    profileJson: {
      // Giữ lại hồ sơ đã có (tên, quà mừng, ảnh mở thiệp...) để lưu từ editor không làm mất dữ liệu.
      // Thiệp tạo từ form mà đã chỉnh tay trong editor thì không còn "dựng tự động" nữa.
      templateName,
      groomName: "",
      brideName: "",
      groomPhone: "",
      bridePhone: "",
      weddingTime: "",
      location: "",
      mapUrl: "",
      story: "Tình yêu là hành trình bắt đầu từ những điều nhỏ bé và dần lớn lên cùng nhau. Chúng tôi xin kính mời mọi người cùng chia sẻ niềm vui hạnh phúc trong ngày cưới của chúng tôi.",
      gallery: [
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80",
      ],
      timeline: [
        { time: "09:00", title: "Tiếp đón khách", note: "Đón khách và chào hỏi tại sảnh chính" },
        { time: "11:00", title: "Lễ cưới", note: "Lễ thành hôn theo nghi thức gia đình" },
        { time: "13:30", title: "Tiệc cưới", note: "Ăn uống, chúc mừng và chụp ảnh" },
      ],
      groomFather: "",
      groomMother: "",
      brideFather: "",
      brideMother: "",
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      ...(existingProfile ?? {}),
      weddingDate: eventDate || existingProfile?.weddingDate || getDefaultEventDate(),
      ...(existingProfile?.guided ? { guided: false } : {}),
    },
    contentJson: { canvasSettings: nextCanvasSettings, elements },
  };
};

const EditorPageContent: React.FC = () => {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<TabKey>("template");
  const [canvasHeight, setCanvasHeight] = useState(4200);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // Card settings state
  const [cardTitle, setCardTitle] = useState("Thiệp cưới của tôi");
  const [cardEventDate, setCardEventDate] = useState<string>("");
  const [cardCategory, setCardCategory] = useState("wedding");
  const [cardStatus, setCardStatus] = useState("draft");
  const [currentInvitationId, setCurrentInvitationId] = useState<string | null>(null);

  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const hasRestoredDraftRef = useRef(false);
  const loadedProfileRef = useRef<Record<string, any> | null>(null);

  const {
    saveHistory,
    loadTemplate,
    selectElement,
    deleteElement,
    selectedElementId,
    selectedElementIds,
    undo,
    redo,
    elements,
    canvasSettings,
  } = useEditorStore();

  const saveDraft = React.useCallback(async () => {
    if (typeof window === "undefined") return;

    const now = new Date().toISOString();
    const payload = buildInvitationPayload(cardTitle, cardEventDate, canvasSettings, elements, loadedProfileRef.current);

    saveEditorState({
      elements,
      canvasSettings,
      cardTitle,
      cardEventDate,
    });

    const accessToken = userAuth.getAccess();
    if (!accessToken) {
      setDraftSavedAt(now);
      return;
    }

    try {
      if (currentInvitationId) {
        await userAuth.apiFetch(`/invitations/${currentInvitationId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        const created = await userAuth.apiFetch<{ id: string; title?: string; slug?: string }>("/invitations", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setCurrentInvitationId(created.id);
        const url = new URL(window.location.href);
        url.searchParams.set("id", created.id);
        url.searchParams.set("title", created.title || cardTitle);
        window.history.replaceState({}, "", url.toString());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tự động lưu dữ liệu";
      if (!errorMessage.includes("hết hạn") && !errorMessage.includes("đăng nhập")) {
        message.warning("Đã lưu bản nháp cục bộ, nhưng chưa đồng bộ lên server.");
      }
    }

    setDraftSavedAt(now);
  }, [cardEventDate, cardTitle, canvasSettings, currentInvitationId, elements, message]);

  const handleSaveDraft = React.useCallback(async () => {
    setSavingDraft(true);
    try {
      saveDraft();
      message.success("Bản nháp đã được lưu thành công!");
    } catch {
      message.error("Không thể lưu bản nháp. Vui lòng thử lại.");
    } finally {
      setSavingDraft(false);
    }
  }, [message, saveDraft]);

  const handlePublishInvitation = async () => {
    try {
      const title = cardTitle.trim();
      if (!title) {
        message.error("Vui lòng nhập tên thiệp trước khi xuất bản.");
        return;
      }

      if (!elements.length) {
        message.error("Thiệp của bạn chưa có nội dung nào. Hãy thêm văn bản hoặc hình ảnh trước khi xuất bản.");
        return;
      }

      if (!cardEventDate) {
        message.error("Vui lòng chọn ngày sự kiện trước khi xuất bản.");
        return;
      }

      setPublishing(true);

      const accessToken = userAuth.getAccess();
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const eventDateValue = cardEventDate ? new Date(`${cardEventDate}T12:00:00`).toISOString() : new Date().toISOString();

      let invitationId = currentInvitationId;
      if (!invitationId) {
        const created = await userAuth.apiFetch<{ id: string; slug?: string }>('/invitations', {
          method: "POST",
          body: JSON.stringify(buildInvitationPayload(title, cardEventDate, canvasSettings, elements, loadedProfileRef.current)),
        });
        invitationId = created.id;
        setCurrentInvitationId(created.id);
      } else {
        await userAuth.apiFetch(`/invitations/${invitationId}`, {
          method: "PATCH",
          body: JSON.stringify(buildInvitationPayload(title, cardEventDate, canvasSettings, elements, loadedProfileRef.current)),
        });
      }

      const published = await userAuth.apiFetch<{ id: string; slug?: string }>(`/invitations/${invitationId}/publish`, {
        method: "POST",
      });

      message.success("Thiệp đã được lưu và công bố thành công!");
      if (published?.slug) {
        window.open(`/invitation/${published.slug}`, "_blank", "noopener,noreferrer");
      }
      router.push("/dashboard/invitations");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể xuất bản thiệp";
      if (errorMessage.includes("hết hạn") || errorMessage.includes("đăng nhập") || errorMessage.includes("401")) {
        router.push("/login");
      }
      message.error(errorMessage);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!cardEventDate) {
      setCardEventDate(getDefaultEventDate());
    }

    const syncSelectedTemplate = () => {
      const storedTemplateName = localStorage.getItem("selectedTemplateName");
      if (storedTemplateName) {
        setCardTitle(storedTemplateName);
      }
    };

    syncSelectedTemplate();
    window.addEventListener("template-theme-change", syncSelectedTemplate);
    return () => window.removeEventListener("template-theme-change", syncSelectedTemplate);
  }, [cardEventDate]);

  useEffect(() => {
    if (typeof window === "undefined" || hasRestoredDraftRef.current) return;
    hasRestoredDraftRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const invitationIdFromQuery = params.get("id");
    const titleFromQuery = params.get("title");
    const eventDateFromQuery = params.get("eventDate");
    if (invitationIdFromQuery) {
      setCurrentInvitationId(invitationIdFromQuery);
    }
    if (titleFromQuery) {
      setCardTitle(titleFromQuery);
    }
    if (eventDateFromQuery) {
      setCardEventDate(eventDateFromQuery);
    }

    if (invitationIdFromQuery) {
      userAuth.apiFetch<any>(`/invitations/${invitationIdFromQuery}`)
        .then((invitation) => {
          loadedProfileRef.current = invitation?.profileJson && typeof invitation.profileJson === "object" ? invitation.profileJson : null;
          if (invitation?.title) setCardTitle(invitation.title);
          if (invitation?.eventDate) {
            const nextDate = new Date(invitation.eventDate).toISOString().slice(0, 10);
            setCardEventDate(nextDate);
          }
          const loadedContent = invitation?.contentJson ?? { canvasSettings: { width: 600, height: 4200, backgroundColor: "#ffffff" }, elements: [] };
          if (Array.isArray(loadedContent.elements) && loadedContent.elements.length > 0) {
            loadTemplate(loadedContent.elements, loadedContent.canvasSettings ?? canvasSettings);
          } else {
            const starterTemplate = weddingTemplates[0];
            if (starterTemplate) {
              loadTemplate(starterTemplate.elements, starterTemplate.canvasSettings);
            }
          }
        })
        .catch(() => {
          const savedDraft = loadEditorState() as any;
          if (savedDraft && Array.isArray(savedDraft.elements) && savedDraft.elements.length > 0) {
            loadTemplate(savedDraft.elements, savedDraft.canvasSettings ?? canvasSettings);
            if (savedDraft.cardTitle) setCardTitle(savedDraft.cardTitle);
            if (savedDraft.cardEventDate) setCardEventDate(savedDraft.cardEventDate);
            if (savedDraft.savedAt) setDraftSavedAt(savedDraft.savedAt);
            message.info("Đã khôi phục bản nháp trước đó.");
          } else {
            const starterTemplate = weddingTemplates[0];
            if (starterTemplate) {
              loadTemplate(starterTemplate.elements, starterTemplate.canvasSettings);
            }
          }
        });
    } else {
      const savedDraft = loadEditorState() as any;
      if (savedDraft && Array.isArray(savedDraft.elements) && savedDraft.elements.length > 0) {
        loadTemplate(savedDraft.elements, savedDraft.canvasSettings ?? canvasSettings);
        if (savedDraft.cardTitle) setCardTitle(savedDraft.cardTitle);
        if (savedDraft.cardEventDate) setCardEventDate(savedDraft.cardEventDate);
        if (savedDraft.savedAt) setDraftSavedAt(savedDraft.savedAt);
        message.info("Đã khôi phục bản nháp trước đó.");
      } else {
        const starterTemplate = weddingTemplates[0];
        if (starterTemplate) {
          loadTemplate(starterTemplate.elements, starterTemplate.canvasSettings);
        }
      }
    }
    setHasRestoredDraft(true);
  }, [canvasSettings, loadTemplate, message]);

  // Initialize history
  useEffect(() => {
    saveHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCanvasHeight(canvasSettings.height || 4200);
  }, [canvasSettings.height]);

  useEffect(() => {
    if (!hasRestoredDraft || typeof window === "undefined") return;
    const timer = window.setInterval(() => {
      saveDraft();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [hasRestoredDraft, saveDraft]);

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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Header */}
      <EditorHeader
        onPublish={handlePublishInvitation}
        onSaveDraft={handleSaveDraft}
        publishing={publishing}
        savingDraft={savingDraft}
        draftSavedAt={draftSavedAt}
      />

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
          cardEventDate={cardEventDate}
          cardCategory={cardCategory}
          cardStatus={cardStatus}
          onTitleChange={setCardTitle}
          onEventDateChange={setCardEventDate}
          onCategoryChange={setCardCategory}
          onStatusChange={setCardStatus}
          onSwitchToImageTab={() => setActiveTab("image")}
        />
      </div>
    </div>
  );
};

const EditorPage: React.FC = () => {
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
      <App>
        <EditorPageContent />
      </App>
    </ConfigProvider>
  );
};

export default EditorPage;

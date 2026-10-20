"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { loadDraft, saveDraft } from "@/lib/draftStore";

export type SaveStatus = "loading" | "saved" | "saving" | "error";

const SAVE_DELAY = 600;

/**
 * Nạp bản nháp khi mở editor và tự lưu lại mỗi khi thiệp thay đổi.
 * Trả về trạng thái lưu và flush() để lưu ngay (vd. trước khi mở trang xem trước).
 */
export const useDraftAutosave = () => {
  const [status, setStatus] = useState<SaveStatus>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const ready = useRef(false);

  const save = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!ready.current || !pending.current) return;
    pending.current = false;
    const { elements, canvasSettings } = useEditorStore.getState();
    setStatus("saving");
    try {
      await saveDraft({ elements, canvasSettings });
      setStatus(pending.current ? "saving" : "saved");
    } catch (error) {
      console.error("Không lưu được bản nháp:", error);
      pending.current = true;
      setStatus("error");
    }
  }, []);

  // Nạp bản nháp đã lưu
  useEffect(() => {
    let cancelled = false;
    loadDraft()
      .then((doc) => {
        if (cancelled || !doc) return;
        useEditorStore.setState({
          elements: doc.elements,
          canvasSettings: { ...doc.canvasSettings, isMusicPlaying: false },
          selectedElementId: null,
          selectedElementIds: [],
          history: [],
          historyIndex: -1,
        });
        useEditorStore.getState().saveHistory();
      })
      .catch((error) => console.error("Không đọc được bản nháp:", error))
      .finally(() => {
        if (cancelled) return;
        ready.current = true;
        setStatus("saved");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tự lưu khi nội dung thiệp thay đổi (bỏ qua thay đổi vùng chọn, lịch sử...)
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe((state, prev) => {
      if (!ready.current) return;
      if (state.elements === prev.elements && state.canvasSettings === prev.canvasSettings) return;
      pending.current = true;
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(save, SAVE_DELAY);
    });

    const flushOnHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", flushOnHide);
    window.addEventListener("pagehide", save);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", flushOnHide);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, [save]);

  return { status, flush: save };
};

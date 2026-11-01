"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CardViewer } from "@/components/card";
import { loadDraft, onDraftChanged } from "@/lib/draftStore";
import { CardDocument } from "@/types/editor";

/**
 * Xem trước thiệp đúng như khách sẽ thấy, từ bản nháp đang thiết kế.
 * Tự cập nhật khi editor (tab khác) lưu thay đổi.
 */
export default function PreviewPage() {
  const [doc, setDoc] = useState<CardDocument | null | undefined>(undefined);

  useEffect(() => {
    const refresh = () =>
      loadDraft()
        .then(setDoc)
        .catch((error) => {
          console.error("Không đọc được bản nháp:", error);
          setDoc(null);
        });
    refresh();
    return onDraftChanged(refresh);
  }, []);

  if (doc === undefined) return <main className="min-h-screen bg-renderer-gray" />;

  if (doc === null || doc.elements.length === 0) {
    return (
      <main className="min-h-screen bg-renderer-gray flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-ink-3">Thiệp chưa có phần tử nào. Hãy thêm chữ, ảnh trong trình thiết kế rồi xem lại.</p>
        <Link href="/editor" target="_top" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent transition-colors">
          Mở trình thiết kế
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-renderer-gray sm:py-6">
      <CardViewer canvasSettings={doc.canvasSettings} elements={doc.elements} />
    </main>
  );
}

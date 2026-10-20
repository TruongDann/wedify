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

  if (doc === undefined) return <main className="min-h-screen bg-neutral-100" />;

  if (doc === null || doc.elements.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-neutral-600">Chưa có thiệp nào để xem trước.</p>
        <Link href="/editor" className="rounded-md bg-[#ff8599] px-4 py-2 text-white">
          Mở trình thiết kế
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 sm:py-6">
      <CardViewer canvasSettings={doc.canvasSettings} elements={doc.elements} />
    </main>
  );
}

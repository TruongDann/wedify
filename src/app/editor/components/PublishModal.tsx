"use client";

import React, { useEffect, useState } from "react";
import { App, Input, Modal } from "antd";
import { useRouter } from "next/navigation";
import { userAuth } from "@/lib/auth";
import { useEditorStore } from "@/store/editorStore";

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  initialTitle: string;
  /** Id thiệp đang sửa (mở bằng /editor?id=...); trống = tạo thiệp mới. */
  invitationId: string | null;
  /** Hồ sơ thiệp đã có (tên, quà mừng, ảnh mở thiệp...) — giữ nguyên khi lưu từ editor. */
  existingProfile: Record<string, any> | null;
  initialEventDate?: string;
  onSaved: (id: string) => void;
}

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
};

/** Lưu thiệp đang thiết kế vào tài khoản (API Wedify) và công bố link cho khách. */
export const PublishModal: React.FC<PublishModalProps> = ({ open, onClose, initialTitle, invitationId, existingProfile, initialEventDate, onSaved }) => {
  const { message } = App.useApp();
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [eventDate, setEventDate] = useState(initialEventDate || tomorrow());
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setEventDate(initialEventDate || existingProfile?.weddingDate || tomorrow());
    }
  }, [open, initialTitle, initialEventDate, existingProfile]);

  const save = async (publish: boolean) => {
    if (!title.trim()) return message.warning("Vui lòng nhập tên thiệp");
    if (!eventDate) return message.warning("Vui lòng chọn ngày tổ chức");
    if (!userAuth.getAccess()) {
      router.push(`/login?next=${encodeURIComponent("/editor" + (invitationId ? `?id=${invitationId}` : ""))}`);
      return;
    }

    const { elements, canvasSettings } = useEditorStore.getState();
    if (!elements.length) return message.warning("Thiệp chưa có nội dung nào");

    // Chiều cao trang đủ chứa mọi phần tử (cộng lề dưới)
    const bottom = elements.reduce((max, el) => Math.max(max, el.position.y + el.size.height + 220), Number(canvasSettings.height) || 0);
    const payload = {
      title: title.trim(),
      eventDate: new Date(`${eventDate}T12:00:00`).toISOString(),
      location: existingProfile?.location || "Chưa cập nhật",
      // Thiệp đã chỉnh tay trong editor thì không còn "dựng tự động" từ form nữa
      profileJson: { ...(existingProfile ?? {}), weddingDate: eventDate, ...(existingProfile?.guided ? { guided: false } : {}) },
      contentJson: { canvasSettings: { ...canvasSettings, width: canvasSettings.width || 600, height: Math.max(canvasSettings.height, bottom) }, elements },
    };

    setBusy(publish ? "publish" : "draft");
    try {
      let id = invitationId;
      let slug: string | undefined;
      if (id) {
        const updated = await userAuth.apiFetch<{ slug?: string }>(`/invitations/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
        slug = updated.slug;
      } else {
        const created = await userAuth.apiFetch<{ id: string; slug?: string }>("/invitations", { method: "POST", body: JSON.stringify(payload) });
        id = created.id;
        slug = created.slug;
      }
      onSaved(id);

      if (publish) {
        const published = await userAuth.apiFetch<{ slug?: string }>(`/invitations/${id}/publish`, { method: "POST" });
        slug = published.slug ?? slug;
        message.success("Thiệp đã được xuất bản!");
        if (slug) window.open(`/invitation/${slug}`, "_blank", "noopener,noreferrer");
        router.push("/dashboard/invitations");
      } else {
        message.success("Đã lưu thiệp vào tài khoản");
        onClose();
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Không thể lưu thiệp");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Xuất bản thiệp"
      centered
      okText="Xuất bản"
      cancelText="Huỷ"
      okButtonProps={{ loading: busy === "publish", disabled: busy === "draft" }}
      onOk={() => save(true)}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => save(false)}
            className="ml-2 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:border-primary disabled:opacity-60"
          >
            {busy === "draft" ? "Đang lưu…" : "Chỉ lưu"}
          </button>
          <span className="ml-2"><OkBtn /></span>
        </>
      )}
    >
      <div className="space-y-4 py-2">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-500">Tên thiệp</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-500">Ngày tổ chức</span>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-pink-400" />
        </label>
        <p className="text-xs text-gray-400">"Chỉ lưu" giữ thiệp ở dạng nháp trong tài khoản; "Xuất bản" tạo link cho khách mở.</p>
      </div>
    </Modal>
  );
};

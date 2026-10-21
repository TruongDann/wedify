"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { vietQrUrl } from "@/utils/vietqr";
import type { ViewerContextValue } from "../ViewerContext";

/**
 * Tiện ích dạng DOM thật còn lại: thẻ liên hệ và sổ lưu bút.
 * Được đặt vào canvas bằng <Html> nên cùng một giao diện hiển thị ở editor và trang xuất bản.
 * Ở editor (viewer = null) các ô nhập bị khoá và không gọi API.
 */

export interface DomWidgetProps {
  p: Record<string, any>;
  w: number;
  h: number;
  viewer: ViewerContextValue | null;
}

const fontOf = (p: Record<string, any>) => `'${p.fontFamily || "Playfair Display"}', serif`;

const Shell: React.FC<DomWidgetProps & { children: React.ReactNode; scroll?: boolean }> = ({ p, w, h, children, scroll = true }) => (
  <div
    style={{
      width: w,
      height: h,
      boxSizing: "border-box",
      padding: 18,
      borderRadius: p.radius ?? 22,
      background: p.bgColor || "rgba(255,255,255,0.93)",
      color: p.textColor || "#3b1d2a",
      fontFamily: fontOf(p),
      overflowY: scroll ? "auto" : "hidden",
      overflowX: "hidden",
      border: "1px solid rgba(0,0,0,0.07)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.14)",
      fontSize: 15,
      lineHeight: 1.45,
    }}
  >
    {children}
  </div>
);

const Title: React.FC<{ p: Record<string, any>; fallback: string; description?: string }> = ({ p, fallback, description }) => (
  <div style={{ textAlign: "center", marginBottom: 12 }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: p.accent || "#ef4565" }}>{p.title ?? fallback}</div>
    {(description ?? p.description) ? <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{description ?? p.description}</div> : null}
  </div>
);

const inputStyle = (accent: string): React.CSSProperties => ({
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 12,
  border: `1px solid ${accent}55`,
  background: "#fff",
  color: "#1f2937",
  fontSize: 15,
  outline: "none",
  fontFamily: "inherit",
});

const primaryButton = (accent: string, disabled?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "11px 14px",
  border: "none",
  borderRadius: 999,
  background: accent,
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.65 : 1,
  fontFamily: "inherit",
});

const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

const postJson = async (url: string, body: unknown) => {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || "Yêu cầu thất bại");
  return data;
};

// ------------------------------------------------------------ Liên hệ

const CONTACT_META: Record<string, { icon: string; href: (value: string) => string; label: string }> = {
  phone: { icon: "📞", label: "Điện thoại", href: (v) => `tel:${v.replace(/[^\d+]/g, "")}` },
  zalo: { icon: "💬", label: "Zalo", href: (v) => `https://zalo.me/${v.replace(/[^\d]/g, "")}` },
  messenger: { icon: "✉️", label: "Messenger", href: (v) => (v.startsWith("http") ? v : `https://m.me/${v}`) },
  email: { icon: "📧", label: "Email", href: (v) => `mailto:${v}` },
  link: { icon: "🔗", label: "Liên kết", href: (v) => v },
};
export const CONTACT_TYPES = Object.entries(CONTACT_META).map(([value, meta]) => ({ value, label: `${meta.icon} ${meta.label}` }));

export const ContactWidget: React.FC<DomWidgetProps> = (props) => {
  const { p } = props;
  const accent = p.accent || "#2563eb";
  const items: Array<{ label?: string; type?: string; value?: string }> = Array.isArray(p.items) ? p.items : [];
  return (
    <Shell {...props}>
      <Title p={{ ...p, accent }} fallback="Liên hệ" />
      <div style={{ display: "grid", gap: 8 }}>
        {items.length === 0 ? <div style={{ textAlign: "center", opacity: 0.6, fontSize: 14 }}>Thêm thông tin liên hệ ở panel bên phải</div> : null}
        {items.map((item, index) => {
          const meta = CONTACT_META[item.type ?? "phone"] ?? CONTACT_META.phone;
          const value = String(item.value ?? "");
          return (
            <a
              key={index}
              href={value ? meta.href(value) : undefined}
              target={item.type === "link" || item.type === "zalo" || item.type === "messenger" ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 14, border: `1.5px solid ${accent}44`, background: "#fff", textDecoration: "none", color: "inherit" }}
            >
              <span style={{ fontSize: 22 }}>{meta.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12, opacity: 0.65 }}>{item.label || meta.label}</span>
                <span style={{ display: "block", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
              </span>
            </a>
          );
        })}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------ Sổ lưu bút

interface Wish {
  id: string;
  guestName: string;
  message: string;
  giftCode?: string | null;
  createdAt?: string;
}

const SAMPLE_WISHES: Wish[] = [
  { id: "s1", guestName: "Linh", message: "Chúc hai bạn trăm năm hạnh phúc! 💕" },
  { id: "s2", guestName: "Huy", message: "Chúc mừng hạnh phúc, sớm có tin vui nhé!" },
];

export const GuestbookWidget: React.FC<DomWidgetProps> = (props) => {
  const { p, viewer } = props;
  const accent = p.accent || "#db2777";
  const data = viewer?.data;
  const [wishes, setWishes] = useState<Wish[]>(data ? [] : SAMPLE_WISHES);
  const [name, setName] = useState(data?.guestName ?? "");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!data) return;
    try {
      const response = await fetch(`${data.apiBase}/invitations/by-slug/${data.slug}/wishes`);
      const list = await response.json().catch(() => []);
      if (response.ok && Array.isArray(list)) setWishes(list);
    } catch {
      /* giữ danh sách cũ */
    }
  }, [data]);

  useEffect(() => {
    void load();
    if (!data) return;
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load, data]);

  const send = async () => {
    if (!data) return;
    const who = data.guestToken ? data.guestName : name.trim();
    if (!who) return setError("Vui lòng nhập tên của bạn");
    if (!text.trim()) return setError("Vui lòng nhập lời chúc");
    setSending(true);
    setError("");
    try {
      if (data.guestToken) await postJson(`${data.apiBase}/guest-links/${data.guestToken}/wishes`, { message: text.trim() });
      else await postJson(`${data.apiBase}/invitations/by-slug/${data.slug}/wishes`, { guestName: who, message: text.trim() });
      setText("");
      await load();
    } catch (err) {
      setError(errorText(err, "Không thể gửi lời chúc"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Shell {...props} scroll={false}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Title p={{ ...p, accent }} fallback="Sổ lưu bút" />
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "grid", gap: 8, alignContent: "start", paddingRight: 2 }}>
          {wishes.length === 0 ? <div style={{ textAlign: "center", opacity: 0.6, fontSize: 14, padding: 12 }}>Chưa có lời chúc nào. Hãy là người đầu tiên!</div> : null}
          {wishes.map((wish) => (
            <div key={wish.id} style={{ padding: "9px 12px", borderRadius: 14, background: `${accent}12`, border: `1px solid ${accent}22` }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: accent }}>{wish.giftCode ? "🎁 " : ""}{wish.guestName}</div>
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{wish.message}</div>
            </div>
          ))}
        </div>
        {p.showForm !== false ? (
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {!data?.guestToken ? <input style={inputStyle(accent)} placeholder="Tên của bạn" value={name} disabled={!data} onChange={(e) => setName(e.target.value)} maxLength={80} /> : null}
            <div style={{ display: "flex", gap: 8 }}>
              <input style={inputStyle(accent)} placeholder="Gửi lời chúc…" value={text} disabled={!data} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !sending && send()} maxLength={1000} />
              <button type="button" disabled={!data || sending} onClick={send} style={{ ...primaryButton(accent, !data || sending), width: 52, flexShrink: 0 }} aria-label="Gửi">➤</button>
            </div>
            {error ? <div style={{ color: "#dc2626", fontSize: 12, textAlign: "center" }}>{error}</div> : null}
          </div>
        ) : null}
      </div>
    </Shell>
  );
};

/** Tiện ích HTML còn giữ lại (các loại khác đã có sẵn ở nhánh dev: form tham dự, hộp quà QR, bản đồ, video, trình chiếu ảnh). */
export const DOM_TOOLS: Record<string, React.FC<DomWidgetProps>> = {
  contactCard: ContactWidget,
  guestbook: GuestbookWidget,
};

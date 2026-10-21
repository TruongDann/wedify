"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { vietQrUrl } from "@/utils/vietqr";
import type { ViewerContextValue } from "../ViewerContext";

/**
 * Các tiện ích dạng DOM thật (form tham dự, hộp quà QR, bản đồ Google, video, liên hệ, sổ lưu bút).
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

// ------------------------------------------------------------ Form tham dự

export const RsvpFormWidget: React.FC<DomWidgetProps> = (props) => {
  const { p, viewer } = props;
  const accent = p.accent || "#ef4565";
  const live = Boolean(viewer?.data);
  const [name, setName] = useState(viewer?.data?.guestName ?? "");
  const [status, setStatus] = useState<"ATTENDING" | "NOT_ATTENDING">("ATTENDING");
  const [count, setCount] = useState(1);
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    const data = viewer?.data;
    if (!data) return;
    if (!data.guestToken && !name.trim()) return setMessage({ ok: false, text: "Vui lòng nhập tên của bạn" });
    setSending(true);
    setMessage(null);
    try {
      const noteText = [p.showContact !== false && contact.trim() ? `SĐT: ${contact.trim()}` : "", note.trim()].filter(Boolean).join(" — ");
      const body = { status, numberOfCompanions: status === "ATTENDING" && p.showCount !== false ? Math.max(0, count - 1) : 0, note: noteText || undefined };
      if (data.guestToken) await postJson(`${data.apiBase}/guest-links/${data.guestToken}/rsvp`, body);
      else await postJson(`${data.apiBase}/invitations/by-slug/${data.slug}/rsvp`, { ...body, name: name.trim() });
      setMessage({ ok: true, text: status === "ATTENDING" ? "Cảm ơn bạn! Chúng tôi rất mong được đón bạn 💕" : "Cảm ơn bạn đã báo cho chúng tôi biết. Rất tiếc không có bạn!" });
    } catch (error) {
      setMessage({ ok: false, text: errorText(error, "Không thể gửi xác nhận") });
    } finally {
      setSending(false);
    }
  };

  return (
    <Shell {...props}>
      <Title p={p} fallback="Xác nhận tham dự" />
      <div style={{ display: "grid", gap: 10 }}>
        {!viewer?.data?.guestToken ? (
          <input style={inputStyle(accent)} placeholder="Họ và tên của bạn" value={name} disabled={!live} onChange={(e) => setName(e.target.value)} />
        ) : (
          <div style={{ textAlign: "center", fontWeight: 600 }}>{viewer?.data?.guestName}</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([
            ["ATTENDING", "Tôi sẽ tham dự"],
            ["NOT_ATTENDING", "Rất tiếc, không đến được"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={!live}
              onClick={() => setStatus(value)}
              style={{
                padding: "9px 6px",
                borderRadius: 12,
                border: `1.5px solid ${status === value ? accent : `${accent}44`}`,
                background: status === value ? `${accent}18` : "#fff",
                color: status === value ? accent : "#475569",
                fontWeight: status === value ? 700 : 500,
                fontSize: 13,
                cursor: live ? "pointer" : "default",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {p.showCount !== false && status === "ATTENDING" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 14 }}>Số người tham dự</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" disabled={!live} onClick={() => setCount(Math.max(1, count - 1))} style={{ ...primaryButton(accent), width: 34, height: 34, padding: 0 }}>−</button>
              <b style={{ minWidth: 22, textAlign: "center" }}>{count}</b>
              <button type="button" disabled={!live} onClick={() => setCount(Math.min(20, count + 1))} style={{ ...primaryButton(accent), width: 34, height: 34, padding: 0 }}>+</button>
            </div>
          </div>
        ) : null}
        {p.showContact !== false ? <input style={inputStyle(accent)} placeholder="Số điện thoại liên hệ" value={contact} disabled={!live} onChange={(e) => setContact(e.target.value)} inputMode="tel" /> : null}
        <textarea style={{ ...inputStyle(accent), minHeight: 60, resize: "none" }} placeholder="Lời nhắn (không bắt buộc)" value={note} disabled={!live} onChange={(e) => setNote(e.target.value)} />
        <button type="button" disabled={!live || sending} onClick={submit} style={primaryButton(accent, !live || sending)}>
          {sending ? "Đang gửi…" : p.buttonLabel || "Gửi xác nhận"}
        </button>
        {message ? <div style={{ textAlign: "center", fontSize: 13, color: message.ok ? "#15803d" : "#dc2626" }}>{message.text}</div> : null}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------ Hộp quà QR

interface GiftAccount {
  holder?: string;
  bank?: string;
  number?: string;
  qrImage?: string;
}

const qrFor = (account: GiftAccount) =>
  account.qrImage ||
  (account.bank && account.number
    ? vietQrUrl(account.bank, account.number, account.holder)
    : "");

export const GiftBoxWidget: React.FC<DomWidgetProps> = (props) => {
  const { p, viewer } = props;
  const accent = p.accent || "#d97706";
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const groups: Array<{ name: string; accounts: GiftAccount[] }> = useMemo(() => {
    const own = (Array.isArray(p.groups) ? p.groups : []).filter((g: any) => (g.accounts ?? []).some((a: GiftAccount) => a.number || a.qrImage));
    if (own.length) return own;
    // Chưa nhập trong widget: dùng tài khoản trong hồ sơ thiệp (form "Dùng mẫu này")
    const profile = viewer?.data?.profile;
    if (profile?.accountNumber) return [{ name: "Chuyển khoản", accounts: [{ holder: profile.accountHolder, bank: profile.bankName, number: profile.accountNumber }] }];
    return [];
  }, [p.groups, viewer?.data?.profile]);

  const current = groups[Math.min(tab, Math.max(0, groups.length - 1))];

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* trình duyệt không cho sao chép */
    }
  }, []);

  return (
    <Shell {...props}>
      <Title p={{ ...p, accent }} fallback="Hộp quà mừng" />
      {groups.length > 1 ? (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
          {groups.map((group, index) => (
            <button key={index} type="button" onClick={() => setTab(index)} style={{ padding: "6px 14px", borderRadius: 999, border: `1.5px solid ${accent}`, background: index === tab ? accent : "transparent", color: index === tab ? "#fff" : accent, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {group.name}
            </button>
          ))}
        </div>
      ) : null}

      {current ? (
        current.accounts.filter((a) => a.number || a.qrImage).map((account, index) => (
          <div key={index} style={{ textAlign: "center", marginBottom: 10 }}>
            {qrFor(account) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrFor(account)} alt="Mã QR chuyển khoản" style={{ width: 170, maxWidth: "100%", borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)", background: "#fff" }} />
            ) : null}
            {/* Đã có mã QR thì chỉ hiện QR (ảnh VietQR đã kèm tên, ngân hàng, số tài khoản) */}
            {qrFor(account) ? null : (
              <>
            <div style={{ marginTop: 6, fontSize: 14 }}>
              {account.holder ? <div style={{ fontWeight: 700 }}>{account.holder}</div> : null}
              {account.bank ? <div style={{ opacity: 0.8 }}>{account.bank}</div> : null}
              {account.number ? <div style={{ fontSize: 17, letterSpacing: 1, fontWeight: 700 }}>{account.number}</div> : null}
            </div>
            {account.number ? (
              <button type="button" onClick={() => copy(account.number!)} style={{ marginTop: 6, padding: "6px 16px", borderRadius: 999, border: `1.5px solid ${accent}`, background: "transparent", color: accent, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {copied ? "Đã sao chép ✓" : "Sao chép số tài khoản"}
              </button>
            ) : null}
              </>
            )}
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", padding: "18px 6px", fontSize: 14, opacity: 0.7 }}>
          {viewer ? "Chủ thiệp chưa cập nhật tài khoản nhận quà." : "Nhập tài khoản ở panel bên phải — mã QR sẽ hiện tại đây."}
        </div>
      )}

      {p.showHearts !== false && viewer?.onAction ? (
        <button type="button" onClick={() => viewer.onAction?.("gift", p)} style={{ ...primaryButton(accent), marginTop: 6 }}>
          💗 Tặng quà bằng tim
        </button>
      ) : null}
    </Shell>
  );
};

// ------------------------------------------------------------ Bản đồ

export const MapWidget: React.FC<DomWidgetProps> = (props) => {
  const { p, w, h, viewer } = props;
  const accent = p.accent || "#0d9488";
  const profile = viewer?.data?.profile;
  const address: string = p.address || [profile?.location, profile?.address].filter(Boolean).join(", ") || "Nhà hát Lớn Hà Nội";
  const zoom = Number(p.zoom) || 16;
  const link = profile?.mapUrl && !p.address ? String(profile.mapUrl) : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div style={{ width: w, height: h, position: "relative", borderRadius: p.radius ?? 22, overflow: "hidden", boxShadow: "0 12px 34px rgba(0,0,0,0.14)", border: "1px solid rgba(0,0,0,0.07)", background: "#e5e7eb" }}>
      <iframe
        title="Bản đồ"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`}
        style={{ width: "100%", height: "100%", border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Khoá bản đồ: chạm một lần để mở khoá, tránh kéo bản đồ khi cuộn thiệp */}
      {p.lock !== false && !unlocked && viewer ? (
        <button type="button" aria-label="Chạm để thao tác với bản đồ" onClick={() => setUnlocked(true)} style={{ position: "absolute", inset: 0, background: "transparent", border: 0, cursor: "pointer" }} />
      ) : null}
      {p.showTitle !== false && p.title ? (
        <div style={{ position: "absolute", left: 10, top: 10, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.95)", color: accent, fontWeight: 700, fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontFamily: fontOf(p) }}>{p.title}</div>
      ) : null}
      {p.showDirections !== false ? (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ position: "absolute", right: 10, bottom: 10, padding: "8px 16px", borderRadius: 999, background: accent, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.25)", fontFamily: fontOf(p) }}>
          📍 Chỉ đường
        </a>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------ Video

const youtubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return match?.[1] ?? "";
};

export const VideoWidget: React.FC<DomWidgetProps> = ({ p, w, h }) => {
  const id = youtubeId(String(p.url ?? ""));
  return (
    <div style={{ width: w, height: h, borderRadius: p.radius ?? 22, overflow: "hidden", background: "#111827", boxShadow: "0 12px 34px rgba(0,0,0,0.18)" }}>
      {id ? (
        <iframe
          title={p.title || "Video"}
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          style={{ width: "100%", height: "100%", border: 0 }}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#e5e7eb", gap: 8, fontFamily: fontOf(p), textAlign: "center", padding: 16 }}>
          <span style={{ fontSize: 40 }}>▶️</span>
          <span style={{ fontSize: 14 }}>Dán link YouTube ở panel bên phải</span>
        </div>
      )}
    </div>
  );
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

export const DOM_WIDGETS: Record<string, React.FC<DomWidgetProps>> = {
  rsvpForm: RsvpFormWidget,
  giftBox: GiftBoxWidget,
  mapEmbed: MapWidget,
  video: VideoWidget,
  contactCard: ContactWidget,
  guestbook: GuestbookWidget,
};

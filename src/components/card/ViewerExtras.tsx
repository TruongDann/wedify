"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Gift, Heart, MessageCircleHeart, Send, X } from "lucide-react";
import type { InteractionSettings, ViewerSettings } from "@/types/editor";
import { Wish, addWish, loadLikes, loadWishes, toggleLike } from "@/lib/wishesStore";
import { OPEN_GIFT_EVENT } from "./clickAction";

export const DEFAULT_VIEWER: ViewerSettings = {
  autoScroll: false,
  scrollSpeed: 40,
  desktopLayout: "classic",
  title: "Minh Anh & Hoàng Nam",
  description: "Cảm ơn bạn đã ghé xem thiệp cưới của chúng mình. Rất mong được gặp bạn trong ngày vui!",
};

export const DEFAULT_INTERACTION: InteractionSettings = {
  enabled: false,
  wishes: true,
  like: true,
  gift: true,
  showWishesPublicly: true,
};

const STOP_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/** Tự cuộn trang xuống từ từ; khách chạm / cuộn / bấm phím thì dừng hẳn. */
export const useAutoScroll = (enabled: boolean, speed: number, started: boolean) => {
  useEffect(() => {
    if (!enabled || !started) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = performance.now();
    let carry = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      STOP_EVENTS.forEach((t) => window.removeEventListener(t, stop));
    };
    const tick = (now: number) => {
      carry += (speed * Math.min(now - last, 100)) / 1000;
      last = now;
      const step = Math.floor(carry);
      if (step > 0) {
        carry -= step;
        window.scrollBy(0, step);
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) return stop();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    STOP_EVENTS.forEach((t) => window.addEventListener(t, stop, { passive: true }));
    return stop;
  }, [enabled, speed, started]);
};

/** Danh sách lời chúc dùng chung cho thanh tương tác, lời chúc nổi và cột bên phải. */
export const useWishes = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => setWishes(loadWishes()), 0);
    return () => clearTimeout(timer);
  }, []);
  const send = useCallback(async (name: string, message: string) => {
    const wish = await addWish(name, message);
    setWishes((list) => [wish, ...list]);
  }, []);
  return { wishes, send };
};

const WishModal: React.FC<{ onSend: (name: string, message: string) => Promise<void>; onClose: () => void }> = ({
  onSend,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const field: React.CSSProperties = {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "none",
  };
  return (
    <div
      role="dialog"
      aria-label="Gửi lời chúc"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim() || !message.trim()) return;
          setSending(true);
          await onSend(name, message);
          onClose();
        }}
        style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: "16px 16px 0 0", padding: 20, display: "grid", gap: 12, fontFamily: "system-ui, sans-serif" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 17 }}>Gửi lời chúc</strong>
          <button type="button" aria-label="Đóng" onClick={onClose} style={{ border: 0, background: "transparent", cursor: "pointer", color: "#999" }}>
            <X size={20} />
          </button>
        </div>
        <input required placeholder="Tên của bạn" value={name} onChange={(e) => setName(e.target.value)} style={field} maxLength={40} />
        <textarea required placeholder="Lời chúc gửi cô dâu chú rể" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} style={field} maxLength={300} />
        <button
          type="submit"
          disabled={sending}
          style={{ border: 0, borderRadius: 999, padding: "12px 0", background: "#c0394b", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Send size={16} /> {sending ? "Đang gửi…" : "Gửi"}
        </button>
      </form>
    </div>
  );
};

interface InteractionBarProps {
  settings: InteractionSettings;
  hasGift: boolean;
  onSendWish: (name: string, message: string) => Promise<void>;
  /** Bề rộng thiệp đang hiển thị, để thanh không rộng hơn thiệp */
  cardWidth: number;
}

/** Thanh nổi cuối màn hình: gửi lời chúc, thích thiệp, mừng cưới. */
export const InteractionBar: React.FC<InteractionBarProps> = ({ settings, hasGift, onSendWish, cardWidth }) => {
  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [writing, setWriting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLikes(loadLikes()), 0);
    return () => clearTimeout(timer);
  }, []);

  const pill: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: 0,
    borderRadius: 999,
    padding: "9px 14px",
    background: "rgba(255,255,255,0.92)",
    color: "#333",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    backdropFilter: "blur(6px)",
    fontFamily: "system-ui, sans-serif",
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.min(cardWidth - 24, 420),
          display: "flex",
          justifyContent: "center",
          gap: 8,
          zIndex: 40,
        }}
      >
        {settings.wishes && (
          <button type="button" style={{ ...pill, flex: 1, justifyContent: "center" }} onClick={() => setWriting(true)}>
            <MessageCircleHeart size={16} color="#c0394b" /> Gửi lời chúc
          </button>
        )}
        {settings.like && (
          <button type="button" aria-pressed={likes.liked} style={pill} onClick={() => setLikes(toggleLike())}>
            <Heart size={16} color="#e8506e" fill={likes.liked ? "#e8506e" : "none"} /> {likes.count}
          </button>
        )}
        {settings.gift && hasGift && (
          <button type="button" style={pill} onClick={() => window.dispatchEvent(new Event(OPEN_GIFT_EVENT))}>
            <Gift size={16} color="#c0394b" /> Mừng cưới
          </button>
        )}
      </div>
      {writing && <WishModal onSend={onSendWish} onClose={() => setWriting(false)} />}
    </>
  );
};

/** Lời chúc nổi lần lượt ở góc dưới thiệp, phía trên thanh tương tác. */
export const FloatingWishes: React.FC<{ wishes: Wish[]; cardWidth: number }> = ({ wishes, cardWidth }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (wishes.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % wishes.length), 4000);
    return () => clearInterval(timer);
  }, [wishes.length]);
  const wish = wishes[index % Math.max(wishes.length, 1)];
  if (!wish) return null;
  return (
    <div
      key={wish.id}
      className="wc-wish"
      style={{
        position: "fixed",
        bottom: 70,
        left: `calc(50% - ${cardWidth / 2}px + 12px)`,
        maxWidth: Math.min(cardWidth - 24, 300),
        zIndex: 39,
        background: "rgba(0,0,0,0.55)",
        color: "#fff",
        borderRadius: 14,
        padding: "8px 12px",
        fontSize: 13,
        lineHeight: 1.4,
        fontFamily: "system-ui, sans-serif",
        pointerEvents: "none",
      }}
    >
      <strong>{wish.name}</strong>: {wish.message}
    </div>
  );
};

/** Cột trái của bố cục máy tính: tiêu đề, lời giới thiệu. */
export const SideInfo: React.FC<{ viewer: ViewerSettings }> = ({ viewer }) => (
  <aside className="wc-side" style={{ textAlign: "center", fontFamily: '"Cormorant Garamond", serif', color: "#3f3f3f" }}>
    <div style={{ fontFamily: '"Great Vibes", cursive', fontSize: 44, lineHeight: 1.2 }}>{viewer.title}</div>
    <p style={{ fontSize: 18, lineHeight: 1.6, marginTop: 16 }}>{viewer.description}</p>
  </aside>
);

/** Cột phải của bố cục máy tính: danh sách lời chúc. */
export const SideWishes: React.FC<{ wishes: Wish[] }> = ({ wishes }) => (
  <aside className="wc-side" style={{ fontFamily: "system-ui, sans-serif" }}>
    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#333" }}>Lời chúc ({wishes.length})</div>
    <div style={{ display: "grid", gap: 10, maxHeight: "70vh", overflowY: "auto" }}>
      {wishes.map((w) => (
        <div key={w.id} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 600, color: "#c0394b" }}>{w.name}</div>
          <div style={{ color: "#444", marginTop: 2 }}>{w.message}</div>
        </div>
      ))}
    </div>
  </aside>
);

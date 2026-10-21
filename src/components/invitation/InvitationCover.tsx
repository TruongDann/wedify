"use client";

import React, { useEffect, useMemo, useState } from "react";
import { loadGoogleFont } from "@/utils/fontLoader";

const PARTICLE_EMOJI: Record<string, string> = {
  petals: "🌸",
  hearts: "💗",
  sparkles: "✨",
  confetti: "🎉",
  bubbles: "🫧",
  snow: "❄️",
};

interface InvitationCoverProps {
  names: string;
  dateText: string;
  guestName: string;
  eyebrow?: string;
  /** Ảnh nền của thẻ mở thiệp; bỏ trống sẽ dùng màu nền của thiệp. */
  image?: string;
  accent: string;
  /** Nền của thiệp (màu hoặc linear-gradient) — dùng làm nền toàn màn hình. */
  background: string;
  ambientType?: string;
  /** Gọi ngay khi bấm "Mở thiệp" (trong lúc có thao tác người dùng, để phát nhạc được). */
  onOpen: () => void;
  /** Gọi khi hiệu ứng đóng xong. */
  onClosed: () => void;
}

const firstHex = (value: string) => value.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/)?.[0] ?? "#ffffff";

const isDarkColor = (hex: string) => {
  const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
};

/** Màn hình "Mở thiệp" hiện khi khách mở link: thẻ mời có tên, ngày, lời mời và nút Mở thiệp. */
const InvitationCover: React.FC<InvitationCoverProps> = ({ names, dateText, guestName, eyebrow, image, accent, background, ambientType, onOpen, onClosed }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    void loadGoogleFont("Great Vibes");
    void loadGoogleFont("Playfair Display");
  }, []);

  const hasImage = Boolean(image);
  const dark = isDarkColor(firstHex(background));
  // Có ảnh nền: chữ trắng trên lớp phủ tối. Không có ảnh: theo độ sáng của nền thiệp.
  const ink = hasImage ? "#ffffff" : dark ? "#ffffff" : "#3b1d2a";
  const emoji = PARTICLE_EMOJI[ambientType ?? ""] ?? "✨";

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 37 + 8) % 100,
        size: 14 + ((i * 7) % 16),
        duration: 9 + ((i * 3) % 8),
        delay: -((i * 2.3) % 10),
        opacity: 0.35 + ((i * 11) % 40) / 100,
      })),
    [],
  );

  const open = () => {
    if (closing) return;
    onOpen();
    setClosing(true);
    setTimeout(onClosed, 850);
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center overflow-hidden px-4"
      style={{ background, transition: "opacity .8s ease, transform .8s ease", opacity: closing ? 0 : 1, transform: closing ? "scale(1.06)" : "scale(1)", pointerEvents: closing ? "none" : "auto" }}
      role="dialog"
      aria-label="Mở thiệp"
    >
      <style>{`
        @keyframes coverFall { 0% { transform: translateY(-12vh) rotate(0deg); } 100% { transform: translateY(112vh) rotate(360deg); } }
        @keyframes coverCard { from { opacity: 0; transform: translateY(24px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes coverShine { 0% { transform: translateX(-120%); } 60%, 100% { transform: translateX(220%); } }
      `}</style>

      {particles.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute top-0 select-none"
          style={{ left: `${p.left}%`, fontSize: p.size, opacity: p.opacity, animation: `coverFall ${p.duration}s linear ${p.delay}s infinite` }}
        >
          {emoji}
        </span>
      ))}

      <div
        className="relative w-full max-w-[600px] overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.3)]"
        style={{ aspectRatio: "4 / 3", animation: "coverCard .9s ease both", background: hasImage ? "#111" : "rgba(255,255,255,0.55)", border: `1px solid ${accent}55` }}
      >
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.7) 100%)" }} />
          </>
        ) : null}

        <div className="relative flex h-full flex-col items-center justify-center gap-[2.2%] px-6 text-center" style={{ color: ink }}>
          <div className="text-[11px] font-semibold tracking-[0.35em] sm:text-xs" style={{ color: hasImage ? "#fde68a" : accent }}>
            {eyebrow || "THIỆP MỜI"}
          </div>
          <div className="leading-tight" style={{ fontFamily: "'Great Vibes', 'Dancing Script', cursive", fontSize: "clamp(34px, 9vw, 58px)", textShadow: hasImage ? "0 4px 18px rgba(0,0,0,0.45)" : "none" }}>
            {names}
          </div>
          <div className="flex w-2/3 items-center gap-3 opacity-80">
            <span className="h-px flex-1" style={{ background: hasImage ? "#fde68a" : accent }} />
            <span style={{ color: hasImage ? "#fde68a" : accent }}>♥</span>
            <span className="h-px flex-1" style={{ background: hasImage ? "#fde68a" : accent }} />
          </div>
          {dateText ? <div className="text-sm sm:text-base" style={{ fontFamily: "'Playfair Display', serif" }}>{dateText}</div> : null}
          <div className="text-sm opacity-90" style={{ fontFamily: "'Playfair Display', serif" }}>Kính mời</div>
          <div
            className="max-w-[85%] truncate rounded-full px-5 py-1.5 text-sm font-semibold sm:text-base"
            style={{ background: hasImage ? "rgba(255,255,255,0.22)" : `${accent}22`, border: `1px solid ${accent}55`, fontFamily: "'Playfair Display', serif", backdropFilter: "blur(4px)" }}
          >
            {guestName}
          </div>
          <button
            type="button"
            onClick={open}
            className="relative mt-1 overflow-hidden rounded-full px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105 sm:text-base"
            style={{ background: accent, fontFamily: "'Playfair Display', serif" }}
          >
            Mở thiệp
            <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/35" style={{ animation: "coverShine 3s ease-in-out infinite" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationCover;

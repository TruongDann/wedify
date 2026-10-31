"use client";

import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { IntroSettings } from "@/types/editor";
import "./card.css";

export const DEFAULT_INTRO: IntroSettings = {
  style: "envelope",
  title: "Minh Anh & Hoàng Nam",
  subtitle: "Trân trọng kính mời",
  buttonText: "Mở thiệp",
  color: "#f3e3d8",
  textColor: "#5b3a2e",
};

type Phase = "closed" | "opening" | "gone";

/** Thời gian toàn bộ màn mở (ms) trước khi gỡ lớp phủ */
const OPEN_DURATION = { envelope: 2300, curtain: 2000 } as const;

const mix = (color: string, other: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, ${other})`;

/** Pha mã hex với trắng (amount 0 = giữ nguyên); màu không phải hex thì trả về trắng */
const lightenHex = (hex: string, amount: number) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) return "#ffffff";
  return `#${[0, 2, 4]
    .map((i) => {
      const c = parseInt(full.slice(i, i + 2), 16);
      return Math.round(c + (255 - c) * amount)
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
};

// Hình trái tim cho pháo giấy (đường dẫn SVG trong hộp 0..20)
const HEART_PATH =
  "M10 18 C2 12 0 8 0 5 C0 2 2.5 0 5 0 C7 0 8.8 1.2 10 3 C11.2 1.2 13 0 15 0 C17.5 0 20 2 20 5 C20 8 18 12 10 18 Z";
// Cánh hoa
const PETAL_PATH = "M10 20 C2 14 1 6 6 1 C8 3 9 3 10 2 C11 3 12 3 14 1 C19 6 18 14 10 20 Z";

/** Bung cánh hoa + trái tim + kim tuyến lúc mở thiệp */
const burst = (canvas: HTMLCanvasElement | null, palette: string[]) => {
  const fire = canvas
    ? confetti.create(canvas, { resize: true, useWorker: true, disableForReducedMotion: true })
    : (opts: confetti.Options) => confetti({ ...opts, disableForReducedMotion: true, zIndex: 60 });
  const heart = confetti.shapeFromPath({ path: HEART_PATH });
  const petal = confetti.shapeFromPath({ path: PETAL_PATH });
  const common = { colors: palette, ticks: 260, gravity: 0.55, decay: 0.93, scalar: 1.1 };

  // Hai luồng từ hai bên chéo vào giữa + một đợt rơi nhẹ từ trên
  fire({ ...common, particleCount: 45, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, shapes: [petal, heart, "circle"], startVelocity: 48 });
  fire({ ...common, particleCount: 45, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, shapes: [petal, heart, "circle"], startVelocity: 48 });
  setTimeout(() => {
    fire({ ...common, particleCount: 60, angle: 90, spread: 160, origin: { x: 0.5, y: -0.1 }, shapes: [petal, heart], startVelocity: 12, gravity: 0.35, ticks: 360 });
  }, 250);
};

/**
 * Màn chào khách trước khi vào thiệp. Khách bấm thì phong bì mở / rèm kéo ra, kèm pháo cánh hoa.
 * Lần bấm này cũng là "tương tác đầu tiên" nên nhạc nền (MusicButton) bắt đầu phát luôn.
 * `preview` = hiển thị trong khung nhỏ của editor (không khoá cuộn trang, pháo giấy nằm trong khung).
 */
export const IntroOverlay: React.FC<{ intro: IntroSettings; preview?: boolean; onDone?: () => void }> = ({
  intro,
  preview = false,
  onDone,
}) => {
  const [phase, setPhase] = useState<Phase>("closed");
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const style = intro.style === "curtain" ? "curtain" : "envelope";

  useEffect(() => {
    if (preview || phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase, preview]);

  useEffect(() => {
    if (phase !== "opening") return;
    // canvas-confetti cần mã hex: tự pha màu thay vì dùng color-mix của CSS
    const palette = [lightenHex(intro.color, 0), lightenHex(intro.color, 0.5), "#f7a8bf", "#e8506e", "#f5d58a", "#ffffff"];
    const burstTimer = setTimeout(() => burst(preview ? confettiRef.current : null, palette), style === "envelope" ? 700 : 450);
    const doneTimer = setTimeout(() => {
      setPhase("gone");
      onDone?.();
    }, OPEN_DURATION[style]);
    return () => {
      clearTimeout(burstTimer);
      clearTimeout(doneTimer);
    };
  }, [phase, onDone, preview, style, intro.color]);

  if (phase === "gone") return null;
  const opening = phase === "opening";
  const open = () => setPhase("opening");

  const shell: React.CSSProperties = {
    position: preview ? "absolute" : "fixed",
    inset: 0,
    zIndex: 50,
    overflow: "hidden",
    color: intro.textColor,
    fontFamily: '"Cormorant Garamond", "Prata", serif',
    textAlign: "center",
    transition: `opacity .7s ease ${style === "envelope" ? 1.5 : 1.25}s`,
    opacity: opening ? 0 : 1,
    pointerEvents: opening ? "none" : "auto",
  };

  const heading = (
    <div
      style={{
        transition: "opacity .5s ease, transform .6s ease",
        opacity: opening ? 0 : 1,
        transform: opening ? "translateY(-12px)" : "none",
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: 4, textTransform: "uppercase", opacity: 0.75 }}>{intro.subtitle}</div>
      <div
        style={{
          fontFamily: '"Great Vibes", "Allison", cursive',
          fontSize: 44,
          lineHeight: 1.2,
          margin: "8px 0 0",
          textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          animation: "wc-intro-rise 1.2s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        {intro.title}
      </div>
      {/* Đường kẻ trang trí */}
      <div
        style={{
          margin: "10px auto 0",
          width: 120,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${intro.textColor}, transparent)`,
          opacity: 0.5,
        }}
      />
    </div>
  );

  const button = (
    <button
      type="button"
      onClick={open}
      disabled={opening}
      className="wc-intro-button"
      style={{
        marginTop: 30,
        padding: "11px 32px",
        borderRadius: 999,
        border: `1px solid ${mix(intro.textColor, "transparent", 60)}`,
        background: mix("white", "transparent", 55),
        backdropFilter: "blur(6px)",
        color: intro.textColor,
        fontSize: 13,
        letterSpacing: 3,
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "opacity .3s, transform .3s",
        opacity: opening ? 0 : 1,
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      }}
    >
      {intro.buttonText}
    </button>
  );

  const confettiCanvas = preview ? (
    <canvas
      ref={confettiRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}
    />
  ) : null;

  if (style === "curtain") {
    // Vải nhung: hai lớp nếp gấp khác chu kỳ chồng lên nhau cho nếp không đều,
    // tối dần ở trên/dưới như có đèn rọi giữa
    const velvet = [
      `linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.4))`,
      `repeating-linear-gradient(90deg,
        rgba(0,0,0,0) 0px, rgba(0,0,0,0.12) 23px, rgba(0,0,0,0) 37px,
        rgba(255,255,255,0.10) 52px, rgba(0,0,0,0) 73px)`,
      `repeating-linear-gradient(90deg,
        ${mix(intro.color, "black", 72)} 0px,
        ${intro.color} 16px,
        ${mix(intro.color, "white", 85)} 24px,
        ${intro.color} 33px,
        ${mix(intro.color, "black", 72)} 48px)`,
    ].join(", ");
    const half = (side: "left" | "right"): React.CSSProperties => ({
      position: "absolute",
      top: 0,
      bottom: 0,
      [side]: 0,
      width: "51%",
      background: velvet,
      boxShadow: `inset ${side === "left" ? "-" : ""}24px 0 40px rgba(0,0,0,0.35)`,
      transformOrigin: `${side} top`,
      transition: "transform 1.3s cubic-bezier(.7,0,.2,1), filter 1.3s ease",
      // Rèm dồn nếp lại về mép của nó (vẫn còn một dải ở hai bên) như được kéo bằng tay
      transform: opening ? `scaleX(0.16) skewY(${side === "left" ? 1.5 : -1.5}deg)` : "none",
      filter: opening ? "brightness(0.8)" : "none",
    });
    return (
      <div
        style={{
          ...shell,
          // Rèm mở là thấy luôn thiệp phía sau
          background: opening ? "transparent" : mix(intro.color, "black", 35),
          transition: `${shell.transition}, background .5s ease .35s`,
        }}
      >
        {/* Ánh đèn sân khấu phía sau */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 30%, rgba(255,240,210,0.55), transparent 65%)",
            transition: "opacity .5s ease .3s",
            opacity: opening ? 0 : 1,
          }}
        />
        <div style={half("left")} />
        <div style={half("right")} />
        {/* Diềm rèm phía trên: dải vải có nếp nhỏ, viền chỉ vàng */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 48,
            background: `linear-gradient(180deg, transparent 88%, #d9b46a 88%, #f3dc9c 93%, #b88d3e 100%),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 3px, rgba(0,0,0,0) 3px 12px, rgba(255,255,255,0.12) 12px 14px, rgba(0,0,0,0) 14px 22px),
              linear-gradient(180deg, ${mix(intro.color, "black", 70)}, ${mix(intro.color, "black", 90)})`,
            boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            color: mix(intro.color, "white", 12),
          }}
        >
          <div
            style={{
              padding: "28px 34px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.88)",
              color: intro.textColor,
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
              transition: "opacity .4s, transform .5s",
              opacity: opening ? 0 : 1,
              transform: opening ? "scale(0.94)" : "none",
            }}
          >
            {heading}
            {button}
          </div>
        </div>
        {confettiCanvas}
      </div>
    );
  }

  // ------------------------------- Phong bì -------------------------------
  const paper = mix(intro.color, "white", 75);
  const W = 320;
  const H = 210;
  return (
    <div
      style={{
        ...shell,
        background: `radial-gradient(circle at 50% 35%, #ffffff 0%, ${mix(intro.color, "white", 45)} 75%),
          repeating-linear-gradient(45deg, rgba(0,0,0,0.012) 0 2px, transparent 2px 6px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {heading}
      <div
        style={{
          position: "relative",
          width: W,
          height: H,
          marginTop: 40,
          perspective: 1000,
          maxWidth: "88%",
          animation: opening ? "none" : "wc-intro-float 4s ease-in-out infinite",
          transition: "transform 1s cubic-bezier(.16,1,.3,1) .9s",
          transform: opening ? "translateY(40%) scale(0.92)" : "none",
        }}
      >
        {/* Bóng đổ dưới phong bì */}
        <div
          style={{
            position: "absolute",
            left: "6%",
            right: "6%",
            bottom: -18,
            height: 24,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.18), transparent 70%)",
            filter: "blur(4px)",
          }}
        />
        {/* Lót trong phong bì (thấy được khi nắp mở) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 8,
            background: `linear-gradient(180deg, ${mix(intro.color, "black", 78)}, ${mix(intro.color, "black", 90)})`,
          }}
        />
        {/* Thư bên trong: trồi lên rồi tiến về phía khách */}
        <div
          style={{
            position: "absolute",
            left: "7%",
            right: "7%",
            top: 10,
            height: H - 22,
            background: `linear-gradient(180deg, #fffdf8, #fbf5ec)`,
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            transition: "transform 1s cubic-bezier(.16,1,.3,1) .55s",
            transform: opening ? "translateY(-78%) scale(1.04)" : "none",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", opacity: 0.6 }}>Save the date</div>
          <div style={{ fontFamily: '"Great Vibes", cursive', fontSize: 30, lineHeight: 1.1, padding: "0 12px" }}>
            {intro.title}
          </div>
        </div>
        {/* Thân phong bì: hai cánh bên + cánh dưới, mỗi cánh một sắc độ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.16))" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 8,
              background: `linear-gradient(90deg, ${mix(paper, "black", 96)}, ${paper} 40%)`,
              clipPath: "polygon(0 0, 52% 54%, 0 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 8,
              background: `linear-gradient(270deg, ${mix(paper, "black", 96)}, ${paper} 40%)`,
              clipPath: "polygon(100% 0, 48% 54%, 100% 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 8,
              background: `linear-gradient(0deg, ${mix(paper, "black", 93)}, ${paper} 70%)`,
              clipPath: "polygon(0 100%, 50% 46%, 100% 100%)",
            }}
          />
        </div>
        {/* Nắp phong bì: lật 3D, mặt sau là lớp lót */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "58%",
            transformOrigin: "top",
            transformStyle: "preserve-3d",
            // Chỉ lùi ra sau lá thư khi nắp đã lật quá 90°
            transition: "transform .75s cubic-bezier(.65,0,.35,1) .2s, z-index 0s linear .58s",
            transform: opening ? "rotateX(180deg)" : "none",
            zIndex: opening ? 0 : 3,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${paper}, ${mix(paper, "black", 92)})`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backfaceVisibility: "hidden",
              filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.12))",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(0deg, ${mix(intro.color, "black", 80)}, ${mix(intro.color, "black", 90)})`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
            }}
          />
        </div>
        {/* Con dấu sáp */}
        <button
          type="button"
          onClick={open}
          aria-label={intro.buttonText}
          className="wc-intro-seal"
          style={{
            position: "absolute",
            left: "50%",
            top: "58%",
            width: 62,
            height: 62,
            marginLeft: -31,
            marginTop: -31,
            padding: 0,
            border: "none",
            background: "none",
            cursor: "pointer",
            zIndex: 4,
            transition: "opacity .25s, transform .35s cubic-bezier(.36,0,.66,-0.56)",
            opacity: opening ? 0 : 1,
            transform: opening ? "scale(0.4)" : "none",
          }}
        >
          <svg viewBox="0 0 62 62" width="62" height="62" aria-hidden>
            <defs>
              <radialGradient id="wc-wax" cx="35%" cy="32%" r="75%">
                <stop offset="0" stopColor="#d4545c" />
                <stop offset="0.6" stopColor="#a3242f" />
                <stop offset="1" stopColor="#6e1119" />
              </radialGradient>
            </defs>
            {/* Viền sáp loang không đều */}
            <path
              d="M31 2 C38 3 41 1 46 5 C52 9 55 10 57 17 C60 23 61 27 59 33 C58 40 60 44 55 49 C50 55 47 58 40 59 C34 61 29 61 23 59 C16 58 12 56 8 50 C4 45 2 41 3 34 C2 27 1 23 5 17 C8 11 12 8 17 5 C22 2 25 2 31 2 Z"
              fill="url(#wc-wax)"
            />
            <circle cx="31" cy="31" r="19" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
            <circle cx="31" cy="31" r="19" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" transform="translate(-0.8 -0.8)" />
            {/* Trái tim dập nổi */}
            <path
              d="M31 41 C24 36 21 32.5 21 29 C21 26 23.3 24 26 24 C28 24 30 25.2 31 27 C32 25.2 34 24 36 24 C38.7 24 41 26 41 29 C41 32.5 38 36 31 41 Z"
              fill="rgba(0,0,0,0.22)"
              transform="translate(0.8 0.8)"
            />
            <path
              d="M31 41 C24 36 21 32.5 21 29 C21 26 23.3 24 26 24 C28 24 30 25.2 31 27 C32 25.2 34 24 36 24 C38.7 24 41 26 41 29 C41 32.5 38 36 31 41 Z"
              fill="#c23a44"
            />
          </svg>
        </button>
      </div>
      {button}
      {confettiCanvas}
    </div>
  );
};

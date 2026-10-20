"use client";

import React, { useEffect, useState } from "react";
import type { IntroSettings } from "@/types/editor";

export const DEFAULT_INTRO: IntroSettings = {
  style: "envelope",
  title: "Minh Anh & Hoàng Nam",
  subtitle: "Trân trọng kính mời",
  buttonText: "Mở thiệp",
  color: "#f3e3d8",
  textColor: "#5b3a2e",
};

type Phase = "closed" | "opening" | "gone";

/**
 * Màn chào khách trước khi vào thiệp. Khách bấm nút thì phong bì mở / rèm kéo ra.
 * Lần bấm này cũng là "tương tác đầu tiên" nên nhạc nền (MusicButton) bắt đầu phát luôn.
 * `preview` = hiển thị trong khung nhỏ của editor (không khoá cuộn trang).
 */
export const IntroOverlay: React.FC<{ intro: IntroSettings; preview?: boolean; onDone?: () => void }> = ({
  intro,
  preview = false,
  onDone,
}) => {
  const [phase, setPhase] = useState<Phase>("closed");

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
    const timer = setTimeout(() => {
      setPhase("gone");
      onDone?.();
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase, onDone]);

  if (phase === "gone") return null;
  const opening = phase === "opening";
  const open = () => setPhase("opening");

  const text = (
    <>
      <div style={{ fontSize: 15, letterSpacing: 2, textTransform: "uppercase", opacity: 0.8 }}>{intro.subtitle}</div>
      <div style={{ fontFamily: '"Great Vibes", "Allison", cursive', fontSize: 40, lineHeight: 1.2, margin: "6px 0 0" }}>
        {intro.title}
      </div>
    </>
  );

  const button = (
    <button
      type="button"
      onClick={open}
      disabled={opening}
      style={{
        marginTop: 28,
        padding: "10px 28px",
        borderRadius: 999,
        border: `1px solid ${intro.textColor}`,
        background: "transparent",
        color: intro.textColor,
        fontSize: 14,
        letterSpacing: 1,
        cursor: "pointer",
        transition: "opacity .3s",
        opacity: opening ? 0 : 1,
      }}
    >
      {intro.buttonText}
    </button>
  );

  const shell: React.CSSProperties = {
    position: preview ? "absolute" : "fixed",
    inset: 0,
    zIndex: 50,
    overflow: "hidden",
    color: intro.textColor,
    fontFamily: '"Cormorant Garamond", "Prata", serif',
    textAlign: "center",
    transition: "opacity .7s ease 1.1s",
    opacity: opening ? 0 : 1,
    pointerEvents: opening ? "none" : "auto",
  };

  if (intro.style === "curtain") {
    const half = (side: "left" | "right"): React.CSSProperties => ({
      position: "absolute",
      top: 0,
      bottom: 0,
      [side]: 0,
      width: "50.5%",
      background: `repeating-linear-gradient(90deg, ${intro.color} 0 18px, color-mix(in srgb, ${intro.color} 85%, black) 18px 22px)`,
      boxShadow: "inset 0 0 40px rgba(0,0,0,0.25)",
      transition: "transform 1.2s cubic-bezier(.6,.05,.3,1)",
      transform: opening ? `translateX(${side === "left" ? "-100%" : "100%"})` : "none",
    });
    return (
      <div style={{ ...shell, transition: "opacity .4s ease 1.2s" }}>
        <div style={half("left")} />
        <div style={half("right")} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            transition: "opacity .4s",
            opacity: opening ? 0 : 1,
          }}
        >
          {text}
          {button}
        </div>
      </div>
    );
  }

  // Phong bì thư
  const W = 300;
  const H = 200;
  return (
    <div
      style={{
        ...shell,
        background: `radial-gradient(circle at 50% 40%, #ffffff 0%, color-mix(in srgb, ${intro.color} 55%, white) 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {text}
      <div style={{ position: "relative", width: W, height: H, marginTop: 36, perspective: 800, maxWidth: "86%" }}>
        {/* Thư bên trong, trồi lên khi mở */}
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: 10,
            height: H - 20,
            background: "#fffdf9",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Great Vibes", cursive',
            fontSize: 28,
            transition: "transform .8s ease .45s",
            transform: opening ? "translateY(-70%)" : "none",
          }}
        >
          Save the date
        </div>
        {/* Thân phong bì (che nửa dưới thư) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: intro.color,
            clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, transparent 48%, color-mix(in srgb, ${intro.color} 85%, black) 50%, transparent 52%), linear-gradient(200deg, transparent 48%, color-mix(in srgb, ${intro.color} 85%, black) 50%, transparent 52%)`,
            opacity: 0.25,
            clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Nắp phong bì */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "58%",
            background: `color-mix(in srgb, ${intro.color} 90%, black)`,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            transformOrigin: "top",
            transition: "transform .6s ease",
            transform: opening ? "rotateX(180deg)" : "none",
            zIndex: opening ? 0 : 2,
          }}
        />
        {/* Con dấu sáp */}
        <button
          type="button"
          onClick={open}
          aria-label={intro.buttonText}
          style={{
            position: "absolute",
            left: "50%",
            top: "58%",
            width: 54,
            height: 54,
            marginLeft: -27,
            marginTop: -27,
            borderRadius: "50%",
            border: "none",
            background: "radial-gradient(circle at 35% 35%, #c9474f, #8e1f2a)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            color: "#ffe9ea",
            fontSize: 22,
            cursor: "pointer",
            zIndex: 3,
            transition: "opacity .3s",
            opacity: opening ? 0 : 1,
          }}
        >
          ♥
        </button>
      </div>
      {button}
    </div>
  );
};

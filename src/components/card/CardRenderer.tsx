"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CanvasSettings, EditorElement } from "@/types/editor";
import { loadGoogleFont } from "@/utils/fontLoader";
import TextView from "./TextView";
import ImageView from "./ImageView";
import ShapeView from "./ShapeView";
import WidgetView from "./WidgetView";
import { MusicButton } from "./MusicButton";
import { FallingEffectLayer } from "./FallingEffectLayer";
import { IntroOverlay } from "./IntroOverlay";
import { GiftModal } from "./WidgetExtraViews";
import { OPEN_GIFT_EVENT } from "./clickAction";
import {
  DEFAULT_INTERACTION,
  DEFAULT_VIEWER,
  FloatingWishes,
  InteractionBar,
  SideInfo,
  SideWishes,
  useAutoScroll,
  useWishes,
} from "./ViewerExtras";
import "./card.css";

interface CardRendererProps {
  canvasSettings: CanvasSettings;
  elements: EditorElement[];
}

/** Gradient giống editor: các mã màu hex trải đều theo đường chéo từ góc trên-trái tới góc dưới-phải. */
const parseGradientColors = (value: string) => {
  if (!value?.startsWith("linear-gradient")) return null;
  const colors = value.match(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/g);
  return colors && colors.length >= 2 ? colors : null;
};

/**
 * Vẽ thiệp bằng HTML/CSS/SVG ở đúng kích thước thiết kế (px của editor).
 * Dùng chung cho trang xem thiệp và mọi chỗ cần hiển thị thiệp ngoài editor.
 */
export const CardRenderer: React.FC<CardRendererProps> = ({ canvasSettings, elements }) => {
  const { width, height, backgroundColor, backgroundImage } = canvasSettings;
  const gradient = parseGradientColors(backgroundColor);
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Tải font Google cho các phần tử chữ
  const fontKey = Array.from(
    new Set(elements.flatMap((el) => (el.type === "text" || el.type === "widget" ? [el.fontFamily] : []))),
  ).join("|");
  useEffect(() => {
    if (fontKey) fontKey.split("|").forEach((font) => loadGoogleFont(font));
  }, [fontKey]);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        background: !gradient && backgroundColor !== "transparent" ? backgroundColor : undefined,
      }}
    >
      {gradient && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <defs>
            <linearGradient id="wc-bg-gradient" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={width} y2={height}>
              {gradient.map((color, i) => (
                <stop key={i} offset={i / (gradient.length - 1)} stopColor={color} />
              ))}
            </linearGradient>
          </defs>
          <rect width={width} height={height} fill="url(#wc-bg-gradient)" />
        </svg>
      )}

      {backgroundImage && (
        // Editor lặp ảnh nền theo chiều dọc, co giãn theo chiều ngang thiệp
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${backgroundImage.replace(/"/g, "%22")}")`,
            backgroundRepeat: "repeat-y",
            backgroundSize: "100% auto",
            backgroundPosition: "0 0",
          }}
        />
      )}

      {sorted.map((el) => {
        switch (el.type) {
          case "text":
            return <TextView key={el.id} element={el} />;
          case "image":
            return <ImageView key={el.id} element={el} />;
          case "shape":
            return <ShapeView key={el.id} element={el} />;
          case "widget":
            return <WidgetView key={el.id} element={el} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

/**
 * Trang xem thiệp: thu nhỏ thiệp vừa bề ngang màn hình (không phóng to quá kích thước thiết kế)
 * và gắn nút nhạc nền cố định ở góc.
 */
export const CardViewer: React.FC<CardRendererProps> = ({ canvasSettings, elements }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const { width, height } = canvasSettings;

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => setScale(Math.min(1, host.clientWidth / width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [width]);

  const s = scale ?? 1;
  const music = canvasSettings.backgroundMusic;
  const { fallingEffect, intro } = canvasSettings;

  // Hộp QR mừng cưới mở từ "Hành động khi bấm"
  const [giftOpen, setGiftOpen] = useState(false);
  useEffect(() => {
    const open = () => setGiftOpen(true);
    window.addEventListener(OPEN_GIFT_EVENT, open);
    return () => window.removeEventListener(OPEN_GIFT_EVENT, open);
  }, []);
  const gift = elements.find((el) => el.type === "widget" && el.widget === "giftQr");

  const viewer = { ...DEFAULT_VIEWER, ...canvasSettings.viewer };
  const interaction = { ...DEFAULT_INTERACTION, ...canvasSettings.interaction };
  const split = viewer.desktopLayout === "split";
  const { wishes, send } = useWishes();

  // Tự cuộn bắt đầu khi khách mở thiệp (hoặc sau 1.5s nếu không có màn chào)
  const [opened, setOpened] = useState(!intro);
  const [started, setStarted] = useState(false);
  const handleIntroDone = useCallback(() => setOpened(true), []);
  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => setStarted(true), intro ? 300 : 1500);
    return () => clearTimeout(timer);
  }, [opened, intro]);
  useAutoScroll(viewer.autoScroll, viewer.scrollSpeed, started);

  // Font của màn chào và bố cục máy tính
  useEffect(() => {
    if (intro || split) ["Great Vibes", "Cormorant Garamond"].forEach((font) => loadGoogleFont(font));
  }, [intro, split]);

  const card = (
    <div ref={hostRef} style={{ width: "100%", maxWidth: width, margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          width: width * s,
          height: height * s,
          visibility: scale === null ? "hidden" : undefined,
        }}
      >
        <div style={{ transform: `scale(${s})`, transformOrigin: "0 0", width, height }}>
          <CardRenderer canvasSettings={canvasSettings} elements={elements} />
        </div>

        {fallingEffect && <FallingEffectLayer effect={fallingEffect} scale={s} />}

        {music?.src && (
          // Bám theo góc phải của thiệp nhưng luôn nằm trong màn hình khi cuộn
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "sticky", top: 16, height: 0, display: "flex", justifyContent: "flex-end", paddingRight: 16 * s }}>
              <div style={{ pointerEvents: "auto" }}>
                <MusicButton music={music} scale={s} />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {split ? (
        <div className="wc-split" style={{ ["--wc-card-width" as string]: `${width}px` }}>
          <div className="wc-side-col">
            <SideInfo viewer={viewer} />
          </div>
          {card}
          <div className="wc-side-col">
            {interaction.enabled && interaction.wishes && <SideWishes wishes={wishes} />}
          </div>
        </div>
      ) : (
        card
      )}

      {interaction.enabled && (
        <>
          <InteractionBar
            settings={interaction}
            hasGift={!!gift}
            onSendWish={send}
            cardWidth={width * s}
          />
          {interaction.wishes && interaction.showWishesPublicly && (
            <FloatingWishes wishes={wishes} cardWidth={width * s} />
          )}
        </>
      )}

      {intro && <IntroOverlay intro={intro} onDone={handleIntroDone} />}
      {giftOpen && gift?.type === "widget" && (
        <GiftModal element={gift} onClose={() => setGiftOpen(false)} />
      )}
    </>
  );
};

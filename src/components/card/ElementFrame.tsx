"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimationType, EditorElement, ElementAnimation, TextElement } from "@/types/editor";
import { DEFAULT_APPEAR_DURATION } from "@/constants/animation";
import { OPEN_GIFT_EVENT, getClickAction, scrollToElement } from "./clickAction";

type Animation = ElementAnimation | undefined;

const BACK_EASE_OUT = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const SINE_IN_OUT = "cubic-bezier(0.37, 0, 0.63, 1)";
const SINE_OUT = "cubic-bezier(0.61, 1, 0.88, 1)";
const EASE_OUT = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

/** keyframes + easing của hiệu ứng xuất hiện (xem useElementAnimation trong editor). */
const APPEAR: Partial<Record<AnimationType, [keyframes: string, easing: string]>> = {
  fadeIn: ["wc-fade-in", "ease-in-out"],
  slideIn: ["wc-slide-up", BACK_EASE_OUT],
  slideUp: ["wc-slide-up", EASE_OUT],
  slideDown: ["wc-slide-down", EASE_OUT],
  slideLeft: ["wc-slide-left", EASE_OUT],
  slideRight: ["wc-slide-right", EASE_OUT],
  zoom: ["wc-zoom-in", BACK_EASE_OUT],
  bounce: ["wc-bounce-in", "linear"],
};

/** CSS animation tương ứng với hiệu ứng Konva của phần tử. */
const getAnimation = (animation: Animation): { css: string; appear: boolean } | null => {
  if (!animation?.enabled || animation.type === "none") return null;

  if (!animation.continuous) {
    const appear = APPEAR[animation.type];
    if (!appear) return null;
    const duration = animation.duration ?? DEFAULT_APPEAR_DURATION[animation.type] ?? 1;
    return {
      css: `${appear[0]} ${duration}s ${appear[1]} ${animation.delay ?? 0}s both`,
      appear: true,
    };
  }

  // Chu kỳ lấy từ Math.sin(frame.time * k) trong editor; delay âm để bắt đầu từ vị trí gốc
  const loop: Partial<Record<AnimationType, string>> = {
    pulse: `wc-pulse 628ms ${SINE_IN_OUT} -314ms infinite alternate`,
    shake: `wc-shake 314ms ${SINE_IN_OUT} -157ms infinite alternate`,
    bounce: `wc-float 628ms ${SINE_IN_OUT} -314ms infinite alternate`,
    fadeIn: `wc-breathe 785ms ${SINE_OUT} infinite alternate`,
  };
  const css = loop[animation.type];
  return css ? { css, appear: false } : null;
};

const LINK_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "block",
  cursor: "pointer",
};

/** Bọc phần tử theo "Hành động khi bấm": mở liên kết, gọi điện, cuộn tới phần tử, mở hộp quà. */
const withClickAction = (element: EditorElement, children: React.ReactNode) => {
  const action = getClickAction(element);
  switch (action.type) {
    case "link": {
      const href = safeHref(action.url);
      return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {children}
        </a>
      ) : (
        children
      );
    }
    case "call": {
      const phone = action.phone.replace(/[^d+]/g, "");
      return phone ? (
        <a href={`tel:${phone}`} style={LINK_STYLE}>
          {children}
        </a>
      ) : (
        children
      );
    }
    case "scroll":
      return (
        <a
          href={`#${action.targetId}`}
          style={LINK_STYLE}
          onClick={(e) => {
            e.preventDefault();
            scrollToElement(action.targetId);
          }}
        >
          {children}
        </a>
      );
    case "gift":
      return (
        <a
          href="#qr-mung-cuoi"
          style={LINK_STYLE}
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new Event(OPEN_GIFT_EVENT));
          }}
        >
          {children}
        </a>
      );
    default:
      return children;
  }
};

/** Chỉ cho phép liên kết an toàn (không cho javascript:, data:...). */
export const safeHref = (href: string | undefined): string | null => {
  if (!href) return null;
  const value = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(value)) return `https://${value}`;
  return null;
};

interface ElementFrameProps {
  element: EditorElement;
  width: number;
  height: number;
  children: React.ReactNode;
}

/**
 * Khung chung cho mọi phần tử: vị trí, xoay (quanh góc trên-trái như Konva), độ mờ,
 * hiệu ứng xuất hiện khi cuộn tới và liên kết.
 */
export const ElementFrame: React.FC<ElementFrameProps> = ({
  element,
  width,
  height,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const animation = getAnimation((element as TextElement).animation);
  const appear = animation?.appear ?? false;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!appear || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [appear]);

  const content = withClickAction(element, children);

  return (
    <>
      {/* Mốc vô hình để biết khi nào cuộn tới — không dùng chính phần tử vì lúc chờ nó đang
          ở khung hình đầu của hiệu ứng (vd. scale(0) thì không có diện tích để quan sát) */}
      {appear && (
        <div
          ref={ref}
          aria-hidden
          style={{
            position: "absolute",
            left: element.position.x,
            top: element.position.y,
            width,
            height,
            visibility: "hidden",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Lớp ngoài: vị trí + hiệu ứng (trong hệ toạ độ của thiệp, như node.x/y của Konva) */}
      <div
        data-el-id={element.id}
        className={animation ? "wc-anim" : undefined}
        style={{
          position: "absolute",
          left: element.position.x,
          top: element.position.y,
          width,
          height,
          zIndex: element.zIndex,
          transformOrigin: "0 0",
          animation: animation?.css,
          // Hiệu ứng xuất hiện đứng ở khung hình đầu tiên cho tới khi cuộn tới
          animationPlayState: appear && !inView ? "paused" : undefined,
        }}
      >
        {/* Lớp trong: xoay + độ mờ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "0 0",
            transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
            opacity: element.opacity,
          }}
        >
          {content}
        </div>
      </div>
    </>
  );
};

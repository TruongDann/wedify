"use client";

import React from "react";
import { TextElement } from "@/types/editor";
import { ElementFrame } from "./ElementFrame";
import { fillGuestName, useGuestName } from "./guestName";

/**
 * Hiển thị phần tử chữ bằng HTML/CSS.
 * Mỗi hiệu ứng được dựng bằng các lớp chữ chồng lên nhau, giống hệt cách
 * components/editor/elements/TextElement.tsx vẽ bằng Konva — khi sửa một bên, sửa cả bên kia.
 */

const DEFAULT_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_BORDER: TextElement["border"] = {
  width: 0,
  color: "#000000",
  style: "solid",
  position: "all",
};
const DEFAULT_SHADOW: TextElement["shadow"] = {
  enabled: false,
  x: 0,
  y: 4,
  blur: 8,
  color: "rgba(0,0,0,0.2)",
};
const DEFAULT_EFFECT: TextElement["textEffect"] = {
  type: "none",
  offset: 50,
  direction: -45,
  blur: 0,
  transparency: 40,
  color: "#000000",
  intensity: 50,
  spread: 50,
  roundness: 0,
  curveAmount: 0,
};

const calculateOffset = (offset: number, direction: number) => {
  const radians = (direction * Math.PI) / 180;
  return { x: Math.cos(radians) * offset, y: Math.sin(radians) * offset };
};

/** Màu kèm độ trong suốt (tương đương shadowOpacity của Konva), dùng được với mọi định dạng màu. */
const withAlpha = (color: string, alpha: number) =>
  alpha >= 1
    ? color
    : `color-mix(in srgb, ${color} ${Math.max(0, alpha) * 100}%, transparent)`;

const shadowCss = (x: number, y: number, blur: number, color: string) =>
  `${x}px ${y}px ${blur}px ${color}`;

interface LayerProps {
  x?: number;
  y?: number;
  fill?: string;
  stroke?: { width: number; color: string };
  opacity?: number;
  textShadow?: string;
}

const TextView: React.FC<{ element: TextElement }> = ({ element: raw }) => {
  // Thay {khách mời} bằng tên khách lấy từ link mời
  const guestName = useGuestName();
  const element = { ...raw, content: fillGuestName(raw.content, guestName) };
  const padding = element.padding || DEFAULT_PADDING;
  const border = element.border || DEFAULT_BORDER;
  const shadow = element.shadow || DEFAULT_SHADOW;
  const textEffect = element.textEffect || DEFAULT_EFFECT;
  const br = element.borderRadius || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

  const hasBackground = !!element.backgroundColor && element.backgroundColor !== "transparent";
  const hasBorder = border.width > 0 && border.style !== "none";
  const applyShadowToBox = shadow.enabled && (hasBackground || hasBorder);
  const applyShadowToText = shadow.enabled && !hasBackground && !hasBorder;

  const contentWidth = element.size.width;
  const contentHeight = element.size.height;
  const totalWidth = contentWidth + padding.left + padding.right;
  const totalHeight = contentHeight + padding.top + padding.bottom;

  const effectOpacity = 1 - textEffect.transparency / 100;
  const textShadowNormal = applyShadowToText
    ? shadowCss(shadow.x, shadow.y, shadow.blur, shadow.color)
    : undefined;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // verticalAlign="middle"
    textAlign: element.textAlign,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    fontFamily: `"${element.fontFamily}"`,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight >= 700 ? 700 : 400,
    fontStyle: element.fontStyle === "italic" ? "italic" : "normal",
    textDecoration: element.textDecoration !== "none" ? element.textDecoration : undefined,
    lineHeight: element.lineHeight,
    letterSpacing: element.letterSpacing,
  };

  const layer = (key: string, p: LayerProps) => (
    <div
      key={key}
      aria-hidden={key !== "main" || undefined}
      style={{
        ...baseStyle,
        color: p.fill ?? element.color,
        transform: p.x || p.y ? `translate(${p.x || 0}px, ${p.y || 0}px)` : undefined,
        opacity: p.opacity,
        textShadow: p.textShadow,
        WebkitTextStroke: p.stroke ? `${p.stroke.width}px ${p.stroke.color}` : undefined,
      }}
    >
      {element.content}
    </div>
  );

  const renderTextEffects = () => {
    switch (textEffect.type) {
      case "shadow": {
        const o = calculateOffset(textEffect.offset / 50, textEffect.direction);
        return layer("main", {
          textShadow: shadowCss(o.x, o.y, textEffect.blur / 20, withAlpha(textEffect.color, effectOpacity)),
        });
      }

      case "lift": {
        const intensity = textEffect.intensity / 100;
        return layer("main", {
          textShadow: shadowCss(0, 0, 1 + intensity * 5, withAlpha("rgba(0,0,0,0.6)", 0.3 + intensity * 0.7)),
        });
      }

      case "hollow": {
        const scale = Math.max(0.3, element.fontSize / 60);
        return layer("main", {
          fill: "transparent",
          stroke: { width: (0.5 + textEffect.intensity / 40) * scale, color: element.color },
        });
      }

      case "splice": {
        const scale = Math.max(0.3, element.fontSize / 60);
        const o = calculateOffset(textEffect.offset / 50, textEffect.direction);
        return [
          layer("back", { x: o.x, y: o.y, fill: textEffect.color, opacity: effectOpacity }),
          layer("main", {
            fill: "transparent",
            stroke: { width: (0.5 + textEffect.intensity / 40) * scale, color: element.color },
          }),
        ];
      }

      case "outline": {
        const scale = Math.max(0.3, element.fontSize / 60);
        return [
          layer("back", {
            fill: "transparent",
            stroke: { width: (0.8 + textEffect.intensity / 25) * scale, color: textEffect.color },
          }),
          layer("main", {}),
        ];
      }

      case "echo": {
        const o = calculateOffset(textEffect.offset / 50, textEffect.direction);
        return [
          ...[2, 1].map((i) =>
            layer(`echo-${i}`, { x: o.x * i, y: o.y * i, opacity: effectOpacity * (0.4 / i) }),
          ),
          layer("main", {}),
        ];
      }

      case "glitch": {
        const o = calculateOffset(textEffect.offset / 50, textEffect.direction);
        return [
          layer("red", { x: -o.x, y: -o.y, fill: "rgba(255,0,0,0.7)", opacity: effectOpacity }),
          layer("blue", { x: o.x, y: o.y, fill: "rgba(0,0,255,0.7)", opacity: effectOpacity }),
          layer("main", {}),
        ];
      }

      case "neon": {
        const v = Math.round((textEffect.intensity / 100) * 255);
        return [
          ...[4, 3, 2, 1].map((i) =>
            layer(`glow-${i}`, {
              fill: textEffect.color,
              opacity: effectOpacity * (0.2 / i),
              textShadow: shadowCss(0, 0, textEffect.blur * i + 5, textEffect.color),
            }),
          ),
          layer("main", {
            fill: `rgb(${v},${v},${v})`,
            textShadow: shadowCss(0, 0, textEffect.blur + 10, textEffect.color),
          }),
        ];
      }

      case "curve": {
        const curveAmount = textEffect.curveAmount || 0;
        const curveHeight = (curveAmount / 100) * (contentHeight * 0.8);
        let d: string;
        if (curveAmount === 0) {
          d = `M 0,${contentHeight / 2} L ${contentWidth},${contentHeight / 2}`;
        } else if (curveAmount > 0) {
          const startY = contentHeight * 0.7;
          d = `M 0,${startY} Q ${contentWidth / 2},${startY - Math.abs(curveHeight)} ${contentWidth},${startY}`;
        } else {
          const startY = contentHeight * 0.3;
          d = `M 0,${startY} Q ${contentWidth / 2},${startY + Math.abs(curveHeight)} ${contentWidth},${startY}`;
        }
        const pathId = `wc-curve-${element.id}`;
        const anchor =
          element.textAlign === "center"
            ? { offset: "50%", anchor: "middle" as const }
            : element.textAlign === "right"
              ? { offset: "100%", anchor: "end" as const }
              : { offset: "0%", anchor: "start" as const };
        return (
          <svg
            width={contentWidth}
            height={contentHeight}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "visible",
              filter: textShadowNormal
                ? `drop-shadow(${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color})`
                : undefined,
            }}
          >
            <path id={pathId} d={d} fill="none" />
            <text
              fill={element.color}
              fontFamily={`"${element.fontFamily}"`}
              fontSize={element.fontSize}
              fontWeight={element.fontWeight >= 700 ? 700 : 400}
              fontStyle={element.fontStyle === "italic" ? "italic" : "normal"}
              letterSpacing={element.letterSpacing}
              dominantBaseline="middle"
            >
              <textPath href={`#${pathId}`} startOffset={anchor.offset} textAnchor={anchor.anchor}>
                {element.content}
              </textPath>
            </text>
          </svg>
        );
      }

      case "none":
      default:
        return layer("main", { textShadow: textShadowNormal });
    }
  };

  const dash = border.style === "none" ? "solid" : border.style;
  const side = (s: TextElement["border"]["position"]) =>
    border.position === "all" || border.position === s
      ? `${border.width}px ${dash} ${border.color}`
      : undefined;

  return (
    <ElementFrame element={element} width={totalWidth} height={totalHeight}>
      {/* Nền + đổ bóng khung */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hasBackground ? element.backgroundColor : undefined,
          borderRadius: `${br.topLeft}px ${br.topRight}px ${br.bottomRight}px ${br.bottomLeft}px`,
          boxShadow: applyShadowToBox
            ? shadowCss(shadow.x, shadow.y, shadow.blur, shadow.color)
            : undefined,
        }}
      />

      {/* Viền: Konva vẽ nét nằm giữa mép khung, nên lớp viền lấn ra ngoài nửa độ dày */}
      {hasBorder && (
        <div
          style={{
            position: "absolute",
            inset: -border.width / 2,
            borderTop: side("top"),
            borderRight: side("right"),
            borderBottom: side("bottom"),
            borderLeft: side("left"),
            borderRadius:
              border.position === "all"
                ? `${br.topLeft + border.width / 2}px ${br.topRight + border.width / 2}px ${br.bottomRight + border.width / 2}px ${br.bottomLeft + border.width / 2}px`
                : undefined,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Vùng chữ */}
      <div
        style={{
          position: "absolute",
          left: padding.left,
          top: padding.top,
          width: contentWidth,
          height: contentHeight,
        }}
      >
        {renderTextEffects()}
      </div>
    </ElementFrame>
  );
};

export default TextView;

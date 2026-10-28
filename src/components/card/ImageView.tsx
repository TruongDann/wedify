"use client";

import React, { useState } from "react";
import { ImageElement } from "@/types/editor";
import { ElementFrame } from "./ElementFrame";

/** Hiển thị ảnh bằng HTML — tương ứng components/editor/elements/ImageElement.tsx. */
const ImageView: React.FC<{ element: ImageElement }> = ({ element }) => {
  // Konva lọc ảnh ở kích thước gốc; cần độ rộng gốc để quy đổi độ nhoè sang kích thước hiển thị
  const [naturalWidth, setNaturalWidth] = useState(0);

  const padding = element.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const br = element.borderRadius || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
  const border = element.border || { width: 0, color: "#000000", style: "solid", position: "all" };
  const shadow = element.shadow || { enabled: false, x: 0, y: 4, blur: 8, color: "rgba(0,0,0,0.2)" };
  const f = element.filters || { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0 };

  const { width, height } = element.size;
  const contentWidth = Math.max(width - padding.left - padding.right, 0);
  const contentHeight = Math.max(height - padding.top - padding.bottom, 0);
  const hasRadius = Math.max(br.topLeft, br.topRight, br.bottomLeft, br.bottomRight) > 0;
  const radius = `${br.topLeft}px ${br.topRight}px ${br.bottomRight}px ${br.bottomLeft}px`;

  const blur = f.blur > 0 && naturalWidth > 0 ? (f.blur * contentWidth) / naturalWidth : 0;
  const filters = [
    f.brightness !== 100 && `brightness(${f.brightness}%)`,
    f.contrast !== 100 && `contrast(${f.contrast}%)`,
    f.saturation !== 100 && `saturate(${f.saturation}%)`,
    blur > 0 && `blur(${blur}px)`,
    f.grayscale > 0 && `grayscale(${f.grayscale}%)`,
    // Ảnh lật bằng transform nên bóng cũng bị lật theo — đảo dấu trước để bóng rơi đúng hướng
    shadow.enabled &&
      `drop-shadow(${shadow.x * (element.flipX ? -1 : 1)}px ${shadow.y * (element.flipY ? -1 : 1)}px ${shadow.blur}px ${shadow.color})`,
  ].filter(Boolean);
  const flip =
    element.flipX || element.flipY
      ? `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})`
      : undefined;

  return (
    <ElementFrame element={element} width={width} height={height}>
      {/* Konva cắt cả nhóm theo bo góc (kể cả bóng) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: hasRadius ? "hidden" : "visible",
          borderRadius: hasRadius ? radius : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh do người dùng tải lên (data URL / URL ngoài) */}
        <img
          src={element.src}
          alt={element.alt || ""}
          draggable={false}
          loading="lazy"
          decoding="async"
          onLoad={(e) => setNaturalWidth(e.currentTarget.naturalWidth)}
          style={{
            position: "absolute",
            left: padding.left,
            top: padding.top,
            width: contentWidth,
            height: contentHeight,
            maxWidth: "none",
            objectFit: element.objectFit || "fill", // giống fitImage() trong ImageElement.tsx
            filter: filters.length ? filters.join(" ") : undefined,
            transform: flip,
          }}
        />

        {border.width > 0 && border.style !== "none" && (
          <div
            style={{
              position: "absolute",
              inset: -border.width / 2,
              border: `${border.width}px ${border.style} ${border.color}`,
              borderRadius: hasRadius
                ? `${br.topLeft + border.width / 2}px ${br.topRight + border.width / 2}px ${br.bottomRight + border.width / 2}px ${br.bottomLeft + border.width / 2}px`
                : undefined,
            }}
          />
        )}
      </div>
    </ElementFrame>
  );
};

export default ImageView;

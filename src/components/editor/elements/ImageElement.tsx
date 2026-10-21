"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Image, Rect, Group } from "react-konva";
import Konva from "konva";
import { ImageElement } from "@/types/editor";
import { runElementAnimation } from "../animation/elementAnimation";

/** Ảnh động (GIF / WebP động, vd. sticker Noto) cần vẽ lại canvas liên tục để chuyển động. */
const isAnimatedSource = (src: string) =>
  /\.gif($|\?)/i.test(src) || src.includes("fonts.gstatic.com/s/e/notoemoji/") || /^\/stock\/.+\.webp($|\?)/i.test(src);

interface ImageElementProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const ImageElementComponent: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const nodeRef = useRef<Konva.Node | null>(null);

  // Default values for new properties
  const padding = element.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const borderRadius = element.borderRadius || {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  };
  const border = element.border || {
    width: 0,
    color: "#000000",
    style: "solid",
    position: "all",
  };
  const shadow = element.shadow || {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.2)",
  };
  const filters = element.filters || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
  };

  // Calculate max border radius for clip function
  const maxRadius = Math.max(
    borderRadius.topLeft,
    borderRadius.topRight,
    borderRadius.bottomLeft,
    borderRadius.bottomRight,
  );

  // Calculate content dimensions (accounting for padding)
  const contentWidth = element.size.width - padding.left - padding.right;
  const contentHeight = element.size.height - padding.top - padding.bottom;

  const animatedSource = isAnimatedSource(element.src);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = element.src;
    img.onload = () => setImage(img);

    // Dự phòng: trình duyệt chỉ chạy khung hình của ảnh động khi ảnh nằm trong DOM và TRONG vùng nhìn thấy
    // (ảnh đặt ngoài màn hình sẽ bị tạm dừng), nên đặt 1px ở góc, gần như trong suốt, nằm dưới mọi thứ.
    if (animatedSource) {
      Object.assign(img.style, { position: "fixed", left: "0", top: "0", width: "1px", height: "1px", opacity: "0.01", zIndex: "-1", pointerEvents: "none" });
      document.body.appendChild(img);
    }
    return () => {
      if (img.parentNode) img.parentNode.removeChild(img);
    };
  }, [element.src, animatedSource]);

  // Cách chính: tự giải mã từng khung hình (WebCodecs ImageDecoder) rồi vẽ vào canvas riêng — không phụ thuộc vào
  // việc trình duyệt có chạy ảnh động hay không. Trình duyệt chưa hỗ trợ thì dùng cách dự phòng phía trên.
  const [frameCanvas, setFrameCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    setFrameCanvas(null);
    const Decoder = (window as unknown as { ImageDecoder?: any }).ImageDecoder;
    if (!animatedSource || !Decoder) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let decoder: any;

    (async () => {
      try {
        const res = await fetch(element.src);
        const type = /\.gif($|\?)/i.test(element.src) ? "image/gif" : "image/webp";
        decoder = new Decoder({ data: await res.arrayBuffer(), type });
        await decoder.tracks.ready;
        const frameCount: number = decoder.tracks.selectedTrack.frameCount;
        if (cancelled || frameCount < 2) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let index = 0;
        const step = async () => {
          if (cancelled) return;
          const { image: frame } = await decoder.decode({ frameIndex: index });
          if (cancelled) {
            frame.close();
            return;
          }
          if (canvas.width !== frame.displayWidth) {
            canvas.width = frame.displayWidth;
            canvas.height = frame.displayHeight;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frame, 0, 0);
          const delay = Math.max(20, (frame.duration ?? 100000) / 1000);
          frame.close();
          if (index === 0) setFrameCanvas(canvas);
          nodeRef.current?.getLayer()?.batchDraw();
          index = (index + 1) % frameCount;
          timer = setTimeout(step, delay);
        };
        await step();
      } catch {
        // Giữ cách dự phòng (thẻ img trong DOM)
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      try {
        decoder?.close();
      } catch {
        /* bỏ qua */
      }
    };
  }, [element.src, animatedSource]);

  // Cách dự phòng: vẽ lại lớp ~15 khung/giây để ảnh động chuyển động (không vẽ nhanh hơn để đỡ tốn pin)
  useEffect(() => {
    const layer = nodeRef.current?.getLayer();
    if (!animatedSource || !image || frameCanvas || !layer) return;
    let last = 0;
    const loop = new Konva.Animation((frame) => {
      if (!frame) return false;
      if (frame.time - last < 66) return false;
      last = frame.time;
      return true;
    }, layer);
    loop.start();
    return () => {
      loop.stop();
    };
  }, [animatedSource, image, frameCanvas]);

  // Apply filters to image using canvas
  const filteredImage = useMemo(() => {
    if (!image) return null;

    // Check if any filter is applied
    const hasFilters =
      filters.brightness !== 100 ||
      filters.contrast !== 100 ||
      filters.saturation !== 100 ||
      filters.blur > 0 ||
      filters.grayscale > 0;

    // Ảnh động không áp bộ lọc (bộ lọc chụp lại 1 khung hình duy nhất)
    if (!hasFilters || animatedSource) return image;

    // Create a canvas to apply filters
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return image;

    // Apply CSS filters
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      grayscale(${filters.grayscale}%)
    `;
    ctx.drawImage(image, 0, 0);

    // Convert canvas to image
    const filteredImg = new window.Image();
    filteredImg.src = canvas.toDataURL();
    return filteredImg;
  }, [image, filters, animatedSource]);

  // Calculate border dash pattern based on style
  const getBorderDash = () => {
    switch (border.style) {
      case "dashed":
        return [10, 5];
      case "dotted":
        return [2, 2];
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    return runElementAnimation(
      node,
      {
        x: element.position.x,
        y: element.position.y,
        opacity: element.opacity,
        rotation: element.rotation,
        width: element.size.width,
        height: element.size.height,
      },
      element.animation,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.animation?.enabled, element.animation?.continuous, element.animation?.type, element.animation?.delay, element.position.x, element.position.y, element.rotation, element.opacity, element.size.width, element.size.height, image]);

  if (!image) {
    // Placeholder while loading
    return (
      <Rect
        id={element.id}
        x={element.position.x}
        y={element.position.y}
        width={element.size.width}
        height={element.size.height}
        fill="#f0f0f0"
        stroke="#d9d9d9"
        strokeWidth={1}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
      />
    );
  }

  return (
    <Group
      ref={nodeRef as any}
      id={element.id}
      x={element.position.x}
      y={element.position.y}
      width={element.size.width}
      height={element.size.height}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      clipFunc={
        maxRadius > 0
          ? (ctx) => {
              const width = element.size.width;
              const height = element.size.height;
              ctx.beginPath();
              ctx.moveTo(borderRadius.topLeft, 0);
              ctx.lineTo(width - borderRadius.topRight, 0);
              ctx.quadraticCurveTo(width, 0, width, borderRadius.topRight);
              ctx.lineTo(width, height - borderRadius.bottomRight);
              ctx.quadraticCurveTo(
                width,
                height,
                width - borderRadius.bottomRight,
                height,
              );
              ctx.lineTo(borderRadius.bottomLeft, height);
              ctx.quadraticCurveTo(
                0,
                height,
                0,
                height - borderRadius.bottomLeft,
              );
              ctx.lineTo(0, borderRadius.topLeft);
              ctx.quadraticCurveTo(0, 0, borderRadius.topLeft, 0);
              ctx.closePath();
            }
          : undefined
      }
    >
      {/* Background/padding area */}
      {(padding.top > 0 ||
        padding.right > 0 ||
        padding.bottom > 0 ||
        padding.left > 0) && (
        <Rect
          width={element.size.width}
          height={element.size.height}
          fill="transparent"
        />
      )}

      {/* Image with shadow */}
      <Image
        x={padding.left}
        y={padding.top}
        image={frameCanvas || filteredImage || image}
        width={Math.max(contentWidth, 0)}
        height={Math.max(contentHeight, 0)}
        shadowColor={shadow.enabled ? shadow.color : undefined}
        shadowBlur={shadow.enabled ? shadow.blur : 0}
        shadowOffsetX={shadow.enabled ? shadow.x : 0}
        shadowOffsetY={shadow.enabled ? shadow.y : 0}
        shadowEnabled={shadow.enabled}
      />

      {/* Border */}
      {border.width > 0 && border.style !== "none" && (
        <Rect
          width={element.size.width}
          height={element.size.height}
          stroke={border.color}
          strokeWidth={border.width}
          dash={getBorderDash()}
          cornerRadius={[
            borderRadius.topLeft,
            borderRadius.topRight,
            borderRadius.bottomRight,
            borderRadius.bottomLeft,
          ]}
        />
      )}
    </Group>
  );
};

export default ImageElementComponent;

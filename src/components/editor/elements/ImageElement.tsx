"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Image, Rect, Group } from "react-konva";
import Konva from "konva";
import { ImageElement } from "@/types/editor";
import { useElementAnimation } from "../hooks/useElementAnimation";

/** Vị trí ảnh trong khung theo objectFit (cover cắt bớt, contain chừa lề, fill kéo giãn). */
export const fitImage = (
  objectFit: ImageElement["objectFit"] | undefined,
  natural: { width: number; height: number },
  box: { width: number; height: number },
) => {
  if (objectFit === "cover" && natural.width > 0 && natural.height > 0) {
    const scale = Math.max(box.width / natural.width, box.height / natural.height);
    const width = box.width / scale;
    const height = box.height / scale;
    return {
      x: 0,
      y: 0,
      width: box.width,
      height: box.height,
      crop: { x: (natural.width - width) / 2, y: (natural.height - height) / 2, width, height },
    };
  }
  if (objectFit === "contain" && natural.width > 0 && natural.height > 0) {
    const scale = Math.min(box.width / natural.width, box.height / natural.height);
    const width = natural.width * scale;
    const height = natural.height * scale;
    return { x: (box.width - width) / 2, y: (box.height - height) / 2, width, height, crop: undefined };
  }
  return { x: 0, y: 0, width: box.width, height: box.height, crop: undefined };
};

interface ImageElementProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const ImageElementComponent: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const groupRef = useRef<Konva.Group>(null);
  useElementAnimation(groupRef, element, !!image);

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

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = element.src;
    img.onload = () => setImage(img);
  }, [element.src]);

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

    if (!hasFilters) return image;

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
  }, [image, filters]);

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

  const fit = fitImage(
    element.objectFit,
    { width: image?.naturalWidth ?? 0, height: image?.naturalHeight ?? 0 },
    { width: Math.max(contentWidth, 0), height: Math.max(contentHeight, 0) },
  );

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
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
      />
    );
  }

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.position.x}
      y={element.position.y}
      width={element.size.width}
      height={element.size.height}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
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
        x={padding.left + fit.x}
        y={padding.top + fit.y}
        image={filteredImage || image}
        width={fit.width}
        height={fit.height}
        crop={fit.crop}
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

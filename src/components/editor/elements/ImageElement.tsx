"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Image, Rect, Group } from "react-konva";
import Konva from "konva";
import { ImageElement } from "@/types/editor";

interface ImageElementProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const ImageElementComponent: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

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
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
      />
    );
  }

  return (
    <Group
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
        image={filteredImage || image}
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

"use client";

import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = element.src;
    img.onload = () => setImage(img);
  }, [element.src]);

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
        element.borderRadius > 0
          ? (ctx) => {
              const radius = element.borderRadius;
              const width = element.size.width;
              const height = element.size.height;
              ctx.beginPath();
              ctx.moveTo(radius, 0);
              ctx.lineTo(width - radius, 0);
              ctx.quadraticCurveTo(width, 0, width, radius);
              ctx.lineTo(width, height - radius);
              ctx.quadraticCurveTo(width, height, width - radius, height);
              ctx.lineTo(radius, height);
              ctx.quadraticCurveTo(0, height, 0, height - radius);
              ctx.lineTo(0, radius);
              ctx.quadraticCurveTo(0, 0, radius, 0);
              ctx.closePath();
            }
          : undefined
      }
    >
      <Image
        image={image}
        width={element.size.width}
        height={element.size.height}
        shadowColor={element.shadow.color}
        shadowBlur={element.shadow.blur}
        shadowOffsetX={element.shadow.x}
        shadowOffsetY={element.shadow.y}
      />
      {element.border.width > 0 && (
        <Rect
          width={element.size.width}
          height={element.size.height}
          stroke={element.border.color}
          strokeWidth={element.border.width}
          cornerRadius={element.borderRadius}
        />
      )}
    </Group>
  );
};

export default ImageElementComponent;

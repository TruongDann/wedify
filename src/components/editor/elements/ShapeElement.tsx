"use client";

import React from "react";
import { Rect, Circle, Ellipse, Line, Star, Shape } from "react-konva";
import Konva from "konva";
import { ShapeElement } from "@/types/editor";

interface ShapeElementProps {
  element: ShapeElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const ShapeElementComponent: React.FC<ShapeElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  // Default shadow values
  const shadow = element.shadow || {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.2)",
  };

  const commonProps = {
    id: element.id,
    x: element.position.x,
    y: element.position.y,
    rotation: element.rotation,
    opacity: element.opacity,
    draggable: !element.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd,
    onTransformEnd,
    fill: element.fill,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
    // Shadow properties
    shadowEnabled: shadow.enabled,
    shadowColor: shadow.color,
    shadowBlur: shadow.blur,
    shadowOffsetX: shadow.x,
    shadowOffsetY: shadow.y,
  };

  switch (element.shapeType) {
    case "rectangle":
      return (
        <Rect
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
        />
      );

    case "circle":
      return (
        <Ellipse
          {...commonProps}
          offsetX={-element.size.width / 2}
          offsetY={-element.size.height / 2}
          radiusX={element.size.width / 2}
          radiusY={element.size.height / 2}
        />
      );

    case "triangle":
      return (
        <Line
          {...commonProps}
          points={[
            element.size.width / 2,
            0,
            element.size.width,
            element.size.height,
            0,
            element.size.height,
          ]}
          closed
        />
      );

    case "star":
      return (
        <Star
          {...commonProps}
          offsetX={-element.size.width / 2}
          offsetY={-element.size.height / 2}
          numPoints={5}
          innerRadius={element.size.width / 4}
          outerRadius={element.size.width / 2}
        />
      );

    case "heart":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const width = element.size.width;
            const height = element.size.height;

            context.beginPath();
            context.moveTo(width / 2, height);

            // Left side of heart
            context.bezierCurveTo(
              width / 4,
              height,
              0,
              height * 0.65,
              0,
              height * 0.35,
            );
            context.bezierCurveTo(0, 0, width / 2, 0, width / 2, height * 0.35);

            // Right side of heart
            context.bezierCurveTo(width / 2, 0, width, 0, width, height * 0.35);
            context.bezierCurveTo(
              width,
              height * 0.65,
              width * 0.75,
              height,
              width / 2,
              height,
            );

            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "line":
      return (
        <Line
          {...commonProps}
          points={[0, 0, element.size.width, 0]}
          hitStrokeWidth={Math.max(20, element.strokeWidth)}
        />
      );

    case "diamond":
      return (
        <Line
          {...commonProps}
          points={[
            element.size.width / 2,
            0,
            element.size.width,
            element.size.height / 2,
            element.size.width / 2,
            element.size.height,
            0,
            element.size.height / 2,
          ]}
          closed
        />
      );

    case "pentagon":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const w = element.size.width;
            const h = element.size.height;
            const cx = w / 2;
            const cy = h / 2;
            const r = Math.min(w, h) / 2;
            context.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              if (i === 0) context.moveTo(x, y);
              else context.lineTo(x, y);
            }
            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "hexagon":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const w = element.size.width;
            const h = element.size.height;
            const cx = w / 2;
            const cy = h / 2;
            const r = Math.min(w, h) / 2;
            context.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              if (i === 0) context.moveTo(x, y);
              else context.lineTo(x, y);
            }
            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "arrow":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const w = element.size.width;
            const h = element.size.height;
            context.beginPath();
            context.moveTo(0, h * 0.3);
            context.lineTo(w * 0.6, h * 0.3);
            context.lineTo(w * 0.6, 0);
            context.lineTo(w, h / 2);
            context.lineTo(w * 0.6, h);
            context.lineTo(w * 0.6, h * 0.7);
            context.lineTo(0, h * 0.7);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "cloud":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const w = element.size.width;
            const h = element.size.height;
            context.beginPath();
            context.moveTo(w * 0.25, h * 0.6);
            context.arc(
              w * 0.25,
              h * 0.5,
              w * 0.15,
              Math.PI * 0.5,
              Math.PI * 1.5,
            );
            context.arc(w * 0.45, h * 0.35, w * 0.2, Math.PI, Math.PI * 1.8);
            context.arc(
              w * 0.7,
              h * 0.4,
              w * 0.18,
              Math.PI * 1.3,
              Math.PI * 0.3,
            );
            context.arc(
              w * 0.75,
              h * 0.55,
              w * 0.12,
              Math.PI * 1.5,
              Math.PI * 0.5,
            );
            context.lineTo(w * 0.25, h * 0.6);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "speechBubble":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const w = element.size.width;
            const h = element.size.height;
            const r = Math.min(w, h) * 0.1;
            context.beginPath();
            context.moveTo(r, 0);
            context.lineTo(w - r, 0);
            context.quadraticCurveTo(w, 0, w, r);
            context.lineTo(w, h * 0.65 - r);
            context.quadraticCurveTo(w, h * 0.65, w - r, h * 0.65);
            context.lineTo(w * 0.35, h * 0.65);
            context.lineTo(w * 0.2, h);
            context.lineTo(w * 0.25, h * 0.65);
            context.lineTo(r, h * 0.65);
            context.quadraticCurveTo(0, h * 0.65, 0, h * 0.65 - r);
            context.lineTo(0, r);
            context.quadraticCurveTo(0, 0, r, 0);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "cross":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const w = element.size.width;
            const h = element.size.height;
            const t = 0.3; // thickness ratio
            context.beginPath();
            context.moveTo(w * t, 0);
            context.lineTo(w * (1 - t), 0);
            context.lineTo(w * (1 - t), h * t);
            context.lineTo(w, h * t);
            context.lineTo(w, h * (1 - t));
            context.lineTo(w * (1 - t), h * (1 - t));
            context.lineTo(w * (1 - t), h);
            context.lineTo(w * t, h);
            context.lineTo(w * t, h * (1 - t));
            context.lineTo(0, h * (1 - t));
            context.lineTo(0, h * t);
            context.lineTo(w * t, h * t);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "ring":
      return (
        <Shape
          {...commonProps}
          width={element.size.width}
          height={element.size.height}
          sceneFunc={(context, shape) => {
            const w = element.size.width;
            const h = element.size.height;
            const cx = w / 2;
            const cy = h / 2;
            const outerR = Math.min(w, h) / 2;
            const innerR = outerR * 0.6;
            context.beginPath();
            context.arc(cx, cy, outerR, 0, Math.PI * 2);
            context.arc(cx, cy, innerR, 0, Math.PI * 2, true);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    default:
      return null;
  }
};

export default ShapeElementComponent;

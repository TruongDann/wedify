"use client";

import React from "react";
import { Rect, Circle, Line, Star, Shape } from "react-konva";
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
        <Circle
          {...commonProps}
          x={element.position.x + element.size.width / 2}
          y={element.position.y + element.size.height / 2}
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
          x={element.position.x + element.size.width / 2}
          y={element.position.y + element.size.height / 2}
          numPoints={5}
          innerRadius={element.size.width / 4}
          outerRadius={element.size.width / 2}
        />
      );

    case "heart":
      return (
        <Shape
          {...commonProps}
          sceneFunc={(context, shape) => {
            const width = element.size.width;
            const height = element.size.height;
            const topCurveHeight = height * 0.3;

            context.beginPath();
            context.moveTo(width / 2, height);

            // Left side of heart
            context.bezierCurveTo(
              0,
              height - topCurveHeight,
              0,
              0,
              width / 2,
              topCurveHeight
            );

            // Right side of heart
            context.bezierCurveTo(
              width,
              0,
              width,
              height - topCurveHeight,
              width / 2,
              height
            );

            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      );

    case "line":
      return <Line {...commonProps} points={[0, 0, element.size.width, 0]} />;

    default:
      return null;
  }
};

export default ShapeElementComponent;

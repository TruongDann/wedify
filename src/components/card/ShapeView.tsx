"use client";

import React from "react";
import { ShapeElement } from "@/types/editor";
import { ElementFrame } from "./ElementFrame";
import { getShapePath } from "./shapePaths";

/** Hiển thị hình khối bằng SVG — tương ứng components/editor/elements/ShapeElement.tsx. */
const ShapeView: React.FC<{ element: ShapeElement }> = ({ element }) => {
  const { width, height } = element.size;
  const d = getShapePath(element.shapeType, width, height);
  if (!d) return null;

  const shadow = element.shadow;
  const isLine = element.shapeType === "line";

  return (
    <ElementFrame element={element} width={width} height={height}>
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          filter: shadow?.enabled
            ? `drop-shadow(${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color})`
            : undefined,
        }}
      >
        <path
          d={d}
          fill={isLine ? "none" : element.fill || "none"}
          stroke={element.stroke || "none"}
          strokeWidth={element.strokeWidth}
        />
      </svg>
    </ElementFrame>
  );
};

export default ShapeView;

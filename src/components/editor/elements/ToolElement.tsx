"use client";

import React, { useContext, useRef } from "react";
import { Group, Rect } from "react-konva";
import Konva from "konva";
import { Html } from "react-konva-utils";
import type { ToolElement } from "@/types/editor";
import { useElementAnimation } from "../hooks/useElementAnimation";
import { ViewerContext } from "../ViewerContext";
import { DOM_TOOLS } from "../widgets/DomWidgets";

interface ToolElementProps {
  element: ToolElement;
  isSelected: boolean;
  onSelect: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

/**
 * Tiện ích mở rộng dạng HTML (thẻ liên hệ, sổ lưu bút) đặt vào canvas bằng <Html>.
 * Ở editor chuột đi xuyên qua để chọn/kéo được; ở trang xuất bản các thành phần bấm/nhập được.
 */
const ToolElementComponent: React.FC<ToolElementProps> = ({ element, onSelect, onDragStart, onDragMove, onDragEnd, onTransformEnd }) => {
  const groupRef = useRef<Konva.Group>(null);
  const viewer = useContext(ViewerContext);
  const { width, height } = element.size;
  const props = element.props ?? {};

  useElementAnimation(groupRef, element);

  const Dom = DOM_TOOLS[element.tool];

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.position.x}
      y={element.position.y}
      width={width}
      height={height}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      onClick={(e) => {
        if (!viewer) onSelect(e);
      }}
      onTap={(e) => {
        if (!viewer) onSelect(e);
      }}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {/* Vùng bắt chuột trong suốt để chọn/kéo được phần tử ở editor */}
      <Rect width={width} height={height} fill="rgba(0,0,0,0.001)" />
      {Dom ? (
        <Html divProps={{ style: { pointerEvents: viewer ? "auto" : "none" } }}>
          <Dom p={props} w={width} h={height} viewer={viewer} />
        </Html>
      ) : null}
    </Group>
  );
};

export default ToolElementComponent;

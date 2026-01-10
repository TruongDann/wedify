"use client";

import React, { useRef, useMemo } from "react";
import { Text, Group, Rect, Line } from "react-konva";
import Konva from "konva";
import { TextElement } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";

interface TextElementProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const TextElementComponent: React.FC<TextElementProps> = ({
  element,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const { updateElement } = useEditorStore();

  // Get default values for new properties
  const padding = element.padding || { top: 0, right: 0, bottom: 0, left: 0 };
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

  // Calculate corner radius array for Konva [topLeft, topRight, bottomRight, bottomLeft]
  const cornerRadiusArray = useMemo(() => {
    const br = element.borderRadius || {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };
    return [br.topLeft, br.topRight, br.bottomRight, br.bottomLeft];
  }, [element.borderRadius]);

  // Calculate border dash pattern based on style
  const borderDash = useMemo(() => {
    switch (border.style) {
      case "dashed":
        return [10, 5];
      case "dotted":
        return [2, 2];
      default:
        return [];
    }
  }, [border.style]);

  const handleDblClick = () => {
    if (!textRef.current || !groupRef.current) return;

    const groupNode = groupRef.current;
    const stage = groupNode.getStage();
    if (!stage) return;

    // Hide group
    groupNode.hide();

    // Create textarea over canvas
    const absPos = groupNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stage.scaleX();

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    textarea.value = element.content;
    textarea.style.position = "absolute";
    textarea.style.top = `${stageBox.top + absPos.y * scale}px`;
    textarea.style.left = `${stageBox.left + absPos.x * scale}px`;
    textarea.style.width = `${element.size.width * scale}px`;
    textarea.style.height = `${element.size.height * scale}px`;
    textarea.style.fontSize = `${element.fontSize * scale}px`;
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.fontWeight = String(element.fontWeight);
    textarea.style.fontStyle = element.fontStyle;
    textarea.style.color = element.color;
    textarea.style.textAlign = element.textAlign;
    textarea.style.border = "2px solid #ec4899";
    textarea.style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    textarea.style.margin = "0px";
    textarea.style.overflow = "hidden";
    textarea.style.background =
      element.backgroundColor === "transparent"
        ? "rgba(255,255,255,0.9)"
        : element.backgroundColor;
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.lineHeight = String(element.lineHeight);
    textarea.style.letterSpacing = `${element.letterSpacing}px`;
    textarea.style.transformOrigin = "left top";
    textarea.style.transform = `rotate(${element.rotation}deg)`;
    textarea.style.zIndex = "1000";
    textarea.style.boxSizing = "border-box";

    textarea.focus();
    textarea.select();

    const removeTextarea = () => {
      textarea.remove();
      groupNode.show();
      stage.batchDraw();
    };

    textarea.addEventListener("blur", () => {
      updateElement(element.id, { content: textarea.value });
      removeTextarea();
    });

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        removeTextarea();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        updateElement(element.id, { content: textarea.value });
        removeTextarea();
      }
    });
  };

  // Check if background should be visible
  const hasBackground =
    element.backgroundColor && element.backgroundColor !== "transparent";
  const hasBorder = border.width > 0 && border.style !== "none";
  const hasShadow = shadow.enabled;

  // Calculate total size including padding
  const totalWidth = element.size.width + padding.left + padding.right;
  const totalHeight = element.size.height + padding.top + padding.bottom;

  // Content area (where text lives) = original element size
  const contentWidth = element.size.width;
  const contentHeight = element.size.height;

  // Text is positioned at padding offset
  // The align property will handle horizontal alignment WITHIN the text box
  // verticalAlign handles vertical alignment WITHIN the text box
  const textX = padding.left;
  const textY = padding.top;

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.position.x}
      y={element.position.y}
      width={totalWidth}
      height={totalHeight}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {/* Background Rect with shadow, border (if all), and fill */}
      <Rect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        fill={hasBackground ? element.backgroundColor : "transparent"}
        cornerRadius={cornerRadiusArray}
        stroke={
          hasBorder && border.position === "all" ? border.color : undefined
        }
        strokeWidth={hasBorder && border.position === "all" ? border.width : 0}
        dash={borderDash}
        shadowEnabled={hasShadow}
        shadowColor={hasShadow ? shadow.color : undefined}
        shadowBlur={hasShadow ? shadow.blur : 0}
        shadowOffsetX={hasShadow ? shadow.x : 0}
        shadowOffsetY={hasShadow ? shadow.y : 0}
        shadowOpacity={hasShadow ? 0.5 : 0}
      />

      {/* Partial Borders */}
      {hasBorder && border.position === "top" && (
        <Line
          points={[0, 0, totalWidth, 0]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}
      {hasBorder && border.position === "bottom" && (
        <Line
          points={[0, totalHeight, totalWidth, totalHeight]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}
      {hasBorder && border.position === "left" && (
        <Line
          points={[0, 0, 0, totalHeight]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}
      {hasBorder && border.position === "right" && (
        <Line
          points={[totalWidth, 0, totalWidth, totalHeight]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}

      {/* Text - Konva Text supports:
          - align: "left" | "center" | "right" (horizontal within width)
          - verticalAlign: "top" | "middle" | "bottom" (vertical within height)
      */}
      <Text
        ref={textRef}
        x={textX}
        y={textY}
        width={contentWidth}
        height={contentHeight}
        text={element.content}
        fontFamily={element.fontFamily}
        fontSize={element.fontSize}
        fontStyle={
          `${element.fontWeight >= 700 ? "bold" : ""} ${
            element.fontStyle === "italic" ? "italic" : ""
          }`.trim() || "normal"
        }
        textDecoration={
          element.textDecoration !== "none" ? element.textDecoration : ""
        }
        fill={element.color}
        align={element.textAlign}
        verticalAlign="middle"
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        wrap="word"
      />
    </Group>
  );
};

export default TextElementComponent;

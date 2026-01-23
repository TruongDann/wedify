"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Transformer, Line } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/store/editorStore";
import TextElementComponent from "./elements/TextElement";
import ImageElementComponent from "./elements/ImageElement";
import ShapeElementComponent from "./elements/ShapeElement";
import { EditorElement } from "@/types/editor";

interface EditorCanvasProps {
  canvasHeight?: number;
}

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  startX: number;
  startY: number;
}

interface GuideLine {
  points: number[];
  orientation: "horizontal" | "vertical";
}

const SNAP_THRESHOLD = 5; // Distance in pixels to snap

const EditorCanvas: React.FC<EditorCanvasProps> = ({ canvasHeight }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Marquee selection state
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
    startX: 0,
    startY: 0,
  });
  const isSelecting = useRef(false);

  // Alignment guides state
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const isDragging = useRef(false);

  const {
    canvasSettings,
    elements,
    selectedElementId,
    selectedElementIds,
    selectElement,
    selectElements,
    addToSelection,
    updateElement,
    moveElement,
    resizeElement,
  } = useEditorStore();

  // Use canvasHeight prop if provided, otherwise use canvasSettings.height
  const effectiveHeight = canvasHeight || canvasSettings.height;

  // Load background image
  const [bgImage, setBgImage] = React.useState<HTMLImageElement | null>(null);
  const bgImageSrc = canvasSettings.backgroundImage;

  useEffect(() => {
    // Reset bgImage when src changes to null
    if (!bgImageSrc) {
      setBgImage(null);
      return;
    }

    let isMounted = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = bgImageSrc;
    img.onload = () => {
      if (isMounted) setBgImage(img);
    };

    return () => {
      isMounted = false;
    };
  }, [bgImageSrc]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const transformer = transformerRef.current;

    // Support multi-selection
    if (selectedElementIds.length > 0) {
      const selectedNodes = selectedElementIds
        .map((id) => stage.findOne(`#${id}`))
        .filter((node): node is Konva.Node => node !== null);

      if (selectedNodes.length > 0) {
        transformer.nodes(selectedNodes);
        transformer.getLayer()?.batchDraw();
      }
    } else if (selectedElementId) {
      const selectedNode = stage.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedElementId, selectedElementIds, elements]);

  // Check if element intersects with selection box
  const isElementInSelectionBox = useCallback(
    (element: EditorElement, box: SelectionBox) => {
      const elLeft = element.position.x;
      const elTop = element.position.y;
      const elRight = element.position.x + element.size.width;
      const elBottom = element.position.y + element.size.height;

      const boxLeft = Math.min(box.x, box.x + box.width);
      const boxTop = Math.min(box.y, box.y + box.height);
      const boxRight = Math.max(box.x, box.x + box.width);
      const boxBottom = Math.max(box.y, box.y + box.height);

      // Check if rectangles intersect
      return !(
        elRight < boxLeft ||
        elLeft > boxRight ||
        elBottom < boxTop ||
        elTop > boxBottom
      );
    },
    [],
  );

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only start selection when clicking on empty area (stage or background)
    if (e.target === e.target.getStage() || e.target.name() === "background") {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      isSelecting.current = true;
      setSelectionBox({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        visible: true,
        startX: pos.x,
        startY: pos.y,
      });

      // Clear selection when starting new marquee
      selectElement(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isSelecting.current) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setSelectionBox((prev) => ({
      ...prev,
      x: Math.min(pos.x, prev.startX),
      y: Math.min(pos.y, prev.startY),
      width: Math.abs(pos.x - prev.startX),
      height: Math.abs(pos.y - prev.startY),
    }));
  };

  const handleMouseUp = () => {
    if (!isSelecting.current) return;

    isSelecting.current = false;

    // Find elements within selection box
    if (selectionBox.width > 5 || selectionBox.height > 5) {
      const selectedIds = elements
        .filter((el) => isElementInSelectionBox(el, selectionBox))
        .map((el) => el.id);

      if (selectedIds.length > 0) {
        selectElements(selectedIds);
      }
    }

    setSelectionBox((prev) => ({
      ...prev,
      visible: false,
      width: 0,
      height: 0,
    }));
  };

  const handleStageClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    // Don't clear selection if we just finished marquee selection
    if (selectionBox.width > 5 || selectionBox.height > 5) return;

    if (e.target === e.target.getStage() || e.target.name() === "background") {
      selectElement(null);
    }
  };

  // Calculate snap lines for alignment guides
  const getSnapLines = useCallback(
    (draggedId: string, draggedNode: Konva.Node) => {
      const newGuides: GuideLine[] = [];
      const canvasWidth = canvasSettings.width;
      const canvasHeight = effectiveHeight;

      // Get dragged element bounds
      const draggedBox = {
        x: draggedNode.x(),
        y: draggedNode.y(),
        width: draggedNode.width() * draggedNode.scaleX(),
        height: draggedNode.height() * draggedNode.scaleY(),
      };

      const draggedLeft = draggedBox.x;
      const draggedRight = draggedBox.x + draggedBox.width;
      const draggedTop = draggedBox.y;
      const draggedBottom = draggedBox.y + draggedBox.height;
      const draggedCenterX = draggedBox.x + draggedBox.width / 2;
      const draggedCenterY = draggedBox.y + draggedBox.height / 2;

      // Canvas center lines
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      // Check canvas center vertical line
      if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [canvasCenterX, 0, canvasCenterX, canvasHeight],
          orientation: "vertical",
        });
        draggedNode.x(canvasCenterX - draggedBox.width / 2);
      }

      // Check canvas center horizontal line
      if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, canvasCenterY, canvasWidth, canvasCenterY],
          orientation: "horizontal",
        });
        draggedNode.y(canvasCenterY - draggedBox.height / 2);
      }

      // Check canvas edges
      // Left edge
      if (Math.abs(draggedLeft) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, 0, 0, canvasHeight],
          orientation: "vertical",
        });
        draggedNode.x(0);
      }
      // Right edge
      if (Math.abs(draggedRight - canvasWidth) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [canvasWidth, 0, canvasWidth, canvasHeight],
          orientation: "vertical",
        });
        draggedNode.x(canvasWidth - draggedBox.width);
      }
      // Top edge
      if (Math.abs(draggedTop) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, 0, canvasWidth, 0],
          orientation: "horizontal",
        });
        draggedNode.y(0);
      }
      // Bottom edge
      if (Math.abs(draggedBottom - canvasHeight) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, canvasHeight, canvasWidth, canvasHeight],
          orientation: "horizontal",
        });
        draggedNode.y(canvasHeight - draggedBox.height);
      }

      // Check alignment with other elements
      elements.forEach((el) => {
        if (el.id === draggedId) return;

        const elLeft = el.position.x;
        const elRight = el.position.x + el.size.width;
        const elTop = el.position.y;
        const elBottom = el.position.y + el.size.height;
        const elCenterX = el.position.x + el.size.width / 2;
        const elCenterY = el.position.y + el.size.height / 2;

        // Vertical alignments (left, center, right)
        // Left to left
        if (Math.abs(draggedLeft - elLeft) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              elLeft,
              Math.min(draggedTop, elTop) - 10,
              elLeft,
              Math.max(draggedBottom, elBottom) + 10,
            ],
            orientation: "vertical",
          });
          draggedNode.x(elLeft);
        }
        // Right to right
        if (Math.abs(draggedRight - elRight) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              elRight,
              Math.min(draggedTop, elTop) - 10,
              elRight,
              Math.max(draggedBottom, elBottom) + 10,
            ],
            orientation: "vertical",
          });
          draggedNode.x(elRight - draggedBox.width);
        }
        // Center to center (vertical)
        if (Math.abs(draggedCenterX - elCenterX) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              elCenterX,
              Math.min(draggedTop, elTop) - 10,
              elCenterX,
              Math.max(draggedBottom, elBottom) + 10,
            ],
            orientation: "vertical",
          });
          draggedNode.x(elCenterX - draggedBox.width / 2);
        }
        // Left to right
        if (Math.abs(draggedLeft - elRight) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              elRight,
              Math.min(draggedTop, elTop) - 10,
              elRight,
              Math.max(draggedBottom, elBottom) + 10,
            ],
            orientation: "vertical",
          });
          draggedNode.x(elRight);
        }
        // Right to left
        if (Math.abs(draggedRight - elLeft) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              elLeft,
              Math.min(draggedTop, elTop) - 10,
              elLeft,
              Math.max(draggedBottom, elBottom) + 10,
            ],
            orientation: "vertical",
          });
          draggedNode.x(elLeft - draggedBox.width);
        }

        // Horizontal alignments (top, center, bottom)
        // Top to top
        if (Math.abs(draggedTop - elTop) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              Math.min(draggedLeft, elLeft) - 10,
              elTop,
              Math.max(draggedRight, elRight) + 10,
              elTop,
            ],
            orientation: "horizontal",
          });
          draggedNode.y(elTop);
        }
        // Bottom to bottom
        if (Math.abs(draggedBottom - elBottom) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              Math.min(draggedLeft, elLeft) - 10,
              elBottom,
              Math.max(draggedRight, elRight) + 10,
              elBottom,
            ],
            orientation: "horizontal",
          });
          draggedNode.y(elBottom - draggedBox.height);
        }
        // Center to center (horizontal)
        if (Math.abs(draggedCenterY - elCenterY) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              Math.min(draggedLeft, elLeft) - 10,
              elCenterY,
              Math.max(draggedRight, elRight) + 10,
              elCenterY,
            ],
            orientation: "horizontal",
          });
          draggedNode.y(elCenterY - draggedBox.height / 2);
        }
        // Top to bottom
        if (Math.abs(draggedTop - elBottom) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              Math.min(draggedLeft, elLeft) - 10,
              elBottom,
              Math.max(draggedRight, elRight) + 10,
              elBottom,
            ],
            orientation: "horizontal",
          });
          draggedNode.y(elBottom);
        }
        // Bottom to top
        if (Math.abs(draggedBottom - elTop) < SNAP_THRESHOLD) {
          newGuides.push({
            points: [
              Math.min(draggedLeft, elLeft) - 10,
              elTop,
              Math.max(draggedRight, elRight) + 10,
              elTop,
            ],
            orientation: "horizontal",
          });
          draggedNode.y(elTop - draggedBox.height);
        }
      });

      return newGuides;
    },
    [canvasSettings.width, effectiveHeight, elements],
  );

  // Handle element drag for showing guides
  const handleElementDragMove = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      isDragging.current = true;
      const node = e.target;
      const newGuides = getSnapLines(id, node);
      setGuides(newGuides);
    },
    [getSnapLines],
  );

  const handleElementDragEnd = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      isDragging.current = false;
      setGuides([]);
      moveElement(id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    [moveElement],
  );

  const handleTransformEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const element = elements.find((el) => el.id === id);
    let newWidth = Math.max(20, node.width() * scaleX);
    let newHeight = Math.max(20, node.height() * scaleY);

    // For text elements, auto-calculate height based on text content
    if (element?.type === "text") {
      const textEl = element as import("@/types/editor").TextElement;
      const padding = textEl.padding || {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };

      // Subtract padding from total dimensions to get content area
      const contentWidth = Math.max(
        20,
        newWidth - padding.left - padding.right,
      );

      // Create a temporary text node to measure actual text height
      const tempText = new Konva.Text({
        text: textEl.content,
        fontSize: textEl.fontSize,
        fontFamily: textEl.fontFamily,
        fontStyle:
          `${textEl.fontWeight >= 700 ? "bold" : ""} ${textEl.fontStyle === "italic" ? "italic" : ""}`.trim() ||
          "normal",
        lineHeight: textEl.lineHeight,
        letterSpacing: textEl.letterSpacing,
        width: contentWidth,
        wrap: "word",
      });

      // Get the actual text height needed
      const textHeight = tempText.height();
      tempText.destroy();

      // Use the larger of: scaled height or calculated text height
      const minContentHeight = Math.max(textHeight, 20);
      newWidth = contentWidth;
      newHeight = Math.max(
        newHeight - padding.top - padding.bottom,
        minContentHeight,
      );
    }

    resizeElement(id, {
      width: newWidth,
      height: newHeight,
    });

    moveElement(id, {
      x: node.x(),
      y: node.y(),
    });

    updateElement(id, {
      rotation: node.rotation(),
    });
  };

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const parseGradient = (gradientString: string) => {
    if (!gradientString?.startsWith("linear-gradient")) return null;

    const colorRegex = /#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/g;
    const colors = gradientString.match(colorRegex);

    if (!colors || colors.length < 2) return null;

    const angleMatch = gradientString.match(/(\d+)deg/);
    const angle = angleMatch ? parseInt(angleMatch[1]) : 135;

    const angleRad = (angle - 90) * (Math.PI / 180);
    const width = canvasSettings.width;
    const height = effectiveHeight;

    return {
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: width, y: height },
      fillLinearGradientColorStops: colors.flatMap((color, index) => [
        index / (colors.length - 1),
        color,
      ]),
    };
  };

  const gradientProps = parseGradient(canvasSettings.backgroundColor);

  const renderElement = (element: EditorElement) => {
    const isSelected =
      selectedElementId === element.id ||
      selectedElementIds.includes(element.id);
    const commonProps = {
      isSelected,
      onSelect: () => selectElement(element.id),
      onDragMove: (e: Konva.KonvaEventObject<DragEvent>) =>
        handleElementDragMove(element.id, e),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
        handleElementDragEnd(element.id, e),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) =>
        handleTransformEnd(element.id, e),
    };

    switch (element.type) {
      case "text":
        return (
          <TextElementComponent
            key={element.id}
            {...commonProps}
            element={element}
          />
        );
      case "image":
        return (
          <ImageElementComponent
            key={element.id}
            {...commonProps}
            element={element}
          />
        );
      case "shape":
        return (
          <ShapeElementComponent
            key={element.id}
            {...commonProps}
            element={element}
          />
        );
      default:
        return null;
    }
  };

  // Hydration fix: only render stage on client
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="bg-white shadow-lg rounded-sm overflow-hidden"
          style={{
            width: canvasSettings.width,
            height: effectiveHeight,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className="bg-white shadow-lg rounded-sm overflow-hidden canvas-wrapper"
        style={{
          width: canvasSettings.width,
          height: effectiveHeight,
        }}
      >
        <Stage
          ref={stageRef}
          width={canvasSettings.width}
          height={effectiveHeight}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Layer>
            {/* Background */}
            <Rect
              name="background"
              x={0}
              y={0}
              width={canvasSettings.width}
              height={effectiveHeight}
              fill={
                gradientProps
                  ? undefined
                  : canvasSettings.backgroundColor === "transparent"
                    ? undefined
                    : canvasSettings.backgroundColor
              }
              {...gradientProps}
            />

            {/* Background Image - Repeat vertically only */}
            {bgImage && (
              <Rect
                name="background"
                x={0}
                y={0}
                width={canvasSettings.width}
                height={effectiveHeight}
                fillPatternImage={bgImage}
                fillPatternRepeat="repeat-y"
                fillPatternScaleX={canvasSettings.width / bgImage.width}
                fillPatternScaleY={canvasSettings.width / bgImage.width}
              />
            )}

            {/* Elements */}
            {sortedElements.map(renderElement)}

            {/* Selection Box (Marquee) */}
            {selectionBox.visible && (
              <Rect
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.width}
                height={selectionBox.height}
                fill="rgba(100, 149, 237, 0.2)"
                stroke="rgba(100, 149, 237, 0.8)"
                strokeWidth={1}
                dash={[4, 4]}
              />
            )}

            {/* Alignment Guide Lines */}
            {guides.map((guide, index) => (
              <Line
                key={`guide-${index}`}
                points={guide.points}
                stroke="#FF6B9D"
                strokeWidth={1}
                dash={[4, 4]}
              />
            ))}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Allow small height for line shapes
                if (newBox.width < 5) {
                  return oldBox;
                }
                // Only enforce minimum height if it's not a very thin shape (like line)
                if (newBox.height < 5 && oldBox.height >= 20) {
                  return oldBox;
                }
                return newBox;
              }}
              anchorStyleFunc={(anchor) => {
                anchor.cornerRadius(10);
                if (anchor.hasName("rotater")) {
                  anchor.fill("#ff6b35");
                  anchor.stroke("#ff6b35");
                }
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default EditorCanvas;

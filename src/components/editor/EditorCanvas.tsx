"use client";

import React, { useRef, useEffect } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/store/editorStore";
import TextElementComponent from "./elements/TextElement";
import ImageElementComponent from "./elements/ImageElement";
import ShapeElementComponent from "./elements/ShapeElement";
import FloatingToolbar from "./FloatingToolbar";
import { EditorElement } from "@/types/editor";

interface EditorCanvasProps {
  canvasHeight?: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ canvasHeight }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [stagePosition, setStagePosition] = React.useState({ x: 0, y: 0 });

  const {
    canvasSettings,
    elements,
    selectedElementId,
    selectElement,
    updateElement,
    moveElement,
    resizeElement,
    duplicateElement,
    deleteElement,
    bringForward,
    sendBackward,
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

    if (selectedElementId) {
      const selectedNode = stage.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedElementId, elements]);

  // Update stage position for toolbar
  useEffect(() => {
    const updateStagePosition = () => {
      const container = stageRef.current?.container();
      if (container) {
        const rect = container.getBoundingClientRect();
        setStagePosition({ x: rect.left, y: rect.top });
      }
    };

    updateStagePosition();
    window.addEventListener("scroll", updateStagePosition);
    window.addEventListener("resize", updateStagePosition);

    return () => {
      window.removeEventListener("scroll", updateStagePosition);
      window.removeEventListener("resize", updateStagePosition);
    };
  }, []);

  const handleStageClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (e.target === e.target.getStage() || e.target.name() === "background") {
      selectElement(null);
    }
  };

  const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    moveElement(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

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
        newWidth - padding.left - padding.right
      );

      // Create a temporary text node to measure actual text height
      const tempText = new Konva.Text({
        text: textEl.content,
        fontSize: textEl.fontSize,
        fontFamily: textEl.fontFamily,
        fontStyle:
          `${textEl.fontWeight >= 700 ? "bold" : ""} ${
            textEl.fontStyle === "italic" ? "italic" : ""
          }`.trim() || "normal",
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
        minContentHeight
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
    const isSelected = selectedElementId === element.id;
    const commonProps = {
      isSelected,
      onSelect: () => selectElement(element.id),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
        handleDragEnd(element.id, e),
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

  // Get selected element for toolbar
  const selectedElement =
    elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="flex items-center justify-center">
      <div
        className="bg-white shadow-lg rounded-sm overflow-hidden relative"
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

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              rotateAnchorOffset={30}
              rotationSnaps={[0, 90, 180, 270]}
              anchorSize={12}
              anchorStroke="#4A90E2"
              anchorFill="#FFFFFF"
              anchorStrokeWidth={2}
              anchorCornerRadius={2}
              borderStroke="#4A90E2"
              borderStrokeWidth={2}
              rotateAnchorCursor="grab"
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
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
            />
          </Layer>
        </Stage>

        {/* Floating Toolbar */}
        <FloatingToolbar
          selectedElement={selectedElement}
          stagePosition={stagePosition}
          onDuplicate={() =>
            selectedElementId && duplicateElement(selectedElementId)
          }
          onDelete={() => selectedElementId && deleteElement(selectedElementId)}
          onBringForward={() =>
            selectedElementId && bringForward(selectedElementId)
          }
          onSendBackward={() =>
            selectedElementId && sendBackward(selectedElementId)
          }
        />
      </div>
    </div>
  );
};

export default EditorCanvas;

"use client";

import React, { useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Image as KonvaImage,
} from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/store/editorStore";
import TextElementComponent from "./elements/TextElement";
import ImageElementComponent from "./elements/ImageElement";
import ShapeElementComponent from "./elements/ShapeElement";
import { EditorElement } from "@/types/editor";

interface EditorCanvasProps {
  canvasHeight?: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ canvasHeight }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const {
    canvasSettings,
    elements,
    selectedElementId,
    selectElement,
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

    resizeElement(id, {
      width: Math.max(20, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleY),
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
    const isSelected = selectedElementId === element.id;
    const commonProps = {
      key: element.id,
      element,
      isSelected,
      onSelect: () => selectElement(element.id),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
        handleDragEnd(element.id, e),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) =>
        handleTransformEnd(element.id, e),
    };

    switch (element.type) {
      case "text":
        return <TextElementComponent {...commonProps} element={element} />;
      case "image":
        return <ImageElementComponent {...commonProps} element={element} />;
      case "shape":
        return <ShapeElementComponent {...commonProps} element={element} />;
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
        className="bg-white shadow-lg rounded-sm overflow-hidden"
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
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
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

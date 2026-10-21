"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Line,
  Text,
  Group,
} from "react-konva";
import { Html } from "react-konva-utils";
import { Music, Disc3, Music2, Music3, Music4, Headphones } from "lucide-react";
import Konva from "konva";
import {
  createImageElement,
  createShapeElement,
  createTextElement,
  useEditorStore,
} from "@/store/editorStore";
import TextElementComponent from "./elements/TextElement";
import ImageElementComponent from "./elements/ImageElement";
import ShapeElementComponent from "./elements/ShapeElement";
import WidgetElementComponent from "./elements/WidgetElement";
import { EditorElement, TextElement } from "@/types/editor";
import { loadGoogleFonts } from "@/utils/fontLoader";
import { parseCssGradient } from "@/utils/gradient";
import AmbientEffect from "./effects/AmbientEffect";
import {
  useSnapLines,
  useMarqueeSelection,
  useBackgroundImage,
  GuideLine,
} from "./hooks";

// Music icons mapping
const MUSIC_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; color?: string; className?: string }>
> = {
  music: Music,
  disc: Disc3,
  music2: Music2,
  music3: Music3,
  music4: Music4,
  headphones: Headphones,
};

// Music icon component for canvas using Html from react-konva-utils
interface MusicIconOnCanvasProps {
  x: number;
  y: number;
  iconType: string;
  iconColor: string;
  isPlaying: boolean;
}

const MusicIconOnCanvas: React.FC<MusicIconOnCanvasProps> = ({
  x,
  y,
  iconType,
  iconColor,
  isPlaying,
}) => {
  const IconComponent = MUSIC_ICONS[iconType] || MUSIC_ICONS.music;

  return (
    <Group x={x} y={y}>
      <Html>
        <style>
          {`
            @keyframes spin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
          `}
        </style>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconColor,
            transform: "translate(-50%, -50%)",
            cursor: "pointer",
            boxShadow: "inset 0 0 0 2px rgba(255, 255, 255, 0.5)",
            animation: isPlaying ? "spin 2s linear infinite" : "none",
          }}
        >
          <IconComponent
            size={14}
            color={iconColor === "#ffffff" ? "#000000" : "#ffffff"}
          />
        </div>
      </Html>
    </Group>
  );
};

interface EditorCanvasProps {
  canvasHeight?: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ canvasHeight }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const isDragging = useRef(false);

  const {
    canvasSettings,
    elements,
    selectedElementId,
    selectedElementIds,
    selectElement,
    selectElements,
    updateElement,
    moveElement,
    resizeElement,
    addElement,
  } = useEditorStore();

  const effectiveHeight = canvasHeight || canvasSettings.height;
  const bgImage = useBackgroundImage(canvasSettings.backgroundImage);
  const gridSize = canvasSettings.gridSize ?? 20;
  const snapEnabled = canvasSettings.snapToGrid ?? true;

  const { getSnapLines } = useSnapLines({
    elements,
    canvasWidth: canvasSettings.width,
    canvasHeight: effectiveHeight,
  });

  const { selectionBox, handleMouseDown, handleMouseMove, handleMouseUp } =
    useMarqueeSelection({
      elements,
      onSelectElement: selectElement,
      onSelectElements: selectElements,
    });

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const transformer = transformerRef.current;

    // Check if selected element still exists in elements array
    const elementExists = (id: string) => elements.some((el) => el.id === id);

    if (selectedElementIds.length > 0) {
      // Filter only existing elements
      const validIds = selectedElementIds.filter(elementExists);
      if (validIds.length === 0) {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
        return;
      }

      const selectedNodes = validIds
        .map((id) => stage.findOne(`#${id}`))
        .filter((node): node is Konva.Node => node !== null);

      if (selectedNodes.length > 0) {
        transformer.nodes(selectedNodes);
        transformer.getLayer()?.batchDraw();
      } else {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
      }
    } else if (selectedElementId) {
      // Check if selected element still exists
      if (!elementExists(selectedElementId)) {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
        return;
      }

      const selectedNode = stage.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode]);
        transformer.getLayer()?.batchDraw();
      } else {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedElementId, selectedElementIds, elements]);

  const handleStageClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (selectionBox.width > 5 || selectionBox.height > 5) return;
    if (e.target === e.target.getStage() || e.target.name() === "background") {
      selectElement(null);
    }
  };

  const snapToGrid = useCallback(
    (value: number, bound: number, size: number) => {
      if (!snapEnabled) return Math.min(Math.max(value, 0), bound - size);
      const snapped = Math.round(value / gridSize) * gridSize;
      return Math.min(Math.max(snapped, 0), Math.max(bound - size, 0));
    },
    [gridSize, snapEnabled],
  );

  const handleCanvasDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData("application/wedify-element");
      if (!payload) return;

      try {
        const raw = JSON.parse(payload) as {
          type: "text" | "image" | "shape";
          options?: Record<string, any>;
          src?: string;
          shapeType?: string;
          size?: { width: number; height: number };
        };

        const rect = event.currentTarget.getBoundingClientRect();
        const dropX = Math.min(
          Math.max(event.clientX - rect.left, 20),
          canvasSettings.width - 40,
        );
        const dropY = Math.min(
          Math.max(event.clientY - rect.top, 20),
          effectiveHeight - 40,
        );

        const resolvedSize = raw.size ?? { width: 180, height: 180 };
        const x = snapToGrid(dropX, canvasSettings.width, resolvedSize.width);
        const y = snapToGrid(dropY, effectiveHeight, resolvedSize.height);

        if (raw.type === "text") {
          addElement(
            createTextElement({
              ...(raw.options ?? {}),
              position: { x, y },
              size: raw.options?.size ?? { width: 220, height: 80 },
            }),
          );
          return;
        }

        if (raw.type === "image") {
          addElement(
            createImageElement(raw.src || "", {
              ...(raw.options ?? {}),
              position: { x, y },
              size: resolvedSize,
            }),
          );
          return;
        }

        if (raw.type === "shape") {
          addElement(
            createShapeElement(raw.shapeType as any, {
              ...(raw.options ?? {}),
              position: { x, y },
              size: resolvedSize,
            }),
          );
        }
      } catch {
        // Ignore invalid payloads.
      }
    },
    [addElement, canvasSettings.width, effectiveHeight, gridSize, snapEnabled, snapToGrid],
  );

  const dragOriginRef = useRef<Record<string, { x: number; y: number }>>({});

  const handleElementDragStart = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const ids = selectedElementIds.length > 0 ? selectedElementIds : [id];
      const current = {} as Record<string, { x: number; y: number }>;

      ids.forEach((selectedId) => {
        const element = elements.find((item) => item.id === selectedId);
        if (element) {
          current[selectedId] = { x: element.position.x, y: element.position.y };
        }
      });

      dragOriginRef.current = current;
      isDragging.current = true;
      const node = e.target;
      node.x(node.x());
      node.y(node.y());
    },
    [elements, selectedElementIds],
  );

  const handleElementDragMove = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      isDragging.current = true;
      const node = e.target;
      const selectedIds = selectedElementIds.length > 0 ? selectedElementIds : [id];
      const relevantIds = selectedIds.includes(id) ? selectedIds : [id];

      const anchorStart = dragOriginRef.current[id] ?? {
        x: node.x(),
        y: node.y(),
      };
      const deltaX = node.x() - anchorStart.x;
      const deltaY = node.y() - anchorStart.y;

      relevantIds.forEach((selectedId) => {
        const dragStart = dragOriginRef.current[selectedId] ?? {
          x: elements.find((item) => item.id === selectedId)?.position.x ?? 0,
          y: elements.find((item) => item.id === selectedId)?.position.y ?? 0,
        };

        moveElement(selectedId, {
          x: dragStart.x + deltaX,
          y: dragStart.y + deltaY,
        });
      });

      const snappedX = snapEnabled
        ? Math.round(node.x() / gridSize) * gridSize
        : node.x();
      const snappedY = snapEnabled
        ? Math.round(node.y() / gridSize) * gridSize
        : node.y();

      node.x(Math.min(Math.max(snappedX, 0), Math.max(canvasSettings.width - node.width(), 0)));
      node.y(Math.min(Math.max(snappedY, 0), Math.max(effectiveHeight - node.height(), 0)));

      const newGuides = getSnapLines(id, node);
      setGuides(newGuides);
    },
    [canvasSettings.width, effectiveHeight, elements, getSnapLines, gridSize, moveElement, selectedElementIds, snapEnabled],
  );

  const handleElementDragEnd = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      isDragging.current = false;
      setGuides([]);
      const ids = selectedElementIds.length > 0 ? selectedElementIds : [id];
      const currentIds = ids.includes(id) ? ids : [id];
      currentIds.forEach((selectedId) => {
        moveElement(selectedId, {
          x: e.target.x(),
          y: e.target.y(),
        });
      });
      dragOriginRef.current = {};
    },
    [moveElement, selectedElementIds],
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
      const textEl = element as TextElement;
      const padding = textEl.padding || {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };

      const contentWidth = Math.max(
        20,
        newWidth - padding.left - padding.right,
      );

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

      const textHeight = tempText.height();
      tempText.destroy();

      const minContentHeight = Math.max(textHeight, 20);
      newWidth = contentWidth;
      newHeight = Math.max(
        newHeight - padding.top - padding.bottom,
        minContentHeight,
      );
    }

    resizeElement(id, { width: newWidth, height: newHeight });
    moveElement(id, { x: node.x(), y: node.y() });
    updateElement(id, { rotation: node.rotation() });
  };

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const gradientProps = parseCssGradient(canvasSettings.backgroundColor, canvasSettings.width, effectiveHeight);

  const renderElement = (element: EditorElement) => {
    const isSelected =
      selectedElementId === element.id ||
      selectedElementIds.includes(element.id);

    const handleElementSelect = (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const modifierKey = e?.evt ? (e.evt as any)?.shiftKey || (e.evt as any)?.metaKey || (e.evt as any)?.ctrlKey : false;

      if (modifierKey) {
        const ids = selectedElementIds.includes(element.id)
          ? selectedElementIds.filter((id) => id !== element.id)
          : [...selectedElementIds, element.id];
        selectElements(ids);
        return;
      }

      selectElement(element.id);
    };

    const commonProps = {
      isSelected,
      onSelect: handleElementSelect,
      onDragStart: (e: Konva.KonvaEventObject<DragEvent>) =>
        handleElementDragStart(element.id, e),
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
      case "widget":
        return (
          <WidgetElementComponent
            key={element.id}
            {...commonProps}
            element={element}
          />
        );
      default:
        return null;
    }
  };

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Đảm bảo font của mọi text (vd. thiệp/mẫu đã lưu) được tải rồi vẽ lại canvas.
  const textFontKey = elements
    .map((el) => (el.type === "text" ? (el as TextElement).fontFamily : el.type === "widget" ? String(el.props?.fontFamily ?? "") : ""))
    .filter(Boolean)
    .join("|");
  useEffect(() => {
    if (!textFontKey) return;
    let cancelled = false;
    loadGoogleFonts(textFontKey.split("|")).then(() => {
      if (!cancelled) stageRef.current?.getLayers().forEach((layer) => layer.batchDraw());
    });
    return () => {
      cancelled = true;
    };
  }, [textFontKey]);

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
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleCanvasDrop}
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

            {/* Background Image */}
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

            {/* Grid Background */}
            {canvasSettings.showGrid && (
              <React.Fragment>
                {Array.from({ length: Math.ceil(canvasSettings.width / gridSize) + 1 }).map((_, index) => (
                  <Line
                    key={`grid-v-${index}`}
                    points={[index * gridSize, 0, index * gridSize, effectiveHeight]}
                    stroke="rgba(148, 163, 184, 0.25)"
                    strokeWidth={index % 5 === 0 ? 0.8 : 0.4}
                  />
                ))}
                {Array.from({ length: Math.ceil(effectiveHeight / gridSize) + 1 }).map((_, index) => (
                  <Line
                    key={`grid-h-${index}`}
                    points={[0, index * gridSize, canvasSettings.width, index * gridSize]}
                    stroke="rgba(148, 163, 184, 0.25)"
                    strokeWidth={index % 5 === 0 ? 0.8 : 0.4}
                  />
                ))}
              </React.Fragment>
            )}

            {/* Elements */}
            {sortedElements.map(renderElement)}

            {/* Music Icon - Show when music is selected */}
            {canvasSettings.backgroundMusic && (
              <MusicIconOnCanvas
                x={canvasSettings.width - 30}
                y={30}
                iconType={canvasSettings.backgroundMusic.icon || "music"}
                iconColor={
                  canvasSettings.backgroundMusic.iconColor || "#000000"
                }
                isPlaying={canvasSettings.isMusicPlaying}
              />
            )}

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
            {guides.map((guide, index) => {
              const isVertical = guide.orientation === "vertical";
              const labelX = isVertical
                ? guide.points[0] + 8
                : (guide.points[0] + guide.points[2]) / 2;
              const labelY = isVertical
                ? (guide.points[1] + guide.points[3]) / 2 - 6
                : guide.points[1] - 18;

              return (
                <React.Fragment key={`guide-${index}`}>
                  <Line
                    points={guide.points}
                    stroke="#FF6B9D"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  {guide.label && (
                    <Text
                      x={labelX}
                      y={labelY}
                      text={guide.label}
                      fontSize={11}
                      fill="#FF6B9D"
                      fontStyle="bold"
                      shadowColor="rgba(255, 255, 255, 0.8)"
                      shadowBlur={3}
                      shadowOffsetX={0}
                      shadowOffsetY={0}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 120, 135, 180]}
              enabledAnchors={[
                "top-left",
                "top-center",
                "top-right",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
                "rotater",
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5) return oldBox;
                if (newBox.height < 5 && oldBox.height >= 20) return oldBox;
                return newBox;
              }}
              anchorStyleFunc={(anchor) => {
                anchor.cornerRadius(10);
                anchor.fill("#ffffff");
                anchor.stroke("#FF6B9D");
                anchor.strokeWidth(2);
                if (anchor.hasName("rotater")) {
                  anchor.fill("#ff6b35");
                  anchor.stroke("#ff6b35");
                }
              }}
            />
          </Layer>
          <AmbientEffect settings={canvasSettings.ambientEffect} width={canvasSettings.width} height={effectiveHeight} />
        </Stage>
      </div>
    </div>
  );
};

export default EditorCanvas;

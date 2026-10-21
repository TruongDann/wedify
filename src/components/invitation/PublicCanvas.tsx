"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import TextElementComponent from "@/components/editor/elements/TextElement";
import ImageElementComponent from "@/components/editor/elements/ImageElement";
import ShapeElementComponent from "@/components/editor/elements/ShapeElement";
import { useBackgroundImage } from "@/components/editor/hooks/useBackgroundImage";
import { loadGoogleFonts } from "@/utils/fontLoader";
import { parseCssGradient } from "@/utils/gradient";
import { FallingEffectLayer } from "@/components/card/FallingEffectLayer";
import { fillGuestName } from "@/components/card/guestName";
import ToolElementComponent from "@/components/editor/elements/ToolElement";
import { Group } from "react-konva";
import { Html } from "react-konva-utils";
import WidgetView from "@/components/card/WidgetView";
import "@/components/card/card.css";
import { ViewerContext, type ViewerData } from "@/components/editor/ViewerContext";

export type PublicCanvasSettings = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundImage?: string | null;
  [key: string]: any;
};

const noop = () => undefined;

interface PublicCanvasProps {
  elements: Array<Record<string, any>>;
  canvasSettings: PublicCanvasSettings;
  /** Chiều rộng hiển thị thực tế (px). Canvas được scale từ chiều rộng thiết kế. */
  displayWidth: number;
  /** Vị trí cuộn & chiều cao vùng nhìn thấy (px màn hình) để chỉ dựng/chạy hiệu ứng khi cuộn tới. */
  scrollTop?: number;
  viewportHeight?: number;
  /** Khách bấm nút tiện ích (tham dự, quà mừng, bản đồ...). */
  onAction?: (action: string, props: Record<string, any>) => void;
  /** Thay thế {{khoá}} trong chữ, vd. {{guest}} -> tên khách mời. */
  placeholders?: Record<string, string>;
  /** Dữ liệu thiệp cho các tiện ích dạng form (tham dự, sổ lưu bút, quà mừng). */
  viewerData?: ViewerData;
}

/**
 * Render thiệp đã xuất bản bằng chính các element của editor (Konva) nên font, hiệu ứng, bố cục
 * giống hệt editor. Chỉ khác là chỉ đọc (không kéo/chọn) và được scale vừa khung hiển thị.
 */
const PublicCanvas: React.FC<PublicCanvasProps> = ({ elements, canvasSettings, displayWidth, scrollTop = 0, viewportHeight = 900, onAction, placeholders, viewerData }) => {
  const width = Number(canvasSettings.width) || 600;
  const height = Number(canvasSettings.height) || 3200;
  const scale = displayWidth > 0 ? displayWidth / width : 1;

  const bgImage = useBackgroundImage(canvasSettings.backgroundImage ?? null);
  const gradientProps = parseCssGradient(canvasSettings.backgroundColor ?? "", width, height);

  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)),
    [elements],
  );

  // Hiệu ứng "hiện ra khi cuộn": chỉ mount phần tử khi mép trên của nó sắp vào vùng nhìn thấy.
  // Phần tử đã hiện thì giữ nguyên (không chạy lại khi cuộn ngược lên).
  const revealedUntil = useRef(0);
  const limit = (scrollTop + viewportHeight) / scale - 60;
  if (limit > revealedUntil.current) revealedUntil.current = limit;
  const visibleElements = sortedElements.filter((el) => (el.position?.y ?? 0) <= revealedUntil.current);

  // Konva vẽ chữ lên <canvas> nên phải chờ font tải xong rồi mới render, nếu không sẽ dùng font dự phòng.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const families = elements
      .map((el) => (el.type === "text" ? el.fontFamily : el.type === "widget" ? el.props?.fontFamily : ""))
      .map((family) => String(family || ""))
      .filter(Boolean);
    loadGoogleFonts(families).finally(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [elements]);

  const commonProps = {
    isSelected: false,
    onSelect: noop,
    onDragStart: noop,
    onDragMove: noop,
    onDragEnd: noop,
    onTransformEnd: noop,
  };

  // Chỉ bật bắt sự kiện khi thiệp có nút/liên kết để bấm (đỡ tốn tài nguyên vẽ lớp "hit").
  const interactive = elements.some(
    (el) => Boolean(el.hyperlink) || (el.clickAction && el.clickAction.type !== "none"),
  );

  const viewerValue = useMemo(() => ({ readOnly: true, onAction, data: viewerData }), [onAction, viewerData]);

  const prepare = (element: Record<string, any>) => {
    let next: Record<string, any> = { ...element, locked: true };
    if (element.type === "text" && placeholders && typeof element.content === "string") {
      let content: string = element.content;
      if (content.includes("{{")) content = content.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => placeholders[key] ?? match);
      if (placeholders.guest) content = fillGuestName(content, placeholders.guest);
      next = { ...next, content };
    }
    return next;
  };
  // Khách bấm vào phần tử: liên kết, gọi điện hoặc mở hộp quà (clickAction của editor)
  const openLink = (element: Record<string, any>) => () => {
    const action = element.clickAction;
    if (action?.type === "link" && /^https?:\/\//i.test(action.url ?? "")) window.open(action.url, "_blank", "noopener,noreferrer");
    else if (action?.type === "call" && action.phone) window.location.href = "tel:" + String(action.phone).replace(/[^0-9+]/g, "");
    else if (action?.type === "gift") onAction?.("gift", {});
    else if (element.hyperlink) window.open(element.hyperlink, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ position: "relative", overflow: "clip", width: displayWidth, height: height * scale, background: canvasSettings.backgroundColor || "#fff" }}>
      {canvasSettings.fallingEffect ? <FallingEffectLayer effect={canvasSettings.fallingEffect} scale={scale} /> : null}
      {fontsReady && displayWidth > 0 ? (
        <ViewerContext.Provider value={viewerValue}>
        <Stage width={displayWidth} height={height * scale} scaleX={scale} scaleY={scale}>
          {/* Chỉ xem: phần tử bị khoá (không kéo), chữ không sửa được */}
          <Layer listening={interactive}>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={
                gradientProps || canvasSettings.backgroundColor === "transparent"
                  ? undefined
                  : canvasSettings.backgroundColor
              }
              {...gradientProps}
            />

            {bgImage && (
              <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fillPatternImage={bgImage}
                fillPatternRepeat="repeat-y"
                fillPatternScaleX={width / bgImage.width}
                fillPatternScaleY={width / bgImage.width}
              />
            )}

            {visibleElements.map((raw) => {
              const element = prepare(raw);
              const props = { ...commonProps, onSelect: openLink(element) };
              switch (element.type) {
                case "text":
                  return <TextElementComponent key={element.id} {...props} element={element as any} />;
                case "image":
                  return <ImageElementComponent key={element.id} {...props} element={element as any} />;
                case "shape":
                  return <ShapeElementComponent key={element.id} {...props} element={element as any} />;
                case "tool":
                  return <ToolElementComponent key={element.id} {...props} element={element as any} />;
                case "widget":
                  // Tiện ích gốc của nhánh dev (lịch, đếm ngược, form tham dự, bản đồ...) là HTML nên đặt lên canvas bằng <Html>
                  return (
                    <Group key={element.id} x={element.position.x} y={element.position.y} rotation={element.rotation}>
                      <Html divProps={{ style: { pointerEvents: "auto" } }}>
                        <div style={{ width: element.size.width, height: element.size.height, position: "relative" }}>
                          {/* WidgetView -> ElementFrame tự đặt phần tử theo position/rotation của nó; vị trí đã do <Group> lo nên đưa về 0 */}
                          <WidgetView element={{ ...(element as any), position: { x: 0, y: 0 }, rotation: 0 }} />
                        </div>
                      </Html>
                    </Group>
                  );
                default:
                  return null;
              }
            })}
          </Layer>
          
        </Stage>
        </ViewerContext.Provider>
      ) : null}
    </div>
  );
};

export default PublicCanvas;

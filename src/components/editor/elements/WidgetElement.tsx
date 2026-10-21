"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Group, Rect, Text, Shape, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import { Html } from "react-konva-utils";
import type { WidgetElement } from "@/types/editor";
import { runElementAnimation } from "../animation/elementAnimation";
import { ViewerContext } from "../ViewerContext";
import { DOM_WIDGETS } from "../widgets/DomWidgets";

interface WidgetElementProps {
  element: WidgetElement;
  isSelected: boolean;
  onSelect: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

interface DrawProps {
  w: number;
  h: number;
  p: Record<string, any>;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Nhãn mặc định hiển thị trên từng loại nút. */
export const BUTTON_ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  rsvp: { label: "Xác nhận tham dự", icon: "💌" },
  gift: { label: "Gửi quà mừng", icon: "🎁" },
  map: { label: "Chỉ đường", icon: "📍" },
  call: { label: "Gọi điện", icon: "📞" },
  reminder: { label: "Thêm lời nhắc", icon: "⏰" },
  wishes: { label: "Gửi lời chúc", icon: "💬" },
  share: { label: "Chia sẻ thiệp", icon: "🔗" },
  link: { label: "Mở liên kết", icon: "🔗" },
};

// ----------------------------------------------------------------- Lịch

const heartPath = (ctx: Konva.Context, size: number) => {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.bezierCurveTo(-s * 1.5, -s * 0.1, -s * 0.8, -s * 1.15, 0, -s * 0.4);
  ctx.bezierCurveTo(s * 0.8, -s * 1.15, s * 1.5, -s * 0.1, 0, s * 0.9);
  ctx.closePath();
};

const CalendarDraw: React.FC<DrawProps> = ({ w, h, p }) => {
  const date = p.date ? new Date(`${p.date}T12:00:00`) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const first = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const accent = p.accent || "#ef4565";
  const textColor = p.textColor || "#3b1d2a";
  const font = p.fontFamily || "Playfair Display";
  const pad = 14;
  const headerH = 40;
  const weekH = 26;
  const gridTop = pad + headerH + weekH;
  const cellW = (w - pad * 2) / 7;
  const cellH = (h - gridTop - pad) / 6;
  const markerSize = Math.min(cellW, cellH) * 1.15;

  const cells: React.ReactNode[] = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const index = first + d - 1;
    const col = index % 7;
    const row = Math.floor(index / 7);
    const x = pad + col * cellW;
    const y = gridTop + row * cellH;
    const isDay = d === day;
    cells.push(
      <React.Fragment key={d}>
        {isDay && p.marker === "heart" ? (
          <Shape x={x + cellW / 2} y={y + cellH / 2} fill={accent} listening={false} sceneFunc={(ctx, shape) => { heartPath(ctx, markerSize * 1.1); ctx.fillShape(shape); }} />
        ) : null}
        {isDay && p.marker === "ring" ? (
          <Rect x={x + cellW / 2 - markerSize / 2} y={y + cellH / 2 - markerSize / 2} width={markerSize} height={markerSize} cornerRadius={markerSize} stroke={accent} strokeWidth={2} listening={false} />
        ) : null}
        {isDay && (p.marker === "circle" || !p.marker) ? (
          <Rect x={x + cellW / 2 - markerSize / 2} y={y + cellH / 2 - markerSize / 2} width={markerSize} height={markerSize} cornerRadius={markerSize} fill={accent} listening={false} />
        ) : null}
        <Text
          x={x}
          y={y}
          width={cellW}
          height={cellH}
          text={String(d)}
          align="center"
          verticalAlign="middle"
          fontFamily={font}
          fontSize={Math.min(cellH * 0.5, 17)}
          fontStyle={isDay ? "bold" : "normal"}
          fill={isDay && p.marker !== "ring" ? "#ffffff" : textColor}
          listening={false}
        />
      </React.Fragment>,
    );
  }

  return (
    <>
      <Rect width={w} height={h} fill={p.bgColor || "rgba(255,255,255,0.85)"} cornerRadius={p.radius ?? 18} stroke={p.borderColor || "rgba(0,0,0,0.08)"} strokeWidth={1} />
      <Text x={0} y={pad} width={w} height={headerH} text={`THÁNG ${month + 1} · ${year}`} align="center" verticalAlign="middle" fontFamily={font} fontStyle="bold" fontSize={18} letterSpacing={3} fill={accent} listening={false} />
      {WEEKDAYS.map((label, i) => (
        <Text key={label} x={pad + i * cellW} y={pad + headerH} width={cellW} height={weekH} text={label} align="center" verticalAlign="middle" fontFamily="Montserrat" fontSize={11} fontStyle="bold" fill={textColor} opacity={0.55} listening={false} />
      ))}
      {cells}
    </>
  );
};

// ----------------------------------------------------------------- Đếm ngược

const countdownParts = (date?: string, time?: string) => {
  const target = date ? new Date(`${date}T${time || "00:00"}:00`) : new Date();
  const diff = Math.max(target.getTime() - Date.now(), 0);
  return [
    Math.floor(diff / 86400000),
    Math.floor((diff / 3600000) % 24),
    Math.floor((diff / 60000) % 60),
    Math.floor((diff / 1000) % 60),
  ];
};

const CountdownDraw: React.FC<DrawProps> = ({ w, h, p }) => {
  const [parts, setParts] = useState(() => countdownParts(p.date, p.time));
  useEffect(() => {
    const update = () => setParts(countdownParts(p.date, p.time));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [p.date, p.time]);

  const labels: string[] = Array.isArray(p.labels) && p.labels.length === 4 ? p.labels : ["Ngày", "Giờ", "Phút", "Giây"];
  const gap = 10;
  const cellW = (w - gap * 3) / 4;
  const font = p.fontFamily || "Playfair Display";
  const boxed = p.style !== "plain";

  return (
    <>
      {parts.map((value, i) => {
        const x = i * (cellW + gap);
        return (
          <React.Fragment key={i}>
            {boxed ? <Rect x={x} y={0} width={cellW} height={h} fill={p.bgColor || "rgba(255,255,255,0.85)"} cornerRadius={p.radius ?? 14} stroke={p.borderColor || "rgba(0,0,0,0.08)"} strokeWidth={1} listening={false} /> : null}
            <Text x={x} y={h * 0.12} width={cellW} height={h * 0.5} text={String(value).padStart(2, "0")} align="center" verticalAlign="middle" fontFamily={font} fontStyle="bold" fontSize={Math.min(h * 0.42, cellW * 0.6)} fill={p.accent || "#ef4565"} listening={false} />
            <Text x={x} y={h * 0.64} width={cellW} height={h * 0.26} text={labels[i]} align="center" verticalAlign="middle" fontFamily="Montserrat" fontSize={Math.max(10, Math.min(13, h * 0.14))} letterSpacing={1} fill={p.textColor || "#3b1d2a"} opacity={0.7} listening={false} />
            {!boxed && i < 3 ? <Text x={x + cellW} y={h * 0.12} width={gap} height={h * 0.5} text=":" align="center" verticalAlign="middle" fontSize={h * 0.3} fill={p.textColor || "#3b1d2a"} opacity={0.5} listening={false} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ----------------------------------------------------------------- Nút hành động

const ButtonDraw: React.FC<DrawProps> = ({ w, h, p }) => {
  const preset = BUTTON_ACTION_LABELS[p.action] ?? BUTTON_ACTION_LABELS.link;
  const label = `${p.icon ?? preset.icon}  ${p.label || preset.label}`.trim();
  const outline = p.variant === "outline";
  const accent = p.bgColor || "#ef4565";

  return (
    <>
      <Rect
        width={w}
        height={h}
        cornerRadius={p.radius ?? h / 2}
        fill={outline ? "rgba(255,255,255,0.0)" : accent}
        stroke={outline ? accent : undefined}
        strokeWidth={outline ? 2 : 0}
        shadowEnabled={!outline}
        shadowColor={accent}
        shadowOpacity={0.35}
        shadowBlur={14}
        shadowOffsetY={5}
      />
      <Text width={w} height={h} text={label} align="center" verticalAlign="middle" fontFamily={p.fontFamily || "Montserrat"} fontStyle="bold" fontSize={p.fontSize || 17} fill={outline ? accent : p.textColor || "#ffffff"} listening={false} />
    </>
  );
};

// ----------------------------------------------------------------- Trình chiếu ảnh

const coverCrop = (img: HTMLImageElement, w: number, h: number) => {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  if (imgRatio > boxRatio) {
    const cropW = img.height * boxRatio;
    return { x: (img.width - cropW) / 2, y: 0, width: cropW, height: img.height };
  }
  const cropH = img.width / boxRatio;
  return { x: 0, y: (img.height - cropH) / 2, width: img.width, height: cropH };
};

const SlideshowDraw: React.FC<DrawProps> = ({ w, h, p }) => {
  const urls: string[] = useMemo(() => (Array.isArray(p.images) ? p.images.filter(Boolean) : []), [p.images]);
  const [images, setImages] = useState<Array<HTMLImageElement | null>>([]);
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const currentRef = useRef<Konva.Image>(null);
  const radius = p.radius ?? 18;

  useEffect(() => {
    let alive = true;
    setImages(urls.map(() => null));
    urls.forEach((url, i) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => alive && setImages((list) => list.map((item, j) => (j === i ? img : item)));
      img.src = url;
    });
    setIndex(0);
    setPrev(null);
    return () => {
      alive = false;
    };
  }, [urls]);

  useEffect(() => {
    if (urls.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => {
        setPrev(current);
        return (current + 1) % urls.length;
      });
    }, Math.max(1.5, Number(p.interval) || 3) * 1000);
    return () => clearInterval(timer);
  }, [urls.length, p.interval]);

  // Chuyển ảnh: ảnh mới mờ dần vào (fade) hoặc trượt vào (slide)
  useEffect(() => {
    const node = currentRef.current;
    if (!node || prev === null) return;
    const slide = p.effect === "slide";
    if (slide) node.x(w);
    else node.opacity(0);
    const tween = new Konva.Tween({ node, duration: 0.8, easing: Konva.Easings.EaseInOut, ...(slide ? { x: 0 } : { opacity: 1 }) });
    tween.play();
    return () => tween.destroy();
  }, [index, prev, p.effect, w]);

  const draw = (i: number | null, ref?: React.Ref<Konva.Image>) => {
    if (i === null) return null;
    const img = images[i];
    if (!img) return null;
    return <KonvaImage ref={ref} key={`${i}-${ref ? "c" : "p"}`} image={img} x={0} y={0} width={w} height={h} crop={coverCrop(img, w, h)} listening={false} />;
  };

  return (
    <Group
      clipFunc={(ctx) => {
        const r = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.arcTo(w, 0, w, h, r);
        ctx.arcTo(w, h, 0, h, r);
        ctx.arcTo(0, h, 0, 0, r);
        ctx.arcTo(0, 0, w, 0, r);
        ctx.closePath();
      }}
    >
      <Rect width={w} height={h} fill="#e5e7eb" />
      {urls.length === 0 ? (
        <Text width={w} height={h} text={"Thêm ảnh cho trình chiếu\n(panel bên phải)"} align="center" verticalAlign="middle" fontSize={14} fill="#6b7280" lineHeight={1.5} />
      ) : null}
      {prev !== null && prev !== index ? draw(prev) : null}
      {draw(index, currentRef)}
      {urls.length > 1
        ? urls.map((_, i) => (
            <Rect key={i} x={w / 2 - (urls.length * 14) / 2 + i * 14 + 3} y={h - 18} width={8} height={8} cornerRadius={4} fill="#ffffff" opacity={i === index ? 0.95 : 0.4} listening={false} />
          ))
        : null}
    </Group>
  );
};

// ----------------------------------------------------------------- Vỏ chung

const WidgetElementComponent: React.FC<WidgetElementProps> = ({ element, onSelect, onDragStart, onDragMove, onDragEnd, onTransformEnd }) => {
  const groupRef = useRef<Konva.Group>(null);
  const viewer = useContext(ViewerContext);
  const { width, height } = element.size;
  const props = element.props ?? {};
  const isActionButton = element.widget === "button";

  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    return runElementAnimation(
      node,
      { x: element.position.x, y: element.position.y, opacity: element.opacity, rotation: element.rotation, width, height },
      element.animation,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.animation?.enabled, element.animation?.continuous, element.animation?.type, element.animation?.delay, element.position.x, element.position.y, element.rotation, element.opacity, width, height]);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (viewer) {
      if (isActionButton) viewer.onAction?.(String(props.action ?? "link"), props);
      return;
    }
    onSelect(e);
  };

  const body = (() => {
    const drawProps = { w: width, h: height, p: props };
    switch (element.widget) {
      case "calendar":
        return <CalendarDraw {...drawProps} />;
      case "countdown":
        return <CountdownDraw {...drawProps} />;
      case "button":
        return <ButtonDraw {...drawProps} />;
      case "slideshow":
        return <SlideshowDraw {...drawProps} />;
      default: {
        // Tiện ích dạng DOM thật (form, bản đồ, video...). Ở editor chuột đi xuyên qua để chọn/kéo phần tử.
        const Dom = DOM_WIDGETS[element.widget];
        if (!Dom) return null;
        return (
          <Html divProps={{ style: { pointerEvents: viewer ? "auto" : "none" } }}>
            <Dom p={props} w={width} h={height} viewer={viewer} />
          </Html>
        );
      }
    }
  })();

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
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={(e) => {
        if (viewer && isActionButton) {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "pointer";
        }
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "default";
      }}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {/* Vùng bắt chuột trong suốt để chọn/bấm được cả khi các thành phần con không nhận sự kiện */}
      <Rect width={width} height={height} fill="rgba(0,0,0,0.001)" />
      {body}
    </Group>
  );
};

export default WidgetElementComponent;

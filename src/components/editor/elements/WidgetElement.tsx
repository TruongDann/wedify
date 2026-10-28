"use client";

import React, { useRef } from "react";
import { Group, Rect, Text, Path, Circle, Line } from "react-konva";
import Konva from "konva";
import { WidgetElement } from "@/types/editor";
import { useElementAnimation } from "../hooks/useElementAnimation";
import {
  HEART_PATH,
  MAP_FOOTER_HEIGHT,
  RSVP_LAYOUT,
  WEEKDAYS,
  formatMonthTitle,
  getCalendarWeeks,
  getCountdown,
  layoutCalendar,
  layoutCountdown,
  layoutRsvp,
  pad2,
  parseEventDate,
  widgetFontSize,
  isFramedWidget,
} from "@/components/widgets/widgetModel";
import {
  AlbumShape,
  CallShape,
  GiftQrShape,
  ReminderShape,
  SlideshowShape,
  YoutubeShape,
} from "./WidgetExtraShapes";

interface WidgetElementProps {
  element: WidgetElement;
  isSelected: boolean;
  onSelect: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

type BodyProps = { element: WidgetElement };

const Calendar: React.FC<BodyProps> = ({ element }) => {
  const { width, height } = element.size;
  const date = parseEventDate(element.eventDate);
  const weeks = getCalendarWeeks(date);
  const L = layoutCalendar(width, height, weeks.length);
  const fs = widgetFontSize(element);
  const font = element.fontFamily;
  const top = L.padding + L.titleHeight + L.weekdayHeight;

  return (
    <>
      <Text
        x={L.padding}
        y={L.padding}
        width={width - L.padding * 2}
        height={L.titleHeight}
        text={formatMonthTitle(date)}
        fontFamily={font}
        fontSize={fs * 1.3}
        fontStyle="bold"
        fill={element.color}
        align="center"
        verticalAlign="middle"
      />
      {WEEKDAYS.map((d, i) => (
        <Text
          key={d}
          x={L.padding + i * L.colWidth}
          y={L.padding + L.titleHeight}
          width={L.colWidth}
          height={L.weekdayHeight}
          text={d}
          fontFamily={font}
          fontSize={fs * 0.9}
          fontStyle="bold"
          fill={element.color}
          opacity={0.75}
          align="center"
          verticalAlign="middle"
        />
      ))}
      {weeks.flatMap((week, wi) =>
        week.map((day, di) => {
          if (day === null) return null;
          const x = L.padding + di * L.colWidth;
          const y = top + wi * L.rowHeight;
          const marked = day === date.getDate();
          const heart = Math.min(L.colWidth, L.rowHeight) * 0.92;
          return (
            <Group key={`${wi}-${di}`} x={x} y={y}>
              {marked && (
                <Path
                  data={HEART_PATH}
                  x={(L.colWidth - heart) / 2}
                  y={(L.rowHeight - heart) / 2}
                  scaleX={heart}
                  scaleY={heart}
                  fill={element.accentColor}
                />
              )}
              <Text
                width={L.colWidth}
                height={L.rowHeight}
                text={String(day)}
                fontFamily={font}
                fontSize={fs}
                fontStyle={marked ? "bold" : "normal"}
                fill={marked ? "#ffffff" : element.color}
                align="center"
                verticalAlign="middle"
              />
            </Group>
          );
        }),
      )}
    </>
  );
};

const Countdown: React.FC<BodyProps> = ({ element }) => {
  // Trên canvas chỉ cần ảnh tĩnh: số ngày/giờ còn lại tại lúc vẽ
  const parts = getCountdown(parseEventDate(element.eventDate));
  return (
    <>
      {layoutCountdown(element.size.width, element.size.height).map((box) => (
        <Group key={box.key} x={box.x}>
          <Rect
            width={box.width}
            height={box.height}
            fill={element.accentColor}
            cornerRadius={element.borderRadius}
          />
          <Text
            y={box.height * 0.12}
            width={box.width}
            height={box.height * 0.5}
            text={pad2(parts[box.key])}
            fontFamily={element.fontFamily}
            fontSize={box.valueSize}
            fontStyle="bold"
            fill={element.color}
            align="center"
            verticalAlign="bottom"
          />
          <Text
            y={box.height * 0.64}
            width={box.width}
            height={box.height * 0.26}
            text={box.label}
            fontFamily={element.fontFamily}
            fontSize={box.labelSize}
            fill={element.color}
            opacity={0.9}
            align="center"
            verticalAlign="top"
          />
        </Group>
      ))}
    </>
  );
};

const Rsvp: React.FC<BodyProps> = ({ element }) => {
  const { rsvp } = element;
  const L = RSVP_LAYOUT;
  const innerW = element.size.width - L.padding * 2;
  const font = element.fontFamily;

  return (
    <>
      {layoutRsvp(rsvp).rows.map((row, i) => {
        switch (row.kind) {
          case "title":
            return (
              <Text key={i} x={L.padding} y={row.y} width={innerW} height={row.height} text={rsvp.title} fontFamily={font} fontSize={L.titleSize} fontStyle="bold" fill={element.color} align="center" verticalAlign="middle" />
            );
          case "label":
            return (
              <Text key={i} x={L.padding} y={row.y} width={innerW} height={row.height} text={row.text} fontFamily={font} fontSize={L.labelSize} fontStyle="bold" fill={element.color} />
            );
          case "input":
            return (
              <Rect key={i} x={L.padding} y={row.y} width={innerW} height={row.height} fill="#ffffff" stroke="#d9d9d9" strokeWidth={1} cornerRadius={6} />
            );
          case "option":
            return (
              <Group key={i} x={L.padding} y={row.y}>
                <Circle x={7} y={row.height / 2} radius={7} stroke="#bfbfbf" strokeWidth={1} fill="#ffffff" />
                <Text x={22} width={innerW - 22} height={row.height} text={row.option} fontFamily={font} fontSize={L.fontSize} fill={element.color} verticalAlign="middle" />
              </Group>
            );
          case "button":
            return (
              <Group key={i} x={L.padding} y={row.y}>
                <Rect width={innerW} height={row.height} fill={rsvp.buttonColor} cornerRadius={6} />
                <Text width={innerW} height={row.height} text={rsvp.submitText} fontFamily={font} fontSize={14} fontStyle="bold" fill={rsvp.buttonTextColor} align="center" verticalAlign="middle" />
              </Group>
            );
        }
      })}
    </>
  );
};

/** Bản đồ thật (iframe Google Maps) chỉ có ở trang xem; trên canvas vẽ hình minh hoạ cùng bố cục. */
const MapPlaceholder: React.FC<BodyProps> = ({ element }) => {
  const { width, height } = element.size;
  const mapH = Math.max(height - MAP_FOOTER_HEIGHT, 0);
  const pinX = width / 2;
  const pinY = mapH / 2;
  const btnW = 92;

  return (
    <>
      <Rect width={width} height={mapH} fill="#e8eee4" />
      {/* đường phố minh hoạ */}
      <Line points={[0, mapH * 0.35, width, mapH * 0.55]} stroke="#ffffff" strokeWidth={10} />
      <Line points={[width * 0.3, 0, width * 0.42, mapH]} stroke="#ffffff" strokeWidth={8} />
      <Line points={[width * 0.75, 0, width * 0.62, mapH]} stroke="#ffffff" strokeWidth={6} />
      <Path
        data="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
        x={pinX - 15}
        y={pinY - 45}
        scaleX={1.25}
        scaleY={1.25}
        fill={element.accentColor}
      />
      <Circle x={pinX} y={pinY - 30} radius={5.5} fill="#ffffff" />
      <Rect y={mapH} width={width} height={MAP_FOOTER_HEIGHT} fill="#ffffff" />
      <Text x={12} y={mapH + 14} width={width - btnW - 34} text={element.map.placeName} fontFamily={element.fontFamily} fontSize={14} fontStyle="bold" fill={element.color} wrap="none" ellipsis />
      <Text x={12} y={mapH + 35} width={width - btnW - 34} text={element.map.address} fontFamily={element.fontFamily} fontSize={12} fill={element.color} opacity={0.7} wrap="none" ellipsis />
      <Group x={width - btnW - 12} y={mapH + (MAP_FOOTER_HEIGHT - 34) / 2}>
        <Rect width={btnW} height={34} fill={element.accentColor} cornerRadius={6} />
        <Text width={btnW} height={34} text={element.map.buttonText} fontFamily={element.fontFamily} fontSize={13} fontStyle="bold" fill="#ffffff" align="center" verticalAlign="middle" />
      </Group>
    </>
  );
};

const WidgetElementComponent: React.FC<WidgetElementProps> = ({
  element,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  useElementAnimation(groupRef, element);
  const { width, height } = element.size;
  const framed = isFramedWidget(element);

  const Body = {
    calendar: Calendar,
    countdown: Countdown,
    rsvp: Rsvp,
    map: MapPlaceholder,
    call: CallShape,
    reminder: ReminderShape,
    youtube: YoutubeShape,
    slideshow: SlideshowShape,
    album: AlbumShape,
    giftQr: GiftQrShape,
  }[element.widget];

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
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      clipFunc={
        framed && element.borderRadius > 0
          ? (ctx) => {
              ctx.beginPath();
              ctx.roundRect(0, 0, width, height, element.borderRadius);
              ctx.closePath();
            }
          : undefined
      }
    >
      {/* Nền (luôn có để bấm chọn được cả vùng trống) */}
      <Rect
        width={width}
        height={height}
        fill={framed && element.backgroundColor !== "transparent" ? element.backgroundColor : "rgba(0,0,0,0)"}
        cornerRadius={framed ? element.borderRadius : 0}
      />
      <Body element={element} />
    </Group>
  );
};

export default WidgetElementComponent;

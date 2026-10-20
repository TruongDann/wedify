"use client";

import React, { useEffect, useState } from "react";
import { WidgetElement } from "@/types/editor";
import { submitRsvp } from "@/lib/rsvpStore";
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
  mapDirectionsUrl,
  mapEmbedUrl,
  pad2,
  parseEventDate,
  widgetFontSize,
  isFramedWidget,
} from "@/components/widgets/widgetModel";
import { ElementFrame } from "./ElementFrame";
import {
  AlbumView,
  CallView,
  GiftQrView,
  ReminderView,
  SlideshowView,
  YoutubeView,
} from "./WidgetExtraViews";

type Props = { element: WidgetElement };

const fontStack = (font: string) => `"${font}", sans-serif`;

const CalendarView: React.FC<Props> = ({ element }) => {
  const { width, height } = element.size;
  const date = parseEventDate(element.eventDate);
  const weeks = getCalendarWeeks(date);
  const L = layoutCalendar(width, height, weeks.length);
  const fs = widgetFontSize(element);

  return (
    <div style={{ position: "absolute", inset: 0, padding: L.padding, color: element.color }}>
      <div
        style={{
          height: L.titleHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: fs * 1.3,
          fontWeight: 700,
        }}
      >
        {formatMonthTitle(date)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", height: L.weekdayHeight }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs * 0.9, fontWeight: 600, opacity: 0.75 }}>
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", height: L.rowHeight }}>
          {week.map((day, di) => {
            const marked = day === date.getDate();
            const heart = Math.min(L.colWidth, L.rowHeight) * 0.92;
            return (
              <div key={di} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs }}>
                {marked && (
                  <svg viewBox="0 0 1 1" width={heart} height={heart} style={{ position: "absolute" }} aria-hidden>
                    <path d={HEART_PATH} fill={element.accentColor} />
                  </svg>
                )}
                <span style={{ position: "relative", fontWeight: marked ? 700 : 400, color: marked ? "#ffffff" : undefined }}>
                  {day ?? ""}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const CountdownView: React.FC<Props> = ({ element }) => {
  const target = parseEventDate(element.eventDate);
  // Tính ở client sau khi mount để không lệch giữa server và trình duyệt
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  const parts = now ? getCountdown(target, now) : null;

  return (
    <>
      {layoutCountdown(element.size.width, element.size.height).map((box) => (
        <div
          key={box.key}
          style={{
            position: "absolute",
            left: box.x,
            top: 0,
            width: box.width,
            height: box.height,
            background: element.accentColor,
            borderRadius: element.borderRadius,
            color: element.color,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.1,
          }}
        >
          <span style={{ fontSize: box.valueSize, fontWeight: 700 }}>
            {parts ? pad2(parts[box.key]) : "--"}
          </span>
          <span style={{ fontSize: box.labelSize, opacity: 0.9 }}>{box.label}</span>
        </div>
      ))}
    </>
  );
};

const RsvpView: React.FC<Props> = ({ element }) => {
  const { rsvp } = element;
  const L = RSVP_LAYOUT;
  const { rows } = layoutRsvp(rsvp);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name?.trim() || !values.attend) return;
    setStatus("sending");
    await submitRsvp({
      name: values.name.trim(),
      attend: values.attend,
      guests: values.guests ? Number(values.guests) : undefined,
      side: values.side,
      message: values.message?.trim() || undefined,
    });
    setStatus("done");
  };

  const inputStyle: React.CSSProperties = {
    position: "absolute",
    left: L.padding,
    right: L.padding,
    border: "1px solid #d9d9d9",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: L.fontSize,
    fontFamily: "inherit",
    color: "inherit",
    background: "#ffffff",
    resize: "none",
  };

  if (status === "done") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: L.padding, textAlign: "center", fontSize: L.titleSize }}>
        {rsvp.thankYouText}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ position: "absolute", inset: 0 }}>
      {rows.map((row, i) => {
        switch (row.kind) {
          case "title":
            return (
              <div key={i} style={{ position: "absolute", left: L.padding, right: L.padding, top: row.y, height: row.height, display: "flex", alignItems: "center", justifyContent: "center", fontSize: L.titleSize, fontWeight: 700 }}>
                {rsvp.title}
              </div>
            );
          case "label":
            return (
              <div key={i} style={{ position: "absolute", left: L.padding, right: L.padding, top: row.y, height: row.height, fontSize: L.labelSize, fontWeight: 600 }}>
                {row.text}
              </div>
            );
          case "input": {
            const { field } = row;
            const common = {
              value: values[field.key] ?? "",
              style: { ...inputStyle, top: row.y, height: row.height },
              "aria-label": field.label,
            };
            if (field.kind === "number")
              return <input key={i} type="number" min={1} max={20} {...common} onChange={(e) => set(field.key, e.target.value)} />;
            if (field.kind === "text" && field.multiline)
              return <textarea key={i} {...common} onChange={(e) => set(field.key, e.target.value)} />;
            return <input key={i} type="text" required {...common} onChange={(e) => set(field.key, e.target.value)} />;
          }
          case "option":
            return (
              <label key={i} style={{ position: "absolute", left: L.padding, right: L.padding, top: row.y, height: row.height, display: "flex", alignItems: "center", gap: 8, fontSize: L.fontSize, cursor: "pointer" }}>
                <input
                  type="radio"
                  name={`${element.id}-${row.field.key}`}
                  value={row.option}
                  required={row.field.key === "attend"}
                  checked={values[row.field.key] === row.option}
                  onChange={() => set(row.field.key, row.option)}
                  style={{ accentColor: rsvp.buttonColor, margin: 0, width: 14, height: 14 }}
                />
                {row.option}
              </label>
            );
          case "button":
            return (
              <button
                key={i}
                type="submit"
                disabled={status === "sending"}
                style={{ position: "absolute", left: L.padding, right: L.padding, top: row.y, height: row.height, border: 0, borderRadius: 6, background: rsvp.buttonColor, color: rsvp.buttonTextColor, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}
              >
                {status === "sending" ? "Đang gửi…" : rsvp.submitText}
              </button>
            );
        }
      })}
    </form>
  );
};

const MapView: React.FC<Props> = ({ element }) => {
  const { map } = element;
  return (
    <>
      <iframe
        title={map.placeName || "Bản đồ"}
        src={mapEmbedUrl(map.address)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ position: "absolute", left: 0, top: 0, width: "100%", height: `calc(100% - ${MAP_FOOTER_HEIGHT}px)`, border: 0 }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: MAP_FOOTER_HEIGHT, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", background: "#ffffff" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{map.placeName}</div>
          <div style={{ fontSize: 12, opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{map.address}</div>
        </div>
        <a
          href={mapDirectionsUrl(map.address)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 6, background: element.accentColor, color: "#ffffff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          {map.buttonText}
        </a>
      </div>
    </>
  );
};

/** Hiển thị tiện ích bằng HTML — tương ứng components/editor/elements/WidgetElement.tsx. */
const WidgetView: React.FC<Props> = ({ element }) => {
  const { width, height } = element.size;
  const framed = isFramedWidget(element);
  const body = {
    calendar: <CalendarView element={element} />,
    countdown: <CountdownView element={element} />,
    rsvp: <RsvpView element={element} />,
    map: <MapView element={element} />,
    call: <CallView element={element} />,
    reminder: <ReminderView element={element} />,
    youtube: <YoutubeView element={element} />,
    slideshow: <SlideshowView element={element} />,
    album: <AlbumView element={element} />,
    giftQr: <GiftQrView element={element} />,
  }[element.widget];

  return (
    <ElementFrame element={element} width={width} height={height}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          // Danh sách chọn lịch của "Lời nhắc" cần tràn ra ngoài nút
          overflow: element.widget === "reminder" ? "visible" : "hidden",
          borderRadius: framed ? element.borderRadius : undefined,
          background: framed ? element.backgroundColor : undefined,
          boxShadow: element.widget === "rsvp" ? "0 2px 10px rgba(0,0,0,0.1)" : undefined,
          color: element.color,
          fontFamily: fontStack(element.fontFamily),
        }}
      >
        {body}
      </div>
    </ElementFrame>
  );
};

export default WidgetView;

"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarPlus, ChevronLeft, ChevronRight, Copy, Phone, X } from "lucide-react";
import { WidgetElement } from "@/types/editor";
import {
  bankName,
  giftQrUrl,
  layoutAlbum,
  layoutGift,
  reminderLinks,
  widgetButton,
  widgetGift,
  widgetMedia,
  youtubeEmbedUrl,
  youtubeId,
} from "@/components/widgets/widgetModel";

type Props = { element: WidgetElement };

const buttonStyle = (el: WidgetElement): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: 0,
  borderRadius: el.borderRadius,
  background: el.accentColor,
  color: el.color,
  fontFamily: "inherit",
  fontSize: Math.min(16, el.size.height * 0.36),
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
});

/** Nút gọi điện. */
export const CallView: React.FC<Props> = ({ element }) => {
  const { label, phone } = widgetButton(element);
  return (
    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} style={buttonStyle(element)}>
      <Phone size={Math.min(18, element.size.height * 0.4)} />
      {label}
    </a>
  );
};

/** Lời nhắc lịch: bấm mở danh sách Google Calendar / file .ics cho Apple, Outlook. */
export const ReminderView: React.FC<Props> = ({ element }) => {
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Menu nằm ngoài thiệp (thiệp đang bị thu nhỏ bằng transform) nên đóng khi cuộn / bấm ra ngoài
  useEffect(() => {
    if (!menuAt) return;
    const close = () => setMenuAt(null);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("pointerdown", close);
    };
  }, [menuAt]);

  const toggle = () => {
    if (menuAt) return setMenuAt(null);
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setMenuAt({ x: r.left + r.width / 2, y: r.bottom + 6 });
  };
  const links = reminderLinks(element);
  const { label } = widgetButton(element);

  useEffect(() => {
    if (!links) return;
    const url = URL.createObjectURL(new Blob([links.ics], { type: "text/calendar" }));
    const timer = setTimeout(() => setIcsUrl(url), 0);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };
  }, [links?.ics]); // eslint-disable-line react-hooks/exhaustive-deps -- chỉ tạo lại khi nội dung đổi

  const item: React.CSSProperties = {
    display: "block",
    padding: "10px 14px",
    fontSize: 14,
    color: "#333",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  return (
    <>
      <button ref={buttonRef} type="button" style={buttonStyle(element)} onClick={toggle}>
        <CalendarPlus size={Math.min(18, element.size.height * 0.4)} />
        {label}
      </button>
      {menuAt && links && createPortal(
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: menuAt.y,
            left: menuAt.x,
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            zIndex: 70,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <a href={links.google} target="_blank" rel="noopener noreferrer" style={item}>
            Google Calendar
          </a>
          {icsUrl && (
            <a href={icsUrl} download="dam-cuoi.ics" style={{ ...item, borderTop: "1px solid #eee" }}>
              Apple / Outlook (.ics)
            </a>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

/** Video YouTube nhúng. */
export const YoutubeView: React.FC<Props> = ({ element }) => {
  const id = youtubeId(widgetMedia(element).videoUrl);
  if (!id)
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#aaa", fontSize: 13 }}>
        Chưa có video
      </div>
    );
  return (
    <iframe
      title="Video"
      src={youtubeEmbedUrl(id)}
      loading="lazy"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
};

/** Trình chiếu ảnh: tự chuyển, mờ dần sang ảnh kế tiếp. */
export const SlideshowView: React.FC<Props> = ({ element }) => {
  const { images, interval } = widgetMedia(element);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), Math.max(1, interval) * 1000);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng (data URL / URL ngoài)
        <img
          key={src + i}
          src={src}
          alt=""
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            maxWidth: "none",
            objectFit: "cover",
            transition: "opacity 1s ease",
            opacity: i === index % images.length ? 1 : 0,
          }}
        />
      ))}
      {images.length > 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "flex", justifyContent: "center", gap: 6 }}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ảnh ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                width: 8,
                height: 8,
                padding: 0,
                border: 0,
                borderRadius: "50%",
                cursor: "pointer",
                background: i === index % images.length ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

/** Album ảnh dạng lưới, bấm để xem lớn. */
export const AlbumView: React.FC<Props> = ({ element }) => {
  const { images, columns } = widgetMedia(element);
  const [open, setOpen] = useState<number | null>(null);
  const cells = layoutAlbum(element.size.width, element.size.height, images.length, columns);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  const navButton: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.15)",
    border: 0,
    borderRadius: "50%",
    width: 40,
    height: 40,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <>
      {cells.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setOpen(i)}
          aria-label={`Xem ảnh ${i + 1}`}
          style={{ position: "absolute", left: c.x, top: c.y, width: c.size, height: c.size, padding: 0, border: 0, cursor: "zoom-in", overflow: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng */}
          <img src={images[i]} alt="" loading="lazy" style={{ width: "100%", height: "100%", maxWidth: "none", objectFit: "cover" }} />
        </button>
      ))}
      {open !== null && createPortal(
        <div
          role="dialog"
          aria-label="Xem ảnh"
          onClick={() => setOpen(null)}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng */}
          <img src={images[open]} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "94vw", maxHeight: "86vh", objectFit: "contain" }} />
          <button type="button" aria-label="Đóng" onClick={() => setOpen(null)} style={{ ...navButton, top: 16, right: 16, transform: "none" }}>
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Ảnh trước" style={{ ...navButton, left: 12 }} onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + images.length) % images.length); }}>
                <ChevronLeft size={22} />
              </button>
              <button type="button" aria-label="Ảnh sau" style={{ ...navButton, right: 12 }} onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % images.length); }}>
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

/** Thẻ QR mừng cưới (VietQR) + sao chép số tài khoản. */
export const GiftQrView: React.FC<Props> = ({ element }) => {
  const gift = widgetGift(element);
  const L = layoutGift(element.size.width, element.size.height);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(gift.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt không cho ghi clipboard (http, iframe...) — bỏ qua
    }
  };

  return (
    <>
      <div style={{ position: "absolute", left: L.padding, right: L.padding, top: L.padding, height: L.titleHeight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
        {gift.title}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR do VietQR tạo */}
      <img
        src={giftQrUrl(gift)}
        alt={`QR chuyển khoản ${bankName(gift.bankCode)} ${gift.accountNumber}`}
        loading="lazy"
        style={{ position: "absolute", left: L.qrX, top: L.qrY, width: L.qr, height: L.qr, maxWidth: "none", background: "#fff" }}
      />
      <div style={{ position: "absolute", left: L.padding, right: L.padding, top: L.infoY, textAlign: "center", fontSize: 13, lineHeight: 1.45 }}>
        <div style={{ fontWeight: 700 }}>{gift.accountName}</div>
        <div>{bankName(gift.bankCode)}</div>
        <button
          type="button"
          onClick={copy}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, border: 0, background: "transparent", color: element.accentColor, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          {gift.accountNumber} <Copy size={13} /> {copied ? "Đã chép" : ""}
        </button>
      </div>
    </>
  );
};

/** Hộp bật lên hiện thẻ QR mừng cưới — mở bằng hành động "Mở hộp QR mừng cưới". */
export const GiftModal: React.FC<{ element: WidgetElement; onClose: () => void }> = ({ element, onClose }) => {
  const { width, height } = element.size;
  return (
    <div
      role="dialog"
      aria-label="Mừng cưới"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width,
          height,
          maxWidth: "100%",
          borderRadius: Math.max(element.borderRadius, 12),
          background: element.backgroundColor === "transparent" ? "#ffffff" : element.backgroundColor,
          color: element.color,
          fontFamily: `"${element.fontFamily}", sans-serif`,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        }}
      >
        <GiftQrView element={element} />
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          style={{ position: "absolute", top: 8, right: 8, border: 0, background: "transparent", cursor: "pointer", color: "#999" }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

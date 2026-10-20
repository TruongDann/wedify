/**
 * Logic thuần của các tiện ích (không phụ thuộc Konva hay DOM) —
 * dùng chung cho canvas editor (WidgetElement.tsx) và trang xem thiệp (WidgetView.tsx).
 */

import type {
  ButtonSettings,
  GiftSettings,
  MediaSettings,
  RsvpSettings,
  WidgetElement,
} from "@/types/editor";

export const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** "YYYY-MM-DDTHH:mm" → Date theo giờ địa phương (new Date(string) coi chuỗi không có múi giờ là UTC trên một số trình duyệt). */
export const parseEventDate = (value: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value || "");
  if (!m) return new Date(NaN);
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
};

/** Các tuần của tháng chứa ngày cưới, bắt đầu từ thứ Hai; ô trống là null. */
export const getCalendarWeeks = (date: Date): (number | null)[][] => {
  if (isNaN(date.getTime())) return [];
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = thứ Hai
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

export const formatMonthTitle = (date: Date) =>
  isNaN(date.getTime()) ? "" : `Tháng ${date.getMonth() + 1} / ${date.getFullYear()}`;

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const getCountdown = (target: Date, now: Date = new Date()): CountdownParts => {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

export const COUNTDOWN_UNITS: { key: keyof CountdownParts; label: string }[] = [
  { key: "days", label: "Ngày" },
  { key: "hours", label: "Giờ" },
  { key: "minutes", label: "Phút" },
  { key: "seconds", label: "Giây" },
];

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const mapEmbedUrl = (address: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;

export const mapDirectionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

/** Các ô của form xác nhận tham dự theo thứ tự hiển thị. */
export type RsvpField =
  | { kind: "text"; key: "name" | "message"; label: string; multiline?: boolean }
  | { kind: "choice"; key: "attend" | "side"; label: string; options: string[] }
  | { kind: "number"; key: "guests"; label: string };

export const getRsvpFields = (rsvp: RsvpSettings): RsvpField[] => [
  { kind: "text", key: "name", label: rsvp.nameLabel },
  { kind: "choice", key: "attend", label: rsvp.attendLabel, options: [rsvp.attendYesText, rsvp.attendNoText] },
  ...(rsvp.enableGuestCount
    ? [{ kind: "number" as const, key: "guests" as const, label: rsvp.guestCountLabel }]
    : []),
  ...(rsvp.enableGuestSide
    ? [{ kind: "choice" as const, key: "side" as const, label: rsvp.guestSideLabel, options: [rsvp.groomSideText, rsvp.brideSideText] }]
    : []),
  ...(rsvp.enableMessage
    ? [{ kind: "text" as const, key: "message" as const, label: rsvp.messageLabel, multiline: true }]
    : []),
];

/** Cỡ chữ cơ sở của tiện ích, tỉ lệ theo bề rộng để kéo to/nhỏ khung thì chữ to/nhỏ theo. */
export const widgetFontSize = (el: WidgetElement) => {
  switch (el.widget) {
    case "calendar":
      return Math.max(9, el.size.width / 24);
    case "countdown":
      return Math.max(9, Math.min(el.size.width / 22, el.size.height / 5.5));
    default:
      return 14;
  }
};

/** Bố cục form xác nhận tham dự (px) — editor vẽ và trang xem đặt ô nhập theo cùng các toạ độ này. */
export const RSVP_LAYOUT = {
  padding: 18,
  titleHeight: 34,
  titleSize: 20,
  labelHeight: 22,
  labelSize: 13,
  inputHeight: 36,
  textareaHeight: 64,
  optionHeight: 26,
  fieldGap: 12,
  buttonGap: 18,
  buttonHeight: 40,
  fontSize: 13,
};

export type RsvpRow =
  | { kind: "title"; y: number; height: number }
  | { kind: "label"; y: number; height: number; text: string }
  | { kind: "input"; y: number; height: number; field: RsvpField }
  | { kind: "option"; y: number; height: number; field: RsvpField; option: string; index: number }
  | { kind: "button"; y: number; height: number };

export const layoutRsvp = (rsvp: RsvpSettings): { rows: RsvpRow[]; height: number } => {
  const L = RSVP_LAYOUT;
  const rows: RsvpRow[] = [];
  let y = L.padding;
  rows.push({ kind: "title", y, height: L.titleHeight });
  y += L.titleHeight + L.fieldGap;
  for (const field of getRsvpFields(rsvp)) {
    rows.push({ kind: "label", y, height: L.labelHeight, text: field.label });
    y += L.labelHeight;
    if (field.kind === "choice") {
      field.options.forEach((option, index) => {
        rows.push({ kind: "option", y, height: L.optionHeight, field, option, index });
        y += L.optionHeight;
      });
    } else {
      const height = field.kind === "text" && field.multiline ? L.textareaHeight : L.inputHeight;
      rows.push({ kind: "input", y, height, field });
      y += height;
    }
    y += L.fieldGap;
  }
  y += L.buttonGap - L.fieldGap;
  rows.push({ kind: "button", y, height: L.buttonHeight });
  y += L.buttonHeight + L.padding;
  return { rows, height: y };
};

/** Bố cục lịch tháng theo kích thước khung. */
export const layoutCalendar = (width: number, height: number, weeks: number) => {
  const padding = Math.min(width, height) * 0.05;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const titleHeight = innerH * 0.15;
  const weekdayHeight = innerH * 0.11;
  const rowHeight = (innerH - titleHeight - weekdayHeight) / Math.max(weeks, 1);
  const colWidth = innerW / 7;
  return { padding, titleHeight, weekdayHeight, rowHeight, colWidth };
};

/** Bố cục 4 ô đếm ngược nằm ngang. */
export const layoutCountdown = (width: number, height: number) => {
  const gap = width * 0.04;
  const boxWidth = (width - gap * 3) / 4;
  return COUNTDOWN_UNITS.map((unit, i) => ({
    ...unit,
    x: i * (boxWidth + gap),
    width: boxWidth,
    height,
    valueSize: Math.min(height * 0.4, boxWidth * 0.42),
    labelSize: Math.min(height * 0.17, boxWidth * 0.2),
  }));
};

/** Bản đồ: phần trên là bản đồ, dải dưới là tên địa điểm + nút chỉ đường. */
export const MAP_FOOTER_HEIGHT = 64;

/** Đường trái tim chuẩn hoá trong hộp 0..1 — đánh dấu ngày cưới trên lịch. */
export const HEART_PATH =
  "M0.5 0.92 C0.18 0.68 0 0.5 0 0.3 C0 0.13 0.13 0 0.29 0 C0.38 0 0.46 0.05 0.5 0.12 C0.54 0.05 0.62 0 0.71 0 C0.87 0 1 0.13 1 0.3 C1 0.5 0.82 0.68 0.5 0.92 Z";

// ---------------------------------------------------------------------------
// Nút gọi, lời nhắc lịch, video, ảnh, QR mừng cưới
// ---------------------------------------------------------------------------

export const DEFAULT_BUTTON: ButtonSettings = {
  label: "Gọi cho chúng mình",
  phone: "0900000000",
  eventTitle: "Lễ cưới của chúng mình",
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const DEFAULT_MEDIA: MediaSettings = {
  videoUrl: "",
  images: [
    unsplash("1591604466107-ec97de577aff"),
    unsplash("1532712938310-34cb3982ef74"),
    unsplash("1520854221256-17451cc331bf"),
    unsplash("1511285560929-80b456fea0bc"),
    unsplash("1606800052052-a08af7148866"),
    unsplash("1525258946800-98cfd641d0de"),
  ],
  interval: 3,
  columns: 3,
};

export const DEFAULT_GIFT: GiftSettings = {
  title: "Hộp mừng cưới",
  bankCode: "VCB",
  accountNumber: "0123456789",
  accountName: "NGUYEN VAN A",
  note: "Mung cuoi",
};

/** Ngân hàng hay dùng — mã theo VietQR. */
export const BANKS = [
  { code: "VCB", name: "Vietcombank" },
  { code: "TCB", name: "Techcombank" },
  { code: "MB", name: "MB Bank" },
  { code: "ACB", name: "ACB" },
  { code: "VPB", name: "VPBank" },
  { code: "BIDV", name: "BIDV" },
  { code: "ICB", name: "VietinBank" },
  { code: "TPB", name: "TPBank" },
  { code: "VBA", name: "Agribank" },
  { code: "STB", name: "Sacombank" },
  { code: "OCB", name: "OCB" },
  { code: "MSB", name: "MSB" },
];

export const widgetButton = (el: WidgetElement): ButtonSettings => ({ ...DEFAULT_BUTTON, ...el.button });
export const widgetMedia = (el: WidgetElement): MediaSettings => ({ ...DEFAULT_MEDIA, ...el.media });
export const widgetGift = (el: WidgetElement): GiftSettings => ({ ...DEFAULT_GIFT, ...el.gift });

/** Lấy id video từ mọi dạng link YouTube (watch?v=, youtu.be/, embed/, shorts/). */
export const youtubeId = (url: string): string | null => {
  const m =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/.exec(url || "") ??
    /^([\w-]{11})$/.exec((url || "").trim());
  return m ? m[1] : null;
};

export const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;

export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const calendarStamp = (d: Date) =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;

/** Lời nhắc lịch: link Google Calendar và nội dung file .ics (Apple / Outlook) — sự kiện kéo dài 3 tiếng. */
export const reminderLinks = (el: WidgetElement) => {
  const start = parseEventDate(el.eventDate);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 3 * 3600 * 1000);
  const { eventTitle } = widgetButton(el);
  const location = el.map?.address ?? "";
  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(eventTitle)}` +
    `&dates=${calendarStamp(start)}/${calendarStamp(end)}` +
    `&ctz=Asia/Ho_Chi_Minh` +
    `&location=${encodeURIComponent(location)}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedify//VI",
    "BEGIN:VEVENT",
    `UID:${el.id}@wedify`,
    `DTSTAMP:${calendarStamp(new Date())}`,
    `DTSTART:${calendarStamp(start)}`,
    `DTEND:${calendarStamp(end)}`,
    `SUMMARY:${eventTitle}`,
    `LOCATION:${location}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${eventTitle}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return { google, ics };
};

/** Ảnh QR chuyển khoản do VietQR tạo (img.vietqr.io). */
export const giftQrUrl = (gift: GiftSettings) =>
  `https://img.vietqr.io/image/${encodeURIComponent(gift.bankCode)}-${encodeURIComponent(gift.accountNumber)}-qr_only.png` +
  `?addInfo=${encodeURIComponent(gift.note)}&accountName=${encodeURIComponent(gift.accountName)}`;

export const bankName = (code: string) => BANKS.find((b) => b.code === code)?.name ?? code;

/** Bố cục thẻ QR mừng cưới: tiêu đề, ảnh QR vuông, 3 dòng thông tin. */
export const layoutGift = (width: number, height: number) => {
  const padding = 14;
  const titleHeight = 30;
  const infoHeight = 66;
  const qr = Math.max(0, Math.min(width - padding * 2, height - padding * 2 - titleHeight - infoHeight));
  return {
    padding,
    titleHeight,
    qr,
    qrX: (width - qr) / 2,
    qrY: padding + titleHeight,
    infoY: padding + titleHeight + qr + 8,
  };
};

/** Ô ảnh của album theo số cột (ảnh vuông, khoảng cách 4px). */
export const layoutAlbum = (width: number, height: number, count: number, columns: number) => {
  const gap = 4;
  const cols = Math.max(1, columns);
  const cell = (width - gap * (cols - 1)) / cols;
  return Array.from({ length: count }, (_, i) => ({
    x: (i % cols) * (cell + gap),
    y: Math.floor(i / cols) * (cell + gap),
    size: cell,
  })).filter((c) => c.y < height);
};

/** Tiện ích tự vẽ nền riêng (ô, nút) — không có khung nền/bo góc chung. */
export const isFramedWidget = (el: WidgetElement) =>
  !["countdown", "call", "reminder"].includes(el.widget);

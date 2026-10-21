import type { WidgetElement, WidgetKind } from "@/types/editor";

export interface WidgetPreset {
  id: string;
  label: string;
  icon: string;
  description?: string;
  build: (canvasWidth: number) => Omit<WidgetElement, "id" | "zIndex">;
}

const isoDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const make = (
  widget: WidgetKind,
  canvasWidth: number,
  size: { width: number; height: number },
  props: Record<string, any>,
  y = 160,
): Omit<WidgetElement, "id" | "zIndex"> => ({
  type: "widget",
  widget,
  props,
  position: { x: Math.max(0, Math.round((canvasWidth - size.width) / 2)), y },
  size,
  rotation: 0,
  opacity: 1,
  locked: false,
  animation: { enabled: true, continuous: false, type: "slideUp", delay: 0 },
});

const button = (action: string, label: string, icon: string, bgColor = "#ef4565", value = "") => (canvasWidth: number) =>
  make("button", canvasWidth, { width: 260, height: 52 }, { action, label, icon, bgColor, textColor: "#ffffff", fontFamily: "Montserrat", fontSize: 17, variant: "solid", value });

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=700&fit=crop&q=80",
];

export const WIDGET_PRESETS: WidgetPreset[] = [
  {
    id: "calendar",
    label: "Lịch",
    icon: "📅",
    build: (w) => make("calendar", w, { width: 320, height: 300 }, { date: isoDate(30), marker: "heart", accent: "#ef4565", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.88)", fontFamily: "Playfair Display" }),
  },
  {
    id: "countdown",
    label: "Đếm ngược",
    icon: "⏳",
    build: (w) => make("countdown", w, { width: 480, height: 96 }, { date: isoDate(30), time: "17:00", accent: "#ef4565", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.88)", fontFamily: "Playfair Display", style: "boxed", labels: ["Ngày", "Giờ", "Phút", "Giây"] }),
  },
  {
    id: "rsvp",
    label: "Form tham dự",
    icon: "💌",
    build: (w) => make("rsvpForm", w, { width: 440, height: 430 }, { title: "Xác nhận tham dự", description: "Quý khách vui lòng xác nhận để chúng tôi chuẩn bị chu đáo hơn.", showCount: true, showContact: true, buttonLabel: "Gửi xác nhận", accent: "#ef4565", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.93)", fontFamily: "Playfair Display", radius: 22 }),
  },
  {
    id: "gift",
    label: "Hộp quà QR",
    icon: "🎁",
    build: (w) => make("giftBox", w, { width: 440, height: 470 }, { title: "Hộp quà mừng", description: "Cảm ơn tấm lòng của bạn dành cho chúng tôi.", groups: [{ name: "Nhà trai", accounts: [{ holder: "", bank: "", number: "", qrImage: "" }] }, { name: "Nhà gái", accounts: [{ holder: "", bank: "", number: "", qrImage: "" }] }], showHearts: true, accent: "#d97706", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.93)", fontFamily: "Playfair Display", radius: 22 }),
  },
  {
    id: "map",
    label: "Bản đồ",
    icon: "📍",
    build: (w) => make("mapEmbed", w, { width: 460, height: 320 }, { title: "Địa điểm tổ chức", address: "", zoom: 16, lock: true, showDirections: true, showTitle: true, accent: "#0d9488", fontFamily: "Playfair Display", radius: 22 }),
  },
  {
    id: "video",
    label: "Nhúng video",
    icon: "🎬",
    build: (w) => make("video", w, { width: 460, height: 260 }, { url: "", title: "Video", radius: 22 }),
  },
  {
    id: "contact",
    label: "Nút liên hệ",
    icon: "📞",
    build: (w) => make("contactCard", w, { width: 400, height: 240 }, { title: "Liên hệ", items: [{ label: "Chú rể", type: "phone", value: "" }, { label: "Cô dâu", type: "phone", value: "" }], accent: "#2563eb", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.93)", fontFamily: "Playfair Display", radius: 22 }),
  },
  {
    id: "guestbook",
    label: "Sổ lưu bút",
    icon: "📖",
    build: (w) => make("guestbook", w, { width: 440, height: 500 }, { title: "Sổ lưu bút", description: "Gửi những lời chúc tốt đẹp nhất đến chúng tôi.", showForm: true, accent: "#db2777", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.93)", fontFamily: "Playfair Display", radius: 22 }),
  },
  { id: "reminder", label: "Thêm lời nhắc", icon: "⏰", build: button("reminder", "Thêm lời nhắc", "⏰", "#7c3aed") },
  { id: "share", label: "Chia sẻ", icon: "🔗", build: button("share", "Chia sẻ thiệp", "🔗", "#475569") },
  {
    id: "album",
    label: "Album ảnh",
    icon: "🖼️",
    build: (w) => make("slideshow", w, { width: 460, height: 320 }, { images: SAMPLE_PHOTOS, interval: 3, effect: "fade", radius: 20 }),
  },
  {
    id: "carousel",
    label: "Carousel",
    icon: "🎠",
    build: (w) => make("slideshow", w, { width: 460, height: 320 }, { images: SAMPLE_PHOTOS, interval: 3, effect: "slide", radius: 20 }),
  },
];

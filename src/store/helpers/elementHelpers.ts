import {
  TextElement,
  ImageElement,
  ShapeElement,
  WidgetElement,
  WidgetKind,
  RsvpSettings,
  MapSettings,
} from "@/types/editor";
import {
  DEFAULT_BUTTON,
  DEFAULT_GIFT,
  DEFAULT_MEDIA,
  layoutRsvp,
} from "@/components/widgets/widgetModel";

/**
 * Helper function to create a text element with default values
 */
export const createTextElement = (
  overrides?: Partial<TextElement>,
): Omit<TextElement, "id" | "zIndex"> => ({
  type: "text",
  content: "Nhập văn bản",
  position: { x: 100, y: 100 },
  size: { width: 200, height: 80 },
  rotation: 0,
  opacity: 1,
  locked: false,
  fontFamily: "Times New Roman",
  fontSize: 24,
  fontWeight: 400,
  fontStyle: "normal",
  textDecoration: "none",
  textAlign: "center",
  color: "#333333",
  backgroundColor: "transparent",
  lineHeight: 1.5,
  letterSpacing: 0,
  // Padding
  padding: { top: 5, right: 5, bottom: 5, left: 5 },
  // Border
  border: { width: 0, color: "#000000", style: "solid", position: "all" },
  // Border Radius
  borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
  // Shadow
  shadow: { enabled: false, x: 0, y: 4, blur: 8, color: "rgba(0,0,0,0.2)" },
  // Link
  hyperlink: "",
  // Animation
  animation: { enabled: false, continuous: false, type: "none" },
  // Text Effects
  textEffect: {
    type: "none",
    offset: 50,
    direction: -45,
    blur: 0,
    transparency: 40,
    color: "#000000",
    intensity: 50,
    spread: 50,
    roundness: 50,
    curveAmount: 0,
  },
  ...overrides,
});

/**
 * Helper function to create an image element with default values
 */
export const createImageElement = (
  src: string,
  overrides?: Partial<ImageElement>,
): Omit<ImageElement, "id" | "zIndex"> => ({
  type: "image",
  src,
  alt: "Image",
  position: { x: 100, y: 100 },
  size: { width: 200, height: 200 },
  rotation: 0,
  opacity: 1,
  locked: false,
  objectFit: "cover",
  // Padding
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  // Border
  border: {
    width: 0,
    color: "#000000",
    style: "solid",
    position: "all",
  },
  // Border Radius
  borderRadius: {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  },
  // Shadow
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.2)",
  },
  // Link
  hyperlink: "",
  // Animation
  animation: {
    enabled: false,
    continuous: false,
    type: "none",
  },
  // Filters
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
  },
  ...overrides,
});

/**
 * Helper function to create a shape element with default values
 */
export const createShapeElement = (
  shapeType: ShapeElement["shapeType"],
  overrides?: Partial<ShapeElement>,
): Omit<ShapeElement, "id" | "zIndex"> => ({
  type: "shape",
  shapeType,
  position: { x: 100, y: 100 },
  size: { width: 100, height: 100 },
  rotation: 0,
  opacity: 1,
  locked: false,
  fill: "#f472b6",
  stroke: "#ec4899",
  strokeWidth: 2,
  // Shadow
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.2)",
  },
  ...overrides,
});

export const DEFAULT_RSVP_SETTINGS: RsvpSettings = {
  title: "Xác nhận tham dự",
  nameLabel: "Họ và tên",
  attendLabel: "Bạn sẽ tham dự chứ?",
  attendYesText: "Có, tôi sẽ tham dự",
  attendNoText: "Rất tiếc, tôi không thể tham dự",
  enableGuestCount: false,
  guestCountLabel: "Số người tham dự",
  enableGuestSide: false,
  guestSideLabel: "Bạn là khách của",
  groomSideText: "Nhà trai",
  brideSideText: "Nhà gái",
  enableMessage: true,
  messageLabel: "Lời chúc gửi cô dâu chú rể",
  submitText: "Gửi xác nhận",
  thankYouText: "Cảm ơn bạn đã phản hồi!",
  buttonColor: "#5c5c5c",
  buttonTextColor: "#ffffff",
};

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  address: "Hồ Gươm, Hoàn Kiếm, Hà Nội",
  placeName: "Trung tâm tiệc cưới",
  buttonText: "Chỉ đường",
};

const WIDGET_SIZES: Record<WidgetKind, { width: number; height: number }> = {
  calendar: { width: 340, height: 320 },
  countdown: { width: 340, height: 84 },
  rsvp: { width: 360, height: layoutRsvp(DEFAULT_RSVP_SETTINGS).height },
  map: { width: 340, height: 280 },
  call: { width: 240, height: 48 },
  reminder: { width: 240, height: 48 },
  youtube: { width: 340, height: 191 },
  slideshow: { width: 340, height: 440 },
  album: { width: 340, height: 228 },
  giftQr: { width: 260, height: 340 },
};

/** Nút gọi / lời nhắc: chữ trắng trên nền màu nhấn, bo tròn hai đầu */
const BUTTON_WIDGETS: WidgetKind[] = ["call", "reminder"];

/** Ngày mặc định cho lịch/đếm ngược: 6 tháng nữa, 11:00 */
const defaultEventDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T11:00`;
};

/**
 * Helper function to create a widget element with default values
 */
export const createWidgetElement = (
  widget: WidgetKind,
  overrides?: Partial<WidgetElement>,
): Omit<WidgetElement, "id" | "zIndex"> => ({
  type: "widget",
  widget,
  position: { x: 80, y: 100 },
  size: WIDGET_SIZES[widget],
  rotation: 0,
  opacity: 1,
  locked: false,
  eventDate: defaultEventDate(),
  fontFamily: "Quicksand",
  color: BUTTON_WIDGETS.includes(widget) ? "#ffffff" : "#333333",
  accentColor: "#c0394b",
  backgroundColor: widget === "rsvp" || widget === "giftQr" ? "#ffffff" : "transparent",
  borderRadius: widget === "countdown" ? 0 : BUTTON_WIDGETS.includes(widget) ? 24 : 8,
  animation: { enabled: true, continuous: false, type: "slideUp" },
  rsvp: DEFAULT_RSVP_SETTINGS,
  map: DEFAULT_MAP_SETTINGS,
  ...(BUTTON_WIDGETS.includes(widget) && {
    button: {
      ...DEFAULT_BUTTON,
      label: widget === "call" ? DEFAULT_BUTTON.label : "Thêm vào lịch",
    },
  }),
  ...(["youtube", "slideshow", "album"].includes(widget) && { media: DEFAULT_MEDIA }),
  ...(widget === "giftQr" && { gift: DEFAULT_GIFT }),
  ...overrides,
});

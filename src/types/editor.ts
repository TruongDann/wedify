export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type AnimationType =
  | "none"
  | "fadeIn"
  | "slideIn" // cũ: trượt lên có nảy — giữ để thiệp đã lưu vẫn chạy như trước
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "bounce"
  | "pulse"
  | "shake"
  | "zoom";

export interface ElementAnimation {
  enabled: boolean;
  /** true = lặp liên tục, false = chạy một lần khi cuộn tới */
  continuous: boolean;
  type: AnimationType;
  /** Thời lượng hiệu ứng xuất hiện (giây); bỏ trống thì dùng mặc định của từng loại */
  duration?: number;
  /** Chờ bao lâu (giây) sau khi cuộn tới mới chạy */
  delay?: number;
}

export interface BaseElement {
  id: string;
  type: "text" | "image" | "shape" | "sticker" | "widget";
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  /** Việc xảy ra khi khách bấm vào phần tử ở trang xem thiệp */
  clickAction?: ClickAction;
}

export type ClickAction =
  | { type: "none" }
  | { type: "link"; url: string }
  | { type: "scroll"; targetId: string }
  | { type: "call"; phone: string }
  | { type: "gift" };

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through";
  textAlign: "left" | "center" | "right";
  color: string;
  backgroundColor: string;
  lineHeight: number;
  letterSpacing: number;
  // Padding
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // Border
  border: {
    width: number;
    color: string;
    style: "solid" | "dashed" | "dotted" | "none";
    position: "all" | "top" | "bottom" | "left" | "right";
  };
  // Border Radius
  borderRadius: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  // Shadow
  shadow: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  // Link
  hyperlink: string;
  // Animation
  animation: ElementAnimation;
  // Text Effects
  textEffect: {
    type:
      | "none"
      | "shadow"
      | "lift"
      | "hollow"
      | "splice"
      | "outline"
      | "echo"
      | "glitch"
      | "neon"
      | "background"
      | "curve";
    offset: number;
    direction: number;
    blur: number;
    transparency: number;
    color: string;
    intensity: number;
    spread: number;
    roundness: number;
    curveAmount: number;
  };
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill";
  // Padding
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // Border
  border: {
    width: number;
    color: string;
    style: "solid" | "dashed" | "dotted" | "none";
    position: "all" | "top" | "bottom" | "left" | "right";
  };
  // Border Radius
  borderRadius: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  // Shadow
  shadow: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  // Link
  hyperlink: string;
  // Animation
  animation: ElementAnimation;
  // Image filters
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    grayscale: number;
  };
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType:
    | "rectangle"
    | "circle"
    | "triangle"
    | "heart"
    | "star"
    | "line"
    | "diamond"
    | "pentagon"
    | "hexagon"
    | "arrow"
    | "cloud"
    | "speechBubble"
    | "cross"
    | "ring";
  fill: string;
  stroke: string;
  strokeWidth: number;
  animation?: ElementAnimation;
  // Shadow
  shadow?: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    color: string;
  };
}

export interface StickerElement extends BaseElement {
  type: "sticker";
  src: string;
  category: string;
}

export type WidgetKind =
  | "calendar"
  | "countdown"
  | "rsvp"
  | "map"
  | "call"
  | "reminder"
  | "youtube"
  | "slideshow"
  | "album"
  | "giftQr";

/** Nút gọi điện / Lời nhắc lịch */
export interface ButtonSettings {
  label: string;
  /** Số điện thoại cho nút gọi */
  phone: string;
  /** Tên sự kiện khi khách thêm vào lịch */
  eventTitle: string;
}

/** Video YouTube, trình chiếu ảnh, album ảnh */
export interface MediaSettings {
  videoUrl: string;
  images: string[];
  /** Số giây giữa hai ảnh khi trình chiếu */
  interval: number;
  /** Số cột của album */
  columns: number;
}

/** Mã QR nhận tiền mừng (VietQR) */
export interface GiftSettings {
  title: string;
  /** Mã ngân hàng theo VietQR, vd. VCB, TCB, MB */
  bankCode: string;
  accountNumber: string;
  accountName: string;
  /** Nội dung chuyển khoản gợi ý */
  note: string;
}

export interface RsvpSettings {
  title: string;
  nameLabel: string;
  attendLabel: string;
  attendYesText: string;
  attendNoText: string;
  /** Hỏi số người đi cùng */
  enableGuestCount: boolean;
  guestCountLabel: string;
  /** Hỏi khách nhà trai hay nhà gái */
  enableGuestSide: boolean;
  guestSideLabel: string;
  groomSideText: string;
  brideSideText: string;
  /** Ô lời chúc */
  enableMessage: boolean;
  messageLabel: string;
  submitText: string;
  thankYouText: string;
  buttonColor: string;
  buttonTextColor: string;
}

export interface MapSettings {
  /** Địa chỉ để tìm trên Google Maps */
  address: string;
  /** Tên địa điểm hiện trên thẻ bản đồ */
  placeName: string;
  buttonText: string;
}

/** Tiện ích tương tác: lịch, đếm ngược, form xác nhận tham dự, bản đồ. */
export interface WidgetElement extends BaseElement {
  type: "widget";
  widget: WidgetKind;
  /** Thời điểm cưới, dạng "YYYY-MM-DDTHH:mm" (giờ địa phương) — dùng cho lịch và đếm ngược */
  eventDate: string;
  fontFamily: string;
  /** Màu chữ */
  color: string;
  /** Màu nhấn: ô đếm ngược, ngày được đánh dấu trên lịch, ghim bản đồ */
  accentColor: string;
  backgroundColor: string;
  borderRadius: number;
  animation: ElementAnimation;
  rsvp: RsvpSettings;
  map: MapSettings;
  /** Thêm sau: thiệp lưu trước đó có thể thiếu — đọc qua widgetButton/widgetMedia/widgetGift */
  button?: ButtonSettings;
  media?: MediaSettings;
  gift?: GiftSettings;
}

export type EditorElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | StickerElement
  | WidgetElement;

export interface BackgroundMusic {
  name: string;
  artist: string;
  duration: string;
  src?: string;
  icon?: string;
  iconColor?: string;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundSize: "cover" | "contain" | "fill";
  backgroundMusic: BackgroundMusic | null;
  isMusicPlaying: boolean;
  /** Hiệu ứng rơi phủ lên thiệp (hoa, tim, tuyết...) */
  fallingEffect?: FallingEffect | null;
  /** Màn chào khách trước khi vào thiệp */
  intro?: IntroSettings | null;
}

export type FallingKind = "petals" | "hearts" | "snow" | "leaves" | "confetti" | "stars";

export interface FallingEffect {
  kind: FallingKind;
  /** Số hạt trên màn hình */
  density: number;
  /** Tốc độ rơi, 0.5 = chậm … 2 = nhanh */
  speed: number;
  /** Màu chính; bỏ trống dùng màu mặc định của từng loại */
  color?: string;
}

export type IntroStyle = "envelope" | "curtain";

export interface IntroSettings {
  style: IntroStyle;
  /** Dòng chữ lớn, vd. tên cô dâu chú rể */
  title: string;
  subtitle: string;
  buttonText: string;
  /** Màu phong bì / rèm */
  color: string;
  textColor: string;
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  canvasSettings: CanvasSettings;
  elements: EditorElement[];
}

/** Toàn bộ dữ liệu một thiệp — thứ được lưu lại và dùng để hiển thị cho khách. */
export interface CardDocument {
  version: 1;
  canvasSettings: CanvasSettings;
  elements: EditorElement[];
  savedAt: string;
}

export interface HistoryState {
  elements: EditorElement[];
  canvasSettings: CanvasSettings;
}

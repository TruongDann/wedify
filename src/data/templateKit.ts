import type { AnimationType } from "@/components/editor/animation/elementAnimation";
import type { EditorElement } from "@/types/editor";

/** Cấu hình hiệu ứng rút gọn: [kiểu, trễ(giây), lặp liên tục?] */
export type Anim = [AnimationType, number?, boolean?];

type Corner = number | { tl?: number; tr?: number; br?: number; bl?: number };

export interface TextOpts {
  text: string;
  /** Tâm ngang (mặc định giữa trang). */
  cx?: number;
  x?: number;
  w: number;
  /** Toạ độ tâm dọc — hoặc dùng `y` (mép trên). */
  cy?: number;
  y?: number;
  font: string;
  size: number;
  weight?: number;
  italic?: boolean;
  color: string;
  align?: "left" | "center" | "right";
  ls?: number;
  lh?: number;
  anim?: Anim;
  opacity?: number;
  rotation?: number;
  /** Đổ bóng/phát sáng quanh chữ. */
  glow?: { color: string; blur: number; x?: number; y?: number };
  /** Nền thẻ (dùng text rỗng làm card). */
  bg?: string;
  radius?: number;
  border?: { width: number; color: string; style?: "solid" | "dashed" | "dotted" };
  /** Ép chiều cao (mặc định tự ước lượng theo số dòng). */
  h?: number;
  pad?: number;
  decoration?: "none" | "underline" | "line-through";
}

export interface ShapeOpts {
  shape: "rectangle" | "circle" | "heart" | "star" | "diamond" | "line" | "ring" | "cloud" | "triangle" | "cross";
  x: number;
  y: number;
  w: number;
  h?: number;
  fill?: string;
  stroke?: string;
  sw?: number;
  opacity?: number;
  rotation?: number;
  anim?: Anim;
  shadow?: { color: string; blur: number; x?: number; y?: number };
}

export interface ImageOpts {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: Corner;
  border?: { width: number; color: string };
  shadow?: { color: string; blur: number; x?: number; y?: number };
  opacity?: number;
  rotation?: number;
  anim?: Anim;
  filters?: Partial<{ brightness: number; contrast: number; saturation: number; blur: number; grayscale: number }>;
}

export const unsplash = (photoId: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${photoId}?w=${Math.round(w * 2)}&h=${Math.round(h * 2)}&fit=crop&q=80`;

/** Nhận mã ảnh Unsplash hoặc URL đầy đủ (ảnh người dùng tải lên) và trả về URL dùng được. */
export const photoUrl = (src: string, w: number, h: number) => (/^(https?:|data:|\/)/.test(src) ? src : unsplash(src, w, h));

const SCRIPT_FONTS = ["Dancing Script", "Great Vibes", "Parisienne", "Allura", "Sacramento", "Alex Brush", "Pinyon Script", "Tangerine"];

/** Ước lượng chiều cao khối chữ để Konva không cắt dòng cuối (Konva cắt chữ vượt quá height). */
export const estimateTextHeight = (text: string, size: number, width: number, font: string, ls: number, lh: number) => {
  const isScript = SCRIPT_FONTS.includes(font);
  const isCaps = text.length > 3 && text === text.toUpperCase();
  const factor = isScript ? 0.5 : isCaps ? 0.74 : font === "Montserrat" || font === "Poppins" ? 0.6 : 0.54;
  const charWidth = size * factor + ls;
  const perLine = Math.max(1, Math.floor((width / charWidth) * 0.92));
  const lines = text
    .split("\n")
    .reduce((sum, paragraph) => sum + Math.max(1, Math.ceil(paragraph.length / perLine)), 0);
  return Math.ceil(lines * size * lh + size * 0.35);
};

const radiusOf = (corner?: Corner) => {
  if (typeof corner === "number") return { topLeft: corner, topRight: corner, bottomRight: corner, bottomLeft: corner };
  return {
    topLeft: corner?.tl ?? 0,
    topRight: corner?.tr ?? 0,
    bottomRight: corner?.br ?? 0,
    bottomLeft: corner?.bl ?? 0,
  };
};

const animOf = (anim?: Anim) =>
  anim
    ? { enabled: true, continuous: Boolean(anim[2]), type: anim[0], delay: anim[1] ?? 0 }
    : { enabled: false, continuous: false, type: "none" as AnimationType, delay: 0 };

/**
 * Bộ dựng phần tử cho mẫu thiệp: tự gán id/zIndex và ước lượng chiều cao chữ,
 * để mỗi mẫu chỉ cần mô tả bố cục.
 */
export class TemplateBuilder {
  readonly elements: EditorElement[] = [];
  private z = 0;
  private n = 0;

  constructor(private readonly prefix: string, private readonly pageWidth = 600) {}

  private nextId(kind: string) {
    this.n += 1;
    return `${this.prefix}-${kind}-${this.n}`;
  }

  private nextZ() {
    this.z += 1;
    return this.z;
  }

  /** Thêm chữ; trả về vùng chiếm dụng để dựng bố cục theo dòng chảy. */
  text(o: TextOpts) {
    const w = o.w;
    const lh = o.lh ?? 1.25;
    const ls = o.ls ?? 0;
    const h = o.h ?? estimateTextHeight(o.text, o.size, w, o.font, ls, lh);
    const cx = o.cx ?? this.pageWidth / 2;
    const x = o.x ?? cx - w / 2;
    const y = o.y ?? (o.cy ?? 0) - h / 2;
    const glow = o.glow;
    const hasBorder = Boolean(o.border && o.border.width > 0);

    this.elements.push({
      id: this.nextId("text"),
      type: "text",
      content: o.text,
      position: { x, y },
      size: { width: w, height: h },
      rotation: o.rotation ?? 0,
      opacity: o.opacity ?? 1,
      zIndex: this.nextZ(),
      locked: false,
      fontFamily: o.font,
      fontSize: o.size,
      fontWeight: o.weight ?? 400,
      fontStyle: o.italic ? "italic" : "normal",
      textDecoration: o.decoration ?? "none",
      textAlign: o.align ?? "center",
      color: o.color,
      backgroundColor: o.bg ?? "transparent",
      lineHeight: lh,
      letterSpacing: ls,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: hasBorder
        ? { width: o.border!.width, color: o.border!.color, style: o.border!.style ?? "solid", position: "all" }
        : { width: 0, color: "#000000", style: "solid", position: "all" },
      borderRadius: radiusOf(o.radius ?? 0),
      shadow: glow
        ? { enabled: true, x: glow.x ?? 0, y: glow.y ?? 0, blur: glow.blur, color: glow.color }
        : { enabled: false, x: 0, y: 0, blur: 0, color: "rgba(0,0,0,0)" },
      hyperlink: "",
      animation: animOf(o.anim),
      textEffect: { type: "none", offset: 0, direction: 0, blur: 0, transparency: 0, color: "#000000", intensity: 0, spread: 0, roundness: 0, curveAmount: 0 },
    } as unknown as EditorElement);

    return { x, y, w, h, bottom: y + h };
  }

  /** Thẻ nền (hộp bo góc có viền/đổ bóng) — dùng text rỗng. */
  card(o: { x: number; y: number; w: number; h: number; bg: string; radius?: number; border?: { width: number; color: string; style?: "solid" | "dashed" | "dotted" }; shadow?: { color: string; blur: number; y?: number }; anim?: Anim; opacity?: number }) {
    this.elements.push({
      id: this.nextId("card"),
      type: "text",
      content: "",
      position: { x: o.x, y: o.y },
      size: { width: o.w, height: o.h },
      rotation: 0,
      opacity: o.opacity ?? 1,
      zIndex: this.nextZ(),
      locked: false,
      fontFamily: "Montserrat",
      fontSize: 14,
      fontWeight: 400,
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "center",
      color: "#000000",
      backgroundColor: o.bg,
      lineHeight: 1.2,
      letterSpacing: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: o.border
        ? { width: o.border.width, color: o.border.color, style: o.border.style ?? "solid", position: "all" }
        : { width: 0, color: "#000000", style: "solid", position: "all" },
      borderRadius: radiusOf(o.radius ?? 0),
      shadow: o.shadow
        ? { enabled: true, x: 0, y: o.shadow.y ?? 8, blur: o.shadow.blur, color: o.shadow.color }
        : { enabled: false, x: 0, y: 0, blur: 0, color: "rgba(0,0,0,0)" },
      hyperlink: "",
      animation: animOf(o.anim),
      textEffect: { type: "none", offset: 0, direction: 0, blur: 0, transparency: 0, color: "#000000", intensity: 0, spread: 0, roundness: 0, curveAmount: 0 },
    } as unknown as EditorElement);
  }

  shape(o: ShapeOpts) {
    const h = o.h ?? o.w;
    this.elements.push({
      id: this.nextId("shape"),
      type: "shape",
      shapeType: o.shape,
      position: { x: o.x, y: o.y },
      size: { width: o.w, height: o.shape === "line" ? 0 : h },
      rotation: o.rotation ?? 0,
      opacity: o.opacity ?? 1,
      zIndex: this.nextZ(),
      locked: false,
      fill: o.shape === "line" ? "transparent" : (o.fill ?? "transparent"),
      stroke: o.stroke ?? "transparent",
      strokeWidth: o.sw ?? 0,
      animation: animOf(o.anim),
      shadow: o.shadow
        ? { enabled: true, x: o.shadow.x ?? 0, y: o.shadow.y ?? 0, blur: o.shadow.blur, color: o.shadow.color }
        : { enabled: false, x: 0, y: 0, blur: 0, color: "rgba(0,0,0,0)" },
    } as unknown as EditorElement);
  }

  image(o: ImageOpts) {
    this.elements.push({
      id: this.nextId("image"),
      type: "image",
      src: o.src,
      alt: "Ảnh thiệp",
      position: { x: o.x, y: o.y },
      size: { width: o.w, height: o.h },
      rotation: o.rotation ?? 0,
      opacity: o.opacity ?? 1,
      zIndex: this.nextZ(),
      locked: false,
      objectFit: "cover",
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: o.border
        ? { width: o.border.width, color: o.border.color, style: "solid", position: "all" }
        : { width: 0, color: "#000000", style: "solid", position: "all" },
      borderRadius: radiusOf(o.radius ?? 0),
      shadow: o.shadow
        ? { enabled: true, x: o.shadow.x ?? 0, y: o.shadow.y ?? 14, blur: o.shadow.blur, color: o.shadow.color }
        : { enabled: false, x: 0, y: 0, blur: 0, color: "rgba(0,0,0,0)" },
      hyperlink: "",
      animation: animOf(o.anim),
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, ...(o.filters ?? {}) },
    } as unknown as EditorElement);
  }
}

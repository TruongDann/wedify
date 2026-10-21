import type { AnimationConfig } from "@/components/editor/animation/elementAnimation";
import type { AmbientEffectSettings } from "@/components/editor/effects/AmbientEffect";

export type { AnimationConfig, AmbientEffectSettings };

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
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
}

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
  animation: AnimationConfig;
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
  animation: AnimationConfig;
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
  // Animation
  animation?: AnimationConfig;
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
  | "button"
  | "slideshow"
  | "rsvpForm"
  | "giftBox"
  | "mapEmbed"
  | "video"
  | "contactCard"
  | "guestbook";

/** Tiện ích thiệp (lịch, đếm ngược, nút hành động, trình chiếu ảnh) — vẽ bằng Konva, cấu hình trong `props`. */
export interface WidgetElement extends BaseElement {
  type: "widget";
  widget: WidgetKind;
  props: Record<string, any>;
  animation?: AnimationConfig;
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
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  showRsvpFooter?: boolean;
  /** Hiệu ứng nền chạy trên toàn trang (cánh hoa rơi, lấp lánh...). */
  ambientEffect?: AmbientEffectSettings | null;
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  accent?: string;
  canvasSettings: CanvasSettings;
  elements: EditorElement[];
}

export interface HistoryState {
  elements: EditorElement[];
  canvasSettings: CanvasSettings;
}

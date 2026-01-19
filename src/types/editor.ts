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
  type: "text" | "image" | "shape" | "sticker";
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
  animation: {
    enabled: boolean;
    continuous: boolean;
    type: "none" | "fadeIn" | "slideIn" | "bounce" | "pulse" | "shake" | "zoom";
  };
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
  animation: {
    enabled: boolean;
    continuous: boolean;
    type: "none" | "fadeIn" | "slideIn" | "bounce" | "pulse" | "shake" | "zoom";
  };
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
}

export interface StickerElement extends BaseElement {
  type: "sticker";
  src: string;
  category: string;
}

export type EditorElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | StickerElement;

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundSize: "cover" | "contain" | "fill";
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  canvasSettings: CanvasSettings;
  elements: EditorElement[];
}

export interface HistoryState {
  elements: EditorElement[];
  canvasSettings: CanvasSettings;
}

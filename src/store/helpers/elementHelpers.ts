import { TextElement, ImageElement, ShapeElement } from "@/types/editor";

/**
 * Helper function to create a text element with default values
 */
export const createTextElement = (
  overrides?: Partial<TextElement>
): Omit<TextElement, "id" | "zIndex"> => ({
  type: "text",
  content: "Nhập văn bản",
  position: { x: 100, y: 100 },
  size: { width: 200, height: 50 },
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
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
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
  overrides?: Partial<ImageElement>
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
  overrides?: Partial<ShapeElement>
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

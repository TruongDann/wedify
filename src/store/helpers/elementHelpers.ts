import {
  TextElement,
  ImageElement,
  ShapeElement,
  EditorElement,
} from "@/types/editor";

const safeNumber = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const safeString = (value: string | undefined, fallback: string) =>
  value ?? fallback;

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

export const normalizeElement = (element: Partial<EditorElement>): EditorElement => {
  const base = {
    id: element.id ?? `element-${Math.random().toString(36).slice(2, 10)}`,
    type: element.type ?? "text",
    position: {
      x: safeNumber(element.position?.x, 100),
      y: safeNumber(element.position?.y, 100),
    },
    size: {
      width: safeNumber(element.size?.width, 200),
      height: safeNumber(element.size?.height, 80),
    },
    rotation: safeNumber(element.rotation, 0),
    opacity: safeNumber(element.opacity, 1),
    zIndex: safeNumber(element.zIndex, 0),
    locked: Boolean(element.locked),
  };

  switch (element.type) {
    case "widget":
      return { ...base, ...element, type: "widget" } as EditorElement;

    case "image":
      return {
        ...createImageElement(safeString((element as Partial<ImageElement>).src, "")),
        ...base,
        ...element,
        src: safeString((element as Partial<ImageElement>).src, ""),
        alt: safeString((element as Partial<ImageElement>).alt, "Image"),
        objectFit: (element as Partial<ImageElement>).objectFit ?? "cover",
        padding: {
          top: safeNumber((element as Partial<ImageElement>).padding?.top, 0),
          right: safeNumber((element as Partial<ImageElement>).padding?.right, 0),
          bottom: safeNumber((element as Partial<ImageElement>).padding?.bottom, 0),
          left: safeNumber((element as Partial<ImageElement>).padding?.left, 0),
        },
        border: {
          width: safeNumber((element as Partial<ImageElement>).border?.width, 0),
          color: safeString((element as Partial<ImageElement>).border?.color, "#000000"),
          style: (element as Partial<ImageElement>).border?.style ?? "solid",
          position: (element as Partial<ImageElement>).border?.position ?? "all",
        },
        borderRadius: {
          topLeft: safeNumber((element as Partial<ImageElement>).borderRadius?.topLeft, 0),
          topRight: safeNumber((element as Partial<ImageElement>).borderRadius?.topRight, 0),
          bottomLeft: safeNumber((element as Partial<ImageElement>).borderRadius?.bottomLeft, 0),
          bottomRight: safeNumber((element as Partial<ImageElement>).borderRadius?.bottomRight, 0),
        },
        shadow: {
          enabled: Boolean((element as Partial<ImageElement>).shadow?.enabled),
          x: safeNumber((element as Partial<ImageElement>).shadow?.x, 0),
          y: safeNumber((element as Partial<ImageElement>).shadow?.y, 4),
          blur: safeNumber((element as Partial<ImageElement>).shadow?.blur, 8),
          color: safeString((element as Partial<ImageElement>).shadow?.color, "rgba(0,0,0,0.2)"),
        },
        hyperlink: safeString((element as Partial<ImageElement>).hyperlink, ""),
        animation: {
          enabled: Boolean((element as Partial<ImageElement>).animation?.enabled),
          continuous: Boolean((element as Partial<ImageElement>).animation?.continuous),
          type: (element as Partial<ImageElement>).animation?.type ?? "none",
          delay: safeNumber((element as Partial<ImageElement>).animation?.delay, 0),
        },
        filters: {
          brightness: safeNumber((element as Partial<ImageElement>).filters?.brightness, 100),
          contrast: safeNumber((element as Partial<ImageElement>).filters?.contrast, 100),
          saturation: safeNumber((element as Partial<ImageElement>).filters?.saturation, 100),
          blur: safeNumber((element as Partial<ImageElement>).filters?.blur, 0),
          grayscale: safeNumber((element as Partial<ImageElement>).filters?.grayscale, 0),
        },
      } as ImageElement;

    case "shape":
      return {
        ...createShapeElement((element as Partial<ShapeElement>).shapeType ?? "rectangle"),
        ...base,
        ...element,
        shapeType: (element as Partial<ShapeElement>).shapeType ?? "rectangle",
        fill: safeString((element as Partial<ShapeElement>).fill, "#f472b6"),
        stroke: safeString((element as Partial<ShapeElement>).stroke, "#ec4899"),
        strokeWidth: safeNumber((element as Partial<ShapeElement>).strokeWidth, 2),
        shadow: {
          enabled: Boolean((element as Partial<ShapeElement>).shadow?.enabled),
          x: safeNumber((element as Partial<ShapeElement>).shadow?.x, 0),
          y: safeNumber((element as Partial<ShapeElement>).shadow?.y, 4),
          blur: safeNumber((element as Partial<ShapeElement>).shadow?.blur, 8),
          color: safeString((element as Partial<ShapeElement>).shadow?.color, "rgba(0,0,0,0.2)"),
        },
      } as ShapeElement;

    case "text":
    default:
      return {
        ...createTextElement(),
        ...base,
        ...element,
        content: safeString((element as Partial<TextElement>).content, "Nhập văn bản"),
        fontFamily: safeString((element as Partial<TextElement>).fontFamily, "Times New Roman"),
        fontSize: safeNumber((element as Partial<TextElement>).fontSize, 24),
        fontWeight: safeNumber((element as Partial<TextElement>).fontWeight, 400),
        fontStyle: (element as Partial<TextElement>).fontStyle ?? "normal",
        textDecoration: (element as Partial<TextElement>).textDecoration ?? "none",
        textAlign: (element as Partial<TextElement>).textAlign ?? "center",
        color: safeString((element as Partial<TextElement>).color, "#333333"),
        backgroundColor: safeString((element as Partial<TextElement>).backgroundColor, "transparent"),
        lineHeight: safeNumber((element as Partial<TextElement>).lineHeight, 1.5),
        letterSpacing: safeNumber((element as Partial<TextElement>).letterSpacing, 0),
        padding: {
          top: safeNumber((element as Partial<TextElement>).padding?.top, 5),
          right: safeNumber((element as Partial<TextElement>).padding?.right, 5),
          bottom: safeNumber((element as Partial<TextElement>).padding?.bottom, 5),
          left: safeNumber((element as Partial<TextElement>).padding?.left, 5),
        },
        border: {
          width: safeNumber((element as Partial<TextElement>).border?.width, 0),
          color: safeString((element as Partial<TextElement>).border?.color, "#000000"),
          style: (element as Partial<TextElement>).border?.style ?? "solid",
          position: (element as Partial<TextElement>).border?.position ?? "all",
        },
        borderRadius: {
          topLeft: safeNumber((element as Partial<TextElement>).borderRadius?.topLeft, 0),
          topRight: safeNumber((element as Partial<TextElement>).borderRadius?.topRight, 0),
          bottomLeft: safeNumber((element as Partial<TextElement>).borderRadius?.bottomLeft, 0),
          bottomRight: safeNumber((element as Partial<TextElement>).borderRadius?.bottomRight, 0),
        },
        shadow: {
          enabled: Boolean((element as Partial<TextElement>).shadow?.enabled),
          x: safeNumber((element as Partial<TextElement>).shadow?.x, 0),
          y: safeNumber((element as Partial<TextElement>).shadow?.y, 4),
          blur: safeNumber((element as Partial<TextElement>).shadow?.blur, 8),
          color: safeString((element as Partial<TextElement>).shadow?.color, "rgba(0,0,0,0.2)"),
        },
        hyperlink: safeString((element as Partial<TextElement>).hyperlink, ""),
        animation: {
          enabled: Boolean((element as Partial<TextElement>).animation?.enabled),
          continuous: Boolean((element as Partial<TextElement>).animation?.continuous),
          type: (element as Partial<TextElement>).animation?.type ?? "none",
          delay: safeNumber((element as Partial<TextElement>).animation?.delay, 0),
        },
        textEffect: {
          type: (element as Partial<TextElement>).textEffect?.type ?? "none",
          offset: safeNumber((element as Partial<TextElement>).textEffect?.offset, 50),
          direction: safeNumber((element as Partial<TextElement>).textEffect?.direction, -45),
          blur: safeNumber((element as Partial<TextElement>).textEffect?.blur, 0),
          transparency: safeNumber((element as Partial<TextElement>).textEffect?.transparency, 40),
          color: safeString((element as Partial<TextElement>).textEffect?.color, "#000000"),
          intensity: safeNumber((element as Partial<TextElement>).textEffect?.intensity, 50),
          spread: safeNumber((element as Partial<TextElement>).textEffect?.spread, 50),
          roundness: safeNumber((element as Partial<TextElement>).textEffect?.roundness, 50),
          curveAmount: safeNumber((element as Partial<TextElement>).textEffect?.curveAmount, 0),
        },
      } as TextElement;
  }
};

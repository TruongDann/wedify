import { ShapeElement } from "@/types/editor";

/**
 * SVG path cho từng loại hình khối.
 * Phải khớp từng nét với phần vẽ Konva trong components/editor/elements/ShapeElement.tsx
 * (toạ độ tính từ góc trên-trái của phần tử).
 */

const polygon = (points: [number, number][]) =>
  `M ${points.map(([x, y]) => `${x},${y}`).join(" L ")} Z`;

const regularPolygon = (w: number, h: number, sides: number) => {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return polygon(pts);
};

/** Tương đương context.arc(): nối thẳng tới điểm đầu cung rồi vẽ cung (mặc định theo chiều kim đồng hồ). */
const arc = (
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  counterClockwise = false,
) => {
  const sx = cx + r * Math.cos(from);
  const sy = cy + r * Math.sin(from);
  let span = counterClockwise ? from - to : to - from;
  span = ((span % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (span === 0) span = 2 * Math.PI;
  const sweep = counterClockwise ? 0 : 1;
  // Cung tròn đủ 360° phải chia làm hai nửa
  if (span >= 2 * Math.PI - 1e-9) {
    const mx = cx - (sx - cx);
    const my = cy - (sy - cy);
    return `L ${sx},${sy} A ${r},${r} 0 0 ${sweep} ${mx},${my} A ${r},${r} 0 0 ${sweep} ${sx},${sy}`;
  }
  const end = counterClockwise ? from - span : from + span;
  const ex = cx + r * Math.cos(end);
  const ey = cy + r * Math.sin(end);
  const large = span > Math.PI ? 1 : 0;
  return `L ${sx},${sy} A ${r},${r} 0 ${large} ${sweep} ${ex},${ey}`;
};

export const getShapePath = (
  shapeType: ShapeElement["shapeType"],
  w: number,
  h: number,
): string | null => {
  const PI = Math.PI;
  switch (shapeType) {
    case "rectangle":
      return polygon([[0, 0], [w, 0], [w, h], [0, h]]);

    case "circle":
      return `M 0,${h / 2} A ${w / 2},${h / 2} 0 1 1 ${w},${h / 2} A ${w / 2},${h / 2} 0 1 1 0,${h / 2} Z`;

    case "triangle":
      return polygon([[w / 2, 0], [w, h], [0, h]]);

    case "star": {
      // Konva.Star: 5 cánh, bán kính theo chiều rộng, cánh đầu tiên hướng lên
      const outer = w / 2;
      const inner = w / 4;
      const pts: [number, number][] = [];
      for (let n = 0; n < 10; n++) {
        const r = n % 2 === 0 ? outer : inner;
        pts.push([w / 2 + r * Math.sin((n * PI) / 5), h / 2 - r * Math.cos((n * PI) / 5)]);
      }
      return polygon(pts);
    }

    case "heart":
      return [
        `M ${w / 2},${h}`,
        `C ${w / 4},${h} 0,${h * 0.65} 0,${h * 0.35}`,
        `C 0,0 ${w / 2},0 ${w / 2},${h * 0.35}`,
        `C ${w / 2},0 ${w},0 ${w},${h * 0.35}`,
        `C ${w},${h * 0.65} ${w * 0.75},${h} ${w / 2},${h}`,
        "Z",
      ].join(" ");

    case "line":
      return `M 0,0 L ${w},0`;

    case "diamond":
      return polygon([[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]]);

    case "pentagon":
      return regularPolygon(w, h, 5);

    case "hexagon":
      return regularPolygon(w, h, 6);

    case "arrow":
      return polygon([
        [0, h * 0.3], [w * 0.6, h * 0.3], [w * 0.6, 0], [w, h / 2],
        [w * 0.6, h], [w * 0.6, h * 0.7], [0, h * 0.7],
      ]);

    case "cloud":
      return [
        `M ${w * 0.25},${h * 0.6}`,
        arc(w * 0.25, h * 0.5, w * 0.15, PI * 0.5, PI * 1.5),
        arc(w * 0.45, h * 0.35, w * 0.2, PI, PI * 1.8),
        arc(w * 0.7, h * 0.4, w * 0.18, PI * 1.3, PI * 0.3),
        arc(w * 0.75, h * 0.55, w * 0.12, PI * 1.5, PI * 0.5),
        `L ${w * 0.25},${h * 0.6}`,
        "Z",
      ].join(" ");

    case "speechBubble": {
      const r = Math.min(w, h) * 0.1;
      const b = h * 0.65;
      return [
        `M ${r},0`,
        `L ${w - r},0`,
        `Q ${w},0 ${w},${r}`,
        `L ${w},${b - r}`,
        `Q ${w},${b} ${w - r},${b}`,
        `L ${w * 0.35},${b}`,
        `L ${w * 0.2},${h}`,
        `L ${w * 0.25},${b}`,
        `L ${r},${b}`,
        `Q 0,${b} 0,${b - r}`,
        `L 0,${r}`,
        `Q 0,0 ${r},0`,
        "Z",
      ].join(" ");
    }

    case "cross": {
      const t = 0.3;
      return polygon([
        [w * t, 0], [w * (1 - t), 0], [w * (1 - t), h * t], [w, h * t],
        [w, h * (1 - t)], [w * (1 - t), h * (1 - t)], [w * (1 - t), h],
        [w * t, h], [w * t, h * (1 - t)], [0, h * (1 - t)], [0, h * t], [w * t, h * t],
      ]);
    }

    case "ring": {
      const cx = w / 2;
      const cy = h / 2;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.6;
      // Bắt đầu bằng "M" thay cho "L" đầu tiên của arc()
      return (
        arc(cx, cy, outerR, 0, PI * 2).replace(/^L/, "M") +
        " " +
        arc(cx, cy, innerR, 0, PI * 2, true) +
        " Z"
      );
    }

    default:
      return null;
  }
};

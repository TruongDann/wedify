/**
 * Chuyển chuỗi CSS `linear-gradient(...)` / `radial-gradient(...)` thành thuộc tính fill của Konva.
 * Hỗ trợ góc (deg hoặc "to bottom"...), màu hex/rgb/rgba/hsl và vị trí %.
 */

const COLOR_STOP = /(rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-fA-F]{3,8})(?:\s+(-?[\d.]+)%)?/g;

const DIRECTION_ANGLES: Record<string, number> = {
  "to top": 0,
  "to right": 90,
  "to bottom": 180,
  "to left": 270,
  "to top right": 45,
  "to bottom right": 135,
  "to bottom left": 225,
  "to top left": 315,
};

export const isCssGradient = (value?: string | null): value is string =>
  typeof value === "string" && /^(linear|radial)-gradient\(/i.test(value.trim());

const parseStops = (body: string) => {
  const stops: Array<{ color: string; position?: number }> = [];
  let match: RegExpExecArray | null;
  COLOR_STOP.lastIndex = 0;
  while ((match = COLOR_STOP.exec(body))) {
    stops.push({ color: match[1], position: match[2] !== undefined ? Number(match[2]) / 100 : undefined });
  }
  if (stops.length < 2) return null;

  return stops.flatMap((stop, index) => [
    Math.min(1, Math.max(0, stop.position ?? index / (stops.length - 1))),
    stop.color,
  ]);
};

/**
 * @param origin góc trên-trái của vùng vẽ trong toạ độ cục bộ của node (mặc định 0,0).
 *   Hình tròn/sao của editor đặt gốc ở tâm nên truyền `{ x: -w/2, y: -h/2 }`.
 */
export const parseCssGradient = (
  input: string | undefined | null,
  width: number,
  height: number,
  origin: { x: number; y: number } = { x: 0, y: 0 },
): Record<string, unknown> | null => {
  if (!isCssGradient(input)) return null;
  const value = input.trim();
  const open = value.indexOf("(");
  const body = value.slice(open + 1, value.lastIndexOf(")"));
  const colorStops = parseStops(body);
  if (!colorStops) return null;

  if (/^radial/i.test(value)) {
    const center = { x: origin.x + width / 2, y: origin.y + height / 2 };
    return {
      fillRadialGradientStartPoint: center,
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: center,
      fillRadialGradientEndRadius: Math.max(width, height) / 2,
      fillRadialGradientColorStops: colorStops,
    };
  }

  const head = body.split(/,(?![^()]*\))/)[0].trim().toLowerCase();
  let angle = 180;
  const degMatch = head.match(/^(-?[\d.]+)deg$/);
  if (degMatch) angle = Number(degMatch[1]);
  else if (head in DIRECTION_ANGLES) angle = DIRECTION_ANGLES[head];

  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const length = Math.abs(width * dx) + Math.abs(height * dy);
  const cx = origin.x + width / 2;
  const cy = origin.y + height / 2;

  return {
    fillLinearGradientStartPoint: { x: cx - (dx * length) / 2, y: cy - (dy * length) / 2 },
    fillLinearGradientEndPoint: { x: cx + (dx * length) / 2, y: cy + (dy * length) / 2 },
    fillLinearGradientColorStops: colorStops,
  };
};

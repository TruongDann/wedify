/**
 * Color Utilities
 * Helper functions for color manipulation
 */

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (
  hex: string,
): { r: number; g: number; b: number } | null => {
  const normalized = hex.trim();
  if (!normalized) return null;

  const namedColors: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    green: "#008000",
    blue: "#0000ff",
    yellow: "#ffff00",
    gray: "#808080",
    grey: "#808080",
    transparent: "#000000",
  };

  const directNamed = namedColors[normalized.toLowerCase()];
  if (directNamed) {
    const namedHex = directNamed;
    const namedMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(namedHex);
    if (namedMatch) {
      return {
        r: parseInt(namedMatch[1], 16),
        g: parseInt(namedMatch[2], 16),
        b: parseInt(namedMatch[3], 16),
      };
    }
  }

  const shortHex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(normalized);
  if (shortHex) {
    return {
      r: parseInt(shortHex[1] + shortHex[1], 16),
      g: parseInt(shortHex[2] + shortHex[2], 16),
      b: parseInt(shortHex[3] + shortHex[3], 16),
    };
  }

  const fullHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  if (fullHex) {
    return {
      r: parseInt(fullHex[1], 16),
      g: parseInt(fullHex[2], 16),
      b: parseInt(fullHex[3], 16),
    };
  }

  const rgbaMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(",").map((n) => Number.parseFloat(n.trim()));
    const [r, g, b] = parts;
    if ([r, g, b].every((value) => Number.isFinite(value))) {
      return {
        r: Math.max(0, Math.min(255, r)),
        g: Math.max(0, Math.min(255, g)),
        b: Math.max(0, Math.min(255, b)),
      };
    }
  }

  return null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

/**
 * Convert hex color to RGBA string
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/**
 * Lighten a hex color by a percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)));

  return rgbToHex(r, g, b);
};

/**
 * Darken a hex color by a percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, Math.round(rgb.r * (1 - percent / 100)));
  const g = Math.max(0, Math.round(rgb.g * (1 - percent / 100)));
  const b = Math.max(0, Math.round(rgb.b * (1 - percent / 100)));

  return rgbToHex(r, g, b);
};

/**
 * Extract a usable RGB value from a CSS color or gradient string.
 */
const parseCssColorToRgb = (value: string): { r: number; g: number; b: number } | null => {
  const cleaned = (value ?? "").trim();
  if (!cleaned || cleaned === "transparent") return null;

  const direct = hexToRgb(cleaned);
  if (direct) return direct;

  const gradientMatches = [...cleaned.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})|rgba?\(([^)]+)\)/gi)];
  if (gradientMatches.length > 0) {
    const samples = gradientMatches
      .map((match) => {
        const raw = match[0];
        const rgb = raw.startsWith("#") ? hexToRgb(raw) : hexToRgb(`rgb(${raw.replace(/^rgba?\(/i, "").replace(/\)$/i, "")})`);
        return rgb;
      })
      .filter(Boolean) as Array<{ r: number; g: number; b: number }>;

    if (samples.length > 0) {
      const avg = samples.reduce(
        (acc, sample) => ({
          r: acc.r + sample.r,
          g: acc.g + sample.g,
          b: acc.b + sample.b,
        }),
        { r: 0, g: 0, b: 0 },
      );

      return {
        r: Math.round(avg.r / samples.length),
        g: Math.round(avg.g / samples.length),
        b: Math.round(avg.b / samples.length),
      };
    }
  }

  return null;
};

/**
 * Check if a color is light or dark
 */
export const isLightColor = (value: string): boolean => {
  const rgb = parseCssColorToRgb(value);
  if (!rgb) return true;

  // Using luminance formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
};

/**
 * Get contrast color (black or white) for given background
 */
export const getContrastColor = (value: string): string => {
  return isLightColor(value) ? "#000000" : "#ffffff";
};

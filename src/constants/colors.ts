/**
 * Color and gradient palette constants for backgrounds
 */

export interface ColorOption {
  color: string;
  isTransparent?: boolean;
}

export interface GradientOption {
  gradient: string;
}

// Color palette for background
export const COLOR_PALETTE: ColorOption[] = [
  // Row 1: Transparent, blacks, grays, white
  { color: "transparent", isTransparent: true },
  { color: "#000000" },
  { color: "#4A4A4A" },
  { color: "#7A7A7A" },
  { color: "#B8B8B8" },
  { color: "#FFFFFF" },
  // Row 2: Vibrant colors
  { color: "#E53935" },
  { color: "#8E24AA" },
  { color: "#1E88E5" },
  { color: "#00897B" },
  { color: "#43A047" },
  { color: "#00ACC1" },
  // Row 3: Medium tones
  { color: "#FF5722" },
  { color: "#7B1FA2" },
  { color: "#2196F3" },
  { color: "#26A69A" },
  { color: "#4CAF50" },
  { color: "#FF9800" },
  // Row 4: Lighter vibrant
  { color: "#F48FB1" },
  { color: "#CE93D8" },
  { color: "#90CAF9" },
  { color: "#80CBC4" },
  { color: "#C5E1A5" },
  { color: "#FFEE58" },
  // Row 5: Pastel colors
  { color: "#FCE4EC" },
  { color: "#E1BEE7" },
  { color: "#B3E5FC" },
  { color: "#B2DFDB" },
  { color: "#DCEDC8" },
  { color: "#FFF9C4" },
  // Row 6: Very light pastels
  { color: "#FFF8E1" },
  { color: "#E0F7FA" },
  { color: "#F1F8E9" },
  { color: "#FFFDE7" },
  { color: "#FBE9E7" },
  { color: "#F3E5F5" },
];

// Gradient palette for background
export const GRADIENT_PALETTE: GradientOption[] = [
  { gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)" },
  { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  {
    gradient: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)",
  },
  { gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
  { gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)" },
  { gradient: "linear-gradient(135deg, #4481eb 0%, #04befe 100%)" },
  { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { gradient: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)" },
  { gradient: "linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)" },
];

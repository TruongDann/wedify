/**
 * Font configuration for the wedding card editor
 * Centralized location for all available fonts
 */

import { CUSTOM_FONTS } from "./customFonts";

export interface FontConfig {
  name: string;
  label: string;
  category:
    | "script"
    | "serif"
    | "sans-serif"
    | "decorative"
    | "vietnamese"
    | "chinese"
    | "custom"
    | "system";
  supportsVietnamese?: boolean; // Whether this font has good Vietnamese character support
}

/**
 * Available fonts for the editor
 * Add or modify fonts here for easier maintenance
 */
export const FONTS: FontConfig[] = [
  // Wedding Script Fonts - Font chữ viết tay cho thiệp cưới
  {
    name: "Allison",
    label: "Allison",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Ephesis",
    label: "Ephesis",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Corinthia",
    label: "Corinthia",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Imperial Script",
    label: "Imperial Script",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Mrs Saint Delafield",
    label: "Mrs Saint Delafield",
    category: "script",
    supportsVietnamese: false,
  },
  {
    name: "Dancing Script",
    label: "Dancing Script",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Great Vibes",
    label: "Great Vibes",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Parisienne",
    label: "Parisienne",
    category: "script",
    supportsVietnamese: false,
  },
  {
    name: "Allura",
    label: "Allura",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Sacramento",
    label: "Sacramento",
    category: "script",
    supportsVietnamese: false,
  },
  {
    name: "Alex Brush",
    label: "Alex Brush",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Tangerine",
    label: "Tangerine",
    category: "script",
    supportsVietnamese: false,
  },
  {
    name: "Pinyon Script",
    label: "Pinyon Script",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Satisfy",
    label: "Satisfy",
    category: "script",
    supportsVietnamese: false,
  },
  {
    name: "Cookie",
    label: "Cookie",
    category: "script",
    supportsVietnamese: false,
  },
  {
    name: "Kaushan Script",
    label: "Kaushan Script",
    category: "script",
    supportsVietnamese: false,
  },
  {
    name: "Amatic SC",
    label: "Amatic SC",
    category: "script",
    supportsVietnamese: true,
  },

  // Elegant Serif - Font serif sang trọng
  {
    name: "Prata",
    label: "Prata",
    category: "serif",
    supportsVietnamese: true,
  },
  {
    name: "Cormorant",
    label: "Cormorant",
    category: "serif",
    supportsVietnamese: true,
  },
  {
    name: "Italiana",
    label: "Italiana",
    category: "serif",
    supportsVietnamese: false,
  },
  {
    name: "Bodoni Moda",
    label: "Bodoni Moda",
    category: "serif",
    supportsVietnamese: false,
  },
  {
    name: "Playfair Display",
    label: "Playfair Display",
    category: "serif",
    supportsVietnamese: true,
  },
  {
    name: "Cormorant Garamond",
    label: "Cormorant Garamond",
    category: "serif",
    supportsVietnamese: true,
  },
  { name: "Lora", label: "Lora", category: "serif", supportsVietnamese: true },
  {
    name: "Crimson Text",
    label: "Crimson Text",
    category: "serif",
    supportsVietnamese: true,
  },
  {
    name: "Libre Baskerville",
    label: "Libre Baskerville",
    category: "serif",
    supportsVietnamese: false,
  },
  {
    name: "EB Garamond",
    label: "EB Garamond",
    category: "serif",
    supportsVietnamese: true,
  },
  {
    name: "Merriweather",
    label: "Merriweather",
    category: "serif",
    supportsVietnamese: true,
  },
  {
    name: "Cinzel",
    label: "Cinzel",
    category: "serif",
    supportsVietnamese: false,
  },
  {
    name: "Cardo",
    label: "Cardo",
    category: "serif",
    supportsVietnamese: false,
  },

  // Modern Sans-Serif - Font hiện đại
  {
    name: "Montserrat",
    label: "Montserrat",
    category: "sans-serif",
    supportsVietnamese: true,
  },
  {
    name: "Raleway",
    label: "Raleway",
    category: "sans-serif",
    supportsVietnamese: true,
  },
  {
    name: "Poppins",
    label: "Poppins",
    category: "sans-serif",
    supportsVietnamese: false,
  },
  {
    name: "Open Sans",
    label: "Open Sans",
    category: "sans-serif",
    supportsVietnamese: true,
  },
  {
    name: "Roboto",
    label: "Roboto",
    category: "sans-serif",
    supportsVietnamese: true,
  },
  {
    name: "Josefin Sans",
    label: "Josefin Sans",
    category: "sans-serif",
    supportsVietnamese: true,
  },
  {
    name: "Quicksand",
    label: "Quicksand",
    category: "sans-serif",
    supportsVietnamese: true,
  },

  // Decorative Fonts - Font trang trí
  {
    name: "Pacifico",
    label: "Pacifico",
    category: "decorative",
    supportsVietnamese: true,
  },
  {
    name: "Lobster",
    label: "Lobster",
    category: "decorative",
    supportsVietnamese: true,
  },
  {
    name: "Righteous",
    label: "Righteous",
    category: "decorative",
    supportsVietnamese: false,
  },
  {
    name: "Abril Fatface",
    label: "Abril Fatface",
    category: "decorative",
    supportsVietnamese: false,
  },

  // Vietnamese Fonts - Font tiếng Việt
  {
    name: "Be Vietnam Pro",
    label: "Be Vietnam Pro",
    category: "vietnamese",
    supportsVietnamese: true,
  },
  {
    name: "Philosopher",
    label: "Philosopher",
    category: "vietnamese",
    supportsVietnamese: true,
  },

  // Classic Fonts - Font hệ thống
  {
    name: "Arial",
    label: "Arial",
    category: "system",
    supportsVietnamese: true,
  },
  {
    name: "Times New Roman",
    label: "Times New Roman",
    category: "system",
    supportsVietnamese: true,
  },
  {
    name: "Georgia",
    label: "Georgia",
    category: "system",
    supportsVietnamese: true,
  },

  // ---- Bổ sung từ nhánh Wedify API: font Google Fonts có tiếng Việt, thư pháp Trung Hoa, chữ ký ----
  { name: "Lobster Two", label: "Lobster Two", category: "script", supportsVietnamese: false },
  { name: "Mali", label: "Mali", category: "script", supportsVietnamese: true },
  { name: "Pangolin", label: "Pangolin", category: "script", supportsVietnamese: true },
  { name: "Patrick Hand", label: "Patrick Hand", category: "script", supportsVietnamese: true },
  { name: "Sriracha", label: "Sriracha", category: "script", supportsVietnamese: true },
  { name: "Itim", label: "Itim", category: "script", supportsVietnamese: true },
  { name: "Playpen Sans", label: "Playpen Sans", category: "script", supportsVietnamese: true },
  { name: "Shantell Sans", label: "Shantell Sans", category: "script", supportsVietnamese: true },
  { name: "Cormorant Infant", label: "Cormorant Infant", category: "serif", supportsVietnamese: true },
  { name: "Playfair Display SC", label: "Playfair Display SC", category: "serif", supportsVietnamese: true },
  { name: "Noto Serif", label: "Noto Serif", category: "serif", supportsVietnamese: true },
  { name: "Crimson Pro", label: "Crimson Pro", category: "serif", supportsVietnamese: true },
  { name: "Source Serif 4", label: "Source Serif 4", category: "serif", supportsVietnamese: true },
  { name: "Spectral", label: "Spectral", category: "serif", supportsVietnamese: true },
  { name: "Vollkorn", label: "Vollkorn", category: "serif", supportsVietnamese: true },
  { name: "Alegreya", label: "Alegreya", category: "serif", supportsVietnamese: true },
  { name: "Gelasio", label: "Gelasio", category: "serif", supportsVietnamese: true },
  { name: "Newsreader", label: "Newsreader", category: "serif", supportsVietnamese: true },
  { name: "Literata", label: "Literata", category: "serif", supportsVietnamese: true },
  { name: "Fraunces", label: "Fraunces", category: "serif", supportsVietnamese: true },
  { name: "Yeseva One", label: "Yeseva One", category: "serif", supportsVietnamese: true },
  { name: "Bitter", label: "Bitter", category: "serif", supportsVietnamese: true },
  { name: "Roboto Slab", label: "Roboto Slab", category: "serif", supportsVietnamese: true },
  { name: "Nunito", label: "Nunito", category: "sans-serif", supportsVietnamese: true },
  { name: "Nunito Sans", label: "Nunito Sans", category: "sans-serif", supportsVietnamese: true },
  { name: "Noto Sans", label: "Noto Sans", category: "sans-serif", supportsVietnamese: true },
  { name: "Inter", label: "Inter", category: "sans-serif", supportsVietnamese: true },
  { name: "Lexend", label: "Lexend", category: "sans-serif", supportsVietnamese: true },
  { name: "Work Sans", label: "Work Sans", category: "sans-serif", supportsVietnamese: true },
  { name: "Mulish", label: "Mulish", category: "sans-serif", supportsVietnamese: true },
  { name: "Cabin", label: "Cabin", category: "sans-serif", supportsVietnamese: true },
  { name: "Archivo", label: "Archivo", category: "sans-serif", supportsVietnamese: true },
  { name: "Barlow", label: "Barlow", category: "sans-serif", supportsVietnamese: true },
  { name: "Oswald", label: "Oswald", category: "sans-serif", supportsVietnamese: true },
  { name: "Roboto Condensed", label: "Roboto Condensed", category: "sans-serif", supportsVietnamese: true },
  { name: "Space Grotesk", label: "Space Grotesk", category: "sans-serif", supportsVietnamese: true },
  { name: "Baloo 2", label: "Baloo 2", category: "sans-serif", supportsVietnamese: true },
  { name: "Bangers", label: "Bangers", category: "decorative", supportsVietnamese: true },
  { name: "Fredoka", label: "Fredoka", category: "decorative", supportsVietnamese: false },
  { name: "Noto Serif SC", label: "Noto Serif SC", category: "chinese", supportsVietnamese: true },
  { name: "Ma Shan Zheng", label: "Ma Shan Zheng", category: "chinese", supportsVietnamese: false },
  { name: "Zhi Mang Xing", label: "Zhi Mang Xing", category: "chinese", supportsVietnamese: false },
  { name: "Liu Jian Mao Cao", label: "Liu Jian Mao Cao", category: "chinese", supportsVietnamese: false },
  { name: "Long Cang", label: "Long Cang", category: "chinese", supportsVietnamese: false },
  { name: "The Nautigal", label: "The Nautigal", category: "script", supportsVietnamese: true },
  { name: "Luxurious Script", label: "Luxurious Script", category: "script", supportsVietnamese: true },
  { name: "Water Brush", label: "Water Brush", category: "script", supportsVietnamese: true },
  { name: "Ballet", label: "Ballet", category: "script", supportsVietnamese: true },
  { name: "Praise", label: "Praise", category: "script", supportsVietnamese: true },
  { name: "Monsieur La Doulaise", label: "Monsieur La Doulaise", category: "script", supportsVietnamese: false },
  { name: "Birthstone", label: "Birthstone", category: "script", supportsVietnamese: true },
  { name: "Whisper", label: "Whisper", category: "script", supportsVietnamese: true },
  { name: "Licorice", label: "Licorice", category: "script", supportsVietnamese: true },
  { name: "Fleur De Leah", label: "Fleur De Leah", category: "script", supportsVietnamese: true },
  { name: "Ole", label: "Ole", category: "script", supportsVietnamese: true },
  { name: "WindSong", label: "WindSong", category: "script", supportsVietnamese: true },
  { name: "Waterfall", label: "Waterfall", category: "script", supportsVietnamese: true },
  { name: "Updock", label: "Updock", category: "script", supportsVietnamese: true },
  { name: "Send Flowers", label: "Send Flowers", category: "script", supportsVietnamese: true },
  { name: "Vujahday Script", label: "Vujahday Script", category: "script", supportsVietnamese: true },
  { name: "Style Script", label: "Style Script", category: "script", supportsVietnamese: true },
  { name: "Square Peg", label: "Square Peg", category: "script", supportsVietnamese: true },
  { name: "Petemoss", label: "Petemoss", category: "script", supportsVietnamese: true },
  { name: "Passions Conflict", label: "Passions Conflict", category: "script", supportsVietnamese: true },
  { name: "Oooh Baby", label: "Oooh Baby", category: "script", supportsVietnamese: true },
  { name: "My Soul", label: "My Soul", category: "script", supportsVietnamese: true },
  { name: "Mea Culpa", label: "Mea Culpa", category: "script", supportsVietnamese: true },
  { name: "Love Light", label: "Love Light", category: "script", supportsVietnamese: true },
  { name: "Kolker Brush", label: "Kolker Brush", category: "script", supportsVietnamese: true },
  { name: "Gwendolyn", label: "Gwendolyn", category: "script", supportsVietnamese: true },
  { name: "Estonia", label: "Estonia", category: "script", supportsVietnamese: true },
  { name: "Ingrid Darling", label: "Ingrid Darling", category: "script", supportsVietnamese: true },
  { name: "Inspiration", label: "Inspiration", category: "script", supportsVietnamese: true },
  { name: "Island Moments", label: "Island Moments", category: "script", supportsVietnamese: true },
  { name: "Lovers Quarrel", label: "Lovers Quarrel", category: "script", supportsVietnamese: true },
  { name: "Meow Script", label: "Meow Script", category: "script", supportsVietnamese: true },
  { name: "Moon Dance", label: "Moon Dance", category: "script", supportsVietnamese: true },
  { name: "Ms Madi", label: "Ms Madi", category: "script", supportsVietnamese: true },
  { name: "Qwigley", label: "Qwigley", category: "script", supportsVietnamese: true },
  { name: "Sassy Frass", label: "Sassy Frass", category: "script", supportsVietnamese: true },
  { name: "Splash", label: "Splash", category: "script", supportsVietnamese: true },
  { name: "Tapestry", label: "Tapestry", category: "script", supportsVietnamese: true },
  { name: "Beau Rivage", label: "Beau Rivage", category: "script", supportsVietnamese: true },
  { name: "Bonheur Royale", label: "Bonheur Royale", category: "script", supportsVietnamese: true },
  { name: "Caramel", label: "Caramel", category: "script", supportsVietnamese: true },
  { name: "Cherish", label: "Cherish", category: "script", supportsVietnamese: true },
  { name: "Comforter", label: "Comforter", category: "script", supportsVietnamese: true },
  { name: "Hurricane", label: "Hurricane", category: "script", supportsVietnamese: true },
  { name: "Lavishly Yours", label: "Lavishly Yours", category: "script", supportsVietnamese: true },
  { name: "Mynerve", label: "Mynerve", category: "script", supportsVietnamese: true },
  { name: "Italianno", label: "Italianno", category: "script", supportsVietnamese: true },
  { name: "Arizonia", label: "Arizonia", category: "script", supportsVietnamese: true },
  { name: "Playball", label: "Playball", category: "script", supportsVietnamese: true },
  { name: "Brygada 1918", label: "Brygada 1918", category: "serif", supportsVietnamese: true },
  { name: "Plus Jakarta Sans", label: "Plus Jakarta Sans", category: "sans-serif", supportsVietnamese: true },
  { name: "Sarabun", label: "Sarabun", category: "sans-serif", supportsVietnamese: true },
  { name: "Marmelad", label: "Marmelad", category: "sans-serif", supportsVietnamese: true },
  { name: "Livvic", label: "Livvic", category: "sans-serif", supportsVietnamese: true },
  { name: "Manrope", label: "Manrope", category: "sans-serif", supportsVietnamese: true },
  { name: "Questrial", label: "Questrial", category: "sans-serif", supportsVietnamese: true },
  { name: "Lexend Deca", label: "Lexend Deca", category: "sans-serif", supportsVietnamese: true },
  { name: "Poetsen One", label: "Poetsen One", category: "sans-serif", supportsVietnamese: false },
  { name: "Unica One", label: "Unica One", category: "decorative", supportsVietnamese: true },
  { name: "Bungee", label: "Bungee", category: "decorative", supportsVietnamese: true },
  { name: "Bevan", label: "Bevan", category: "decorative", supportsVietnamese: true },
];

/** Bộ font riêng (đã kiểm tra đủ dấu tiếng Việt) — nạp từ public/assets/fonts/custom. */
FONTS.push(
  ...CUSTOM_FONTS.map((font) => ({ name: font.name, label: font.name, category: "custom" as const, supportsVietnamese: true })),
);

/**
 * Get fonts by category
 */
export const getFontsByCategory = (category: FontConfig["category"]) => {
  return FONTS.filter((font) => font.category === category);
};

/**
 * Get fonts that support Vietnamese characters
 */
export const getVietnameseFonts = () => {
  return FONTS.filter((font) => font.supportsVietnamese);
};

export const FONT_CATEGORY_LABELS: Record<FontConfig["category"], string> = {
  script: "Chữ viết tay / thư pháp",
  serif: "Có chân (sang trọng)",
  "sans-serif": "Không chân (hiện đại)",
  decorative: "Trang trí",
  vietnamese: "Font tiếng Việt",
  chinese: "Thư pháp Trung Hoa (囍 福 愛)",
  custom: "Font của bạn (tiếng Việt)",
  system: "Font hệ thống",
};

/** Danh sách font gom theo nhóm, dùng cho ô chọn font (antd Select options). */
export const FONT_SELECT_GROUPS = (Object.keys(FONT_CATEGORY_LABELS) as FontConfig["category"][])
  .map((category) => ({
    label: FONT_CATEGORY_LABELS[category],
    options: FONTS.filter((font) => font.category === category).map((font) => ({
      value: font.name,
      label: font.label,
    })),
  }))
  .filter((group) => group.options.length > 0);

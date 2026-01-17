/**
 * Font configuration for the wedding card editor
 * Centralized location for all available fonts
 */

export interface FontConfig {
  name: string;
  label: string;
  category:
    | "script"
    | "serif"
    | "sans-serif"
    | "decorative"
    | "vietnamese"
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
    name: "Dancing Script",
    label: "Dancing Script",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Great Vibes",
    label: "Great Vibes",
    category: "script",
    supportsVietnamese: false,
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
    supportsVietnamese: false,
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
    supportsVietnamese: false,
  },
  {
    name: "Tangerine",
    label: "Tangerine",
    category: "script",
    supportsVietnamese: true,
  },
  {
    name: "Pinyon Script",
    label: "Pinyon Script",
    category: "script",
    supportsVietnamese: false,
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
    supportsVietnamese: true,
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
    supportsVietnamese: true,
  },
  {
    name: "Cardo",
    label: "Cardo",
    category: "serif",
    supportsVietnamese: true,
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
    supportsVietnamese: true,
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
    name: "Lobster",
    label: "Lobster",
    category: "decorative",
    supportsVietnamese: true,
  },
  {
    name: "Righteous",
    label: "Righteous",
    category: "decorative",
    supportsVietnamese: true,
  },
  {
    name: "Abril Fatface",
    label: "Abril Fatface",
    category: "decorative",
    supportsVietnamese: true,
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
];

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

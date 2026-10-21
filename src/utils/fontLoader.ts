/**
 * Font Loader - Load Google Fonts dynamically with proper loading detection
 * Only loads fonts when they are selected by the user
 */

const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();

/**
 * Map of font display names to their exact Google Fonts family names
 * Some fonts need special handling for URL encoding
 */
const FONT_NAME_MAP: Record<string, string> = {
  "Alex Brush": "Alex+Brush",
  "Amatic SC": "Amatic+SC",
  "Be Vietnam Pro": "Be+Vietnam+Pro",
  "Cormorant Garamond": "Cormorant+Garamond",
  "Crimson Text": "Crimson+Text",
  "Dancing Script": "Dancing+Script",
  "EB Garamond": "EB+Garamond",
  "Great Vibes": "Great+Vibes",
  "Josefin Sans": "Josefin+Sans",
  "Kaushan Script": "Kaushan+Script",
  "Libre Baskerville": "Libre+Baskerville",
  "Open Sans": "Open+Sans",
  "Pinyon Script": "Pinyon+Script",
  "Playfair Display": "Playfair+Display",
  "Times New Roman": "Times+New+Roman",
  "Abril Fatface": "Abril+Fatface",
};

const SYSTEM_FONTS = ["Arial", "Times New Roman", "Georgia", "Verdana", "Helvetica"];

/** Lấy tên font chính từ chuỗi CSS font-family (vd: `Great Vibes, cursive` -> `Great Vibes`). */
export const getPrimaryFontFamily = (fontFamily?: string): string =>
  (fontFamily || "").split(",")[0].replace(/["']/g, "").trim();

const buildFontUrls = (fontFamily: string): string[] => {
  const family = FONT_NAME_MAP[fontFamily] || fontFamily.replace(/ /g, "+");
  // Không phải font nào cũng có trục italic / weight 700 -> thử từ đầy đủ đến tối giản.
  return [
    `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,400;0,700;1,400;1,700&display=swap`,
    `https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap`,
    `https://fonts.googleapis.com/css2?family=${family}&display=swap`,
  ];
};

const injectStylesheet = (href: string): Promise<boolean> =>
  new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve(true);
    link.onerror = () => {
      link.remove();
      resolve(false);
    };
    document.head.appendChild(link);
  });

/**
 * Load a Google Font dynamically and wait for it to be ready
 * @param fontFamily - The font family name
 * @returns Promise that resolves when font is loaded
 */
export const loadGoogleFont = async (rawFontFamily: string): Promise<void> => {
  if (typeof document === "undefined") return;
  const fontFamily = getPrimaryFontFamily(rawFontFamily);
  if (!fontFamily) return;

  if (loadedFonts.has(fontFamily)) return;
  const pending = loadingFonts.get(fontFamily);
  if (pending) return pending;

  if (SYSTEM_FONTS.includes(fontFamily)) {
    loadedFonts.add(fontFamily);
    return;
  }

  const loadingPromise = (async () => {
    for (const url of buildFontUrls(fontFamily)) {
      if (await injectStylesheet(url)) break;
    }

    // Chờ trình duyệt tải thật sự file font (cả chữ thường, đậm, nghiêng) để Konva vẽ đúng font.
    const fonts = (document as any).fonts;
    if (fonts?.load) {
      const sample = "Aa Ăâ Ếế Ơơ 0123";
      await Promise.race([
        Promise.all([
          fonts.load(`16px "${fontFamily}"`, sample),
          fonts.load(`700 16px "${fontFamily}"`, sample),
          fonts.load(`italic 16px "${fontFamily}"`, sample),
        ]).catch(() => undefined),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    }

    loadedFonts.add(fontFamily);
    loadingFonts.delete(fontFamily);
  })();

  loadingFonts.set(fontFamily, loadingPromise);
  return loadingPromise;
};

/** Tải một danh sách font (loại trùng) và chờ tất cả sẵn sàng. */
export const loadGoogleFonts = async (fontFamilies: string[]): Promise<void> => {
  const unique = Array.from(
    new Set(fontFamilies.map(getPrimaryFontFamily).filter(Boolean)),
  );
  await Promise.all(unique.map((family) => loadGoogleFont(family)));
};

/**
 * Preload commonly used fonts for better UX
 */
export const preloadCommonFonts = () => {
  const commonFonts = [
    "Dancing Script",
    "Great Vibes",
    "Playfair Display",
    "Montserrat",
  ];

  commonFonts.forEach((font) => loadGoogleFont(font));
};

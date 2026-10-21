/**
 * Font Loader - Load Google Fonts dynamically with proper loading detection
 * Only loads fonts when they are selected by the user
 */

import { CUSTOM_FONT_MAP } from "@/constants/customFonts";
import { FONTS } from "@/constants/fonts";

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


// Đủ ký tự Latin + tiếng Việt để trình duyệt tải mọi phần (unicode-range) của font
const FONT_SAMPLE_TEXT =
  "AaBbZz09 ĂăÂâĐđÊêÔôƠơƯư ÁáÀàẢảÃãẠạẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặ ÉéÈèẺẻẼẽẸẹẾếỀềỂểỄễỆệ ÍíÌìỈỉĨĩỊị ÓóÒòỎỏÕõỌọỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợ ÚúÙùỦủŨũỤụỨứỪừỬửỮữỰự ÝýỲỳỶỷỸỹỴỵ";

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

/** Khai báo @font-face cho font riêng (một lần cho mỗi font). */
const injectedCustomFaces = new Set<string>();
const injectCustomFontFace = (family: string) => {
  const font = CUSTOM_FONT_MAP[family];
  if (!font || injectedCustomFaces.has(family)) return;
  injectedCustomFaces.add(family);
  const style = document.createElement("style");
  style.textContent = font.faces
    .map((face) => `@font-face{font-family:"${family}";src:url("/fonts/custom/${face.file}") format("woff2");font-weight:${face.weight};font-style:${face.italic ? "italic" : "normal"};font-display:swap;}`)
    .join("");
  document.head.appendChild(style);
};

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
    if (CUSTOM_FONT_MAP[fontFamily]) {
      injectCustomFontFace(fontFamily);
    } else {
      for (const url of buildFontUrls(fontFamily)) {
        if (await injectStylesheet(url)) break;
      }
    }

    // Chờ trình duyệt tải thật sự file font (cả chữ thường, đậm, nghiêng) để Konva vẽ đúng font.
    const fonts = (document as any).fonts;
    if (fonts?.load) {
      // Tải cả phần chữ có dấu tiếng Việt (Google Fonts tách thành file riêng) và bản đậm/nghiêng:
      // canvas không tự tải các phần này như HTML nên Konva sẽ vẽ chữ có dấu bằng font dự phòng.
      await Promise.race([
        Promise.all(
          ["", "bold ", "italic ", "italic bold "].map((style) => fonts.load(`${style}16px "${fontFamily}"`, FONT_SAMPLE_TEXT)),
        ).catch(() => undefined),
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

  // Nạp sẵn kiểu chữ của toàn bộ font để danh sách chọn font hiển thị đúng ngay khi mở (không đợi bấm chọn)
  const previewAll = () => void preloadFontPreviews(FONTS.map((font) => font.name));
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (idle) idle(previewAll);
  else setTimeout(previewAll, 1500);
};

const previewedFonts = new Set<string>();
const PREVIEW_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";

/**
 * Nạp nhẹ các font để xem trước trong danh sách chọn font (mỗi font hiển thị đúng kiểu chữ của nó ngay khi mở danh sách).
 * Google Fonts: gộp theo lô và chỉ tải các ký tự cần cho tên font. Font riêng: khai báo @font-face, trình duyệt tự tải file khi dùng.
 */
export const preloadFontPreviews = async (rawFamilies: string[]): Promise<void> => {
  if (typeof document === "undefined") return;
  const pending = Array.from(new Set(rawFamilies.map(getPrimaryFontFamily).filter(Boolean))).filter(
    (family) => !previewedFonts.has(family) && !loadedFonts.has(family) && !SYSTEM_FONTS.includes(family),
  );
  const google: string[] = [];
  const custom: string[] = [];
  pending.forEach((family) => {
    previewedFonts.add(family);
    if (CUSTOM_FONT_MAP[family]) {
      injectCustomFontFace(family);
      custom.push(family);
    } else google.push(family);
  });

  // Font riêng: chủ động tải file ngay (không đợi trình duyệt render dòng đó), 6 font song song cho khỏi nghẽn
  const fontSet = (document as any).fonts;
  const customQueue = [...custom];
  const customWorkers = Array.from({ length: 6 }, async () => {
    while (customQueue.length) {
      const family = customQueue.shift()!;
      await fontSet?.load?.(`16px "${family}"`, PREVIEW_TEXT).catch(() => undefined);
    }
  });

  const toParam = (family: string) => `family=${FONT_NAME_MAP[family] || family.replace(/ /g, "+")}`;
  const href = (families: string[]) => `https://fonts.googleapis.com/css2?${families.map(toParam).join("&")}&text=${encodeURIComponent(PREVIEW_TEXT)}&display=swap`;

  for (let i = 0; i < google.length; i += 20) {
    const batch = google.slice(i, i + 20);
    // Một font không tồn tại sẽ làm hỏng cả lô -> thử lại từng font
    if (!(await injectStylesheet(href(batch)))) {
      await Promise.all(batch.map((family) => injectStylesheet(href([family]))));
    }
  }
  await Promise.all(customWorkers);
};

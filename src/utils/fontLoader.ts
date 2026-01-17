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

/**
 * Load a Google Font dynamically and wait for it to be ready
 * @param fontFamily - The font family name
 * @returns Promise that resolves when font is loaded
 */
export const loadGoogleFont = async (fontFamily: string): Promise<void> => {
  // Skip if already loaded
  if (loadedFonts.has(fontFamily)) {
    return Promise.resolve();
  }

  // If currently loading, return existing promise
  if (loadingFonts.has(fontFamily)) {
    return loadingFonts.get(fontFamily)!;
  }

  // System fonts that don't need to be loaded from Google Fonts
  const systemFonts = [
    "Arial",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Helvetica",
  ];
  if (systemFonts.includes(fontFamily)) {
    loadedFonts.add(fontFamily);
    return Promise.resolve();
  }

  // Create loading promise
  const loadingPromise = new Promise<void>((resolve) => {
    // Get the properly formatted font name for Google Fonts URL
    const fontUrl = FONT_NAME_MAP[fontFamily] || fontFamily.replace(/ /g, "+");

    // Create link element
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrl}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;

    // Add preconnect for faster loading (only once)
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = "https://fonts.googleapis.com";
      document.head.appendChild(preconnect);

      const preconnectStatic = document.createElement("link");
      preconnectStatic.rel = "preconnect";
      preconnectStatic.href = "https://fonts.gstatic.com";
      preconnectStatic.crossOrigin = "anonymous";
      document.head.appendChild(preconnectStatic);
    }

    // Wait for font to be loaded using Font Loading API
    if ("fonts" in document) {
      link.onload = () => {
        // Use Font Loading API to wait for font
        (document as any).fonts.ready.then(() => {
          // Double check font is actually loaded
          (document as any).fonts
            .load(`16px "${fontFamily}"`)
            .then(() => {
              loadedFonts.add(fontFamily);
              loadingFonts.delete(fontFamily);
              console.log(`✓ Font loaded and ready: ${fontFamily}`);
              resolve();
            })
            .catch(() => {
              // Fallback: just mark as loaded after short delay
              setTimeout(() => {
                loadedFonts.add(fontFamily);
                loadingFonts.delete(fontFamily);
                console.log(`✓ Font loaded (fallback): ${fontFamily}`);
                resolve();
              }, 500);
            });
        });
      };
    } else {
      // Fallback for browsers without Font Loading API
      link.onload = () => {
        setTimeout(() => {
          loadedFonts.add(fontFamily);
          loadingFonts.delete(fontFamily);
          console.log(`✓ Font loaded: ${fontFamily}`);
          resolve();
        }, 300);
      };
    }

    // Fallback timeout in case onload doesn't fire
    setTimeout(() => {
      if (!loadedFonts.has(fontFamily)) {
        loadedFonts.add(fontFamily);
        loadingFonts.delete(fontFamily);
        console.log(`✓ Font loaded (timeout): ${fontFamily}`);
        resolve();
      }
    }, 2000);

    // Add to document head
    document.head.appendChild(link);
  });

  loadingFonts.set(fontFamily, loadingPromise);
  return loadingPromise;
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

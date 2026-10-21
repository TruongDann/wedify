/**
 * Kho hình tự vẽ (SVG) cho editor: khung viền, nền họa tiết và chữ kết hợp.
 * Mọi hình do dự án tự tạo bằng code nên dùng tự do, đổi màu được.
 */

export const svgUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;

export const STOCK_COLORS = ["#d4af37", "#e11d48", "#f472b6", "#15803d", "#1e3a8a", "#7c3aed", "#111827", "#ffffff"];

// ------------------------------------------------------------------ Khung viền

export interface StockFrame {
  id: string;
  label: string;
  width: number;
  height: number;
  svg: (c: string) => string;
}

const star = (cx: number, cy: number, r: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  });
  return `<polygon points="${pts.join(" ")}"/>`;
};

const HEART = "M160 268 C22 168 -8 70 68 30 C112 8 148 28 160 62 C172 28 208 8 252 30 C328 70 298 168 160 268 Z";
const heartAt = (cx: number, cy: number, size: number, rotate = 0) =>
  `<path transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${size / 320}) translate(-160 -140)" d="${HEART}"/>`;

const ringOf = (count: number, radius: number, render: (angle: number, x: number, y: number, i: number) => string, cx: number, cy: number) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count;
    return render((angle * 180) / Math.PI, cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), i);
  }).join("");

export const STOCK_FRAMES: StockFrame[] = [
  {
    id: "rect-double",
    label: "Chữ nhật đôi",
    width: 400,
    height: 300,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none"><rect x="6" y="6" width="388" height="288" rx="14" stroke="${c}" stroke-width="3.5"/><rect x="20" y="20" width="360" height="260" rx="8" stroke="${c}" stroke-width="1.2"/><g fill="${c}"><circle cx="6" cy="6" r="6"/><circle cx="394" cy="6" r="6"/><circle cx="6" cy="294" r="6"/><circle cx="394" cy="294" r="6"/></g></svg>`,
  },
  {
    id: "brackets",
    label: "Góc vuông",
    width: 400,
    height: 300,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"><path d="M10 70 V10 H70"/><path d="M330 10 H390 V70"/><path d="M390 230 V290 H330"/><path d="M70 290 H10 V230"/></svg>`,
  },
  {
    id: "heart-double",
    label: "Trái tim đôi",
    width: 320,
    height: 290,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 290" fill="none" stroke="${c}" stroke-linejoin="round"><path d="${HEART}" stroke-width="5"/><path transform="translate(160 140) scale(.88) translate(-160 -140)" d="${HEART}" stroke-width="1.6"/></svg>`,
  },
  {
    id: "arch",
    label: "Vòm cửa sổ",
    width: 300,
    height: 420,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" fill="none" stroke="${c}"><path d="M10 410 V150 A140 140 0 0 1 290 150 V410 Z" stroke-width="4"/><path d="M26 396 V152 A124 124 0 0 1 274 152 V396 Z" stroke-width="1.4"/></svg>`,
  },
  {
    id: "circle-beads",
    label: "Vòng tròn hạt",
    width: 340,
    height: 340,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340" fill="none"><circle cx="170" cy="170" r="162" stroke="${c}" stroke-width="3.5"/><circle cx="170" cy="170" r="146" stroke="${c}" stroke-width="1.2"/><g fill="${c}">${ringOf(36, 154, (_, x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6"/>`, 170, 170)}</g></svg>`,
  },
  {
    id: "ellipse",
    label: "Bầu dục",
    width: 420,
    height: 300,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300" fill="none" stroke="${c}"><ellipse cx="210" cy="150" rx="202" ry="142" stroke-width="3.5"/><ellipse cx="210" cy="150" rx="188" ry="128" stroke-width="1.2"/></svg>`,
  },
  {
    id: "ticket",
    label: "Vé mời",
    width: 440,
    height: 240,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 240" fill="none" stroke="${c}" stroke-width="3"><path d="M20 10 H420 a10 10 0 0 1 10 10 V90 a30 30 0 0 0 0 60 V220 a10 10 0 0 1 -10 10 H20 a10 10 0 0 1 -10 -10 V150 a30 30 0 0 0 0 -60 V20 a10 10 0 0 1 10 -10 Z"/><path d="M60 24 V216" stroke-dasharray="2 8" stroke-linecap="round" stroke-width="2.5"/></svg>`,
  },
  {
    id: "ribbon",
    label: "Dải ruy băng",
    width: 480,
    height: 130,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 130" stroke="${c}" stroke-width="3" stroke-linejoin="round"><path d="M70 30 H410 V100 H70 Z" fill="${c}" fill-opacity=".14"/><path d="M70 46 L12 46 L34 72 L12 98 L70 98 Z" fill="${c}" fill-opacity=".3"/><path d="M410 46 L468 46 L446 72 L468 98 L410 98 Z" fill="${c}" fill-opacity=".3"/></svg>`,
  },
  {
    id: "diamond",
    label: "Hình thoi",
    width: 340,
    height: 340,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340" fill="none" stroke="${c}"><path d="M170 8 L332 170 L170 332 L8 170 Z" stroke-width="3.5"/><path d="M170 26 L314 170 L170 314 L26 170 Z" stroke-width="1.2"/></svg>`,
  },
  {
    id: "dotted",
    label: "Viền chấm",
    width: 400,
    height: 300,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none"><rect x="8" y="8" width="384" height="284" rx="26" stroke="${c}" stroke-width="5" stroke-dasharray="1 11" stroke-linecap="round"/></svg>`,
  },
  {
    id: "beads",
    label: "Viền hạt tròn",
    width: 400,
    height: 300,
    svg: (c) => {
      const circles: string[] = [];
      for (let x = 14; x <= 386; x += 18.6) circles.push(`<circle cx="${x.toFixed(1)}" cy="10" r="5"/><circle cx="${x.toFixed(1)}" cy="290" r="5"/>`);
      for (let y = 28; y <= 272; y += 18.6) circles.push(`<circle cx="10" cy="${y.toFixed(1)}" r="5"/><circle cx="390" cy="${y.toFixed(1)}" r="5"/>`);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="${c}">${circles.join("")}</svg>`;
    },
  },
  {
    id: "star-corners",
    label: "Sao ở góc",
    width: 400,
    height: 300,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect x="16" y="16" width="368" height="268" fill="none" stroke="${c}" stroke-width="2.5"/><g fill="${c}">${star(16, 16, 15)}${star(384, 16, 15)}${star(16, 284, 15)}${star(384, 284, 15)}</g></svg>`,
  },
  {
    id: "leaf-wreath",
    label: "Vòng lá",
    width: 360,
    height: 360,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" fill="${c}">${ringOf(30, 148, (deg, x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="20" ry="8" transform="rotate(${(deg + 90 + (i % 2 ? 28 : -28)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill-opacity="${i % 2 ? 0.55 : 0.9}"/>`, 180, 180)}</svg>`,
  },
  {
    id: "flower-wreath",
    label: "Vòng hoa",
    width: 360,
    height: 360,
    svg: (c) => {
      const leaves = ringOf(18, 150, (deg, x, y) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="16" ry="6" transform="rotate(${(deg + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#15803d" fill-opacity=".7"/>`, 180, 180);
      const flowers = ringOf(9, 150, (_, x, y) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" fill="${c}">${ringOf(5, 9, (__, px, py) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7"/>`, 0, 0)}<circle r="5" fill="#fde68a"/></g>`, 180, 180);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">${leaves}${flowers}</svg>`;
    },
  },
  {
    id: "heart-ring",
    label: "Vòng tim",
    width: 360,
    height: 360,
    svg: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" fill="${c}">${ringOf(16, 150, (deg, x, y, i) => `<g fill-opacity="${i % 2 ? 0.55 : 1}">${heartAt(x, y, i % 2 ? 22 : 30, deg + 90)}</g>`, 180, 180)}</svg>`,
  },
  {
    id: "lace",
    label: "Dải ren",
    width: 480,
    height: 60,
    svg: (c) => {
      const arcs: string[] = [];
      for (let x = 0; x < 480; x += 30) arcs.push(`<path d="M${x} 6 a15 15 0 0 0 30 0" /><circle cx="${x + 15}" cy="30" r="3.4" fill="${c}" stroke="none"/>`);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 60" fill="none" stroke="${c}" stroke-width="2.4">${arcs.join("")}<path d="M0 6 H480"/></svg>`;
    },
  },
];

// ------------------------------------------------------------------ Nền họa tiết

export interface StockPattern {
  id: string;
  label: string;
  svg: (bg: string, ink: string) => string;
}

const W = 600;
const H = 800;
const wrap = (bg: string, defs: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs><rect width="${W}" height="${H}" fill="${bg}"/>${body}</svg>`;
const fillPattern = (id: string, w: number, h: number, inner: string, rotate = 0) =>
  `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${rotate ? ` patternTransform="rotate(${rotate})"` : ""}>${inner}</pattern>`;
const rect = (id: string) => `<rect width="${W}" height="${H}" fill="url(#${id})"/>`;

export const STOCK_PATTERNS: StockPattern[] = [
  { id: "dots", label: "Chấm bi", svg: (bg, ink) => wrap(bg, fillPattern("p", 40, 40, `<circle cx="20" cy="20" r="4.5" fill="${ink}" fill-opacity=".45"/>`), rect("p")) },
  { id: "stripes", label: "Sọc", svg: (bg, ink) => wrap(bg, fillPattern("p", 40, 40, `<rect width="20" height="40" fill="${ink}" fill-opacity=".14"/>`), rect("p")) },
  { id: "diagonal", label: "Sọc chéo", svg: (bg, ink) => wrap(bg, fillPattern("p", 36, 36, `<rect width="14" height="36" fill="${ink}" fill-opacity=".14"/>`, 45), rect("p")) },
  { id: "gingham", label: "Caro", svg: (bg, ink) => wrap(bg, fillPattern("p", 60, 60, `<rect width="30" height="60" fill="${ink}" fill-opacity=".12"/><rect width="60" height="30" fill="${ink}" fill-opacity=".12"/>`), rect("p")) },
  { id: "lattice", label: "Ô trám", svg: (bg, ink) => wrap(bg, fillPattern("p", 60, 60, `<path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="1.6"/>`), rect("p")) },
  { id: "chevron", label: "Chữ V", svg: (bg, ink) => wrap(bg, fillPattern("p", 60, 40, `<path d="M0 10 L30 30 L60 10" fill="none" stroke="${ink}" stroke-opacity=".4" stroke-width="3"/>`), rect("p")) },
  { id: "scallop", label: "Vảy cá", svg: (bg, ink) => wrap(bg, fillPattern("p", 60, 40, `<path d="M0 40 A30 30 0 0 1 60 40 M-30 20 A30 30 0 0 1 30 20 M30 20 A30 30 0 0 1 90 20" fill="none" stroke="${ink}" stroke-opacity=".4" stroke-width="2"/>`), rect("p")) },
  { id: "hearts", label: "Trái tim", svg: (bg, ink) => wrap(bg, fillPattern("p", 70, 70, `<g fill="${ink}" fill-opacity=".35">${heartAt(35, 35, 22)}</g>`), rect("p")) },
  { id: "stars", label: "Ngôi sao", svg: (bg, ink) => wrap(bg, fillPattern("p", 70, 70, `<g fill="${ink}" fill-opacity=".4">${star(35, 35, 11)}</g>`), rect("p")) },
  {
    id: "floral",
    label: "Hoa nhỏ",
    svg: (bg, ink) => wrap(bg, fillPattern("p", 90, 90, `<g transform="translate(45 45)" fill="${ink}" fill-opacity=".4">${ringOf(5, 9, (_, x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/>`, 0, 0)}<circle r="4" fill-opacity=".8"/></g>`), rect("p")),
  },
  {
    id: "quatrefoil",
    label: "Bốn cánh",
    svg: (bg, ink) => wrap(bg, fillPattern("p", 80, 80, `<g fill="none" stroke="${ink}" stroke-opacity=".38" stroke-width="2"><circle cx="30" cy="40" r="14"/><circle cx="50" cy="40" r="14"/><circle cx="40" cy="30" r="14"/><circle cx="40" cy="50" r="14"/></g>`), rect("p")),
  },
  {
    id: "watercolor",
    label: "Màu nước",
    svg: (bg, ink) =>
      wrap(
        bg,
        `<filter id="b"><feGaussianBlur stdDeviation="46"/></filter>`,
        `<g filter="url(#b)" fill="${ink}"><circle cx="110" cy="130" r="150" fill-opacity=".38"/><circle cx="520" cy="360" r="170" fill-opacity=".3"/><circle cx="170" cy="640" r="160" fill-opacity=".34"/><circle cx="500" cy="760" r="120" fill-opacity=".26"/></g>`,
      ),
  },
  {
    id: "gradient",
    label: "Chuyển màu",
    svg: (bg, ink) => wrap(bg, `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${ink}" stop-opacity=".5"/></linearGradient>`, `<rect width="${W}" height="${H}" fill="url(#g)"/>`),
  },
  {
    id: "paper",
    label: "Giấy nhám",
    svg: (bg, ink) =>
      wrap(bg, `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .16 0"/></filter>`, `<rect width="${W}" height="${H}" filter="url(#n)" fill="${ink}"/>`),
  },
  {
    id: "confetti",
    label: "Confetti",
    svg: (bg, ink) => {
      const colors = [ink, "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];
      const bits = Array.from({ length: 70 }, (_, i) => {
        const x = (i * 97) % W;
        const y = (i * 151) % H;
        const color = colors[i % colors.length];
        return i % 3 === 0 ? `<circle cx="${x}" cy="${y}" r="${3 + (i % 4)}" fill="${color}" fill-opacity=".6"/>` : `<rect x="${x}" y="${y}" width="${8 + (i % 3) * 3}" height="4" fill="${color}" fill-opacity=".6" transform="rotate(${(i * 41) % 180} ${x} ${y})"/>`;
      });
      return wrap(bg, "", bits.join(""));
    },
  },
];

export const STOCK_PATTERN_PALETTES: Array<{ bg: string; ink: string }> = [
  { bg: "#fff1f2", ink: "#e11d48" },
  { bg: "#f0fdf4", ink: "#15803d" },
  { bg: "#fefce8", ink: "#a16207" },
  { bg: "#eff6ff", ink: "#1d4ed8" },
  { bg: "#faf5ff", ink: "#7e22ce" },
  { bg: "#fffbeb", ink: "#92400e" },
  { bg: "#111827", ink: "#d4af37" },
  { bg: "#ffffff", ink: "#9ca3af" },
];

// ------------------------------------------------------------------ Kết hợp chữ

export interface StockTextCombo {
  label: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight?: number;
  letterSpacing?: number;
  italic?: boolean;
  glow?: string;
  backgroundColor?: string;
  radius?: number;
}

export interface StockTextGroup {
  label: string;
  items: StockTextCombo[];
}

export const STOCK_TEXT_GROUPS: StockTextGroup[] = [
  {
    label: "Tiếng Việt",
    items: [
      { label: "Trăm năm hạnh phúc", content: "Trăm năm hạnh phúc", fontFamily: "Dancing Script", fontSize: 46, color: "#be123c" },
      { label: "Mãi bên nhau", content: "Mãi bên nhau", fontFamily: "Pacifico", fontSize: 40, color: "#db2777" },
      { label: "Hạnh phúc trọn đời", content: "Hạnh phúc trọn đời", fontFamily: "Great Vibes", fontSize: 50, color: "#9f1239" },
      { label: "Duyên trời định", content: "Duyên trời định", fontFamily: "Allura", fontSize: 52, color: "#a16207" },
      { label: "Sắc son", content: "Sắc son", fontFamily: "Alex Brush", fontSize: 56, color: "#b91c1c" },
      { label: "Chúc mừng hạnh phúc", content: "CHÚC MỪNG HẠNH PHÚC", fontFamily: "Montserrat", fontSize: 22, color: "#7f1d1d", fontWeight: 700, letterSpacing: 4 },
      { label: "Trân trọng kính mời", content: "TRÂN TRỌNG KÍNH MỜI", fontFamily: "Cormorant Garamond", fontSize: 24, color: "#44403c", letterSpacing: 6, fontWeight: 700 },
      { label: "Lễ thành hôn", content: "Lễ Thành Hôn", fontFamily: "Playfair Display", fontSize: 38, color: "#4c0519", italic: true },
      { label: "Lễ vu quy", content: "Lễ Vu Quy", fontFamily: "Playfair Display", fontSize: 38, color: "#4c0519", italic: true },
      { label: "Thiệp mời", content: "THIỆP MỜI", fontFamily: "Oswald", fontSize: 34, color: "#111827", letterSpacing: 8 },
      { label: "Cảm ơn", content: "Cảm ơn bạn đã đến!", fontFamily: "Mali", fontSize: 32, color: "#be185d" },
      { label: "Hẹn gặp lại", content: "Hẹn gặp bạn tại tiệc cưới", fontFamily: "Lora", fontSize: 24, color: "#44403c", italic: true },
    ],
  },
  {
    label: "Tiếng Anh",
    items: [
      { label: "Thank you", content: "Thank you", fontFamily: "Great Vibes", fontSize: 58, color: "#be123c" },
      { label: "Save the date", content: "Save the date", fontFamily: "Allura", fontSize: 58, color: "#a16207" },
      { label: "I do", content: "I do", fontFamily: "Pinyon Script", fontSize: 72, color: "#7c2d12" },
      { label: "Just married", content: "JUST MARRIED", fontFamily: "Bangers", fontSize: 38, color: "#db2777", letterSpacing: 2 },
      { label: "Mr & Mrs", content: "Mr & Mrs", fontFamily: "Playfair Display", fontSize: 46, color: "#1f2937", italic: true },
      { label: "Our wedding", content: "OUR WEDDING", fontFamily: "Montserrat", fontSize: 24, color: "#be123c", fontWeight: 700, letterSpacing: 5 },
      { label: "The wedding of", content: "The Wedding of", fontFamily: "Cormorant Garamond", fontSize: 34, color: "#44403c", italic: true },
      { label: "Forever & always", content: "Forever & Always", fontFamily: "Dancing Script", fontSize: 46, color: "#be123c" },
      { label: "Love story", content: "LOVE STORY", fontFamily: "Josefin Sans", fontSize: 30, color: "#111827", letterSpacing: 10 },
      { label: "Welcome", content: "WELCOME", fontFamily: "Raleway", fontSize: 34, color: "#ea580c", fontWeight: 700, letterSpacing: 6 },
      { label: "Happy birthday", content: "Happy Birthday", fontFamily: "Lobster", fontSize: 46, color: "#db2777" },
      { label: "Bride to be", content: "Bride to be", fontFamily: "Parisienne", fontSize: 50, color: "#be185d" },
      { label: "With love", content: "With Love", fontFamily: "Sacramento", fontSize: 56, color: "#9f1239" },
      { label: "Cheers", content: "CHEERS!", fontFamily: "Fredoka", fontSize: 40, color: "#f59e0b", fontWeight: 700 },
      { label: "Baby shower", content: "Baby Shower", fontFamily: "Pacifico", fontSize: 38, color: "#0ea5e9" },
      { label: "Welcome baby", content: "Welcome Baby", fontFamily: "Dancing Script", fontSize: 48, color: "#0284c7" },
    ],
  },
  {
    label: "Thư pháp Trung Hoa",
    items: [
      { label: "Bách niên hảo hợp", content: "百年好合", fontFamily: "Ma Shan Zheng", fontSize: 54, color: "#b91c1c" },
      { label: "Vĩnh kết đồng tâm", content: "永结同心", fontFamily: "Zhi Mang Xing", fontSize: 54, color: "#9f1239" },
      { label: "Thiên tác chi hợp", content: "天作之合", fontFamily: "Liu Jian Mao Cao", fontSize: 54, color: "#7c2d12" },
      { label: "Hỷ kết lương duyên", content: "喜结良缘", fontFamily: "Long Cang", fontSize: 54, color: "#dc2626" },
      { label: "Hạnh phúc mỹ mãn", content: "幸福美满", fontFamily: "Ma Shan Zheng", fontSize: 54, color: "#b45309" },
      { label: "Hoa hảo nguyệt viên", content: "花好月圆", fontFamily: "Zhi Mang Xing", fontSize: 54, color: "#be185d" },
      { label: "Bạch đầu giai lão", content: "白头偕老", fontFamily: "Liu Jian Mao Cao", fontSize: 54, color: "#1f2937" },
      { label: "Tảo sinh quý tử", content: "早生贵子", fontFamily: "Long Cang", fontSize: 54, color: "#c2410c" },
      { label: "Tân hôn đại cát", content: "新婚大吉", fontFamily: "Ma Shan Zheng", fontSize: 54, color: "#b91c1c" },
      { label: "Cầm sắt hòa minh", content: "琴瑟和鸣", fontFamily: "Zhi Mang Xing", fontSize: 54, color: "#15803d" },
      { label: "Phúc", content: "福", fontFamily: "Ma Shan Zheng", fontSize: 110, color: "#dc2626" },
      { label: "Lộc", content: "禄", fontFamily: "Zhi Mang Xing", fontSize: 110, color: "#15803d" },
    ],
  },
];

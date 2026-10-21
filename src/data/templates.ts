import type { CanvasSettings, Template } from "@/types/editor";
import type { AmbientEffectSettings } from "@/components/editor/effects/AmbientEffect";
import { TemplateBuilder, photoUrl, type Anim } from "./templateKit";

type Kind = "wedding" | "engagement" | "birthday" | "baby";
type HeroLayout = "photo" | "arch" | "type" | "frame";
type Motif = "heart" | "star" | "diamond" | "circle";

interface Theme {
  id: string;
  name: string;
  kind: Kind;
  /** Nhãn hiển thị ở thẻ mẫu, vd. "Tiệc cưới". */
  tag: string;
  accent: string;
  gold: string;
  ink: string;
  soft: string;
  /** Nền canvas (màu hoặc linear-gradient). */
  bg: string;
  /** Màu đặc ở mép dưới hero, để ảnh tan vào nền. */
  fade: string;
  panel: string;
  panelBorder: string;
  dark: boolean;
  hero: HeroLayout;
  motif: Motif;
  glow: string[];
  ambient: AmbientEffectSettings;
  fonts: { script: string; serif: string; sans: string };
  photos: { hero: string; story: [string, string]; gallery: [string, string, string, string, string] };
  date: string; // YYYY-MM-DD
  time: string;
  names: [string, string?];
  /** Số lớn hiển thị ở hero (vd. tuổi trong sinh nhật). */
  bigNumber?: string;
  song: number;
}

const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

const dateParts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return {
    day: dd,
    month: `THÁNG ${m} · ${y}`,
    short: `${dd}.${mm}.${y}`,
    weekday: WEEKDAYS[new Date(y, m - 1, d).getDay()],
  };
};

/** Nội dung mặc định theo loại thiệp — người dùng sửa trực tiếp trong editor. */
const copyFor = (theme: Theme) => {
  const [a, b] = theme.names;
  const couple = b ? `${a} & ${b}` : a;
  switch (theme.kind) {
    case "birthday":
      return {
        eyebrow: "HAPPY BIRTHDAY",
        subtitle: "Sinh nhật lần thứ " + (theme.bigNumber ?? ""),
        lead: "TRÂN TRỌNG KÍNH MỜI",
        guest: "Bạn thân mến",
        body: "Hãy cùng mình thổi nến, cắt bánh và\nlưu lại thật nhiều kỷ niệm đáng nhớ nhé!",
        hosts: [{ title: "CHỦ TIỆC", lines: `${a}\nCùng gia đình và bạn bè` }],
        dateLabel: "SAVE THE DATE",
        storyTitle: "Một năm rực rỡ",
        story: "Thêm một vòng quay quanh mặt trời với bao nhiêu niềm vui, bài học và những người bạn tuyệt vời. Cảm ơn vì đã luôn ở bên mình!",
        schedule: [
          { time: "17:00", title: "Đón khách", note: "Welcome drink & chụp ảnh check-in" },
          { time: "18:00", title: "Thổi nến & cắt bánh", note: "Khoảnh khắc ước nguyện cùng nhau" },
          { time: "19:00", title: "Tiệc & âm nhạc", note: "Ăn uống, trò chơi và quẩy hết mình" },
        ],
        galleryTitle: "Khoảnh khắc đáng nhớ",
        venue: "Sky Lounge 88",
        address: "88 Tôn Đức Thắng, Hải Châu, Đà Nẵng",
        thanks: "Sự hiện diện của bạn là món quà tuyệt vời nhất!\nHẹn gặp bạn tại bữa tiệc nhé.",
        closing: a,
      };
    case "baby":
      return {
        eyebrow: "THÔI NÔI",
        subtitle: "Tròn một tuổi",
        lead: "TRÂN TRỌNG KÍNH MỜI",
        guest: "Quý khách",
        body: "Đến chung vui và chúc phúc cho bé\nnhân dịp tròn một tuổi của gia đình chúng tôi.",
        hosts: [{ title: "GIA ĐÌNH CỦA BÉ", lines: "Bố: Nguyễn Văn A\nMẹ: Trần Thị B" }],
        dateLabel: "SAVE THE DATE",
        storyTitle: "Hành trình một năm",
        story: "Một năm trước, bé chào đời mang theo bao yêu thương. Từng nụ cười, từng bước đi chập chững là món quà vô giá của cả gia đình.",
        schedule: [
          { time: "10:00", title: "Đón khách", note: "Chụp ảnh cùng bé và gia đình" },
          { time: "10:45", title: "Lễ thôi nôi", note: "Bốc thăm đồ vật tiên đoán tương lai" },
          { time: "11:30", title: "Tiệc mừng", note: "Dùng bữa và chia sẻ niềm vui" },
        ],
        galleryTitle: "Những khoảnh khắc đáng yêu",
        venue: "Nhà hàng Hoa Mai",
        address: "25 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
        thanks: "Cảm ơn mọi người đã đến chúc phúc cho bé.\nSự có mặt của bạn là niềm vui của gia đình!",
        closing: a,
      };
    case "engagement":
      return {
        eyebrow: "LỄ ĐÍNH HÔN",
        subtitle: "",
        lead: "TRÂN TRỌNG KÍNH MỜI",
        guest: "Quý khách",
        body: "Đến dự lễ đính hôn và chung vui\ncùng gia đình chúng tôi.",
        hosts: [
          { title: "NHÀ TRAI", lines: "Ông Nguyễn Văn A\nBà Trần Thị B\nHà Nội" },
          { title: "NHÀ GÁI", lines: "Ông Lê Văn C\nBà Phạm Thị D\nHải Phòng" },
        ],
        dateLabel: "SAVE THE DATE",
        storyTitle: "Chuyện tình của chúng mình",
        story: `Từ lần đầu gặp gỡ đến lời hẹn ước hôm nay, ${couple} đã cùng nhau đi qua biết bao mùa yêu thương. Chúng mình rất mong được chia sẻ ngày đặc biệt này cùng bạn.`,
        schedule: [
          { time: "09:00", title: "Đón khách", note: "Chào đón quan khách hai họ" },
          { time: "10:00", title: "Lễ đính hôn", note: "Nghi thức trao nhẫn và lời hẹn ước" },
          { time: "11:30", title: "Tiệc mừng", note: "Dùng bữa thân mật cùng hai gia đình" },
        ],
        galleryTitle: "Album ngày đính hôn",
        venue: "Nhà hàng Ngọc Lan",
        address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        thanks: "Cảm ơn bạn đã đến chia sẻ niềm hạnh phúc này.\nHẹn gặp bạn trong ngày vui của chúng mình!",
        closing: couple,
      };
    default:
      return {
        eyebrow: "THIỆP BÁO HỶ",
        subtitle: "",
        lead: "TRÂN TRỌNG KÍNH MỜI",
        guest: "Quý khách",
        body: "Đến dự lễ thành hôn của chúng tôi\nvà chung vui trong ngày trọng đại.",
        hosts: [
          { title: "NHÀ TRAI", lines: "Ông Nguyễn Văn A\nBà Trần Thị B\nHà Nội" },
          { title: "NHÀ GÁI", lines: "Ông Lê Văn C\nBà Phạm Thị D\nHải Phòng" },
        ],
        dateLabel: "SAVE THE DATE",
        storyTitle: "Câu chuyện của chúng mình",
        story: `Từ những lần đi bộ cùng nhau trong chiều mưa đến ngày hôm nay, ${couple} đã tìm thấy nhau trong một tình yêu dịu dàng và bền bỉ. Rất mong được chia sẻ niềm vui này cùng bạn.`,
        schedule: [
          { time: "09:00", title: "Đón khách", note: "Chào đón và chụp ảnh lưu niệm" },
          { time: "10:30", title: "Lễ thành hôn", note: "Nghi thức theo truyền thống hai gia đình" },
          { time: "12:00", title: "Tiệc cưới", note: "Dùng bữa, chúc mừng và giao lưu" },
        ],
        galleryTitle: "Album cưới",
        venue: "Trung tâm tiệc cưới Aurora",
        address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        thanks: "Sự hiện diện của bạn là niềm hạnh phúc lớn nhất của chúng mình.\nHẹn gặp bạn trong ngày trọng đại!",
        closing: couple,
      };
  }
};

export interface TemplateContent {
  eyebrow: string;
  subtitle: string;
  nameA: string;
  nameB?: string;
  /** Số lớn ở hero (vd. tuổi trong thiệp sinh nhật). */
  bigNumber?: string;
  date: string; // YYYY-MM-DD
  time: string;
  lead: string;
  guest: string;
  body: string;
  hosts: Array<{ title: string; lines: string }>;
  dateLabel: string;
  storyTitle: string;
  story: string;
  schedule: Array<{ time: string; title: string; note: string }>;
  galleryTitle: string;
  venue: string;
  address: string;
  thanks: string;
  closing: string;
  /** Mỗi ảnh là URL đầy đủ hoặc mã ảnh Unsplash. */
  photos: { hero: string; story: [string, string]; gallery: [string, string, string, string, string] };
  musicSrc: string;
  musicName: string;
  musicArtist: string;
}

/** Nội dung mặc định (mẫu) của một chủ đề. */
const defaultContent = (theme: Theme): TemplateContent => ({
  ...copyFor(theme),
  nameA: theme.names[0],
  nameB: theme.names[1],
  bigNumber: theme.bigNumber,
  date: theme.date,
  time: theme.time,
  photos: theme.photos,
  musicSrc: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${theme.song}.mp3`,
  musicName: "Nhạc nền mẫu",
  musicArtist: "SoundHelix",
});

const WIDTH = 600;
const CX = WIDTH / 2;
const motifShape = (m: Motif) => (m === "heart" ? "heart" : m === "star" ? "star" : m === "diamond" ? "diamond" : "circle");

const buildTemplate = (theme: Theme, content: TemplateContent = defaultContent(theme)): Template => {
  const b = new TemplateBuilder(theme.id, WIDTH);
  const t = content;
  const dp = dateParts(content.date);
  const { script, serif, sans } = theme.fonts;
  const nameA = content.nameA;
  const nameB = content.nameB?.trim() ? content.nameB : undefined;
  const clearEnd = theme.dark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)";
  const heroWhite = "#ffffff";

  // ---- thành phần dùng lại ----
  const bokeh = (y0: number, y1: number, count: number, seed = 0) => {
    for (let i = 0; i < count; i += 1) {
      const size = 70 + ((i * 53 + seed * 17) % 110);
      const x = ((i * 173 + 60 + seed * 41) % 520) - 20;
      const y = y0 + ((i * 257 + seed * 83) % Math.max(1, y1 - y0 - size));
      const color = theme.glow[i % theme.glow.length];
      b.shape({
        shape: "circle",
        x,
        y,
        w: size,
        h: size,
        fill: `radial-gradient(${color}, ${clearEnd})`,
        opacity: theme.dark ? 0.8 : 0.9,
        anim: [i % 2 ? "float" : "twinkle", (i % 5) * 0.4, true],
      });
    }
  };

  const sparkleMotifs = (y0: number, y1: number, count: number, seed = 0) => {
    for (let i = 0; i < count; i += 1) {
      const size = 8 + ((i * 7 + seed) % 10);
      b.shape({
        shape: motifShape(theme.motif),
        x: 24 + ((i * 211 + seed * 59) % 540),
        y: y0 + ((i * 331 + seed * 97) % Math.max(1, y1 - y0)),
        w: size,
        h: size,
        fill: i % 3 === 0 ? theme.gold : theme.accent,
        opacity: 0.55,
        anim: ["twinkle", (i % 6) * 0.35, true],
      });
    }
  };

  const eyebrow = (text: string, cy: number, color = theme.soft, anim: Anim = ["fadeIn", 0]) =>
    b.text({ text, cy, w: 480, font: sans, size: 14, weight: 600, color, ls: 7, anim });

  const divider = (cy: number) => {
    b.shape({ shape: "line", x: CX - 150, y: cy, w: 110, stroke: theme.accent, sw: 1.4, opacity: 0.7, anim: ["slideRight", 0] });
    b.shape({ shape: "line", x: CX + 40, y: cy, w: 110, stroke: theme.accent, sw: 1.4, opacity: 0.7, anim: ["slideLeft", 0] });
    b.shape({ shape: motifShape(theme.motif), x: CX - 9, y: cy - 9, w: 18, h: 18, fill: theme.accent, anim: [theme.motif === "heart" ? "heartbeat" : "twinkle", 0.2, true] });
  };

  const arrow = (cy: number, color: string) => {
    b.text({ text: "Kéo xuống", cy: cy - 22, w: 200, font: sans, size: 12, weight: 500, color, ls: 4, opacity: 0.85, anim: ["fadeIn", 1.2] });
    b.text({ text: "↓", cy, w: 60, font: sans, size: 26, color, opacity: 0.9, anim: ["float", 0, true] });
  };

  /** Khối tên: 2 người (tên – & – tên) hoặc 1 tên + phụ đề. Trả về mép dưới. */
  const nameBlock = (startCy: number, size: number, color: string, ampColor: string, glow?: { color: string; blur: number }) => {
    if (nameB) {
      b.text({ text: nameA, cy: startCy, w: 540, font: script, size, color, glow, anim: ["slideLeft", 0.2] });
      b.text({ text: "&", cy: startCy + size * 0.95, w: 100, font: serif, size: size * 0.55, italic: true, color: ampColor, anim: ["zoomIn", 0.5] });
      b.text({ text: nameB, cy: startCy + size * 1.9, w: 540, font: script, size, color, glow, anim: ["slideRight", 0.35] });
      return startCy + size * 1.9 + size * 0.7;
    }
    b.text({ text: nameA, cy: startCy, w: 540, font: script, size: size * 1.15, color, glow, anim: ["zoomIn", 0.2] });
    if (t.subtitle) b.text({ text: t.subtitle, cy: startCy + size * 0.95, w: 500, font: serif, size: 26, italic: true, color: ampColor, anim: ["fadeIn", 0.6] });
    return startCy + size * 1.4;
  };

  let y = 0;

  // =========================== HERO ===========================
  if (theme.hero === "photo") {
    const H = 1000;
    b.image({ src: photoUrl(content.photos.hero, WIDTH, H), x: 0, y: 0, w: WIDTH, h: H, anim: ["fadeIn", 0], filters: { brightness: 82, contrast: 106, saturation: 92 } });
    b.shape({
      shape: "rectangle", x: 0, y: 0, w: WIDTH, h: H,
      fill: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.5) 72%, ${theme.fade} 100%)`,
    });
    bokeh(0, H, 6, 1);
    eyebrow(t.eyebrow, 120, heroWhite, ["slideUp", 0.1]);
    b.shape({ shape: motifShape(theme.motif), x: CX - 8, y: 158, w: 16, h: 16, fill: theme.gold, anim: ["heartbeat", 0.3, true] });
    nameBlock(480, 84, heroWhite, theme.gold, { color: "rgba(0,0,0,0.45)", blur: 18 });
    b.text({ text: `${dp.weekday}  •  ${dp.short}`, cy: 850, w: 520, font: sans, size: 21, weight: 600, color: heroWhite, ls: 4, glow: { color: "rgba(0,0,0,0.5)", blur: 10 }, anim: ["slideUp", 0.9] });
    arrow(945, heroWhite);
    y = H;
  } else if (theme.hero === "arch") {
    const H = 1080;
    bokeh(0, H, 7, 2);
    b.shape({ shape: "ring", x: 70, y: 100, w: 460, h: 460, fill: theme.accent, opacity: 0.12, anim: ["pulse", 0, true] });
    eyebrow(t.eyebrow, 80, theme.soft, ["slideUp", 0]);
    b.image({
      src: photoUrl(content.photos.hero, 380, 540), x: 110, y: 130, w: 380, h: 560,
      radius: { tl: 190, tr: 190, br: 18, bl: 18 }, border: { width: 6, color: "rgba(255,255,255,0.92)" },
      shadow: { color: "rgba(0,0,0,0.25)", blur: 34, y: 18 }, anim: ["zoomIn", 0.1],
    });
    sparkleMotifs(120, 700, 8, 3);
    const end = nameBlock(790, 68, theme.ink, theme.accent);
    b.text({ text: `${dp.weekday}  •  ${dp.short}`, cy: end + 30, w: 520, font: sans, size: 19, weight: 600, color: theme.accent, ls: 4, anim: ["fadeIn", 0.9] });
    arrow(H - 45, theme.soft);
    y = H;
  } else if (theme.hero === "frame") {
    const H = 1080;
    bokeh(0, H, 5, 4);
    eyebrow(t.eyebrow, 80, theme.soft, ["slideUp", 0]);
    b.card({ x: 80, y: 130, w: 440, h: 560, bg: "#fffdf7", radius: 4, border: { width: 1, color: theme.panelBorder }, shadow: { color: "rgba(60,40,10,0.3)", blur: 30, y: 16 }, anim: ["zoomIn", 0] });
    b.image({ src: photoUrl(content.photos.hero, 400, 460), x: 100, y: 150, w: 400, h: 460, radius: 2, anim: ["fadeIn", 0.4], filters: { saturation: 78, contrast: 104 } });
    b.text({ text: nameB ? `${nameA} & ${nameB}` : nameA, cy: 650, w: 380, font: script, size: 34, color: theme.ink, anim: ["fadeIn", 0.8] });
    b.card({ x: 70, y: 118, w: 90, h: 26, bg: "rgba(214,179,112,0.7)", anim: ["fadeIn", 0.6] });
    b.card({ x: 440, y: 118, w: 90, h: 26, bg: "rgba(214,179,112,0.7)", anim: ["fadeIn", 0.7] });
    const end = nameBlock(790, 62, theme.ink, theme.accent);
    b.text({ text: `${dp.weekday}  •  ${dp.short}`, cy: end + 24, w: 520, font: serif, size: 22, weight: 700, color: theme.accent, ls: 3, anim: ["fadeIn", 0.9] });
    arrow(H - 45, theme.soft);
    y = H;
  } else {
    // type: bố cục chữ lớn trong khung viền
    const H = 980;
    bokeh(0, H, 8, 5);
    b.shape({ shape: "rectangle", x: 24, y: 24, w: WIDTH - 48, h: H - 48, stroke: theme.gold, sw: 1.6, opacity: 0.7, anim: ["fadeIn", 0] });
    b.shape({ shape: "rectangle", x: 38, y: 38, w: WIDTH - 76, h: H - 76, stroke: theme.gold, sw: 0.8, opacity: 0.4, anim: ["fadeIn", 0.2] });
    sparkleMotifs(60, H - 60, 14, 6);
    eyebrow(t.eyebrow, 130, theme.gold, ["slideUp", 0.1]);
    divider(172);
    if (content.bigNumber) {
      b.text({ text: nameA, cy: 320, w: 540, font: script, size: 96, color: theme.ink, glow: { color: theme.glow[0], blur: 22 }, anim: ["slideUp", 0.2] });
      b.text({ text: content.bigNumber, cy: 560, w: 520, font: sans, size: 250, weight: 700, color: theme.accent, glow: { color: theme.glow[0], blur: 30 }, anim: ["zoomIn", 0.5] });
      b.text({ text: t.subtitle, cy: 735, w: 500, font: serif, size: 28, italic: true, color: theme.soft, anim: ["fadeIn", 0.9] });
    } else {
      b.text({ text: nameA, cy: 340, w: 540, font: script, size: 100, color: theme.ink, glow: { color: theme.glow[0], blur: 22 }, anim: ["slideLeft", 0.2] });
      b.text({ text: "&", cy: 465, w: 100, font: serif, size: 58, italic: true, color: theme.accent, anim: ["zoomIn", 0.5] });
      b.text({ text: nameB ?? "", cy: 590, w: 540, font: script, size: 100, color: theme.ink, glow: { color: theme.glow[0], blur: 22 }, anim: ["slideRight", 0.35] });
    }
    divider(800);
    b.text({ text: dp.short.replace(/\./g, "  ·  "), cy: 850, w: 520, font: serif, size: 36, weight: 700, color: theme.gold, ls: 5, anim: ["fadeIn", 1] });
    b.text({ text: `${dp.weekday} — ${content.time}`, cy: 898, w: 500, font: sans, size: 16, weight: 500, color: theme.soft, ls: 4, anim: ["fadeIn", 1.2] });
    arrow(H - 52, theme.soft);
    y = H;
  }

  // =========================== LỜI MỜI ===========================
  {
    const top = y;
    bokeh(top, top + 440, 3, 7);
    eyebrow(t.lead, top + 70, theme.soft, ["fadeIn", 0]);
    b.text({ text: t.guest, cy: top + 160, w: 520, font: script, size: 70, color: theme.accent, anim: ["slideUp", 0.15] });
    b.text({ text: t.body, cy: top + 280, w: 460, font: serif, size: 21, italic: true, lh: 1.75, color: theme.ink, anim: ["slideUp", 0.35] });
    divider(top + 385);
    y = top + 440;
  }

  // =========================== GIA ĐÌNH ===========================
  {
    const top = y;
    const shadow = { color: theme.dark ? "rgba(0,0,0,0.4)" : "rgba(80,40,60,0.12)", blur: 28, y: 12 };
    if (t.hosts.length === 2) {
      t.hosts.forEach((host, i) => {
        const x = i === 0 ? 40 : 305;
        const anim: Anim = [i === 0 ? "slideLeft" : "slideRight", 0.1];
        b.card({ x, y: top + 10, w: 255, h: 280, bg: theme.panel, radius: 26, border: { width: 1, color: theme.panelBorder }, shadow, anim });
        b.shape({ shape: motifShape(theme.motif), x: x + 119, y: top + 36, w: 18, h: 18, fill: theme.accent, anim: ["twinkle", 0.3, true] });
        b.text({ text: host.title, x: x + 20, w: 215, cy: top + 90, font: sans, size: 15, weight: 700, color: theme.accent, ls: 5, anim });
        b.text({ text: host.lines, x: x + 20, w: 215, cy: top + 185, font: serif, size: 20, lh: 1.75, color: theme.ink, anim: [anim[0], 0.25] });
      });
    } else {
      const host = t.hosts[0];
      b.card({ x: 70, y: top + 10, w: 460, h: 230, bg: theme.panel, radius: 28, border: { width: 1, color: theme.panelBorder }, shadow, anim: ["zoomIn", 0.1] });
      b.shape({ shape: motifShape(theme.motif), x: CX - 10, y: top + 38, w: 20, h: 20, fill: theme.accent, anim: ["heartbeat", 0.3, true] });
      b.text({ text: host.title, cy: top + 95, w: 400, font: sans, size: 15, weight: 700, color: theme.accent, ls: 6, anim: ["fadeIn", 0.2] });
      b.text({ text: host.lines, cy: top + 165, w: 400, font: serif, size: 24, lh: 1.7, color: theme.ink, anim: ["slideUp", 0.35] });
    }
    y = top + 330;
  }

  // =========================== NGÀY TỔ CHỨC ===========================
  {
    const top = y;
    bokeh(top, top + 560, 3, 9);
    eyebrow(t.dateLabel, top + 55, theme.soft, ["fadeIn", 0]);
    b.shape({ shape: "ring", x: 110, y: top + 80, w: 380, h: 380, fill: theme.accent, opacity: 0.13, anim: ["pulse", 0, true] });
    b.shape({ shape: "circle", x: 150, y: top + 120, w: 300, h: 300, fill: `radial-gradient(${theme.glow[0]}, ${clearEnd})`, opacity: 0.9, anim: ["twinkle", 0.2, true] });
    sparkleMotifs(top + 70, top + 480, 7, 11);
    b.text({ text: dp.day, cy: top + 268, w: 360, font: serif, size: 190, weight: 700, color: theme.accent, glow: { color: theme.glow[0], blur: 20 }, anim: ["zoomIn", 0.1] });
    b.text({ text: dp.month, cy: top + 392, w: 460, font: sans, size: 20, weight: 600, color: theme.ink, ls: 7, anim: ["slideUp", 0.4] });
    b.text({ text: dp.weekday, x: 110, w: 170, cy: top + 500, h: 50, font: sans, size: 17, weight: 600, color: theme.ink, ls: 2, bg: theme.panel, radius: 28, border: { width: 1, color: theme.panelBorder }, anim: ["slideRight", 0.5] });
    b.text({ text: content.time, x: 320, w: 170, cy: top + 500, h: 50, font: sans, size: 17, weight: 600, color: theme.ink, ls: 2, bg: theme.panel, radius: 28, border: { width: 1, color: theme.panelBorder }, anim: ["slideLeft", 0.5] });
    y = top + 580;
  }

  // =========================== CÂU CHUYỆN ===========================
  {
    const top = y;
    eyebrow("OUR STORY", top + 40, theme.soft, ["fadeIn", 0]);
    b.text({ text: t.storyTitle, cy: top + 100, w: 520, font: script, size: 50, color: theme.accent, anim: ["slideUp", 0.1] });
    const frameShadow = { color: "rgba(0,0,0,0.25)", blur: 26, y: 14 };
    b.image({ src: photoUrl(content.photos.story[0], 250, 340), x: 40, y: top + 170, w: 250, h: 340, radius: 28, border: { width: 5, color: "rgba(255,255,255,0.9)" }, shadow: frameShadow, anim: ["slideLeft", 0.1] });
    b.image({ src: photoUrl(content.photos.story[1], 250, 340), x: 310, y: top + 230, w: 250, h: 340, radius: 28, border: { width: 5, color: "rgba(255,255,255,0.9)" }, shadow: frameShadow, anim: ["slideRight", 0.25] });
    b.card({ x: 40, y: top + 600, w: 520, h: 215, bg: theme.panel, radius: 28, border: { width: 1, color: theme.panelBorder }, shadow: { color: theme.dark ? "rgba(0,0,0,0.4)" : "rgba(80,40,60,0.12)", blur: 28, y: 12 }, anim: ["slideUp", 0.1] });
    b.text({ text: t.story, cy: top + 707, w: 460, font: serif, size: 18, italic: true, lh: 1.75, color: theme.ink, anim: ["fadeIn", 0.4] });
    y = top + 850;
  }

  // =========================== LỊCH TRÌNH ===========================
  {
    const top = y;
    bokeh(top, top + 640, 3, 13);
    eyebrow("LỊCH TRÌNH", top + 40, theme.soft, ["fadeIn", 0]);
    b.text({ text: "Chương trình", cy: top + 100, w: 500, font: script, size: 52, color: theme.accent, anim: ["slideUp", 0.1] });
    t.schedule.forEach((item, i) => {
      const cy = top + 170 + i * 150;
      const dir: "slideLeft" | "slideRight" = i % 2 === 0 ? "slideLeft" : "slideRight";
      const anim: Anim = [dir, 0.1 + i * 0.12];
      b.card({ x: 50, y: cy, w: 500, h: 124, bg: theme.panel, radius: 24, border: { width: 1, color: theme.panelBorder }, shadow: { color: theme.dark ? "rgba(0,0,0,0.4)" : "rgba(80,40,60,0.1)", blur: 24, y: 10 }, anim });
      b.text({ text: item.time, x: 66, w: 140, cy: cy + 62, font: serif, size: 34, weight: 700, color: theme.accent, anim });
      b.shape({ shape: "rectangle", x: 216, y: cy + 28, w: 2, h: 68, fill: theme.panelBorder, anim });
      b.text({ text: item.title, x: 238, w: 292, cy: cy + 44, font: serif, size: 23, weight: 700, color: theme.ink, align: "left", anim });
      b.text({ text: item.note, x: 238, w: 292, cy: cy + 88, font: sans, size: 15, color: theme.soft, align: "left", lh: 1.4, anim });
    });
    y = top + 640;
  }

  // =========================== ALBUM ===========================
  {
    const top = y;
    eyebrow("ALBUM ẢNH", top + 40, theme.soft, ["fadeIn", 0]);
    b.text({ text: t.galleryTitle, cy: top + 100, w: 540, font: script, size: 50, color: theme.accent, anim: ["slideUp", 0.1] });
    const g = content.photos.gallery;
    const shadow = { color: "rgba(0,0,0,0.22)", blur: 24, y: 12 };
    const border = { width: 5, color: "rgba(255,255,255,0.92)" };
    const gy = top + 170;
    b.image({ src: photoUrl(g[0], 520, 300), x: 40, y: gy, w: 520, h: 300, radius: 28, border, shadow, anim: ["zoomIn", 0.1] });
    b.image({ src: photoUrl(g[1], 250, 250), x: 40, y: gy + 320, w: 250, h: 250, radius: 28, border, shadow, anim: ["slideLeft", 0.1] });
    b.image({ src: photoUrl(g[2], 250, 250), x: 310, y: gy + 320, w: 250, h: 250, radius: 28, border, shadow, anim: ["slideRight", 0.2] });
    b.image({ src: photoUrl(g[3], 250, 250), x: 40, y: gy + 590, w: 250, h: 250, radius: 28, border, shadow, anim: ["slideLeft", 0.1] });
    b.image({ src: photoUrl(g[4], 250, 250), x: 310, y: gy + 590, w: 250, h: 250, radius: 28, border, shadow, anim: ["slideRight", 0.2] });
    sparkleMotifs(gy, gy + 840, 6, 17);
    y = top + 1050;
  }

  // =========================== ĐỊA ĐIỂM ===========================
  {
    const top = y;
    b.card({ x: 50, y: top + 10, w: 500, h: 400, bg: theme.panel, radius: 30, border: { width: 1, color: theme.panelBorder }, shadow: { color: theme.dark ? "rgba(0,0,0,0.4)" : "rgba(80,40,60,0.12)", blur: 30, y: 14 }, anim: ["zoomIn", 0] });
    eyebrow("ĐỊA ĐIỂM", top + 70, theme.soft, ["fadeIn", 0.1]);
    b.shape({ shape: "heart", x: CX - 24, y: top + 110, w: 48, h: 44, fill: theme.accent, shadow: { color: theme.glow[0], blur: 24 }, anim: ["heartbeat", 0.2, true] });
    b.text({ text: t.venue, cy: top + 215, w: 440, font: serif, size: 31, weight: 700, color: theme.ink, anim: ["slideUp", 0.3] });
    b.text({ text: t.address, cy: top + 295, w: 420, font: sans, size: 17, lh: 1.6, color: theme.soft, anim: ["slideUp", 0.45] });
    b.text({ text: `${dp.weekday} • ${content.time}`, cy: top + 360, w: 340, h: 44, font: sans, size: 15, weight: 600, color: theme.dark ? "#1a1a1a" : "#ffffff", ls: 2, bg: theme.accent, radius: 24, anim: ["zoomIn", 0.6] });
    y = top + 450;
  }

  // =========================== LỜI CẢM ƠN ===========================
  {
    const top = y;
    bokeh(top, top + 560, 4, 19);
    sparkleMotifs(top + 20, top + 520, 10, 23);
    b.text({ text: "Cảm ơn", cy: top + 110, w: 520, font: script, size: 96, color: theme.accent, glow: { color: theme.glow[0], blur: 22 }, anim: ["zoomIn", 0.1] });
    b.text({ text: t.thanks, cy: top + 250, w: 470, font: serif, size: 19, italic: true, lh: 1.8, color: theme.ink, anim: ["slideUp", 0.35] });
    divider(top + 345);
    b.text({ text: t.closing, cy: top + 425, w: 540, font: script, size: 58, color: theme.ink, anim: ["fadeIn", 0.5] });
    b.text({ text: "Tạo bởi Wedify • Thiệp mời online", cy: top + 520, w: 400, font: sans, size: 12, color: theme.soft, opacity: 0.7, ls: 2 });
    y = top + 560;
  }

  const canvasSettings: CanvasSettings = {
    width: WIDTH,
    height: y,
    backgroundColor: theme.bg,
    backgroundImage: null,
    backgroundSize: "cover",
    backgroundMusic: {
      name: content.musicName,
      artist: content.musicArtist,
      duration: "03:00",
      src: content.musicSrc,
      icon: "music",
      iconColor: theme.accent,
    },
    isMusicPlaying: false,
    ambientEffect: theme.ambient,
  };

  return {
    id: theme.id,
    name: theme.name,
    thumbnail: photoUrl(theme.photos.hero, 450, 600),
    category: theme.kind,
    accent: theme.accent,
    canvasSettings,
    elements: b.elements,
  };
};

// ===================================================================
// 10 chủ đề
// ===================================================================
const THEMES: Theme[] = [
  {
    id: "tpl-rose-garden",
    name: "Rose Garden",
    kind: "wedding",
    tag: "Tiệc cưới",
    accent: "#e11d48",
    gold: "#c9a24b",
    ink: "#4c0519",
    soft: "#9f1239",
    bg: "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 30%, #fff7f8 60%, #ffe4e6 100%)",
    fade: "#fff1f2",
    panel: "rgba(255,255,255,0.8)",
    panelBorder: "rgba(225,29,72,0.2)",
    dark: false,
    hero: "photo",
    motif: "heart",
    glow: ["rgba(251,113,133,0.5)", "rgba(253,164,175,0.55)", "rgba(255,255,255,0.9)"],
    ambient: { type: "petals", color: "#fb7185" },
    fonts: { script: "Great Vibes", serif: "Playfair Display", sans: "Montserrat" },
    photos: {
      hero: "1522673607200-164d1b6ce486",
      story: ["1520854221256-17451cc331bf", "1519741497674-611481863552"],
      gallery: ["1529636798458-92182e662485", "1519225421980-715cb0215aed", "1511285560929-80b456fea0bc", "1522673607200-164d1b6ce486", "1520854221256-17451cc331bf"],
    },
    date: "2026-12-20",
    time: "17:00",
    names: ["Minh Anh", "Hoàng Nam"],
    song: 1,
  },
  {
    id: "tpl-hoa-sen-hy",
    name: "Hoa Sen Báo Hỷ",
    kind: "wedding",
    tag: "Tiệc cưới",
    accent: "#15803d",
    gold: "#b9892f",
    ink: "#14532d",
    soft: "#3f6212",
    bg: "linear-gradient(180deg, #f6f3e7 0%, #eef3e3 35%, #f8f5ea 65%, #e9f0dc 100%)",
    fade: "#f6f3e7",
    panel: "rgba(255,255,255,0.78)",
    panelBorder: "rgba(21,128,61,0.22)",
    dark: false,
    hero: "arch",
    motif: "diamond",
    glow: ["rgba(190,242,100,0.45)", "rgba(249,168,212,0.5)", "rgba(255,255,255,0.9)"],
    ambient: { type: "petals", color: "#f9a8d4" },
    fonts: { script: "Dancing Script", serif: "Playfair Display", sans: "Quicksand" },
    photos: {
      hero: "1519741497674-611481863552",
      story: ["1522673607200-164d1b6ce486", "1529636798458-92182e662485"],
      gallery: ["1520854221256-17451cc331bf", "1519225421980-715cb0215aed", "1511285560929-80b456fea0bc", "1519741497674-611481863552", "1522673607200-164d1b6ce486"],
    },
    date: "2026-11-28",
    time: "11:00",
    names: ["Hà Trang", "Hoàng Hải"],
    song: 2,
  },
  {
    id: "tpl-midnight-stars",
    name: "Midnight Stars",
    kind: "wedding",
    tag: "Tiệc cưới",
    accent: "#fbbf24",
    gold: "#fcd34d",
    ink: "#f8f4e3",
    soft: "#c7c3e8",
    bg: "linear-gradient(180deg, #070b1f 0%, #111a45 38%, #1b1450 68%, #0b1030 100%)",
    fade: "#070b1f",
    panel: "rgba(255,255,255,0.07)",
    panelBorder: "rgba(252,211,77,0.35)",
    dark: true,
    hero: "type",
    motif: "star",
    glow: ["rgba(252,211,77,0.45)", "rgba(129,140,248,0.5)", "rgba(244,114,182,0.35)"],
    ambient: { type: "sparkles", color: "#fde68a" },
    fonts: { script: "Allura", serif: "Cormorant Garamond", sans: "Montserrat" },
    photos: {
      hero: "1519225421980-715cb0215aed",
      story: ["1529636798458-92182e662485", "1522673607200-164d1b6ce486"],
      gallery: ["1519741497674-611481863552", "1520854221256-17451cc331bf", "1511285560929-80b456fea0bc", "1519225421980-715cb0215aed", "1529636798458-92182e662485"],
    },
    date: "2027-01-16",
    time: "18:30",
    names: ["Thanh Vân", "Đức Minh"],
    song: 3,
  },
  {
    id: "tpl-gold-luxury",
    name: "Gold Luxury",
    kind: "wedding",
    tag: "Tiệc cưới",
    accent: "#d4af37",
    gold: "#e8c872",
    ink: "#f5e6b8",
    soft: "#b8a46a",
    bg: "linear-gradient(180deg, #0b0b0b 0%, #17130a 50%, #0b0b0b 100%)",
    fade: "#0b0b0b",
    panel: "rgba(212,175,55,0.08)",
    panelBorder: "rgba(212,175,55,0.4)",
    dark: true,
    hero: "photo",
    motif: "diamond",
    glow: ["rgba(212,175,55,0.45)", "rgba(245,215,122,0.4)", "rgba(255,255,255,0.25)"],
    ambient: { type: "sparkles", color: "#f5d77a" },
    fonts: { script: "Allura", serif: "Cormorant Garamond", sans: "Montserrat" },
    photos: {
      hero: "1511285560929-80b456fea0bc",
      story: ["1519741497674-611481863552", "1519225421980-715cb0215aed"],
      gallery: ["1522673607200-164d1b6ce486", "1520854221256-17451cc331bf", "1529636798458-92182e662485", "1519225421980-715cb0215aed", "1519741497674-611481863552"],
    },
    date: "2026-12-12",
    time: "18:00",
    names: ["Bảo Ngọc", "Quốc Huy"],
    song: 4,
  },
  {
    id: "tpl-sakura-dream",
    name: "Sakura Dream",
    kind: "wedding",
    tag: "Tiệc cưới",
    accent: "#ec4899",
    gold: "#d9a441",
    ink: "#6b2145",
    soft: "#a24c78",
    bg: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 30%, #f5f3ff 65%, #fdf2f8 100%)",
    fade: "#fdf2f8",
    panel: "rgba(255,255,255,0.8)",
    panelBorder: "rgba(236,72,153,0.22)",
    dark: false,
    hero: "arch",
    motif: "circle",
    glow: ["rgba(249,168,212,0.55)", "rgba(196,181,253,0.5)", "rgba(255,255,255,0.9)"],
    ambient: { type: "petals", color: "#f9a8d4", density: 46 },
    fonts: { script: "Alex Brush", serif: "Lora", sans: "Quicksand" },
    photos: {
      hero: "1529636798458-92182e662485",
      story: ["1520854221256-17451cc331bf", "1522673607200-164d1b6ce486"],
      gallery: ["1519741497674-611481863552", "1511285560929-80b456fea0bc", "1519225421980-715cb0215aed", "1529636798458-92182e662485", "1520854221256-17451cc331bf"],
    },
    date: "2027-03-27",
    time: "10:00",
    names: ["Khánh Linh", "Tuấn Kiệt"],
    song: 5,
  },
  {
    id: "tpl-tropical-breeze",
    name: "Tropical Breeze",
    kind: "wedding",
    tag: "Cưới biển",
    accent: "#0d9488",
    gold: "#f59e0b",
    ink: "#134e4a",
    soft: "#0f766e",
    bg: "linear-gradient(180deg, #ecfeff 0%, #cffafe 33%, #fef9c3 68%, #ecfeff 100%)",
    fade: "#ecfeff",
    panel: "rgba(255,255,255,0.8)",
    panelBorder: "rgba(13,148,136,0.25)",
    dark: false,
    hero: "photo",
    motif: "star",
    glow: ["rgba(94,234,212,0.5)", "rgba(253,224,71,0.45)", "rgba(255,255,255,0.9)"],
    ambient: { type: "bubbles", color: "#2dd4bf" },
    fonts: { script: "Dancing Script", serif: "Lora", sans: "Poppins" },
    photos: {
      hero: "1507525428034-b723cf961d3e",
      story: ["1522673607200-164d1b6ce486", "1520854221256-17451cc331bf"],
      gallery: ["1507525428034-b723cf961d3e", "1519741497674-611481863552", "1529636798458-92182e662485", "1511285560929-80b456fea0bc", "1519225421980-715cb0215aed"],
    },
    date: "2027-04-10",
    time: "16:30",
    names: ["Thu Hà", "Gia Bảo"],
    song: 6,
  },
  {
    id: "tpl-vintage-paper",
    name: "Vintage Paper",
    kind: "wedding",
    tag: "Cổ điển",
    accent: "#9a3412",
    gold: "#92700c",
    ink: "#4a2f1b",
    soft: "#7c5a3a",
    bg: "linear-gradient(180deg, #f5ecd9 0%, #efe2c6 50%, #f5ecd9 100%)",
    fade: "#f5ecd9",
    panel: "rgba(255,251,240,0.85)",
    panelBorder: "rgba(124,90,58,0.3)",
    dark: false,
    hero: "frame",
    motif: "diamond",
    glow: ["rgba(214,179,112,0.5)", "rgba(255,255,255,0.7)", "rgba(180,120,70,0.3)"],
    ambient: { type: "sparkles", color: "#d6b370" },
    fonts: { script: "Great Vibes", serif: "Crimson Text", sans: "Montserrat" },
    photos: {
      hero: "1511285560929-80b456fea0bc",
      story: ["1520854221256-17451cc331bf", "1519741497674-611481863552"],
      gallery: ["1522673607200-164d1b6ce486", "1529636798458-92182e662485", "1519225421980-715cb0215aed", "1511285560929-80b456fea0bc", "1520854221256-17451cc331bf"],
    },
    date: "2026-11-14",
    time: "10:30",
    names: ["Mai Phương", "Thành Đạt"],
    song: 7,
  },
  {
    id: "tpl-birthday-confetti",
    name: "Birthday Confetti",
    kind: "birthday",
    tag: "Sinh nhật",
    accent: "#db2777",
    gold: "#f59e0b",
    ink: "#3b0764",
    soft: "#7e22ce",
    bg: "linear-gradient(180deg, #fff7ed 0%, #fef3c7 24%, #fce7f3 52%, #ede9fe 78%, #fff7ed 100%)",
    fade: "#fff7ed",
    panel: "rgba(255,255,255,0.82)",
    panelBorder: "rgba(219,39,119,0.22)",
    dark: false,
    hero: "type",
    motif: "star",
    glow: ["rgba(251,191,36,0.5)", "rgba(244,114,182,0.5)", "rgba(167,139,250,0.5)"],
    ambient: { type: "confetti" },
    fonts: { script: "Dancing Script", serif: "Playfair Display", sans: "Poppins" },
    photos: {
      hero: "1534528741775-53994a69daeb",
      story: ["1529156069898-49953e39b3ac", "1533139502658-0198f920d8e8"],
      gallery: ["1529156069898-49953e39b3ac", "1533139502658-0198f920d8e8", "1534528741775-53994a69daeb", "1529156069898-49953e39b3ac", "1533139502658-0198f920d8e8"],
    },
    date: "2026-12-05",
    time: "18:00",
    names: ["Yến Nhi"],
    bigNumber: "24",
    song: 8,
  },
  {
    id: "tpl-engagement-emerald",
    name: "Emerald Engagement",
    kind: "engagement",
    tag: "Đính hôn",
    accent: "#f2d08a",
    gold: "#e8c36a",
    ink: "#fdf6e3",
    soft: "#a7d3c0",
    bg: "linear-gradient(180deg, #022c22 0%, #064e3b 45%, #022c22 100%)",
    fade: "#022c22",
    panel: "rgba(255,255,255,0.07)",
    panelBorder: "rgba(242,208,138,0.4)",
    dark: true,
    hero: "photo",
    motif: "heart",
    glow: ["rgba(242,208,138,0.4)", "rgba(110,231,183,0.35)", "rgba(249,168,201,0.35)"],
    ambient: { type: "hearts", color: "#f9a8c9" },
    fonts: { script: "Pinyon Script", serif: "Playfair Display", sans: "Montserrat" },
    photos: {
      hero: "1529156069898-49953e39b3ac",
      story: ["1522673607200-164d1b6ce486", "1520854221256-17451cc331bf"],
      gallery: ["1519741497674-611481863552", "1529636798458-92182e662485", "1511285560929-80b456fea0bc", "1519225421980-715cb0215aed", "1522673607200-164d1b6ce486"],
    },
    date: "2026-11-21",
    time: "10:00",
    names: ["Ngọc Hân", "Việt Anh"],
    song: 1,
  },
  {
    id: "tpl-baby-moon",
    name: "Baby Moon",
    kind: "baby",
    tag: "Thôi nôi",
    accent: "#0ea5e9",
    gold: "#f59e0b",
    ink: "#0c4a6e",
    soft: "#0369a1",
    bg: "linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 30%, #fef9c3 65%, #e0f2fe 100%)",
    fade: "#e0f2fe",
    panel: "rgba(255,255,255,0.82)",
    panelBorder: "rgba(14,165,233,0.25)",
    dark: false,
    hero: "arch",
    motif: "star",
    glow: ["rgba(125,211,252,0.55)", "rgba(253,224,71,0.45)", "rgba(255,255,255,0.9)"],
    ambient: { type: "bubbles", color: "#7dd3fc" },
    fonts: { script: "Dancing Script", serif: "Lora", sans: "Quicksand" },
    photos: {
      hero: "1533139502658-0198f920d8e8",
      story: ["1534528741775-53994a69daeb", "1529156069898-49953e39b3ac"],
      gallery: ["1533139502658-0198f920d8e8", "1529156069898-49953e39b3ac", "1534528741775-53994a69daeb", "1533139502658-0198f920d8e8", "1529156069898-49953e39b3ac"],
    },
    date: "2027-02-06",
    time: "10:00",
    names: ["Bé Bống"],
    song: 2,
  },
];

export const templateTags: Record<string, string> = Object.fromEntries(THEMES.map((theme) => [theme.id, theme.tag]));

export const weddingTemplates: Template[] = THEMES.map((theme) => buildTemplate(theme));

export interface TemplateMeta {
  id: string;
  name: string;
  kind: Kind;
  tag: string;
  accent: string;
  thumbnail: string;
}

export const templateMetas: TemplateMeta[] = THEMES.map((theme) => ({
  id: theme.id,
  name: theme.name,
  kind: theme.kind,
  tag: theme.tag,
  accent: theme.accent,
  thumbnail: photoUrl(theme.photos.hero, 450, 600),
}));

const findTheme = (id: string) => THEMES.find((theme) => theme.id === id);

export const getTemplateMeta = (id: string) => templateMetas.find((meta) => meta.id === id);

/** Nội dung mặc định để điền sẵn vào form; trả về null nếu không có mẫu. */
export const getDefaultContent = (id: string): TemplateContent | null => {
  const theme = findTheme(id);
  return theme ? defaultContent(theme) : null;
};

/** Dựng lại toàn bộ thiệp từ nội dung người dùng nhập. */
export const buildTemplateFromContent = (id: string, content: TemplateContent): Template | null => {
  const theme = findTheme(id);
  return theme ? buildTemplate(theme, content) : null;
};

export default weddingTemplates;

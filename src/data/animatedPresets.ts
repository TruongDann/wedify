import type { LucideIcon } from "lucide-react";
import { CircleDot, Frame, Gem, Heart, HeartPulse, PartyPopper, Sparkles, Sun } from "lucide-react";
import type { EditorElement } from "@/types/editor";
import { TemplateBuilder } from "./templateKit";

/** Cụm hình động tự vẽ: ghép từ hình khối + hiệu ứng chuyển động có sẵn của editor. */
export interface AnimatedPreset {
  id: string;
  label: string;
  /** Icon minh hoạ trong ô chọn. */
  icon: LucideIcon;
  build: (canvasWidth: number, top: number) => EditorElement[];
}

const radial = (color: string, end = "rgba(255,255,255,0)") => `radial-gradient(${color}, ${end})`;

const make = (id: string, fill: (b: TemplateBuilder, cx: number, top: number) => void): AnimatedPreset["build"] => (canvasWidth, top) => {
  const b = new TemplateBuilder(`stock-${id}`, canvasWidth);
  fill(b, canvasWidth / 2, top);
  return b.elements;
};

export const ANIMATED_PRESETS: AnimatedPreset[] = [
  {
    id: "hearts",
    label: "Cụm tim bay",
    icon: Heart,
    build: make("hearts", (b, cx, top) => {
      const hearts: Array<[number, number, number, string, number]> = [
        [-60, 40, 60, "#f43f5e", 0],
        [20, 0, 44, "#fb7185", 0.4],
        [70, 60, 34, "#fda4af", 0.8],
        [-20, 110, 30, "#e11d48", 1.2],
        [40, 130, 24, "#fecdd3", 1.6],
      ];
      hearts.forEach(([dx, dy, size, fill, delay], i) =>
        b.shape({ shape: "heart", x: cx + dx - size / 2, y: top + dy, w: size, h: size * 0.92, fill, anim: [i % 2 ? "float" : "heartbeat", delay, true], shadow: { color: "rgba(244,63,94,0.45)", blur: 14 } }),
      );
    }),
  },
  {
    id: "heartbeat",
    label: "Tim đập có hào quang",
    icon: HeartPulse,
    build: make("heartbeat", (b, cx, top) => {
      b.shape({ shape: "circle", x: cx - 110, y: top - 10, w: 220, h: 220, fill: radial("rgba(244,63,94,0.55)"), anim: ["pulse", 0, true] });
      b.shape({ shape: "heart", x: cx - 55, y: top + 40, w: 110, h: 100, fill: "#e11d48", anim: ["heartbeat", 0, true], shadow: { color: "rgba(225,29,72,0.6)", blur: 26 } });
    }),
  },
  {
    id: "stars",
    label: "Chùm sao lấp lánh",
    icon: Sparkles,
    build: make("stars", (b, cx, top) => {
      const stars: Array<[number, number, number, string]> = [
        [-90, 10, 30, "#fcd34d"],
        [-30, 60, 18, "#fde68a"],
        [30, 0, 40, "#fbbf24"],
        [90, 50, 22, "#fde68a"],
        [-60, 110, 22, "#fbbf24"],
        [60, 120, 30, "#fcd34d"],
      ];
      stars.forEach(([dx, dy, size, fill], i) => b.shape({ shape: "star", x: cx + dx - size / 2, y: top + dy, w: size, h: size, fill, anim: ["twinkle", i * 0.3, true], shadow: { color: "rgba(251,191,36,0.7)", blur: 12 } }));
    }),
  },
  {
    id: "rings",
    label: "Đôi nhẫn",
    icon: Gem,
    build: make("rings", (b, cx, top) => {
      b.shape({ shape: "ring", x: cx - 80, y: top + 20, w: 110, h: 110, fill: "#d4af37", anim: ["sway", 0, true], shadow: { color: "rgba(212,175,55,0.5)", blur: 16 } });
      b.shape({ shape: "ring", x: cx - 30, y: top + 20, w: 110, h: 110, fill: "#f5d77a", anim: ["sway", 0.6, true], shadow: { color: "rgba(212,175,55,0.5)", blur: 16 } });
      b.shape({ shape: "star", x: cx + 10, y: top, w: 26, h: 26, fill: "#ffffff", anim: ["twinkle", 0, true], shadow: { color: "#fde68a", blur: 14 } });
      b.shape({ shape: "star", x: cx - 90, y: top + 100, w: 16, h: 16, fill: "#ffffff", anim: ["twinkle", 0.8, true], shadow: { color: "#fde68a", blur: 10 } });
    }),
  },
  {
    id: "bokeh",
    label: "Vầng sáng bokeh",
    icon: Sun,
    build: make("bokeh", (b, cx, top) => {
      const orbs: Array<[number, number, number, string]> = [
        [-100, 0, 130, "rgba(251,191,36,0.55)"],
        [10, 40, 170, "rgba(244,114,182,0.5)"],
        [-40, 120, 110, "rgba(167,139,250,0.5)"],
        [70, 110, 90, "rgba(255,255,255,0.8)"],
      ];
      orbs.forEach(([dx, dy, size, color], i) => b.shape({ shape: "circle", x: cx + dx, y: top + dy, w: size, h: size, fill: radial(color), anim: [i % 2 ? "float" : "twinkle", i * 0.5, true] }));
    }),
  },
  {
    id: "bubbles",
    label: "Bong bóng",
    icon: CircleDot,
    build: make("bubbles", (b, cx, top) => {
      const bubbles: Array<[number, number, number]> = [[-70, 70, 56], [10, 0, 80], [80, 80, 40], [-20, 120, 34], [60, 140, 24]];
      bubbles.forEach(([dx, dy, size], i) => b.shape({ shape: "circle", x: cx + dx, y: top + dy, w: size, h: size, fill: "rgba(186,230,253,0.28)", stroke: "rgba(255,255,255,0.9)", sw: 2, anim: ["float", i * 0.4, true] }));
    }),
  },
  {
    id: "confetti",
    label: "Dải confetti",
    icon: PartyPopper,
    build: make("confetti", (b, cx, top) => {
      const colors = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];
      for (let i = 0; i < 14; i += 1) {
        const x = cx - 130 + ((i * 53) % 260);
        const y = top + ((i * 71) % 170);
        const size = 10 + (i % 4) * 4;
        b.shape({ shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "rectangle" : "diamond", x, y, w: size, h: i % 3 === 1 ? size * 0.5 : size, fill: colors[i % colors.length], rotation: (i * 37) % 180, anim: [i % 2 ? "sway" : "float", (i % 6) * 0.25, true] });
      }
    }),
  },
  {
    id: "frame",
    label: "Khung viền lấp lánh",
    icon: Frame,
    build: make("frame", (b, cx, top) => {
      b.shape({ shape: "rectangle", x: cx - 150, y: top, w: 300, h: 190, stroke: "#d4af37", sw: 2.5, anim: ["fadeIn", 0] });
      b.shape({ shape: "rectangle", x: cx - 140, y: top + 10, w: 280, h: 170, stroke: "#f5d77a", sw: 1, opacity: 0.7, anim: ["fadeIn", 0.2] });
      [[-150, 0], [150, 0], [-150, 190], [150, 190]].forEach(([dx, dy], i) =>
        b.shape({ shape: "star", x: cx + dx - 13, y: top + dy - 13, w: 26, h: 26, fill: "#fbbf24", anim: ["twinkle", i * 0.4, true], shadow: { color: "#fde68a", blur: 12 } }),
      );
    }),
  },
];

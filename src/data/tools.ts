import type { ToolElement, ToolKind } from "@/types/editor";

export interface ToolPreset {
  id: string;
  label: string;
  icon: string;
  description?: string;
  build: (canvasWidth: number) => Omit<ToolElement, "id" | "zIndex">;
}


const make = (
  tool: ToolKind,
  canvasWidth: number,
  size: { width: number; height: number },
  props: Record<string, any>,
  y = 160,
): Omit<ToolElement, "id" | "zIndex"> => ({
  type: "tool",
  tool,
  props,
  position: { x: Math.max(0, Math.round((canvasWidth - size.width) / 2)), y },
  size,
  rotation: 0,
  opacity: 1,
  locked: false,
  animation: { enabled: true, continuous: false, type: "slideUp", delay: 0 },
});

export const TOOL_PRESETS: ToolPreset[] = [
  {
    id: "contact",
    label: "Nút liên hệ",
    icon: "📞",
    build: (w) => make("contactCard", w, { width: 400, height: 240 }, { title: "Liên hệ", items: [{ label: "Chú rể", type: "phone", value: "" }, { label: "Cô dâu", type: "phone", value: "" }], accent: "#2563eb", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.93)", fontFamily: "Playfair Display", radius: 22 }),
  },
  {
    id: "guestbook",
    label: "Sổ lưu bút",
    icon: "📖",
    build: (w) => make("guestbook", w, { width: 440, height: 500 }, { title: "Sổ lưu bút", description: "Gửi những lời chúc tốt đẹp nhất đến chúng tôi.", showForm: true, accent: "#db2777", textColor: "#3b1d2a", bgColor: "rgba(255,255,255,0.93)", fontFamily: "Playfair Display", radius: 22 }),
  },
];

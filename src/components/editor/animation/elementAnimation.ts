import Konva from "konva";

export type AnimationType =
  | "none"
  | "fadeIn"
  | "slideIn"
  | "bounce"
  | "pulse"
  | "shake"
  | "zoom"
  | "slideUp"
  | "slideLeft"
  | "slideRight"
  | "zoomIn"
  | "rotateIn"
  | "float"
  | "sway"
  | "twinkle"
  | "heartbeat";

export interface AnimationConfig {
  enabled: boolean;
  continuous: boolean;
  type: AnimationType;
  /** Trễ (giây) trước khi chạy hiệu ứng, dùng để các phần tử hiện lần lượt. */
  delay?: number;
}

/** Danh sách hiệu ứng cho ô chọn trong panel thuộc tính. */
export const ANIMATION_OPTIONS: Array<{ value: AnimationType; label: string }> = [
  { value: "none", label: "Không có" },
  { value: "fadeIn", label: "Fade In" },
  { value: "slideIn", label: "Slide In (nhẹ)" },
  { value: "slideUp", label: "Trượt lên" },
  { value: "slideLeft", label: "Trượt từ trái" },
  { value: "slideRight", label: "Trượt từ phải" },
  { value: "zoom", label: "Zoom (nhẹ)" },
  { value: "zoomIn", label: "Phóng to dần" },
  { value: "rotateIn", label: "Xoay vào" },
  { value: "bounce", label: "Bounce" },
  { value: "pulse", label: "Pulse (liên tục)" },
  { value: "heartbeat", label: "Nhịp tim (liên tục)" },
  { value: "shake", label: "Shake (liên tục)" },
  { value: "float", label: "Lơ lửng (liên tục)" },
  { value: "sway", label: "Đung đưa (liên tục)" },
  { value: "twinkle", label: "Lấp lánh (liên tục)" },
];

interface BaseState {
  x: number;
  y: number;
  opacity: number;
  rotation: number;
  width: number;
  height: number;
}

const phaseFromId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 9973;
  return hash;
};

/**
 * Chạy hiệu ứng cho một node Konva (text/image/shape dùng chung) và trả về hàm dọn dẹp.
 * Hiệu ứng xuất hiện chạy 1 lần khi node được mount — viewer chỉ mount phần tử khi cuộn tới nên
 * đây cũng chính là hiệu ứng "hiện ra khi cuộn".
 */
export const runElementAnimation = (
  node: Konva.Node,
  base: BaseState,
  config?: Partial<AnimationConfig> | null,
): (() => void) => {
  // Ghi nhớ offset gốc (vd. hình tròn/ngôi sao có offset riêng) để khôi phục chính xác.
  if (node.getAttr("__baseOffsetX") === undefined) {
    node.setAttr("__baseOffsetX", node.offsetX());
    node.setAttr("__baseOffsetY", node.offsetY());
  }
  const baseOffset = { x: node.getAttr("__baseOffsetX") as number, y: node.getAttr("__baseOffsetY") as number };

  const reset = () => {
    node.opacity(base.opacity);
    node.scale({ x: 1, y: 1 });
    node.rotation(base.rotation);
    node.offset(baseOffset);
    node.position({ x: base.x, y: base.y });
  };
  reset();

  if (!config || !config.enabled || !config.type || config.type === "none") return reset;

  let anim: Konva.Animation | null = null;
  let tween: Konva.Tween | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const type = config.type;
  const layer = node.getLayer();
  const delayMs = Math.max(0, Number(config.delay) || 0) * 1000;

  // Scale/xoay quanh tâm cho node chưa có offset riêng; nếu không giữ nguyên gốc toạ độ.
  const canCenter = baseOffset.x === 0 && baseOffset.y === 0 && base.width > 0 && base.height > 0;
  const pivotY = canCenter ? base.height / 2 : 0;
  const centerPivot = () => {
    if (!canCenter) return;
    node.offset({ x: base.width / 2, y: base.height / 2 });
    node.position({ x: base.x + base.width / 2, y: base.y + base.height / 2 });
  };

  const play = (to: Record<string, unknown>, duration: number, easing = Konva.Easings.EaseOut) => {
    const run = () => {
      tween = new Konva.Tween({ node, duration, easing, ...to } as Konva.TweenConfig);
      tween.play();
    };
    if (delayMs > 0) timer = setTimeout(run, delayMs);
    else run();
  };

  if (!config.continuous) {
    switch (type) {
      case "fadeIn":
        node.opacity(0);
        play({ opacity: base.opacity }, 1, Konva.Easings.EaseInOut);
        break;
      case "slideIn":
        node.y(base.y + 12);
        node.opacity(0.35);
        play({ y: base.y, opacity: base.opacity }, 0.9);
        break;
      case "slideUp":
        node.y(base.y + 70);
        node.opacity(0);
        play({ y: base.y, opacity: base.opacity }, 1.1);
        break;
      case "slideLeft":
        node.x(base.x - 90);
        node.opacity(0);
        play({ x: base.x, opacity: base.opacity }, 1.1);
        break;
      case "slideRight":
        node.x(base.x + 90);
        node.opacity(0);
        play({ x: base.x, opacity: base.opacity }, 1.1);
        break;
      case "zoom":
        centerPivot();
        node.scale({ x: 0.97, y: 0.97 });
        play({ scaleX: 1, scaleY: 1 }, 0.75);
        break;
      case "zoomIn":
        centerPivot();
        node.scale({ x: 0.55, y: 0.55 });
        node.opacity(0);
        play({ scaleX: 1, scaleY: 1, opacity: base.opacity }, 1.1, Konva.Easings.BackEaseOut);
        break;
      case "rotateIn":
        centerPivot();
        node.rotation(base.rotation - 14);
        node.scale({ x: 0.8, y: 0.8 });
        node.opacity(0);
        play({ rotation: base.rotation, scaleX: 1, scaleY: 1, opacity: base.opacity }, 1.2, Konva.Easings.BackEaseOut);
        break;
      case "bounce":
        node.y(base.y - 40);
        node.opacity(0);
        play({ y: base.y, opacity: base.opacity }, 1, Konva.Easings.BounceEaseOut);
        break;
      default:
        break;
    }
  } else if (layer) {
    const phase = phaseFromId(String(node.id() || "x"));
    centerPivot();
    // Khi đã dời tâm xoay, toạ độ Y thực của node cao hơn base.y một nửa chiều cao.
    const yBase = base.y + pivotY;

    switch (type) {
      case "pulse":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          const scale = 1 + Math.sin(frame.time * 0.004 + phase) * 0.03;
          node.scale({ x: scale, y: scale });
        }, layer);
        break;
      case "heartbeat":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          const p = ((frame.time + phase * 7) % 1300) / 1300;
          const beat = Math.exp(-Math.pow((p - 0.12) * 12, 2)) + 0.7 * Math.exp(-Math.pow((p - 0.3) * 12, 2));
          const scale = 1 + 0.1 * beat;
          node.scale({ x: scale, y: scale });
        }, layer);
        break;
      case "shake":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          node.rotation(base.rotation + Math.sin(frame.time * 0.008 + phase) * 2);
        }, layer);
        break;
      case "bounce":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          node.y(yBase + Math.sin(frame.time * 0.005 + phase) * 4);
        }, layer);
        break;
      case "float":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          node.y(yBase + Math.sin(frame.time * 0.0018 + phase) * 9);
        }, layer);
        break;
      case "sway":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          node.rotation(base.rotation + Math.sin(frame.time * 0.0014 + phase) * 4);
        }, layer);
        break;
      case "twinkle":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          node.opacity(base.opacity * (0.25 + 0.75 * Math.abs(Math.sin(frame.time * 0.0021 + phase))));
        }, layer);
        break;
      case "fadeIn":
        anim = new Konva.Animation((frame) => {
          if (!frame) return;
          node.opacity(base.opacity * (0.7 + Math.abs(Math.sin(frame.time * 0.002 + phase)) * 0.3));
        }, layer);
        break;
      default:
        break;
    }
    if (anim) {
      const started = anim;
      if (delayMs > 0) timer = setTimeout(() => started.start(), delayMs);
      else started.start();
    }
  }

  return () => {
    if (timer) clearTimeout(timer);
    if (anim) anim.stop();
    if (tween) tween.destroy();
    reset();
  };
};

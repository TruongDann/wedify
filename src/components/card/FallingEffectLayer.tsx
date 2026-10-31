"use client";

import React, { useEffect, useRef } from "react";
import type { FallingEffect, FallingKind } from "@/types/editor";

export const FALLING_KINDS: { kind: FallingKind; label: string; color: string }[] = [
  { kind: "petals", label: "Cánh hoa", color: "#f7a8bf" },
  { kind: "hearts", label: "Trái tim", color: "#e8506e" },
  { kind: "snow", label: "Tuyết", color: "#ffffff" },
  { kind: "leaves", label: "Lá xanh", color: "#7a9a5a" },
  { kind: "confetti", label: "Kim tuyến", color: "#f5c542" },
  { kind: "stars", label: "Lấp lánh", color: "#f5c542" },
];

const CONFETTI_COLORS = ["#f5c542", "#e8506e", "#7ec8e3", "#a3d977", "#c39bd3", "#ffffff"];

// ---------------------------------------------------------------------------
// Màu
// ---------------------------------------------------------------------------

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  const n = parseInt(full.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

/** Pha màu với trắng (amount > 0) hoặc đen (amount < 0) */
const shade = (hex: string, amount: number) => {
  const { r, g, b } = hexToRgb(hex);
  const target = amount > 0 ? 255 : 0;
  const k = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * k);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

const rgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ---------------------------------------------------------------------------
// Sprite: mỗi loại hạt được vẽ sẵn (có đổ màu, gân, bóng sáng) vào canvas nhỏ,
// lúc chạy chỉ drawImage nên vừa đẹp vừa nhẹ.
// ---------------------------------------------------------------------------

const SPRITE = 96;

type Sprite = HTMLCanvasElement;

const makeCanvas = () => {
  const c = document.createElement("canvas");
  c.width = SPRITE;
  c.height = SPRITE;
  return c;
};

const drawPetal = (ctx: CanvasRenderingContext2D, color: string) => {
  const s = SPRITE * 0.42;
  ctx.translate(SPRITE / 2, SPRITE / 2);
  // Cánh hoa anh đào: tròn ở dưới, khía ở đỉnh
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(-s * 0.95, s * 0.55, -s * 0.85, -s * 0.55, -s * 0.22, -s * 0.95);
  ctx.quadraticCurveTo(-s * 0.05, -s * 0.72, 0, -s * 0.6);
  ctx.quadraticCurveTo(s * 0.05, -s * 0.72, s * 0.22, -s * 0.95);
  ctx.bezierCurveTo(s * 0.85, -s * 0.55, s * 0.95, s * 0.55, 0, s);
  ctx.closePath();
  const g = ctx.createRadialGradient(0, s * 0.55, s * 0.05, 0, 0, s * 1.15);
  g.addColorStop(0, shade(color, 0.55));
  g.addColorStop(0.55, color);
  g.addColorStop(1, shade(color, -0.18));
  ctx.fillStyle = g;
  ctx.fill();
  // Gân mảnh
  ctx.strokeStyle = rgba("#ffffff", 0.35);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.85);
  ctx.quadraticCurveTo(-s * 0.05, 0, 0, -s * 0.55);
  ctx.stroke();
  // Ánh sáng trên mép
  const hl = ctx.createLinearGradient(-s, -s, s * 0.4, s * 0.4);
  hl.addColorStop(0, "rgba(255,255,255,0.45)");
  hl.addColorStop(0.45, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fill();
};

const drawHeart = (ctx: CanvasRenderingContext2D, color: string) => {
  const s = SPRITE * 0.4;
  ctx.translate(SPRITE / 2, SPRITE / 2 + s * 0.1);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.85);
  ctx.bezierCurveTo(-s * 1.25, 0, -s * 0.65, -s * 1.15, 0, -s * 0.4);
  ctx.bezierCurveTo(s * 0.65, -s * 1.15, s * 1.25, 0, 0, s * 0.85);
  ctx.closePath();
  const g = ctx.createRadialGradient(-s * 0.35, -s * 0.45, s * 0.05, 0, 0, s * 1.2);
  g.addColorStop(0, shade(color, 0.45));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.3));
  ctx.fillStyle = g;
  ctx.fill();
  // Bóng sáng bóng kiểu men
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(-s * 0.4, -s * 0.38, s * 0.17, s * 0.09, -0.6, 0, Math.PI * 2);
  ctx.fill();
};

const drawSnow = (ctx: CanvasRenderingContext2D, color: string) => {
  const c = SPRITE / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c * 0.9);
  g.addColorStop(0, rgba(color, 1));
  g.addColorStop(0.35, rgba(color, 0.85));
  g.addColorStop(0.7, rgba(color, 0.25));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SPRITE, SPRITE);
};

const drawLeaf = (ctx: CanvasRenderingContext2D, color: string) => {
  const s = SPRITE * 0.44;
  ctx.translate(SPRITE / 2, SPRITE / 2);
  ctx.rotate(-0.3);
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.7, -s * 0.55, s * 0.6, s * 0.5, 0, s);
  ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.7, -s * 0.55, 0, -s);
  ctx.closePath();
  const g = ctx.createLinearGradient(-s * 0.6, -s, s * 0.6, s);
  g.addColorStop(0, shade(color, 0.35));
  g.addColorStop(0.6, color);
  g.addColorStop(1, shade(color, -0.35));
  ctx.fillStyle = g;
  ctx.fill();
  // Gân giữa + gân phụ
  ctx.strokeStyle = rgba("#ffffff", 0.35);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.9);
  ctx.lineTo(0, s * 1.1);
  ctx.stroke();
  ctx.lineWidth = 0.9;
  for (let i = -2; i <= 2; i++) {
    const y = i * s * 0.28;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(s * 0.38, y - s * 0.22);
    ctx.moveTo(0, y);
    ctx.lineTo(-s * 0.38, y - s * 0.22);
    ctx.stroke();
  }
};

const drawConfetti = (ctx: CanvasRenderingContext2D, color: string, round: boolean) => {
  ctx.translate(SPRITE / 2, SPRITE / 2);
  const g = ctx.createLinearGradient(-SPRITE * 0.3, 0, SPRITE * 0.3, 0);
  g.addColorStop(0, shade(color, 0.3));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.2));
  ctx.fillStyle = g;
  if (round) {
    ctx.beginPath();
    ctx.arc(0, 0, SPRITE * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-SPRITE * 0.32, -SPRITE * 0.13, SPRITE * 0.64, SPRITE * 0.26);
  }
};

const drawSparkle = (ctx: CanvasRenderingContext2D, color: string) => {
  const c = SPRITE / 2;
  // Quầng sáng
  const halo = ctx.createRadialGradient(c, c, 0, c, c, c);
  halo.addColorStop(0, rgba("#ffffff", 0.9));
  halo.addColorStop(0.15, rgba(color, 0.55));
  halo.addColorStop(0.5, rgba(color, 0.12));
  halo.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, SPRITE, SPRITE);
  // Tia sáng 4 cánh: hai hình thoi cong mảnh, một dọc một ngang
  ctx.translate(c, c);
  ctx.fillStyle = rgba("#ffffff", 0.95);
  const long = SPRITE * 0.42;
  const thin = SPRITE * 0.05;
  for (const angle of [0, Math.PI / 2]) {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -long);
    ctx.quadraticCurveTo(thin, 0, 0, long);
    ctx.quadraticCurveTo(-thin, 0, 0, -long);
    ctx.fill();
    ctx.restore();
  }
};

/** Vài biến thể màu cho mỗi loại để đàn hạt không đều tăm tắp */
const buildSprites = (kind: FallingKind, base: string): { sharp: Sprite; soft: Sprite }[] => {
  const variants: string[] =
    kind === "confetti"
      ? CONFETTI_COLORS
      : kind === "leaves"
        ? [base, shade(base, 0.15), shade(base, -0.15), "#c9a227", "#b8743a"]
        : kind === "snow" || kind === "stars"
          ? [base]
          : [base, shade(base, 0.2), shade(base, -0.1)];

  const out: { sharp: Sprite; soft: Sprite }[] = [];
  variants.forEach((color, i) => {
    const sharp = makeCanvas();
    const ctx = sharp.getContext("2d")!;
    if (kind === "petals") drawPetal(ctx, color);
    else if (kind === "hearts") drawHeart(ctx, color);
    else if (kind === "snow") drawSnow(ctx, color);
    else if (kind === "leaves") drawLeaf(ctx, color);
    else if (kind === "confetti") drawConfetti(ctx, color, i % 3 === 2);
    else drawSparkle(ctx, color);

    // Bản nhòe cho các hạt ở xa (tạo chiều sâu)
    const soft = makeCanvas();
    const sctx = soft.getContext("2d")!;
    sctx.filter = "blur(3px)";
    sctx.drawImage(sharp, 0, 0);
    out.push({ sharp, soft });
  });
  return out;
};

// ---------------------------------------------------------------------------
// Hạt
// ---------------------------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  /** 0 = xa (nhỏ, mờ, chậm) … 1 = gần (to, rõ, nhanh) */
  z: number;
  size: number;
  vy: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  rotation: number;
  spin: number;
  /** Góc lật 3D quanh trục ngang */
  flip: number;
  flipSpeed: number;
  sprite: number;
}

/** Thông số theo loại: kích thước, tốc độ rơi, mức lắc, có lật 3D không */
const KIND_PHYSICS: Record<
  FallingKind,
  { size: number; fall: number; sway: number; spin: number; flip: number; wind: number }
> = {
  petals: { size: 26, fall: 42, sway: 34, spin: 1.2, flip: 2.4, wind: 1 },
  hearts: { size: 24, fall: 38, sway: 22, spin: 0.5, flip: 1.2, wind: 0.6 },
  snow: { size: 18, fall: 34, sway: 18, spin: 0, flip: 0, wind: 0.8 },
  leaves: { size: 30, fall: 48, sway: 40, spin: 1.6, flip: 2.8, wind: 1.2 },
  confetti: { size: 16, fall: 70, sway: 16, spin: 3, flip: 7, wind: 0.5 },
  stars: { size: 26, fall: 14, sway: 10, spin: 0.3, flip: 0, wind: 0.3 },
};

interface FallingEffectLayerProps {
  effect: FallingEffect;
  /** Tỉ lệ thu nhỏ của thiệp đang hiển thị, để hạt to/nhỏ theo thiệp */
  scale?: number;
}

/**
 * Lớp hiệu ứng rơi phủ trên thiệp. Đặt trong một khung position: relative —
 * lớp tự dính vào màn hình (sticky) khi cuộn và không chặn thao tác bấm.
 */
export const FallingEffectLayer: React.FC<FallingEffectLayerProps> = ({ effect, scale = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { kind, density, speed, color } = effect;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const base = color || FALLING_KINDS.find((k) => k.kind === kind)?.color || "#f7a8bf";
    const sprites = buildSprites(kind, base);
    const physics = KIND_PHYSICS[kind];
    const unit = Math.max(scale, 0.6);

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const spawn = (anywhere: boolean): Particle => {
      // Phần lớn hạt ở giữa / xa, ít hạt rất gần — trông tự nhiên hơn chia đều
      const z = Math.pow(Math.random(), 0.8);
      const size = physics.size * unit * (0.45 + 0.8 * z) * (0.85 + Math.random() * 0.3);
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : -size - Math.random() * height * 0.15,
        z,
        size,
        vy: physics.fall * speed * (0.55 + 0.7 * z) * (0.85 + Math.random() * 0.3) * unit,
        swayAmp: physics.sway * (0.5 + Math.random()) * unit,
        swaySpeed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2 * physics.spin,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: physics.flip * (0.6 + Math.random() * 0.8),
        sprite: Math.floor(Math.random() * sprites.length),
      };
    };

    // Vẽ hạt xa trước, gần sau
    const particles = Array.from({ length: Math.round(density) }, () => spawn(true)).sort(
      (a, b) => a.z - b.z,
    );
    let last = performance.now();
    let frame = 0;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      // Gió: dao động chậm + những cơn gió ngắn
      const wind =
        (Math.sin(t * 0.25) * 18 + Math.max(0, Math.sin(t * 0.9 + 1.3)) ** 6 * 45) *
        physics.wind *
        unit;

      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy * dt;
        p.x += wind * (0.4 + p.z) * dt;
        p.rotation += p.spin * dt;
        p.flip += p.flipSpeed * dt;
        if (p.y - p.size > height || p.x < -p.size * 3 || p.x > width + p.size * 3) {
          const next = spawn(false);
          // Gió thổi ngang thì sinh lại ở mép đón gió
          if (Math.abs(wind) > 20 && Math.random() < 0.4) {
            next.x = wind > 0 ? -next.size : width + next.size;
            next.y = Math.random() * height * 0.7;
          }
          next.z = p.z;
          particles[i] = next;
          continue;
        }

        const x = p.x + Math.sin(t * p.swaySpeed + p.phase) * p.swayAmp;
        const sprite = p.z < 0.3 ? sprites[p.sprite].soft : sprites[p.sprite].sharp;
        let alpha = 0.35 + 0.6 * p.z;
        if (kind === "stars") alpha *= 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + p.phase));
        // Mờ dần ở mép trên cho khỏi "mọc" ra đột ngột
        alpha *= Math.min(1, (p.y + p.size) / (height * 0.06 + p.size));

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(x, p.y);
        ctx.rotate(p.rotation);
        if (physics.flip > 0) {
          // Lật 3D: co theo cos, không để mỏng hẳn thành một vạch
          const c = Math.cos(p.flip);
          ctx.scale(1, Math.sign(c || 1) * Math.max(Math.abs(c), 0.12));
        }
        const d = p.size;
        ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
        ctx.restore();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // Tab ẩn thì dừng để đỡ tốn pin
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind, density, speed, color, scale]);

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
      <canvas
        ref={canvasRef}
        style={{ position: "sticky", top: 0, display: "block", width: "100%", height: "min(100vh, 100%)" }}
      />
    </div>
  );
};

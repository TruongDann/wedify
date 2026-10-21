"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Layer, Shape } from "react-konva";
import Konva from "konva";

export type AmbientEffectType = "none" | "petals" | "hearts" | "sparkles" | "confetti" | "bubbles" | "snow";

export interface AmbientEffectSettings {
  type: AmbientEffectType;
  color?: string;
  /** Số lượng hạt, mặc định tính theo chiều cao canvas. */
  density?: number;
}

export const AMBIENT_EFFECT_OPTIONS: Array<{ value: AmbientEffectType; label: string }> = [
  { value: "none", label: "Không có" },
  { value: "petals", label: "Cánh hoa rơi" },
  { value: "hearts", label: "Trái tim bay" },
  { value: "sparkles", label: "Lấp lánh" },
  { value: "confetti", label: "Confetti" },
  { value: "bubbles", label: "Bong bóng" },
  { value: "snow", label: "Tuyết rơi" },
];

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  rotation: number;
  spin: number;
  alpha: number;
  color: string;
}

const CONFETTI_COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];

// Bộ sinh số ngẫu nhiên có seed để bố cục hạt ổn định giữa các lần render.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const createParticles = (type: AmbientEffectType, color: string, width: number, height: number, density?: number): Particle[] => {
  const rand = mulberry32(width * 31 + Math.round(height));
  const count = density ?? Math.min(70, Math.max(14, Math.round(height / (type === "sparkles" ? 60 : 85))));
  const sizeRange: Record<string, [number, number]> = {
    petals: [9, 17],
    hearts: [10, 20],
    sparkles: [6, 14],
    confetti: [7, 12],
    bubbles: [8, 26],
    snow: [2, 6],
  };
  const [min, max] = sizeRange[type] ?? [6, 12];

  return Array.from({ length: count }, (_, i) => ({
    x: rand() * width,
    y: rand() * height,
    size: min + rand() * (max - min),
    speed: type === "sparkles" ? 0 : 18 + rand() * 34,
    drift: 14 + rand() * 26,
    phase: rand() * Math.PI * 2,
    rotation: rand() * 360,
    spin: (rand() - 0.5) * 120,
    alpha: type === "bubbles" ? 0.35 + rand() * 0.4 : 0.55 + rand() * 0.45,
    color: type === "confetti" ? CONFETTI_COLORS[i % CONFETTI_COLORS.length] : color,
  }));
};

const drawPetal = (ctx: CanvasRenderingContext2D, s: number) => {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.7, 0, s);
  ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.6, 0, -s);
  ctx.fill();
};

const drawHeart = (ctx: CanvasRenderingContext2D, s: number) => {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.7, -s * 1.1, 0, -s * 0.35);
  ctx.bezierCurveTo(s * 0.7, -s * 1.1, s * 1.4, -s * 0.1, 0, s * 0.9);
  ctx.fill();
};

const drawSparkle = (ctx: CanvasRenderingContext2D, s: number) => {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
  ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
  ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
  ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
  ctx.fill();
};

interface AmbientEffectProps {
  settings?: AmbientEffectSettings | null;
  width: number;
  height: number;
}

/**
 * Lớp hiệu ứng nền (cánh hoa, tim, lấp lánh...) nằm trên cùng, không bắt sự kiện chuột.
 * Dùng chung cho editor và trang xuất bản để hai nơi hiển thị giống hệt nhau.
 */
const AmbientEffect: React.FC<AmbientEffectProps> = ({ settings, width, height }) => {
  const layerRef = useRef<Konva.Layer>(null);
  const type = settings?.type ?? "none";
  const color = settings?.color || "#f9a8d4";

  const particles = useMemo(
    () => (type === "none" ? [] : createParticles(type, color, width, height, settings?.density)),
    [type, color, width, height, settings?.density],
  );

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || particles.length === 0) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const dt = Math.min(frame.timeDiff, 64) / 1000;
      const rising = type === "bubbles" || type === "hearts";
      for (const p of particles) {
        p.phase += dt * 1.2;
        if (type !== "sparkles") {
          p.y += (rising ? -1 : 1) * p.speed * dt;
          p.x += Math.sin(p.phase) * p.drift * dt;
          p.rotation += p.spin * dt;
          if (!rising && p.y > height + 24) {
            p.y = -24;
            p.x = (p.x + width * 0.37) % width;
          }
          if (rising && p.y < -24) {
            p.y = height + 24;
            p.x = (p.x + width * 0.41) % width;
          }
        }
      }
    }, layer);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [particles, type, height, width]);

  if (type === "none") return null;

  return (
    <Layer ref={layerRef} listening={false}>
      <Shape
        listening={false}
        sceneFunc={(context) => {
          const ctx = (context as unknown as { _context: CanvasRenderingContext2D })._context;
          const now = performance.now() / 1000;
          ctx.save();
          for (const p of particles) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;
            switch (type) {
              case "petals":
                ctx.globalAlpha = p.alpha;
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.phase)));
                drawPetal(ctx, p.size);
                break;
              case "hearts":
                ctx.globalAlpha = p.alpha * 0.85;
                ctx.rotate(Math.sin(p.phase) * 0.35);
                drawHeart(ctx, p.size);
                break;
              case "sparkles": {
                const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(now * 1.6 + p.phase));
                ctx.globalAlpha = twinkle * p.alpha;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                drawSparkle(ctx, p.size * (0.6 + 0.4 * twinkle));
                break;
              }
              case "confetti":
                ctx.globalAlpha = p.alpha;
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.scale(1, Math.cos(p.phase * 1.6));
                ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
                break;
              case "bubbles":
                ctx.globalAlpha = p.alpha;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = p.alpha * 0.22;
                ctx.fill();
                break;
              case "snow":
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
              default:
                break;
            }
            ctx.restore();
          }
          ctx.restore();
        }}
      />
    </Layer>
  );
};

export default AmbientEffect;

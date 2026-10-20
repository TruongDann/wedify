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

const CONFETTI_COLORS = ["#f5c542", "#e8506e", "#7ec8e3", "#a3d977", "#c39bd3"];

interface Particle {
  x: number;
  y: number;
  size: number;
  vy: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  rotation: number;
  spin: number;
  color: string;
}

const drawShape = (ctx: CanvasRenderingContext2D, kind: FallingKind, p: Particle, t: number) => {
  const s = p.size;
  ctx.fillStyle = p.color;
  switch (kind) {
    case "petals": {
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.5, s * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(-s * 0.12, -s * 0.05, s * 0.22, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "hearts": {
      const h = s * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.85);
      ctx.bezierCurveTo(-h * 1.2, 0, -h * 0.6, -h * 1.1, 0, -h * 0.4);
      ctx.bezierCurveTo(h * 0.6, -h * 1.1, h * 1.2, 0, 0, h * 0.85);
      ctx.fill();
      break;
    }
    case "snow": {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }
    case "leaves": {
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.quadraticCurveTo(s * 0.45, 0, 0, s * 0.5);
      ctx.quadraticCurveTo(-s * 0.45, 0, 0, -s * 0.5);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.45);
      ctx.lineTo(0, s * 0.45);
      ctx.stroke();
      break;
    }
    case "confetti": {
      // Lật qua lật lại khi rơi
      ctx.scale(1, Math.cos(t * p.swaySpeed * 3 + p.phase));
      ctx.fillRect(-s * 0.25, -s * 0.12, s * 0.5, s * 0.24);
      break;
    }
    case "stars": {
      ctx.globalAlpha *= 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + p.phase));
      const r = s * 0.4;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const rr = i % 2 === 0 ? r : r * 0.25;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
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
    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
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
      const size = (kind === "snow" ? 10 + Math.random() * 10 : 12 + Math.random() * 12) * Math.max(scale, 0.6);
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : -size - Math.random() * 40,
        size,
        vy: (30 + Math.random() * 40) * speed,
        swayAmp: 10 + Math.random() * 30,
        swaySpeed: 0.5 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2,
        color: kind === "confetti" ? CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] : base,
      };
    };

    const particles = Array.from({ length: Math.round(density) }, () => spawn(true));
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        if (p.y - p.size > height) particles[i] = spawn(false);
        ctx.save();
        ctx.globalAlpha = kind === "snow" ? 0.9 : 0.85;
        ctx.translate(p.x + Math.sin(t * p.swaySpeed + p.phase) * p.swayAmp, p.y);
        ctx.rotate(p.rotation);
        drawShape(ctx, kind, p, t);
        ctx.restore();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
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

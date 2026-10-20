"use client";

import React, { useEffect, useRef, useState } from "react";
import { Music, Disc3, Music2, Music3, Music4, Headphones } from "lucide-react";
import { BackgroundMusic } from "@/types/editor";

const MUSIC_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  music: Music,
  disc: Disc3,
  music2: Music2,
  music3: Music3,
  music4: Music4,
  headphones: Headphones,
};

// Trình duyệt chặn tự phát nhạc: phát ở lần chạm/cuộn đầu tiên của khách
const KICK_EVENTS = ["pointerdown", "touchstart", "keydown", "scroll", "wheel"];

interface MusicButtonProps {
  music: BackgroundMusic;
  /** Kích thước nút theo tỉ lệ thiệp đang hiển thị */
  scale: number;
  style?: React.CSSProperties;
}

/** Nút nhạc nền cho trang xem thiệp: tự phát khi khách tương tác lần đầu, bấm để bật/tắt. */
export const MusicButton: React.FC<MusicButtonProps> = ({ music, scale, style }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const kick = (e?: Event) => {
      // Chạm vào chính nút nhạc thì để toggle() xử lý
      if (userPaused.current || buttonRef.current?.contains(e?.target as Node)) return;
      audio.play().catch(() => {});
    };
    const onPlay = () => {
      setPlaying(true);
      KICK_EVENTS.forEach((t) => document.removeEventListener(t, kick, true));
    };
    const onPause = () => setPlaying(false);
    const onVisibility = () => {
      if (document.hidden) audio.pause();
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", onVisibility);
    KICK_EVENTS.forEach((t) => document.addEventListener(t, kick, { capture: true, passive: true }));
    kick();

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      KICK_EVENTS.forEach((t) => document.removeEventListener(t, kick, true));
    };
  }, [music.src]);

  if (!music.src || broken) return null;

  const Icon = MUSIC_ICONS[music.icon || "music"] || Music;
  const color = music.iconColor || "#000000";
  const size = Math.max(28 * scale, 32);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      userPaused.current = false;
      audio.play().catch(() => {});
    } else {
      userPaused.current = true;
      audio.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={music.src} loop preload="auto" onError={() => setBroken(true)} />
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
        title={music.name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: color,
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.15)",
          border: "none",
          cursor: "pointer",
          animation: playing ? "wc-spin 2s linear infinite" : "none",
          opacity: playing ? 1 : 0.75,
          ...style,
        }}
      >
        <Icon size={size / 2} color={color === "#ffffff" ? "#000000" : "#ffffff"} />
      </button>
    </>
  );
};

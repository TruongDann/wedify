"use client";

import React from "react";
import { Music, Disc3, Music2, Music3, Music4, Headphones } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

const MUSIC_ICONS = [
  { key: "music", icon: Music, label: "Music" },
  { key: "disc", icon: Disc3, label: "Disc" },
  { key: "music2", icon: Music2, label: "Music 2" },
  { key: "music3", icon: Music3, label: "Music 3" },
  { key: "music4", icon: Music4, label: "Music 4" },
  { key: "headphones", icon: Headphones, label: "Headphones" },
];

const ICON_COLORS = [
  "#000000",
  "#ffffff",
  "#6F42A3",
  "#e91e63",
  "#2196f3",
  "#4caf50",
  "#ff9800",
  "#f44336",
];

export const MusicPropertySection: React.FC = () => {
  const { canvasSettings, setCanvasSettings } = useEditorStore();
  const currentMusic = canvasSettings.backgroundMusic;

  const handleIconChange = (iconKey: string) => {
    if (currentMusic) {
      setCanvasSettings({
        backgroundMusic: {
          ...currentMusic,
          icon: iconKey,
        },
      });
    }
  };

  const handleColorChange = (color: string) => {
    if (currentMusic) {
      setCanvasSettings({
        backgroundMusic: {
          ...currentMusic,
          iconColor: color,
        },
      });
    }
  };

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Nhạc đang dùng */}
      <div
        className={`flex items-center gap-3 rounded-xl border p-3 text-[13px] leading-[19px] text-ink-3 ${
          currentMusic ? "border-line" : "border-dashed border-line"
        }`}
      >
        <Music size={20} className="shrink-0" />
        <div className="min-w-0">
          <div className="text-ink-2 truncate">
            {currentMusic ? currentMusic.name : "Chưa có nhạc nền"}
          </div>
          {currentMusic
            ? currentMusic.artist
            : "Chọn một bài trong thư viện hoặc nhạc của bạn."}
        </div>
      </div>

      {/* Biểu tượng */}
      <section>
        <h3 className="text-[15px] font-semibold leading-[22px] text-ink">
          Biểu tượng nhạc
        </h3>
        <p className="text-[13px] leading-5 text-ink-3 mb-3">
          Chọn kiểu hiển thị trên thiệp.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {MUSIC_ICONS.map(({ key, icon: Icon, label }) => {
            const active = currentMusic?.icon === key;
            return (
              <button
                key={key}
                type="button"
                className={`h-13 rounded-[10px] border flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  active
                    ? "bg-primary-soft border-primary text-link"
                    : "bg-white border-line text-ink hover:border-line-strong"
                }`}
                onClick={() => handleIconChange(key)}
                disabled={!currentMusic}
                title={label}
              >
                <Icon size={20} strokeWidth={1.7} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Màu biểu tượng */}
      <section>
        <h3 className="text-[15px] font-semibold leading-[22px] text-ink mb-3">
          Màu biểu tượng
        </h3>
        <div className="flex gap-2 flex-wrap">
          {ICON_COLORS.map((color) => {
            const active = currentMusic?.iconColor === color;
            return (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-lg p-0.5 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  active ? "border-primary" : "border-line hover:border-line-strong"
                }`}
                onClick={() => handleColorChange(color)}
                disabled={!currentMusic}
                title={color}
              >
                <span
                  className="block w-full h-full rounded-md shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                  style={{ backgroundColor: color }}
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

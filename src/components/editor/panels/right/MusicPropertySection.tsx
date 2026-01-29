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
    <div className="p-4">
      {/* Section Title */}
      <h2 className="text-base font-semibold text-gray-800 mb-4">Nhạc nền</h2>

      {/* Current Music Display */}
      <p className="text-sm text-gray-400 mb-4">
        {currentMusic ? currentMusic.name : "Chưa chọn bài hát nào"}
      </p>

      {/* Icon Selection */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Chọn biểu tượng
        </h3>
        <div className="flex gap-2 flex-wrap">
          {MUSIC_ICONS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-105 ${
                currentMusic?.icon === key
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleIconChange(key)}
              disabled={!currentMusic}
              title={key}
            >
              <Icon
                size={20}
                className={
                  currentMusic?.icon === key ? "text-primary" : "text-gray-500"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Icon Color */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Màu biểu tượng
        </h3>
        <div className="flex gap-2 flex-wrap">
          {ICON_COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-105 ${
                currentMusic?.iconColor === color
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{
                backgroundColor: color,
                boxShadow:
                  color === "#ffffff" ? "inset 0 0 0 1px #e5e7eb" : undefined,
              }}
              onClick={() => handleColorChange(color)}
              disabled={!currentMusic}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

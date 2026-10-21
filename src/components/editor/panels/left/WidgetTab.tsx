"use client";

import React from "react";
import { App } from "antd";
import { createTextElement, useEditorStore } from "@/store/editorStore";
import { WIDGET_PRESETS } from "@/data/widgets";
import { AMBIENT_EFFECT_OPTIONS, type AmbientEffectType } from "../../effects/AmbientEffect";
import { Section } from "../../shared";

const AMBIENT_EMOJI: Record<string, string> = { petals: "🌸", hearts: "💗", sparkles: "✨", confetti: "🎉", bubbles: "🫧", snow: "❄️", none: "🚫" };

/** Tab "Tiện ích": thêm lịch, đếm ngược, nút hành động, trình chiếu ảnh... và hiệu ứng nền. */
export const WidgetTab: React.FC = () => {
  const { message } = App.useApp();
  const { addElement, canvasSettings, setCanvasSettings } = useEditorStore();
  const canvasWidth = canvasSettings.width || 600;

  const addPreset = (id: string) => {
    const preset = WIDGET_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    addElement(preset.build(canvasWidth));
    message.success(`Đã thêm "${preset.label}" — kéo để đặt vị trí, chỉnh chi tiết ở panel bên phải`);
  };

  const addGuestName = () => {
    addElement(
      createTextElement({
        content: "Kính mời {{guest}}",
        fontFamily: "Playfair Display",
        fontSize: 28,
        size: { width: Math.min(460, canvasWidth - 40), height: 70 },
        position: { x: Math.max(20, (canvasWidth - 460) / 2), y: 160 },
        animation: { enabled: true, continuous: false, type: "slideUp", delay: 0 },
      }),
    );
    message.success("Đã thêm tên khách mời. Khi khách mở link riêng, {{guest}} tự đổi thành tên của họ");
  };

  const setAmbient = (type: AmbientEffectType) => {
    setCanvasSettings({ ambientEffect: type === "none" ? null : { type, color: canvasSettings.ambientEffect?.color ?? "#f9a8d4" } });
  };

  const activeAmbient = canvasSettings.ambientEffect?.type ?? "none";

  return (
    <Section title="Tiện ích">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={addGuestName} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-3 text-xs text-gray-700 transition hover:border-primary hover:bg-pink-50">
            <span className="text-2xl">🙋</span>
            Tên khách mời
          </button>
          {WIDGET_PRESETS.map((preset) => (
            <button key={preset.id} type="button" onClick={() => addPreset(preset.id)} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-3 text-xs text-gray-700 transition hover:border-primary hover:bg-pink-50">
              <span className="text-2xl">{preset.icon}</span>
              {preset.label}
            </button>
          ))}
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Hiệu ứng đặc biệt (toàn trang)</div>
          <div className="grid grid-cols-3 gap-2">
            {AMBIENT_EFFECT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAmbient(option.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] transition ${activeAmbient === option.value ? "border-primary bg-pink-50 text-primary" : "border-gray-200 bg-white text-gray-600 hover:border-primary"}`}
              >
                <span className="text-xl">{AMBIENT_EMOJI[option.value]}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-gray-400">
          Form tham dự, Hộp quà QR, Bản đồ, Sổ lưu bút… hiển thị đúng tính năng ngay trên thiệp. Khi khách mở thiệp đã xuất bản, các form hoạt động thật (gửi xác nhận, gửi lời chúc, sao chép số tài khoản…).
        </p>
      </div>
    </Section>
  );
};

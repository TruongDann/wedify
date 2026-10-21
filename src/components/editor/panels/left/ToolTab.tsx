"use client";

import React from "react";
import { App } from "antd";
import { createTextElement, useEditorStore } from "@/store/editorStore";
import { TOOL_PRESETS } from "@/data/tools";
import { Section } from "../../shared";

/** Tiện ích mở rộng kết nối API Wedify: form tham dự, hộp quà QR + tim, bản đồ nhúng, video, liên hệ, sổ lưu bút, trình chiếu ảnh. */
export const ToolTab: React.FC = () => {
  const { message } = App.useApp();
  const { addElement, canvasSettings } = useEditorStore();
  const canvasWidth = canvasSettings.width || 600;

  const addPreset = (id: string) => {
    const preset = TOOL_PRESETS.find((item) => item.id === id);
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

  return (
    <Section title="Tiện ích mở rộng (Wedify)">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={addGuestName} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-3 text-xs text-gray-700 transition hover:border-primary hover:bg-pink-50">
            <span className="text-2xl">🙋</span>
            Tên khách mời
          </button>
          {TOOL_PRESETS.map((preset) => (
            <button key={preset.id} type="button" onClick={() => addPreset(preset.id)} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-3 text-xs text-gray-700 transition hover:border-primary hover:bg-pink-50">
              <span className="text-2xl">{preset.icon}</span>
              {preset.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] leading-relaxed text-gray-400">
          Form tham dự, Hộp quà QR, Bản đồ, Sổ lưu bút… hiển thị đúng tính năng ngay trên thiệp. Khi khách mở thiệp đã xuất bản, các form hoạt động thật (gửi xác nhận, gửi lời chúc, sao chép số tài khoản…).
        </p>
      </div>
    </Section>
  );
};

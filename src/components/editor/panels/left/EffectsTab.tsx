"use client";

import React from "react";
import { App } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { ANIMATION_EFFECTS } from "@/data/animationEffects";
import { useEditorStore } from "@/store/editorStore";

const animationTypeMap: Record<string, "none" | "fadeIn" | "slideIn" | "bounce" | "pulse" | "shake" | "zoom"> = {
  none: "none",
  fadeInAll: "fadeIn",
  slideUpAll: "slideIn",
  scaleInAll: "zoom",
  flipInAll: "pulse",
  slideUpMix: "slideIn",
  fadeInMix: "fadeIn",
};

export const EffectsTab: React.FC = () => {
  const { message } = App.useApp();
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const updateElement = useEditorStore((state) => state.updateElement);

  const applyEffect = (effectId: string) => {
    const ids = selectedElementIds.length > 0 ? selectedElementIds : selectedElementId ? [selectedElementId] : [];

    if (ids.length === 0) {
      message.warning("Vui lòng chọn 1 đối tượng trên canvas trước khi áp dụng hiệu ứng.");
      return;
    }

    const mappedType = animationTypeMap[effectId] ?? "fadeIn";
    ids.forEach((id) => {
      updateElement(id, {
        animation: {
          enabled: mappedType !== "none",
          continuous: mappedType === "pulse" || mappedType === "zoom" || mappedType === "bounce",
          type: mappedType,
        },
      });
    });

    message.success(`Đã áp dụng hiệu ứng: ${ANIMATION_EFFECTS.find((item) => item.id === effectId)?.name ?? "Hiệu ứng"}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Hiệu ứng</div>
          <div className="mt-1 text-sm font-semibold text-slate-700">Áp dụng trực tiếp lên đối tượng</div>
        </div>
        <ThunderboltOutlined className="text-lg text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ANIMATION_EFFECTS.map((effect) => (
          <button
            type="button"
            key={effect.id}
            onClick={() => applyEffect(effect.id)}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-center transition-all hover:border-primary hover:shadow-md"
          >
            {typeof effect.icon === "string" ? (
              <div className="mb-2 text-2xl text-gray-400">{effect.icon}</div>
            ) : (
              <div className="mb-2">{effect.icon}</div>
            )}
            <div className="text-xs font-medium text-gray-800">{effect.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

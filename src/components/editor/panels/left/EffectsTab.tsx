"use client";

import React from "react";
import { ColorPicker, Input, Modal, Slider } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { ANIMATION_EFFECTS, AnimationEffect } from "@/data/animationEffects";
import { useEditorStore } from "@/store/editorStore";
import type {
  AnimationType,
  EditorElement,
  FallingEffect,
  IntroSettings,
} from "@/types/editor";
import { FALLING_KINDS } from "@/components/card/FallingEffectLayer";
import { DEFAULT_INTRO, IntroOverlay } from "@/components/card/IntroOverlay";
import { PropertyRow } from "../../shared";

type TabKey = "animation" | "falling" | "intro";

/** Đặt lại hiệu ứng xuất hiện của mọi phần tử theo một kiểu chung. */
const applyAnimationPreset = (
  elements: EditorElement[],
  canvasWidth: number,
  id: AnimationEffect["id"],
): EditorElement[] => {
  const withAnim = (el: EditorElement, type: AnimationType, delay = 0) =>
    ({
      ...el,
      animation:
        type === "none"
          ? { enabled: false, continuous: false, type: "none" }
          : { enabled: true, continuous: false, type, delay },
    }) as EditorElement;

  switch (id) {
    case "none":
      return elements.map((el) => withAnim(el, "none"));
    case "fadeInAll":
      return elements.map((el) => withAnim(el, "fadeIn"));
    case "slideUpAll":
      return elements.map((el) => withAnim(el, "slideUp"));
    case "scaleInAll":
      return elements.map((el) => withAnim(el, "zoom"));
    case "slideSideMix":
      return elements.map((el) => {
        const center = el.position.x + el.size.width / 2;
        const third = canvasWidth / 3;
        if (el.size.width > canvasWidth * 0.6 || (center > third && center < third * 2))
          return withAnim(el, "slideUp");
        return withAnim(el, center <= third ? "slideRight" : "slideLeft");
      });
    case "fadeInSequence": {
      // Phần tử có cạnh trên gần nhau coi như cùng hàng, hiện lần lượt từ trái qua
      const order = new Map<string, number>();
      const sorted = [...elements].sort((a, b) => a.position.y - b.position.y);
      let rowTop = -Infinity;
      let row: EditorElement[] = [];
      const flush = () =>
        row
          .sort((a, b) => a.position.x - b.position.x)
          .forEach((el, i) => order.set(el.id, i));
      for (const el of sorted) {
        if (el.position.y - rowTop > 40) {
          flush();
          row = [];
          rowTop = el.position.y;
        }
        row.push(el);
      }
      flush();
      return elements.map((el) => withAnim(el, "fadeIn", Math.min((order.get(el.id) ?? 0) * 0.25, 1.5)));
    }
  }
};

const DEFAULT_FALLING: FallingEffect = { kind: "petals", density: 30, speed: 1 };

export const EffectsTab: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabKey>("animation");
  const [previewIntro, setPreviewIntro] = React.useState(false);
  const { elements, canvasSettings, setCanvasSettings, saveHistory } = useEditorStore();
  const falling = canvasSettings.fallingEffect ?? null;
  const intro = canvasSettings.intro ?? null;

  const setFalling = (patch: Partial<FallingEffect> | null) =>
    setCanvasSettings({
      fallingEffect: patch === null ? null : { ...(falling ?? DEFAULT_FALLING), ...patch },
    });
  const setIntro = (patch: Partial<IntroSettings> | null) =>
    setCanvasSettings({
      intro: patch === null ? null : { ...(intro ?? DEFAULT_INTRO), ...patch },
    });

  const tabButton = (key: TabKey, label: string) => (
    <button
      className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
        activeTab === key
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      onClick={() => setActiveTab(key)}
    >
      {label}
    </button>
  );

  const card = (active: boolean) =>
    `bg-white border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-center text-center ${
      active ? "border-primary ring-1 ring-primary" : "border-gray-200 hover:border-primary"
    }`;

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        {tabButton("animation", "Hiệu ứng động")}
        {tabButton("falling", "Hiệu ứng rơi")}
        {tabButton("intro", "Mở màn")}
      </div>

      {activeTab === "animation" && (
        <div>
          <p className="text-xs text-gray-500 mb-3">
            Áp một kiểu chuyển động cho mọi phần tử khi khách cuộn tới. Chỉnh riêng từng phần tử ở
            cột bên phải.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ANIMATION_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                title={effect.description}
                className={`${card(false)} aspect-square`}
                onClick={() => {
                  useEditorStore.setState({
                    elements: applyAnimationPreset(elements, canvasSettings.width, effect.id),
                  });
                  saveHistory();
                }}
              >
                <div className="text-2xl mb-2 text-gray-400">{effect.icon}</div>
                <div className="text-sm font-medium text-gray-800">{effect.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "falling" && (
        <div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button className={card(!falling)} onClick={() => setFalling(null)}>
              <span className="text-xl text-gray-400">⊘</span>
              <span className="text-xs mt-1">Không</span>
            </button>
            {FALLING_KINDS.map((k) => (
              <button
                key={k.kind}
                className={card(falling?.kind === k.kind)}
                onClick={() => setFalling({ kind: k.kind, color: undefined })}
              >
                <span
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ background: k.kind === "confetti" ? "conic-gradient(#f5c542,#e8506e,#7ec8e3,#a3d977,#f5c542)" : k.color }}
                />
                <span className="text-xs mt-1">{k.label}</span>
              </button>
            ))}
          </div>
          {falling && (
            <>
              <PropertyRow label="Mật độ">
                <Slider className="flex-1" min={5} max={80} value={falling.density} onChange={(density) => setFalling({ density })} />
              </PropertyRow>
              <PropertyRow label="Tốc độ">
                <Slider className="flex-1" min={0.3} max={2.5} step={0.1} value={falling.speed} onChange={(speed) => setFalling({ speed })} />
              </PropertyRow>
              {falling.kind !== "confetti" && (
                <PropertyRow label="Màu">
                  <ColorPicker
                    value={falling.color || FALLING_KINDS.find((k) => k.kind === falling.kind)?.color}
                    onChange={(c) => setFalling({ color: c.toHexString() })}
                  />
                </PropertyRow>
              )}
              <p className="text-xs text-gray-400">Hiệu ứng đang chạy thử trên thiệp khi mở tab này.</p>
            </>
          )}
        </div>
      )}

      {activeTab === "intro" && (
        <div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button className={card(!intro)} onClick={() => setIntro(null)}>
              <span className="text-xl text-gray-400">⊘</span>
              <span className="text-xs mt-1">Không</span>
            </button>
            <button className={card(intro?.style === "envelope")} onClick={() => setIntro({ style: "envelope" })}>
              <span className="text-xl">✉️</span>
              <span className="text-xs mt-1">Phong bì</span>
            </button>
            <button className={card(intro?.style === "curtain")} onClick={() => setIntro({ style: "curtain" })}>
              <span className="text-xl">🎭</span>
              <span className="text-xs mt-1">Rèm</span>
            </button>
          </div>
          {intro && (
            <>
              <PropertyRow label="Tiêu đề">
                <Input value={intro.title} onChange={(e) => setIntro({ title: e.target.value })} />
              </PropertyRow>
              <PropertyRow label="Dòng phụ">
                <Input value={intro.subtitle} onChange={(e) => setIntro({ subtitle: e.target.value })} />
              </PropertyRow>
              <PropertyRow label="Nút">
                <Input value={intro.buttonText} onChange={(e) => setIntro({ buttonText: e.target.value })} />
              </PropertyRow>
              <PropertyRow label={intro.style === "curtain" ? "Màu rèm" : "Màu phong bì"}>
                <ColorPicker value={intro.color} onChange={(c) => setIntro({ color: c.toHexString() })} />
              </PropertyRow>
              <PropertyRow label="Màu chữ">
                <ColorPicker value={intro.textColor} onChange={(c) => setIntro({ textColor: c.toHexString() })} />
              </PropertyRow>
              <button
                className="w-full mt-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                onClick={() => setPreviewIntro(true)}
              >
                <EyeOutlined /> Xem thử
              </button>
              <Modal
                open={previewIntro}
                onCancel={() => setPreviewIntro(false)}
                footer={null}
                width={380}
                destroyOnHidden
                styles={{ body: { padding: 0 } }}
              >
                <div style={{ position: "relative", height: 640, marginTop: 28, overflow: "hidden", borderRadius: 8, background: "#fff" }}>
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">Thiệp hiện ra ở đây</div>
                  <IntroOverlay intro={intro} preview />
                </div>
              </Modal>
            </>
          )}
        </div>
      )}
    </div>
  );
};

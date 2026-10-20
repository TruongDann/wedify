"use client";

import React from "react";
import { ColorPicker, Input, Modal, Slider } from "antd";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
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
import { SectionTitle, Tile } from "./ui";

type TabKey = "animation" | "falling" | "intro";

const CATEGORIES: {
  key: TabKey;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    key: "animation",
    title: "Hiệu ứng động",
    description: "Chuyển động của phần tử khi cuộn trang",
    icon: "/effects/animation.webp",
  },
  {
    key: "intro",
    title: "Hiệu ứng mở màn",
    description: "Màn chào khách trước khi vào thiệp",
    icon: "/effects/intro.webp",
  },
  {
    key: "falling",
    title: "Hiệu ứng rơi",
    description: "Cánh hoa, trái tim, tuyết rơi trên thiệp",
    icon: "/effects/falling.webp",
  },
];

const OPTION =
  "flex flex-col items-center justify-center gap-1.5 px-2 py-3 min-h-21 text-center text-[13px] font-medium text-ink bg-white";

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

const NONE_ICON = <span className="text-xl leading-none text-ink-3">⊘</span>;

export const EffectsTab: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabKey | null>(null);
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

  // Màn hình đầu: danh sách loại hiệu ứng
  if (!activeTab) {
    return (
      <div className="px-4 pt-2 pb-8 flex flex-col gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setActiveTab(c.key)}
            className="flex items-center gap-3 p-3 rounded-xl border border-line bg-white text-left hover:border-primary/40 hover:bg-primary-soft transition-colors"
          >
            <span className="w-14 h-14 rounded-lg bg-surface-muted flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.icon} alt="" width={48} height={48} className="w-12 h-12 object-contain" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-ink">{c.title}</span>
              <span className="block text-xs leading-4 text-ink-3 mt-0.5">
                {c.description}
              </span>
            </span>
            <ChevronRight size={16} className="text-ink-3 shrink-0" />
          </button>
        ))}
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.key === activeTab)!;

  return (
    <div className="flex flex-col h-full">
      <button
        type="button"
        onClick={() => setActiveTab(null)}
        className="mx-2 mb-1 h-9 px-2 rounded-lg flex items-center gap-1 self-start text-sm font-semibold text-ink hover:bg-surface-muted"
      >
        <ChevronLeft size={16} /> {category.title}
      </button>

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-8">
        {activeTab === "animation" && (
          <section>
            <SectionTitle title="Mẫu hiệu ứng" />
            <p className="text-xs leading-4 text-ink-3 -mt-1 mb-3">
              Bấm để áp cho mọi phần tử khi khách cuộn tới. Chỉnh riêng từng phần tử ở cột bên phải.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATION_EFFECTS.map((effect) => (
                <Tile
                  key={effect.id}
                  title={effect.description}
                  className={OPTION}
                  onClick={() => {
                    useEditorStore.setState({
                      elements: applyAnimationPreset(elements, canvasSettings.width, effect.id),
                    });
                    saveHistory();
                  }}
                >
                  <span className="text-xl leading-none text-ink-2">{effect.icon}</span>
                  {effect.name}
                </Tile>
              ))}
            </div>
          </section>
        )}

        {activeTab === "falling" && (
          <section>
            <SectionTitle title="Kiểu rơi" />
            <div className="grid grid-cols-3 gap-2 mb-5">
              <Tile selected={!falling} className={OPTION} onClick={() => setFalling(null)}>
                {NONE_ICON}
                Không
              </Tile>
              {FALLING_KINDS.map((k) => (
                <Tile
                  key={k.kind}
                  selected={falling?.kind === k.kind}
                  className={OPTION}
                  onClick={() => setFalling({ kind: k.kind, color: undefined })}
                >
                  <span
                    className="w-5 h-5 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                    style={{
                      background:
                        k.kind === "confetti"
                          ? "conic-gradient(#f5c542,#e8506e,#7ec8e3,#a3d977,#f5c542)"
                          : k.color,
                    }}
                  />
                  {k.label}
                </Tile>
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
                <p className="text-xs text-ink-3">Hiệu ứng đang chạy thử trên thiệp khi mở tab này.</p>
              </>
            )}
          </section>
        )}

        {activeTab === "intro" && (
          <section>
            <SectionTitle title="Kiểu mở màn" />
            <div className="grid grid-cols-3 gap-2 mb-5">
              <Tile selected={!intro} className={OPTION} onClick={() => setIntro(null)}>
                {NONE_ICON}
                Không
              </Tile>
              <Tile
                selected={intro?.style === "envelope"}
                className={OPTION}
                onClick={() => setIntro({ style: "envelope" })}
              >
                <span className="text-xl leading-none">✉️</span>
                Phong bì
              </Tile>
              <Tile
                selected={intro?.style === "curtain"}
                className={OPTION}
                onClick={() => setIntro({ style: "curtain" })}
              >
                <span className="text-xl leading-none">🎭</span>
                Rèm
              </Tile>
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
          </section>
        )}
      </div>

      {/* Nút xem trước cố định ở đáy panel */}
      {activeTab === "intro" && intro && (
        <div className="p-4 border-t border-line shrink-0">
          <button
            type="button"
            className="w-full h-10 rounded-full border border-line-strong bg-white text-sm font-semibold text-ink flex items-center justify-center gap-2 hover:bg-surface-muted transition-colors"
            onClick={() => setPreviewIntro(true)}
          >
            <Eye size={16} /> Xem trước hiệu ứng
          </button>
        </div>
      )}
    </div>
  );
};

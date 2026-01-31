"use client";

import React from "react";
import { Slider, ColorPicker } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { TextElement } from "@/types/editor";
import { SectionHeader, PropertyRow } from "../../shared";

const TEXT_EFFECT_STYLES = [
  { type: "none", label: "Không", preview: "Ag" },
  { type: "shadow", label: "Shadow", preview: "Ag" },
  { type: "lift", label: "Lift", preview: "Ag" },
] as const;

const TEXT_EFFECT_COLORS = [
  { type: "hollow", label: "Hollow", preview: "Ag" },
  { type: "splice", label: "Splice", preview: "Ag" },
  { type: "outline", label: "Outline", preview: "Ag" },
] as const;

const TEXT_EFFECT_SPECIAL = [
  { type: "echo", label: "Echo", preview: "Ag" },
  { type: "glitch", label: "Glitch", preview: "Ag" },
  { type: "neon", label: "Neon", preview: "Ag" },
] as const;

interface TextEffectSectionProps {
  element: TextElement;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<TextElement>) => void;
}

export const TextEffectSection: React.FC<TextEffectSectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => {
  const textEffect = element.textEffect || {
    type: "none" as const,
    offset: 50,
    direction: -45,
    blur: 0,
    transparency: 40,
    color: "#000000",
    intensity: 50,
    spread: 50,
    curveAmount: 0,
  };

  const handleEffectUpdate = (updates: Partial<typeof textEffect>) => {
    onUpdate({ textEffect: { ...textEffect, ...updates } });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Hiệu ứng chữ"
        sectionKey="textEffect"
        icon={<ThunderboltOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-4">
          {/* Style section */}
          <div className="mb-4">
            <span className="text-xs text-gray-500 mb-2 block">Kiểu</span>
            <div className="grid grid-cols-3 gap-2">
              {TEXT_EFFECT_STYLES.map((effect) => (
                <button
                  key={effect.type}
                  className={`relative h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    textEffect.type === effect.type
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleEffectUpdate({ type: effect.type })}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{
                      textShadow:
                        effect.type === "shadow"
                          ? "2px 2px 4px rgba(0,0,0,0.3)"
                          : effect.type === "lift"
                            ? "0 4px 8px rgba(0,0,0,0.2)"
                            : "none",
                    }}
                  >
                    {effect.preview}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {effect.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings for Shadow effect */}
          {textEffect.type === "shadow" && (
            <EffectSettings
              settings={[
                {
                  label: "Offset",
                  value: textEffect.offset,
                  key: "offset",
                  min: 0,
                  max: 100,
                },
                {
                  label: "Hướng",
                  value: textEffect.direction,
                  key: "direction",
                  min: -180,
                  max: 180,
                },
                {
                  label: "Blur",
                  value: textEffect.blur,
                  key: "blur",
                  min: 0,
                  max: 100,
                },
                {
                  label: "Độ mờ",
                  value: textEffect.transparency,
                  key: "transparency",
                  min: 0,
                  max: 100,
                },
              ]}
              onUpdate={handleEffectUpdate}
            />
          )}

          {/* Settings for Lift effect */}
          {textEffect.type === "lift" && (
            <EffectSettings
              settings={[
                {
                  label: "Intensity",
                  value: textEffect.intensity,
                  key: "intensity",
                  min: 0,
                  max: 100,
                },
              ]}
              onUpdate={handleEffectUpdate}
            />
          )}

          {/* Settings for Hollow effect */}
          {textEffect.type === "hollow" && (
            <EffectSettings
              settings={[
                {
                  label: "Thickness",
                  value: textEffect.intensity,
                  key: "intensity",
                  min: 0,
                  max: 100,
                },
              ]}
              onUpdate={handleEffectUpdate}
            />
          )}

          {/* Settings for Outline effect */}
          {textEffect.type === "outline" && (
            <EffectSettings
              settings={[
                {
                  label: "Thickness",
                  value: textEffect.intensity,
                  key: "intensity",
                  min: 0,
                  max: 200,
                },
              ]}
              onUpdate={handleEffectUpdate}
            />
          )}

          {/* Settings for Splice effect */}
          {textEffect.type === "splice" && (
            <EffectSettings
              settings={[
                {
                  label: "Thickness",
                  value: textEffect.intensity,
                  key: "intensity",
                  min: 0,
                  max: 100,
                },
                {
                  label: "Offset",
                  value: textEffect.offset,
                  key: "offset",
                  min: 0,
                  max: 100,
                },
                {
                  label: "Direction",
                  value: textEffect.direction,
                  key: "direction",
                  min: -180,
                  max: 180,
                },
              ]}
              onUpdate={handleEffectUpdate}
            />
          )}

          {/* Settings for Echo and Glitch effects */}
          {(textEffect.type === "echo" || textEffect.type === "glitch") && (
            <EffectSettings
              settings={[
                {
                  label: "Offset",
                  value: textEffect.offset,
                  key: "offset",
                  min: 0,
                  max: 100,
                },
                {
                  label: "Direction",
                  value: textEffect.direction,
                  key: "direction",
                  min: -180,
                  max: 180,
                },
              ]}
              onUpdate={handleEffectUpdate}
            />
          )}

          {/* Settings for Neon effect */}
          {textEffect.type === "neon" && (
            <EffectSettings
              settings={[
                {
                  label: "Intensity",
                  value: textEffect.intensity,
                  key: "intensity",
                  min: 0,
                  max: 100,
                },
                {
                  label: "Blur",
                  value: textEffect.blur,
                  key: "blur",
                  min: 0,
                  max: 100,
                },
              ]}
              onUpdate={handleEffectUpdate}
            />
          )}

          {/* Color section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Màu</span>
              <ColorPicker
                value={textEffect.color}
                onChange={(color) =>
                  handleEffectUpdate({ color: color.toHexString() })
                }
                size="small"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TEXT_EFFECT_COLORS.map((effect) => (
                <button
                  key={effect.type}
                  className={`relative h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    textEffect.type === effect.type
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleEffectUpdate({ type: effect.type })}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color:
                        effect.type === "hollow"
                          ? "transparent"
                          : effect.type === "splice"
                            ? "#7c3aed"
                            : "#000",
                      WebkitTextStroke:
                        effect.type === "hollow"
                          ? "1px #000"
                          : effect.type === "outline"
                            ? "2px #7c3aed"
                            : "none",
                      textShadow:
                        effect.type === "splice" ? "2px 2px 0 #000" : "none",
                    }}
                  >
                    {effect.preview}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {effect.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Special effects section */}
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {TEXT_EFFECT_SPECIAL.map((effect) => (
                <button
                  key={effect.type}
                  className={`relative h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    textEffect.type === effect.type
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleEffectUpdate({ type: effect.type })}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color:
                        effect.type === "neon"
                          ? "#00ff88"
                          : effect.type === "glitch"
                            ? "#ff0066"
                            : "#000",
                      textShadow:
                        effect.type === "echo"
                          ? "2px 2px 0 rgba(0,0,0,0.2), 4px 4px 0 rgba(0,0,0,0.1)"
                          : effect.type === "neon"
                            ? "0 0 10px #00ff88, 0 0 20px #00ff88"
                            : "none",
                    }}
                  >
                    {effect.preview}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {effect.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shape section */}
          <div>
            <span className="text-xs text-gray-500 mb-2 block">Hình dạng</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  textEffect.type !== "curve"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  handleEffectUpdate({ type: "none", curveAmount: 0 })
                }
              >
                <span className="text-lg font-bold tracking-wide">ABCD</span>
                <span className="text-xs text-gray-500">Thẳng</span>
              </button>
              <button
                className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  textEffect.type === "curve"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  handleEffectUpdate({
                    type: "curve",
                    curveAmount: textEffect.curveAmount || 50,
                  })
                }
              >
                <svg
                  width="50"
                  height="24"
                  viewBox="0 0 50 24"
                  className="text-gray-700"
                >
                  <path
                    d="M 2,18 Q 25,2 48,18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <text
                    x="8"
                    y="16"
                    fontSize="8"
                    fontWeight="bold"
                    fill="currentColor"
                  >
                    A
                  </text>
                  <text
                    x="17"
                    y="10"
                    fontSize="8"
                    fontWeight="bold"
                    fill="currentColor"
                  >
                    B
                  </text>
                  <text
                    x="27"
                    y="10"
                    fontSize="8"
                    fontWeight="bold"
                    fill="currentColor"
                  >
                    C
                  </text>
                  <text
                    x="37"
                    y="16"
                    fontSize="8"
                    fontWeight="bold"
                    fill="currentColor"
                  >
                    D
                  </text>
                </svg>
                <span className="text-xs text-gray-500">Cong</span>
              </button>
            </div>

            {/* Curve Amount Slider - only show when curve is selected */}
            {textEffect.type === "curve" && (
              <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                <PropertyRow label="Độ cong">
                  <Slider
                    value={textEffect.curveAmount || 0}
                    onChange={(value) =>
                      handleEffectUpdate({ curveAmount: value })
                    }
                    min={-100}
                    max={100}
                    className="flex-1"
                    tooltip={{ formatter: (value) => `${value}%` }}
                  />
                  <input
                    type="number"
                    className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
                    value={textEffect.curveAmount || 0}
                    onChange={(e) =>
                      handleEffectUpdate({
                        curveAmount: Math.max(
                          -100,
                          Math.min(100, Number(e.target.value) || 0),
                        ),
                      })
                    }
                  />
                </PropertyRow>
                <div className="text-xs text-gray-400 text-center">
                  Âm (-): Cong xuống • Dương (+): Cong lên
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for effect settings
interface EffectSettingsProps {
  settings: Array<{
    label: string;
    value: number;
    key: string;
    min: number;
    max: number;
  }>;
  onUpdate: (updates: Record<string, number>) => void;
}

const EffectSettings: React.FC<EffectSettingsProps> = ({
  settings,
  onUpdate,
}) => (
  <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
    {settings.map((setting) => (
      <PropertyRow key={setting.key} label={setting.label}>
        <Slider
          value={setting.value}
          onChange={(value) => onUpdate({ [setting.key]: value })}
          min={setting.min}
          max={setting.max}
          className="flex-1"
        />
        <input
          type="number"
          className="w-14 h-8 text-center bg-gray-100 rounded text-sm"
          value={setting.value}
          onChange={(e) =>
            onUpdate({ [setting.key]: Number(e.target.value) || 0 })
          }
        />
      </PropertyRow>
    ))}
  </div>
);

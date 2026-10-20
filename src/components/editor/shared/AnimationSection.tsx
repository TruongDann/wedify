import React from "react";
import { Select, Slider, Switch } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import type { AnimationType, ElementAnimation } from "@/types/editor";
import { SectionHeader } from "./SectionHeader";
import { PropertyRow } from "./PropertyRow";
import { DEFAULT_APPEAR_DURATION } from "@/constants/animation";

export const DEFAULT_ELEMENT_ANIMATION: ElementAnimation = {
  enabled: false,
  continuous: false,
  type: "none",
};

const APPEAR_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: "fadeIn", label: "Hiện dần" },
  { value: "slideUp", label: "Trượt lên" },
  { value: "slideDown", label: "Trượt xuống" },
  { value: "slideLeft", label: "Trượt sang trái" },
  { value: "slideRight", label: "Trượt sang phải" },
  { value: "zoom", label: "Phóng to" },
  { value: "bounce", label: "Rơi nảy" },
  { value: "slideIn", label: "Trượt lên (nảy)" },
];

const LOOP_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: "pulse", label: "Nhịp đập" },
  { value: "shake", label: "Lắc lư" },
  { value: "bounce", label: "Bồng bềnh" },
  { value: "fadeIn", label: "Nhấp nháy" },
];

interface AnimationSectionProps {
  animation: ElementAnimation | undefined;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onChange: (animation: ElementAnimation) => void;
}

/** Hiệu ứng chuyển động của một phần tử: xuất hiện khi cuộn tới (có hướng, thời lượng, độ trễ) hoặc lặp liên tục. */
export const AnimationSection: React.FC<AnimationSectionProps> = ({
  animation = DEFAULT_ELEMENT_ANIMATION,
  sectionKey,
  isExpanded,
  onToggle,
  onChange,
}) => {
  const update = (patch: Partial<ElementAnimation>) =>
    onChange({ ...animation, ...patch });
  const options = animation.continuous ? LOOP_OPTIONS : APPEAR_OPTIONS;
  const type = options.some((o) => o.value === animation.type)
    ? animation.type
    : "none";
  const duration =
    animation.duration ?? DEFAULT_APPEAR_DURATION[animation.type] ?? 1;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Hiệu ứng chuyển động"
        sectionKey={sectionKey}
        icon={<PlayCircleOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Bật hiệu ứng</span>
            <Switch
              checked={animation.enabled}
              onChange={(enabled) =>
                update({
                  enabled,
                  type: enabled && animation.type === "none" ? "slideUp" : animation.type,
                })
              }
            />
          </div>

          {animation.enabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lặp liên tục</span>
                <Switch
                  checked={animation.continuous}
                  onChange={(continuous) =>
                    update({
                      continuous,
                      type: continuous ? "pulse" : "slideUp",
                    })
                  }
                />
              </div>

              <PropertyRow label="Kiểu">
                <Select
                  value={type}
                  onChange={(value: AnimationType) => update({ type: value })}
                  className="flex-1"
                  options={[{ value: "none", label: "Không có" }, ...options]}
                />
              </PropertyRow>

              {!animation.continuous && type !== "none" && (
                <>
                  <PropertyRow label="Thời lượng">
                    <Slider
                      value={duration}
                      onChange={(value) => update({ duration: value })}
                      min={0.2}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-10">
                      {duration.toFixed(1)}s
                    </span>
                  </PropertyRow>
                  <PropertyRow label="Độ trễ">
                    <Slider
                      value={animation.delay ?? 0}
                      onChange={(value) => update({ delay: value })}
                      min={0}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-10">
                      {(animation.delay ?? 0).toFixed(1)}s
                    </span>
                  </PropertyRow>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

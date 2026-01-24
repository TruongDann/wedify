import React from "react";
import { Slider } from "antd";
import { PropertyRow } from "./PropertyRow";

interface SliderPropertyProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showInput?: boolean;
  inputWidth?: string;
}

export const SliderProperty: React.FC<SliderPropertyProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showInput = true,
  inputWidth = "w-14",
}) => (
  <PropertyRow label={label}>
    <Slider
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className="flex-1"
    />
    {showInput && (
      <input
        type="number"
        className={`${inputWidth} h-8 text-center bg-gray-100 rounded text-sm`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    )}
  </PropertyRow>
);

"use client";

import React from "react";
import { Slider as AntSlider, InputNumber } from "antd";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showInput?: boolean;
  suffix?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showInput = true,
  suffix = "",
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AntSlider
        className="flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
      {showInput && (
        <InputNumber
          className="w-16"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(val) => onChange(val ?? min)}
          suffix={suffix}
          size="small"
        />
      )}
    </div>
  );
};

export default Slider;

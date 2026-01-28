"use client";

import React, { useState, useRef } from "react";
import { Popover } from "antd";
import { COLOR_PALETTE } from "@/constants/colors";

// Extract color strings from COLOR_PALETTE
const DEFAULT_COLORS = COLOR_PALETTE.filter(c => !c.isTransparent).map(c => c.color);

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showInput?: boolean;
  presetColors?: string[];
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  showInput = true,
  presetColors = DEFAULT_COLORS,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleColorClick = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const content = (
    <div className="w-48">
      <div className="grid grid-cols-6 gap-1 mb-3">
        {presetColors.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
              value === color ? "border-primary" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
          />
        ))}
      </div>
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 cursor-pointer rounded border border-gray-200"
      />
    </div>
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Popover
        content={content}
        trigger="click"
        open={isOpen}
        onOpenChange={setIsOpen}
        placement="bottomLeft"
      >
        <button
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:border-primary transition-colors"
          style={{ backgroundColor: value }}
        />
      </Popover>
      {showInput && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-primary"
          placeholder="#000000"
        />
      )}
    </div>
  );
};

export default ColorPicker;

"use client";

import React from "react";

interface CanvasHeightControlProps {
  height: number;
  onChange: (height: number) => void;
  minHeight?: number;
  step?: number;
}

export const CanvasHeightControl: React.FC<CanvasHeightControlProps> = ({
  height,
  onChange,
  minHeight = 400,
  step = 100,
}) => {
  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
        <button
          className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          onClick={() => onChange(Math.max(minHeight, height - step))}
          title="Giảm chiều dài"
        >
          −
        </button>
        <input
          type="number"
          className="w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
          value={height}
          onChange={(e) => onChange(Number(e.target.value))}
          min={minHeight}
          step={step}
        />
        <span className="text-sm text-gray-500">px</span>
        <button
          className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          onClick={() => onChange(height + step)}
          title="Tăng chiều dài"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CanvasHeightControl;

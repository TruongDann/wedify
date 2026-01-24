import React from "react";

interface PositionGridProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  onPositionChange: (key: "x" | "y", value: number) => void;
  onSizeChange: (key: "width" | "height", value: number) => void;
}

export const PositionGrid: React.FC<PositionGridProps> = ({
  position,
  size,
  onPositionChange,
  onSizeChange,
}) => {
  const fields = [
    {
      label: "X",
      value: position.x,
      onChange: (v: number) => onPositionChange("x", v),
    },
    {
      label: "Y",
      value: position.y,
      onChange: (v: number) => onPositionChange("y", v),
    },
    {
      label: "W",
      value: size.width,
      onChange: (v: number) => onSizeChange("width", v),
    },
    {
      label: "H",
      value: size.height,
      onChange: (v: number) => onSizeChange("height", v),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-3">
      {fields.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 uppercase">{item.label}</span>
          <input
            type="number"
            className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={Math.round(item.value)}
            onChange={(e) => item.onChange(Number(e.target.value) || 0)}
          />
        </div>
      ))}
    </div>
  );
};

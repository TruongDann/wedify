import React from "react";
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";

interface AlignButtonsProps {
  textAlign: "left" | "center" | "right";
  onUpdate: (value: "left" | "center" | "right") => void;
}

export const AlignButtons: React.FC<AlignButtonsProps> = ({
  textAlign,
  onUpdate,
}) => {
  const buttons = [
    { icon: <AlignLeftOutlined />, value: "left" as const },
    { icon: <AlignCenterOutlined />, value: "center" as const },
    { icon: <AlignRightOutlined />, value: "right" as const },
  ];

  return (
    <div className="flex gap-1">
      {buttons.map((btn) => (
        <button
          key={btn.value}
          className={`w-9 h-9 flex items-center justify-center rounded border transition-colors ${
            textAlign === btn.value
              ? "bg-primary/10 border-primary text-primary"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onUpdate(btn.value)}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

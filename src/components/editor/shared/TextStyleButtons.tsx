import React from "react";
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";
import { TextElement } from "@/types/editor";

interface TextStyleButtonsProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

export const TextStyleButtons: React.FC<TextStyleButtonsProps> = ({
  element,
  onUpdate,
}) => {
  const buttons = [
    {
      icon: <BoldOutlined />,
      active: element.fontWeight >= 700,
      onClick: () =>
        onUpdate({ fontWeight: element.fontWeight >= 700 ? 400 : 700 }),
      title: "Đậm",
    },
    {
      icon: <ItalicOutlined />,
      active: element.fontStyle === "italic",
      onClick: () =>
        onUpdate({
          fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
        }),
      title: "Nghiêng",
    },
    {
      icon: <StrikethroughOutlined />,
      active: element.textDecoration === "line-through",
      onClick: () =>
        onUpdate({
          textDecoration:
            element.textDecoration === "line-through" ? "none" : "line-through",
        }),
      title: "Gạch ngang",
    },
    {
      icon: <UnderlineOutlined />,
      active: element.textDecoration === "underline",
      onClick: () =>
        onUpdate({
          textDecoration:
            element.textDecoration === "underline" ? "none" : "underline",
        }),
      title: "Gạch chân",
    },
  ];

  return (
    <div className="flex gap-1 mb-3">
      {buttons.map((btn, i) => (
        <button
          key={i}
          className={`w-9 h-9 flex items-center justify-center rounded border transition-colors ${
            btn.active
              ? "bg-primary/10 border-primary text-primary"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={btn.onClick}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

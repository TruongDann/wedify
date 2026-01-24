"use client";

import React from "react";
import { createShapeElement, useEditorStore } from "@/store/editorStore";
import { ShapeElement } from "@/types/editor";
import { SHAPES } from "@/constants/shapes";

export const ShapesTab: React.FC = () => {
  const { addElement } = useEditorStore();

  const handleAddShape = (shapeType: ShapeElement["shapeType"]) => {
    addElement(createShapeElement(shapeType));
  };

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
        Hình dạng
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {SHAPES.map((shape) => (
          <button
            key={shape.type}
            onClick={() => handleAddShape(shape.type)}
            className="aspect-square rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 p-4 group"
          >
            <div className="text-3xl text-gray-600 group-hover:text-primary transition-colors">
              {shape.icon}
            </div>
            <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
              {shape.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

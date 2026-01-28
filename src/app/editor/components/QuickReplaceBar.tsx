"use client";

import React from "react";
import { PictureOutlined, RightOutlined } from "@ant-design/icons";
import { EditorElement } from "@/types/editor";

interface QuickReplaceBarProps {
  elements: EditorElement[];
}

export const QuickReplaceBar: React.FC<QuickReplaceBarProps> = ({
  elements,
}) => {
  const imageElements = elements.filter((el) => el.type === "image");

  return (
    <div className="h-20 bg-white border-t border-gray-200 flex items-center px-4 gap-3">
      <div className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-primary">
        <span className="text-sm font-medium">Thay ảnh nhanh</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 8l5 5 5-5H5z" />
        </svg>
      </div>
      <div className="flex-1 flex items-center gap-2 overflow-x-auto">
        {imageElements.length > 0
          ? imageElements.map((el) => (
              <div
                key={el.id}
                className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer group shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={(el as { src?: string }).src || ""}
                  alt="Quick replace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <PictureOutlined className="text-white text-xl" />
                </div>
              </div>
            ))
          : [1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer group shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/100/100?random=${i}`}
                  alt={`Quick ${i}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <PictureOutlined className="text-white text-xl" />
                </div>
              </div>
            ))}
      </div>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
        <RightOutlined className="text-gray-500" />
      </div>
    </div>
  );
};

export default QuickReplaceBar;

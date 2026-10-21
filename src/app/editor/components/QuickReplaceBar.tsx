"use client";

import React, { useState } from "react";
import { Tooltip } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { ChevronDown, ImagePlay } from "lucide-react";
import { EditorElement, ImageElement } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";

interface QuickReplaceBarProps {
  elements: EditorElement[];
}

// Thumbnail component cho mỗi ảnh
interface ImageThumbnailProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  src,
  alt,
  onClick,
}) => (
  <Tooltip title="Click để chọn ảnh này">
    <div
      onClick={onClick}
      className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-ink cursor-pointer group shrink-0 transition-all bg-surface-muted"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="block w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <PictureOutlined className="text-white text-xl" />
      </div>
    </div>
  </Tooltip>
);

export const QuickReplaceBar: React.FC<QuickReplaceBarProps> = ({
  elements,
}) => {
  const { selectElement } = useEditorStore();
  const imageElements = elements.filter(
    (el) => el.type === "image",
  ) as ImageElement[];

  const [open, setOpen] = useState(true);

  const handleImageClick = (elementId: string) => {
    selectElement(elementId);
  };

  return (
    <div
      className={`pointer-events-auto w-full overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-[max-width,padding] duration-300 ease-out ${
        open ? "max-w-full px-3 py-2" : "max-w-[200px] px-2.5 py-2"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-ink"
          aria-expanded={open}
        >
          <ImagePlay size={14} />
          Thay ảnh nhanh
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <span
          className={`whitespace-nowrap text-xs text-ink-2 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {imageElements.length} ảnh
        </span>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {imageElements.length > 0 ? (
              imageElements.map((el) => (
                <ImageThumbnail
                  key={el.id}
                  src={el.src}
                  alt="Quick replace"
                  onClick={() => handleImageClick(el.id)}
                />
              ))
            ) : (
              <span className="py-4 text-xs text-ink-2">
                Chưa có ảnh nào trong thiệp
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickReplaceBar;

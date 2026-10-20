"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createImageElement, useEditorStore } from "@/store/editorStore";
import { GRAPHIC_CATEGORIES, getGraphicUrls } from "@/constants/graphics";

type CategoryId = string;

const ALL = "all";

const CHIPS: { id: CategoryId; label: string }[] = [
  { id: ALL, label: "Tất cả" },
  ...GRAPHIC_CATEGORIES,
];

const PREVIEW_COUNT = 6;
const PAGE_SIZE = 60;
const MAX_INSERT_SIZE = 200;

const SECTION_TITLE =
  "text-xs font-semibold text-gray-500 uppercase tracking-wider";
const TILE =
  "aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50";

export const StockTab: React.FC = () => {
  const { addElement } = useEditorStore();
  const [selected, setSelected] = useState<CategoryId>(ALL);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const selectCategory = (id: CategoryId) => {
    setSelected(id);
    setVisibleCount(PAGE_SIZE);
  };

  const handleAddGraphic = (src: string, alt: string) => {
    const insert = (width: number, height: number) => {
      const scale = Math.min(1, MAX_INSERT_SIZE / Math.max(width, height));
      addElement(
        createImageElement(src, {
          alt,
          size: {
            width: Math.max(1, Math.round(width * scale)),
            height: Math.max(1, Math.round(height * scale)),
          },
          objectFit: "contain",
        }),
      );
    };
    const img = new Image();
    img.onload = () => insert(img.naturalWidth || 150, img.naturalHeight || 150);
    img.onerror = () => insert(150, 150);
    img.src = src;
  };

  const renderGraphicTile = (src: string, label: string, index: number) => (
    <button
      key={src}
      type="button"
      title={label}
      className={TILE}
      onClick={() => handleAddGraphic(src, `${label} ${index + 1}`)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${label} ${index + 1}`}
        loading="lazy"
        decoding="async"
        className="max-w-full max-h-full object-contain"
      />
    </button>
  );

  const renderSectionHeader = (id: CategoryId, label: string) => (
    <div className="flex items-center justify-between mb-3">
      <h3 className={SECTION_TITLE}>{label}</h3>
      <button
        type="button"
        className="text-sm text-gray-500 hover:text-primary"
        onClick={() => selectCategory(id)}
      >
        Xem thêm
      </button>
    </div>
  );

  const renderDetail = () => {
    const label = CHIPS.find((c) => c.id === selected)?.label ?? "";
    const header = (
      <div className="flex items-center justify-between mb-3">
        <h3 className={SECTION_TITLE}>{label}</h3>
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
          onClick={() => selectCategory(ALL)}
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );

    const urls = getGraphicUrls(selected);
    return (
      <div className="mb-6">
        {header}
        <div className="grid grid-cols-3 gap-2">
          {urls
            .slice(0, visibleCount)
            .map((src, i) => renderGraphicTile(src, label, i))}
        </div>
        {visibleCount < urls.length && (
          <button
            type="button"
            className="mt-4 w-full py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Tải thêm ({urls.length - visibleCount})
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category chips */}
      <div className="border-b border-gray-100 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {CHIPS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`px-3 py-1.5 text-sm rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                selected === cat.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {selected === ALL ? (
          <>
            {GRAPHIC_CATEGORIES.map((cat) => (
              <div key={cat.id} className="mb-6">
                {renderSectionHeader(cat.id, cat.label)}
                <div className="grid grid-cols-3 gap-2">
                  {getGraphicUrls(cat.id)
                    .slice(0, PREVIEW_COUNT)
                    .map((src, i) => renderGraphicTile(src, cat.label, i))}
                </div>
              </div>
            ))}
          </>
        ) : (
          renderDetail()
        )}
      </div>
    </div>
  );
};

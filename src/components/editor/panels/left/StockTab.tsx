"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { createImageElement, useEditorStore } from "@/store/editorStore";
import { GRAPHIC_CATEGORIES, getGraphicUrls } from "@/constants/graphics";
import { Chip, ChipRow, LinkButton, SectionTitle } from "./ui";
import { EXTRA_STOCK_CATEGORIES, ExtraStock } from "./StockExtras";

type CategoryId = string;

const ALL = "all";

const CHIPS: { id: CategoryId; label: string }[] = [
  { id: ALL, label: "Tất cả" },
  ...GRAPHIC_CATEGORIES,
  // Kho bổ sung của Wedify: ảnh động, hình động, sticker, khung viền, nền họa tiết, kết hợp chữ
  ...EXTRA_STOCK_CATEGORIES,
];

const PREVIEW_COUNT = 6;
const PAGE_SIZE = 60;
const MAX_INSERT_SIZE = 200;

const TILE =
  "aspect-square rounded-[10px] overflow-hidden cursor-pointer border border-transparent bg-surface-muted hover:border-line-strong transition-colors p-2.5 flex items-center justify-center";

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
    <SectionTitle
      title={label}
      action={
        <LinkButton onClick={() => selectCategory(id)}>Xem tất cả</LinkButton>
      }
    />
  );

  const renderDetail = () => {
    const label = CHIPS.find((c) => c.id === selected)?.label ?? "";
    const header = (
      <SectionTitle
        title={label}
        action={
          <LinkButton onClick={() => selectCategory(ALL)}>
            <ChevronLeft size={14} /> Quay lại
          </LinkButton>
        }
      />
    );

    const urls = getGraphicUrls(selected);
    return (
      <section>
        {header}
        <div className="grid grid-cols-3 gap-2">
          {urls
            .slice(0, visibleCount)
            .map((src, i) => renderGraphicTile(src, label, i))}
        </div>
        {visibleCount < urls.length && (
          <button
            type="button"
            className="mt-4 w-full h-9 text-[13px] font-semibold rounded-full border border-line-strong text-ink hover:bg-surface-muted transition-colors"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Tải thêm ({urls.length - visibleCount})
          </button>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category chips */}
      <div className="px-4 pt-2 pb-3 shrink-0">
        <ChipRow>
          {CHIPS.map((cat) => (
            <Chip
              key={cat.id}
              active={selected === cat.id}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-8 flex flex-col gap-5">
        {EXTRA_STOCK_CATEGORIES.some((cat) => cat.id === selected) ? (
          <ExtraStock category={selected} onBack={() => selectCategory(ALL)} />
        ) : selected === ALL ? (
          <>
            {GRAPHIC_CATEGORIES.map((cat) => (
              <section key={cat.id}>
                {renderSectionHeader(cat.id, cat.label)}
                <div className="grid grid-cols-3 gap-2">
                  {getGraphicUrls(cat.id)
                    .slice(0, PREVIEW_COUNT)
                    .map((src, i) => renderGraphicTile(src, cat.label, i))}
                </div>
              </section>
            ))}
          </>
        ) : (
          renderDetail()
        )}
      </div>
    </div>
  );
};

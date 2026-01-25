"use client";

import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Dropdown } from "antd";
import {
  createImageElement,
  createShapeElement,
  useEditorStore,
} from "@/store/editorStore";
import { STICKERS, STOCK_IMAGES } from "@/constants/assets";
import { SHAPES } from "@/constants/shapes";
import { ShapeElement } from "@/types/editor";

type CategoryType =
  | "all"
  | "wedding-elements"
  | "people"
  | "flowers"
  | "shapes"
  | "notes"
  | "hearts";

const CATEGORIES = [
  { id: "all" as CategoryType, label: "Tất cả" },
  { id: "wedding-elements" as CategoryType, label: "Yếu tố đám cưới" },
  { id: "people" as CategoryType, label: "Nhân vật" },
  { id: "flowers" as CategoryType, label: "Hoa cưới" },
  { id: "shapes" as CategoryType, label: "Hình dạng" },
  { id: "notes" as CategoryType, label: "Chủ hý" },
  { id: "hearts" as CategoryType, label: "Trái tim" },
];

export const StockTab: React.FC = () => {
  const { addElement } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");

  const handleAddSticker = (src: string) => {
    addElement(
      createImageElement(src, {
        size: { width: 80, height: 80 },
      }),
    );
  };

  const handleAddStockImage = (src: string) => {
    addElement(createImageElement(src, { size: { width: 200, height: 200 } }));
  };

  const handleAddShape = (shapeType: ShapeElement["shapeType"]) => {
    addElement(createShapeElement(shapeType));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Filter Tabs */}
      <div className="border-b border-gray-100 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.slice(0, 2).map((cat) => (
            <button
              key={cat.id}
              className={`px-3 py-1.5 text-sm rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
          <Dropdown
            menu={{
              items: CATEGORIES.slice(2).map((cat) => ({
                key: cat.id,
                label: cat.label,
                onClick: () => setSelectedCategory(cat.id),
              })),
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button
              className="px-2 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1 flex-shrink-0"
              aria-label="Xem thêm danh mục"
            >
              <MoreHorizontal size={16} />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Show all sections when "Tất cả" is selected */}
        {selectedCategory === "all" && (
          <>
            {/* Yếu tố đám cưới Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Yếu tố đám cưới
                </h3>
                <button className="text-sm text-gray-500 hover:text-primary">
                  Xem thêm
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {STICKERS.slice(0, 6).map((sticker) => (
                  <div
                    key={sticker.id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                    onClick={() => handleAddSticker(sticker.src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sticker.src}
                      alt={`Sticker ${sticker.id}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Nhân vật Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nhân vật
                </h3>
                <button className="text-sm text-gray-500 hover:text-primary">
                  Xem thêm
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {STOCK_IMAGES.slice(0, 3).map((src, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-gray-50"
                    onClick={() => handleAddStockImage(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Person ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hình dạng Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hình dạng
                </h3>
                <button className="text-sm text-gray-500 hover:text-primary">
                  Xem thêm
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {SHAPES.slice(0, 6).map((shape) => (
                  <button
                    key={shape.type}
                    onClick={() => handleAddShape(shape.type)}
                    className="aspect-square rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 p-3 group bg-gray-50"
                  >
                    <div className="text-2xl text-gray-600 group-hover:text-primary transition-colors">
                      {shape.icon}
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
                      {shape.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Yếu tố đám cưới category */}
        {selectedCategory === "wedding-elements" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Yếu tố đám cưới
              </h3>
              <button className="text-sm text-gray-500 hover:text-primary">
                Xem thêm
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.map((sticker) => (
                <div
                  key={sticker.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                  onClick={() => handleAddSticker(sticker.src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sticker.src}
                    alt={`Sticker ${sticker.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nhân vật category */}
        {selectedCategory === "people" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nhân vật
              </h3>
              <button className="text-sm text-gray-500 hover:text-primary">
                Xem thêm
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_IMAGES.map((src, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-gray-50"
                  onClick={() => handleAddStockImage(src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Person ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hoa cưới category */}
        {selectedCategory === "flowers" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">
                Hoa cưới
              </h3>
              <button className="text-sm text-gray-500 hover:text-primary">
                Xem thêm
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.slice(0, 9).map((sticker) => (
                <div
                  key={sticker.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                  onClick={() => handleAddSticker(sticker.src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sticker.src}
                    alt={`Flower ${sticker.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hình dạng category */}
        {selectedCategory === "shapes" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hình dạng
              </h3>
              <button className="text-sm text-gray-500 hover:text-primary">
                Xem thêm
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SHAPES.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => handleAddShape(shape.type)}
                  className="aspect-square rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 p-3 group bg-gray-50"
                >
                  <div className="text-2xl text-gray-600 group-hover:text-primary transition-colors">
                    {shape.icon}
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
                    {shape.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chủ hý category */}
        {selectedCategory === "notes" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Chủ hý
              </h3>
              <button className="text-sm text-gray-500 hover:text-primary">
                Xem thêm
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SHAPES.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => handleAddShape(shape.type)}
                  className="aspect-square rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 p-3 group bg-gray-50"
                >
                  <div className="text-2xl text-gray-600 group-hover:text-primary transition-colors">
                    {shape.icon}
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
                    {shape.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trái tim category */}
        {selectedCategory === "hearts" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">
                Trái tim
              </h3>
              <button className="text-sm text-gray-500 hover:text-primary">
                Xem thêm
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.slice(0, 12).map((sticker) => (
                <div
                  key={sticker.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center bg-gray-50"
                  onClick={() => handleAddSticker(sticker.src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sticker.src}
                    alt={`Heart ${sticker.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

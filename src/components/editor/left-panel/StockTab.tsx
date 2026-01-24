"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "antd";
import { createImageElement, useEditorStore } from "@/store/editorStore";
import { STICKERS, STOCK_IMAGES } from "@/constants/assets";

export const StockTab: React.FC = () => {
  const { addElement } = useEditorStore();
  const [stockSubTab, setStockSubTab] = useState<string>("stickers");

  const handleAddSticker = (src: string) => {
    addElement(
      createImageElement(src, {
        size: { width: 80, height: 80 },
      })
    );
  };

  const handleAddStockImage = (src: string) => {
    addElement(createImageElement(src, { size: { width: 200, height: 200 } }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs: Sticker / Ảnh Stock */}
      <div className="border-b border-gray-100">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              stockSubTab === "stickers"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setStockSubTab("stickers")}
          >
            Sticker
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              stockSubTab === "photos"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setStockSubTab("photos")}
          >
            Ảnh Stock
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 pb-3">
        <Input
          prefix={<Search size={18} className="text-gray-400" />}
          placeholder={
            stockSubTab === "stickers"
              ? "Tìm kiếm sticker..."
              : "Tìm kiếm ảnh stock..."
          }
          className="rounded-full !py-2 !px-4 !border-gray-200"
          style={{ backgroundColor: "white" }}
        />
      </div>

      {/* Content based on sub-tab */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {stockSubTab === "stickers" && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
              Sticker đám cưới
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {STICKERS.map((sticker) => (
                <div
                  key={sticker.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center"
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

        {stockSubTab === "photos" && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
              Ảnh cưới
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {STOCK_IMAGES.map((src, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                  onClick={() => handleAddStockImage(src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Stock ${index + 1}`}
                    className="w-full h-full object-cover"
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

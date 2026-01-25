"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button, Upload } from "antd";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { useEditorStore } from "@/store/editorStore";
import { COLOR_PALETTE, GRADIENT_PALETTE } from "@/constants/colors";
import { STOCK_IMAGES } from "@/constants/assets";

export const BackgroundTab: React.FC = () => {
  const { setCanvasSettings, canvasSettings } = useEditorStore();
  const [bgSubTab, setBgSubTab] = useState<string>("color");

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCanvasSettings({ backgroundImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs: Màu nền / Hình nền */}
      <div className="border-b border-gray-100">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bgSubTab === "color"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setBgSubTab("color")}
          >
            Màu nền
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bgSubTab === "image"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setBgSubTab("image")}
          >
            Hình nền
          </button>
        </div>
      </div>

      {/* Content based on sub-tab */}
      <div className="flex-1 overflow-y-auto">
        {bgSubTab === "color" && (
          <div className="p-4">
            {/* Current Background Color */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Màu nền hiện tại
              </h3>
              <div
                className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                style={{
                  backgroundColor:
                    canvasSettings.backgroundColor === "transparent"
                      ? undefined
                      : canvasSettings.backgroundColor,
                  backgroundImage:
                    canvasSettings.backgroundColor === "transparent"
                      ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                      : canvasSettings.backgroundColor?.startsWith(
                            "linear-gradient"
                          )
                        ? canvasSettings.backgroundColor
                        : undefined,
                  backgroundSize:
                    canvasSettings.backgroundColor === "transparent"
                      ? "8px 8px"
                      : undefined,
                  backgroundPosition:
                    canvasSettings.backgroundColor === "transparent"
                      ? "0 0, 0 4px, 4px -4px, -4px 0px"
                      : undefined,
                }}
              />
            </div>

            {/* Default Colors */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Màu nền mặc định
              </h3>
              <p className="text-sm text-gray-500 mb-3">Màu đơn</p>

              <div className="grid grid-cols-6 gap-2">
                {COLOR_PALETTE.map((item, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                      canvasSettings.backgroundColor === item.color
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    style={{
                      backgroundColor: item.isTransparent
                        ? undefined
                        : item.color,
                      backgroundImage: item.isTransparent
                        ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                        : undefined,
                      backgroundSize: "8px 8px",
                      backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                    }}
                    onClick={() =>
                      setCanvasSettings({ backgroundColor: item.color })
                    }
                  />
                ))}
              </div>
            </div>

            {/* Gradient Colors */}
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-3">Màu nền gradient</p>

              <div className="grid grid-cols-6 gap-2">
                {GRADIENT_PALETTE.map((item, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                      canvasSettings.backgroundColor === item.gradient
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    style={{
                      backgroundImage: item.gradient,
                    }}
                    onClick={() =>
                      setCanvasSettings({ backgroundColor: item.gradient })
                    }
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Picker - Inline */}
            <div className="pt-4 border-t border-gray-100">
              <div className="color-picker-wrapper">
                <HexColorPicker
                  color={
                    canvasSettings.backgroundColor === "transparent" ||
                    canvasSettings.backgroundColor?.startsWith("linear-gradient")
                      ? "#6F42A3"
                      : canvasSettings.backgroundColor
                  }
                  onChange={(color) =>
                    setCanvasSettings({ backgroundColor: color })
                  }
                  style={{ width: "100%" }}
                />
                <div className="flex items-center gap-3 mt-4">
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm shrink-0"
                    style={{
                      backgroundColor:
                        canvasSettings.backgroundColor === "transparent" ||
                        canvasSettings.backgroundColor?.startsWith(
                          "linear-gradient"
                        )
                          ? "#6F42A3"
                          : canvasSettings.backgroundColor,
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        HEX
                      </span>
                      <HexColorInput
                        color={
                          canvasSettings.backgroundColor === "transparent" ||
                          canvasSettings.backgroundColor?.startsWith(
                            "linear-gradient"
                          )
                            ? "6F42A3"
                            : canvasSettings.backgroundColor?.replace("#", "")
                        }
                        onChange={(color) =>
                          setCanvasSettings({ backgroundColor: `#${color}` })
                        }
                        prefixed
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {bgSubTab === "image" && (
          <div className="p-4">
            {/* Upload Background Button */}
            <div className="mb-4">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleBackgroundUpload}
                className="block w-full [&_.ant-upload]:w-full"
              >
                <Button
                  type="primary"
                  size="large"
                  className="!font-medium !text-sm !rounded-lg h-11 !w-full"
                >
                  Tải ảnh nền
                </Button>
              </Upload>
            </div>

            {/* Current Background Image */}
            {canvasSettings.backgroundImage && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  Ảnh nền hiện tại
                </h3>
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={canvasSettings.backgroundImage}
                    alt="Current background"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                  <button
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg backdrop-blur-sm"
                    onClick={() => setCanvasSettings({ backgroundImage: null })}
                    title="Xóa ảnh nền"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Stock Background Images */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Hình nền mẫu
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {STOCK_IMAGES.map((src, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                    onClick={() => setCanvasSettings({ backgroundImage: src })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

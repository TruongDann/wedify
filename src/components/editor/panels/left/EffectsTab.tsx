"use client";

import React from "react";
import { ThunderboltOutlined } from "@ant-design/icons";
import { ANIMATION_EFFECTS } from "@/data/animationEffects";

export const EffectsTab: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<
    "animation" | "open" | "raster"
  >("animation");

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "animation"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("animation")}
        >
          Hiệu ứng động
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "open"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("open")}
        >
          Hiệu ứng mở màn
        </button>
      </div>

      {/* Raster Tab */}
      {activeTab === "animation" && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Hiệu ứng rơi
          </h3>

          {/* Effects Grid */}
          <div className="grid grid-cols-2 gap-3">
            {ANIMATION_EFFECTS.map((effect) => (
              <div
                key={effect.id}
                className="bg-white border border-gray-200 hover:border-primary rounded-lg p-4 cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-center aspect-square"
              >
                <div className="text-center">
                  {typeof effect.icon === "string" ? (
                    <div className="text-2xl mb-2 text-gray-400">
                      {effect.icon}
                    </div>
                  ) : (
                    <div className="mb-2">{effect.icon}</div>
                  )}
                  <div className="text-sm font-medium text-gray-800">
                    {effect.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Button */}
          <button className="w-full mt-4 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
            <ThunderboltOutlined />
            Xem trước hiệu ứng
          </button>
        </div>
      )}

      {activeTab === "open" && (
        <div className="text-center py-8 text-gray-500">
          <ThunderboltOutlined className="text-4xl mb-2" />
          <p>Hiệu ứng mở màn sắp ra mắt</p>
        </div>
      )}
    </div>
  );
};

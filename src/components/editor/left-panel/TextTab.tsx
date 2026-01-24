"use client";

import React from "react";
import { Search, Type } from "lucide-react";
import { Button, Input } from "antd";
import { createTextElement, useEditorStore } from "@/store/editorStore";

export const TextTab: React.FC = () => {
  const { addElement } = useEditorStore();

  const handleAddText = (
    options: {
      fontSize?: number;
      fontWeight?: number;
      content?: string;
    } = {}
  ) => {
    addElement(createTextElement(options));
  };

  return (
    <div className="p-4 space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <Input
          prefix={<Search size={18} className="text-gray-400" />}
          placeholder="Tìm kiếm font và mẫu..."
          className="rounded-xl !py-2 !px-3 !border-gray-200"
          style={{ backgroundColor: "white" }}
        />
      </div>

      {/* Main Add Button */}
      <Button
        type="primary"
        block
        size="large"
        onClick={() => handleAddText()}
        className="!font-medium !text-sm !rounded-md flex items-center justify-center h-10 shadow-sm"
        icon={<Type size={18} className="mr-1" />}
      >
        Thêm hộp văn bản
      </Button>

      {/* Default Text Styles */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Kiểu mặc định
        </h3>
        <div className="space-y-3">
          {/* Heading */}
          <div
            className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center group"
            onClick={() =>
              handleAddText({
                content: "Thêm tiêu đề",
                fontSize: 32,
                fontWeight: 700,
              })
            }
          >
            <h1 className="text-2xl font-bold text-gray-800 w-full group-hover:text-black transition-colors">
              Thêm tiêu đề
            </h1>
          </div>

          {/* Subheading */}
          <div
            className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center group"
            onClick={() =>
              handleAddText({
                content: "Thêm tiêu đề phụ",
                fontSize: 24,
                fontWeight: 600,
              })
            }
          >
            <h2 className="text-lg font-semibold text-gray-700 w-full group-hover:text-black transition-colors">
              Thêm tiêu đề phụ
            </h2>
          </div>

          {/* Body Text */}
          <div
            className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-all flex items-center group"
            onClick={() =>
              handleAddText({
                content: "Thêm văn bản nội dung",
                fontSize: 16,
                fontWeight: 400,
              })
            }
          >
            <p className="text-sm text-gray-600 w-full group-hover:text-gray-900 transition-colors">
              Thêm văn bản nội dung
            </p>
          </div>
        </div>
      </div>

      {/* Text Templates - placeholder for future expansion */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Mẫu văn bản
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Templates will be rendered here */}
        </div>
      </div>
    </div>
  );
};

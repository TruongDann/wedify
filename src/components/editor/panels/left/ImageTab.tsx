"use client";

import React, { useState } from "react";
import { Upload as UploadIcon } from "lucide-react";
import { Upload } from "antd";
import { createImageElement, useEditorStore } from "@/store/editorStore";
import { STOCK_IMAGES, stockThumb } from "@/constants/assets";
import { SectionTitle } from "./ui";

const MAX_UPLOAD = 15;
const MAX_INSERT_WIDTH = 300;

const TILE =
  "aspect-square rounded-[10px] overflow-hidden border border-line bg-surface-muted hover:border-line-strong transition-colors";

export const ImageTab: React.FC = () => {
  const { addElement } = useEditorStore();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Thêm ảnh vào thiệp, giữ tỉ lệ và giới hạn chiều rộng
  const addImage = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      const width = Math.min(img.width, MAX_INSERT_WIDTH);
      const height = width / ratio;
      addElement(createImageElement(src, { size: { width, height } }));
    };
    img.src = src;
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setUploadedImages((prev) => [src, ...prev].slice(0, MAX_UPLOAD));
    };
    reader.readAsDataURL(file);
    return false;
  };

  const renderTile = (src: string, alt: string) => (
    <button
      key={alt}
      type="button"
      title="Thêm vào thiệp"
      className={TILE}
      onClick={() => addImage(src)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={stockThumb(src)}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
      />
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Khu tải ảnh */}
      <div className="px-4 pt-2 pb-3 border-b border-line">
        <Upload.Dragger
          accept="image/*"
          multiple
          maxCount={MAX_UPLOAD}
          showUploadList={false}
          beforeUpload={handleUpload}
          className="block [&_.ant-upload-drag]:rounded-[10px]! [&_.ant-upload-drag]:border-line-strong! [&_.ant-upload-drag]:bg-surface-subtle! [&_.ant-upload-btn]:py-3! [&_.ant-upload-btn]:px-4!"
        >
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink">
            <UploadIcon size={16} />
            Tải ảnh lên
          </div>
          <div className="text-xs text-ink-3 mt-0.5">
            hoặc kéo tối đa {MAX_UPLOAD} ảnh vào đây
          </div>
        </Upload.Dragger>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-8 flex flex-col gap-5">
        {uploadedImages.length > 0 && (
          <section>
            <SectionTitle title={`Ảnh của bạn (${uploadedImages.length})`} />
            <div className="grid grid-cols-3 gap-2">
              {uploadedImages.map((src, i) => renderTile(src, `Ảnh ${i + 1}`))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle title="Thư viện ảnh" />
          <div className="grid grid-cols-3 gap-2">
            {STOCK_IMAGES.map((src, i) =>
              renderTile(src, `Ảnh thư viện ${i + 1}`),
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

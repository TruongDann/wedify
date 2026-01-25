"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button, Upload, Input, Tabs } from "antd";
import {
  PictureOutlined,
  AppstoreOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { createImageElement, useEditorStore } from "@/store/editorStore";

export const ImageTab: React.FC = () => {
  const { addElement } = useEditorStore();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageSubTab, setImageSubTab] = useState<string>("images");

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 300;
        const ratio = img.width / img.height;
        const width = Math.min(img.width, maxWidth);
        const height = width / ratio;
        addElement(createImageElement(src, { size: { width, height } }));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleImageUpload2 = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 300;
      const ratio = img.width / img.height;
      const width = Math.min(img.width, maxWidth);
      const height = width / ratio;
      addElement(createImageElement(src, { size: { width, height } }));
    };
    img.src = src;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <Input
          prefix={<Search size={18} className="text-gray-400" />}
          placeholder="Tìm kiếm từ khóa, thẻ, màu sắc"
          className="rounded-full !py-2 !px-4 !border-gray-200"
          style={{ backgroundColor: "white" }}
        />
      </div>

      {/* Upload Button */}
      <div className="px-4 pb-2">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              setUploadedImages((prev) => [src, ...prev]);
            };
            reader.readAsDataURL(file);
            return false;
          }}
          className="block w-full [&_.ant-upload]:w-full"
        >
          <Button
            type="primary"
            size="large"
            className="!font-medium !text-sm !rounded-lg flex items-center justify-center h-11 !w-full"
          >
            Tải lên tệp
          </Button>
        </Upload>
      </div>

      {/* Record Yourself Button */}
      <div className="px-4 pb-3">
        <Button
          block
          size="large"
          className="!font-medium !text-sm !rounded-lg h-11 flex items-center justify-center"
        >
          Tự quay video
        </Button>
      </div>

      {/* Tabs: Images, Designs, Folders */}
      <div className="px-4 border-b border-gray-100">
        <Tabs
          activeKey={imageSubTab}
          onChange={setImageSubTab}
          items={[
            {
              key: "images",
              label: (
                <span className="flex items-center gap-1">
                  <PictureOutlined />
                  Hình ảnh
                </span>
              ),
            },
            {
              key: "designs",
              label: (
                <span className="flex items-center gap-1">
                  <AppstoreOutlined />
                  Thiết kế
                </span>
              ),
            },
            {
              key: "folders",
              label: (
                <span className="flex items-center gap-1">
                  <FolderOutlined />
                  Thư mục
                </span>
              ),
            },
          ]}
          className="!mb-0"
          size="small"
        />
      </div>

      {/* Content based on sub-tab */}
      <div className="flex-1 overflow-y-auto p-4">
        {imageSubTab === "images" && (
          <>
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((src, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors bg-gray-100"
                    onClick={() => handleImageUpload2(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <PictureOutlined className="text-4xl mb-3" />
                <p className="text-sm text-center">
                  Tải lên hình ảnh để xem tại đây
                </p>
              </div>
            )}
          </>
        )}

        {imageSubTab === "designs" && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AppstoreOutlined className="text-4xl mb-3" />
            <p className="text-sm text-center">
              Thiết kế của bạn sẽ hiển thị tại đây
            </p>
          </div>
        )}

        {imageSubTab === "folders" && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FolderOutlined className="text-4xl mb-3" />
            <p className="text-sm text-center">
              Sắp xếp tệp của bạn vào thư mục
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

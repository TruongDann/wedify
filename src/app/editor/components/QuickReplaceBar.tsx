"use client";

import React from "react";
import { Button, Dropdown, Image, Tooltip } from "antd";
import {
  PictureOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";
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
      className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer group shrink-0 transition-all"
    >
      <Image
        src={src}
        alt={alt}
        preview={false}
        className="!w-full !h-full object-cover"
        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesAbfO+O6kAADIHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPg0KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPg0KICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiDQogICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iDQogICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyINCiAgICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiDQogICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iDQogICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iPg=="
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

  const handleImageClick = (elementId: string) => {
    selectElement(elementId);
  };

  const dropdownItems = [
    { key: "all", label: "Tất cả ảnh" },
    { key: "selected", label: "Ảnh đã chọn" },
  ];

  return (
    <div className="h-20 bg-white border-t border-gray-200 flex items-center px-4 gap-3">
      <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
        <Button type="text" className="flex items-center gap-1 text-gray-600">
          <span className="text-sm font-medium">Thay ảnh nhanh</span>
          <DownOutlined className="text-xs" />
        </Button>
      </Dropdown>

      <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {imageElements.length > 0
          ? imageElements.map((el) => (
              <ImageThumbnail
                key={el.id}
                src={el.src}
                alt="Quick replace"
                onClick={() => handleImageClick(el.id)}
              />
            ))
          : [1, 2, 3, 4, 5, 6, 7].map((i) => (
              <ImageThumbnail
                key={i}
                src={`https://picsum.photos/100/100?random=${i}`}
                alt={`Quick ${i}`}
              />
            ))}
      </div>

      <Tooltip title="Xem thêm">
        <Button
          type="text"
          shape="circle"
          icon={<RightOutlined className="text-gray-500" />}
          className="bg-gray-100 hover:bg-gray-200"
        />
      </Tooltip>
    </div>
  );
};

export default QuickReplaceBar;

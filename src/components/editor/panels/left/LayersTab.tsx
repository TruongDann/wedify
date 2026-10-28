"use client";

import React, { useState } from "react";
import { Tooltip } from "antd";
import {
  GripVertical,
  Group,
  Lock,
  LockOpen,
  Shapes,
  Sparkles,
  Type,
  Wrench,
  CalendarDays,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { EditorElement } from "@/types/editor";

const WIDGET_LABELS: Record<string, string> = {
  calendar: "Lịch",
  countdown: "Đếm ngược",
  rsvp: "Xác nhận tham dự",
  map: "Bản đồ",
  call: "Nút gọi",
  reminder: "Lời nhắc lịch",
  youtube: "Video YouTube",
  slideshow: "Trình chiếu ảnh",
  album: "Album ảnh",
  giftQr: "QR mừng cưới",
  guestName: "Tên khách mời",
};

const TOOL_LABELS: Record<string, string> = {
  contactCard: "Thẻ liên hệ",
  guestbook: "Sổ lưu bút",
};

const SHAPE_LABELS: Record<string, string> = {
  rectangle: "Hình chữ nhật",
  circle: "Hình tròn",
  triangle: "Tam giác",
  heart: "Trái tim",
  star: "Ngôi sao",
  line: "Đường kẻ",
  diamond: "Hình thoi",
  pentagon: "Ngũ giác",
  hexagon: "Lục giác",
  arrow: "Mũi tên",
  cloud: "Đám mây",
  speechBubble: "Bong bóng thoại",
  cross: "Dấu cộng",
  ring: "Vòng tròn",
};

/** Tên hiển thị của một lớp */
const layerName = (el: EditorElement): string => {
  switch (el.type) {
    case "text":
      return el.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "Văn bản trống";
    case "image":
      return el.alt && el.alt !== "Image" ? el.alt : "Hình ảnh";
    case "shape":
      return SHAPE_LABELS[el.shapeType] ?? "Hình dạng";
    case "widget":
      return WIDGET_LABELS[el.widget] ?? "Tiện ích";
    case "tool":
      return TOOL_LABELS[el.tool] ?? "Tiện ích";
    default:
      return "Sticker";
  }
};

const LayerThumb: React.FC<{ element: EditorElement }> = ({ element }) => {
  if (element.type === "image" || element.type === "sticker") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- ảnh thu nhỏ của phần tử (data URL / URL ngoài)
      <img src={element.src} alt="" className="w-full h-full object-contain" />
    );
  }
  const Icon =
    element.type === "text"
      ? Type
      : element.type === "shape"
        ? Shapes
        : element.type === "widget"
          ? CalendarDays
          : element.type === "tool"
            ? Wrench
            : Sparkles;
  return <Icon size={16} strokeWidth={1.6} className="text-ink-3" />;
};

/** Danh sách lớp: bấm để chọn (Ctrl/Shift để chọn thêm), kéo để đổi thứ tự, khóa vị trí. */
export const LayersTab: React.FC = () => {
  const {
    elements,
    selectedElementId,
    selectedElementIds,
    selectElement,
    toggleSelection,
    updateElement,
    reorderLayers,
  } = useEditorStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Trên cùng của thiệp đứng đầu danh sách
  const layers = [...elements].sort((a, b) => b.zIndex - a.zIndex);
  const isSelected = (id: string) =>
    selectedElementIds.includes(id) || selectedElementId === id;

  const handleClick = (e: React.MouseEvent, id: string) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) toggleSelection(id);
    else selectElement(id);
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = layers.map((el) => el.id).filter((id) => id !== dragId);
    ids.splice(ids.indexOf(targetId), 0, dragId);
    reorderLayers(ids);
  };

  if (layers.length === 0) {
    return (
      <p className="px-4 py-6 text-[13px] text-ink-3 text-center">
        Thiệp chưa có phần tử nào.
      </p>
    );
  }

  return (
    <ul className="px-3 pb-4 space-y-1">
      {layers.map((el, index) => {
        const selected = isSelected(el.id);
        const inGroup =
          !!el.groupId &&
          layers.filter((l) => l.groupId === el.groupId).length > 1;
        // Dòng tiêu đề trước phần tử đầu tiên của mỗi đoạn lớp cùng nhóm
        const startsGroup =
          inGroup && layers[index - 1]?.groupId !== el.groupId;
        const groupSize = startsGroup
          ? layers.filter((l) => l.groupId === el.groupId).length
          : 0;
        return (
          <React.Fragment key={el.id}>
          {startsGroup && (
            <li
              onClick={() => selectElement(el.id)}
              className={`flex items-center gap-2 h-8 px-2 rounded-lg cursor-pointer select-none text-[13px] font-medium text-ink ${
                selected ? "bg-surface-muted" : "hover:bg-surface-subtle"
              }`}
            >
              <Group size={14} className="text-ink-3" />
              Nhóm ({groupSize})
            </li>
          )}
          <li
            draggable
            onDragStart={(e) => {
              setDragId(el.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverId(el.id);
            }}
            onDragLeave={() => setOverId((id) => (id === el.id ? null : id))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(el.id);
              setDragId(null);
              setOverId(null);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            onClick={(e) => handleClick(e, el.id)}
            className={`group flex items-center gap-2 h-11 pl-1 pr-1.5 rounded-lg border cursor-pointer select-none transition-colors ${
              inGroup ? "ml-4" : ""
            } ${
              selected
                ? "border-link bg-surface-muted"
                : "border-transparent hover:bg-surface-subtle"
            } ${overId === el.id && dragId !== el.id ? "border-t-link border-t-2" : ""} ${
              dragId === el.id ? "opacity-40" : ""
            }`}
          >
            <GripVertical
              size={14}
              className="shrink-0 text-ink-3 cursor-grab"
              aria-hidden
            />
            <span className="w-8 h-8 shrink-0 rounded-md bg-surface-subtle border border-line flex items-center justify-center overflow-hidden">
              <LayerThumb element={el} />
            </span>
            <span className="flex-1 min-w-0 truncate text-[13px] text-ink">
              {layerName(el)}
            </span>
            <Tooltip title={el.locked ? "Mở khóa vị trí" : "Khóa vị trí"}>
              <button
                type="button"
                aria-label={el.locked ? "Mở khóa vị trí" : "Khóa vị trí"}
                aria-pressed={el.locked}
                onClick={(e) => {
                  e.stopPropagation();
                  updateElement(el.id, { locked: !el.locked });
                }}
                className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center hover:bg-white ${
                  el.locked ? "text-ink" : "text-ink-3 opacity-0 group-hover:opacity-100"
                }`}
              >
                {el.locked ? <Lock size={14} /> : <LockOpen size={14} />}
              </button>
            </Tooltip>
          </li>
          </React.Fragment>
        );
      })}
    </ul>
  );
};

export default LayersTab;

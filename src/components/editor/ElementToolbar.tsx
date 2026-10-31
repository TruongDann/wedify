"use client";

import React, { useRef } from "react";
import { Dropdown, Tooltip, InputNumber } from "antd";
import type { MenuProps } from "antd";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  ChevronsDown,
  ChevronsUp,
  ArrowDown,
  ArrowUp,
  Copy,
  Ellipsis,
  FlipHorizontal2,
  FlipVertical2,
  Group,
  Lock,
  LockOpen,
  Trash2,
  Ungroup,
  Layers,
  RotateCw,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

interface Props {
  zoom: number;
}

const TOOLBAR_HEIGHT = 44;
const GAP = 22;
const ROTATE_GAP = 36;

const btn =
  "w-9 h-9 rounded-full flex items-center justify-center text-ink hover:bg-surface-muted transition-colors";

/** Thanh công cụ khi chọn nhiều phần tử: nhóm / bỏ nhóm, nhân đôi, xóa */
const MultiSelectionToolbar: React.FC<Props> = ({ zoom }) => {
  const {
    elements,
    selectedElementIds,
    groupSelection,
    ungroupSelection,
    duplicateSelection,
    deleteSelection,
    alignSelection,
    distributeSelection,
  } = useEditorStore();

  const selected = elements.filter((e) => selectedElementIds.includes(e.id));
  if (selected.length < 2) return null;

  const alignItems: MenuProps["items"] = [
    { key: "left", icon: <AlignStartVertical size={16} />, label: "Căn trái" },
    { key: "centerX", icon: <AlignCenterVertical size={16} />, label: "Căn giữa ngang" },
    { key: "right", icon: <AlignEndVertical size={16} />, label: "Căn phải" },
    { type: "divider" },
    { key: "top", icon: <AlignStartHorizontal size={16} />, label: "Căn trên" },
    { key: "centerY", icon: <AlignCenterHorizontal size={16} />, label: "Căn giữa dọc" },
    { key: "bottom", icon: <AlignEndHorizontal size={16} />, label: "Căn dưới" },
    { type: "divider" },
    {
      key: "distributeX",
      icon: <AlignHorizontalDistributeCenter size={16} />,
      label: "Giãn đều ngang",
      disabled: selected.length < 3,
    },
    {
      key: "distributeY",
      icon: <AlignVerticalDistributeCenter size={16} />,
      label: "Giãn đều dọc",
      disabled: selected.length < 3,
    },
  ];
  const onAlign: MenuProps["onClick"] = ({ key }) => {
    if (key === "distributeX") distributeSelection("x");
    else if (key === "distributeY") distributeSelection("y");
    else alignSelection(key as Parameters<typeof alignSelection>[0]);
  };

  // Cả vùng chọn là đúng một nhóm thì hiện "Bỏ nhóm"
  const groupId = selected[0].groupId;
  const isGroup = !!groupId && selected.every((e) => e.groupId === groupId);

  const corners = selected.flatMap((e) => {
    const rad = (e.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const { width: w, height: h } = e.size;
    return [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ].map(([lx, ly]) => ({
      x: e.position.x + lx * cos - ly * sin,
      y: e.position.y + lx * sin + ly * cos,
    }));
  });
  const minX = Math.min(...corners.map((c) => c.x));
  const maxX = Math.max(...corners.map((c) => c.x));
  const minY = Math.min(...corners.map((c) => c.y));
  const maxY = Math.max(...corners.map((c) => c.y));

  const rawTop = minY * zoom - TOOLBAR_HEIGHT - GAP;
  const top = rawTop < 0 ? maxY * zoom + GAP : rawTop;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <div
        className="pointer-events-auto absolute flex items-center gap-1 px-2 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
        style={{
          left: ((minX + maxX) / 2) * zoom,
          top,
          height: TOOLBAR_HEIGHT,
          transform: "translateX(-50%)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Tooltip title={isGroup ? "Bỏ nhóm (Ctrl+Shift+G)" : "Nhóm (Ctrl+G)"}>
          <button
            type="button"
            className={`${btn} w-auto! px-3 gap-1.5 text-[13px] font-medium`}
            onClick={isGroup ? ungroupSelection : groupSelection}
          >
            {isGroup ? <Ungroup size={16} /> : <Group size={16} />}
            {isGroup ? "Bỏ nhóm" : "Nhóm"}
          </button>
        </Tooltip>
        <Dropdown menu={{ items: alignItems, onClick: onAlign }} trigger={["click"]}>
          <Tooltip title="Căn chỉnh">
            <button type="button" className={btn} aria-label="Căn chỉnh">
              <AlignCenterVertical size={16} />
            </button>
          </Tooltip>
        </Dropdown>
        <Tooltip title="Nhân đôi (Ctrl+D)">
          <button
            type="button"
            className={btn}
            onClick={duplicateSelection}
            aria-label="Nhân đôi"
          >
            <Copy size={16} />
          </button>
        </Tooltip>
        <Tooltip title="Xóa (Delete)">
          <button
            type="button"
            className={btn}
            onClick={deleteSelection}
            aria-label="Xóa các phần tử đã chọn"
          >
            <Trash2 size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

const ElementToolbar: React.FC<Props> = ({ zoom }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    moveElement,
    rotateElement,
    saveHistory,
    elements,
    selectedElementId,
    selectedElementIds,
    updateElement,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    duplicateSelection,
    deleteSelection,
  } = useEditorStore();

  if (selectedElementIds.length > 1) return <MultiSelectionToolbar zoom={zoom} />;

  const element = elements.find((e) => e.id === selectedElementId);
  if (!element) return null;

  const layer = [...elements]
    .sort((a, b) => a.zIndex - b.zIndex)
    .findIndex((e) => e.id === element.id);

  const setLayer = (target: number) => {
    const sorted = [...elements]
      .filter((e) => e.id !== element.id)
      .sort((a, b) => a.zIndex - b.zIndex);
    const index = Math.min(Math.max(target, 0), sorted.length);
    sorted.splice(index, 0, element);
    sorted.forEach((e, i) => {
      if (e.zIndex !== i + 1) updateElement(e.id, { zIndex: i + 1 });
    });
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "front",
      icon: <ChevronsUp size={16} />,
      label: "Đưa lên trên cùng",
      onClick: () => bringToFront(element.id),
    },
    {
      key: "back",
      icon: <ChevronsDown size={16} />,
      label: "Đưa xuống dưới cùng",
      onClick: () => sendToBack(element.id),
    },
    {
      key: "forward",
      icon: <ArrowUp size={16} />,
      label: "Đưa lên một lớp",
      onClick: () => bringForward(element.id),
    },
    {
      key: "backward",
      icon: <ArrowDown size={16} />,
      label: "Đưa xuống một lớp",
      onClick: () => sendBackward(element.id),
    },
    { type: "divider" },
    {
      key: "lock",
      icon: element.locked ? <LockOpen size={16} /> : <Lock size={16} />,
      label: element.locked ? "Mở khóa vị trí" : "Khóa vị trí",
      onClick: () => updateElement(element.id, { locked: !element.locked }),
    },
    {
      key: "layer",
      icon: <Layers size={16} />,
      label: (
        <div
          className="flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <span>Chỉnh thứ lớp</span>
          <InputNumber
            size="small"
            min={0}
            max={elements.length - 1}
            value={layer}
            className="w-16"
            onChange={(v) => typeof v === "number" && setLayer(v)}
          />
        </div>
      ),
    },
    {
      key: "current",
      disabled: true,
      label: `Lớp hiện tại: ${layer}`,
    },
  ];

  const { width: w, height: h } = element.size;
  const rad = (element.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const toWorld = (lx: number, ly: number) => ({
    x: element.position.x + lx * cos - ly * sin,
    y: element.position.y + lx * sin + ly * cos,
  });
  const corners = [toWorld(0, 0), toWorld(w, 0), toWorld(w, h), toWorld(0, h)];
  const minY = Math.min(...corners.map((c) => c.y));
  const maxY = Math.max(...corners.map((c) => c.y));
  const center = toWorld(w / 2, h / 2);

  const left = center.x * zoom;
  const rawTop = minY * zoom - TOOLBAR_HEIGHT - GAP;
  const top = rawTop < 0 ? maxY * zoom + GAP + ROTATE_GAP : rawTop;

  const handleCenter = {
    x: center.x * zoom - sin * (h / 2) * zoom,
    y: center.y * zoom + cos * (h / 2) * zoom,
  };
  const rotatorX = handleCenter.x - sin * ROTATE_GAP;
  const rotatorY = handleCenter.y + cos * ROTATE_GAP;

  const startRotate = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Giữ con trỏ trên nút để Konva không nhận pointerup và bỏ chọn phần tử
    e.currentTarget.setPointerCapture(e.pointerId);
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const scale = rect.width / (root.offsetWidth || 1);
    const cx = rect.left + center.x * zoom * scale;
    const cy = rect.top + center.y * zoom * scale;

    const onMove = (ev: PointerEvent) => {
      let deg =
        (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI - 90;
      if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
      deg = ((((deg + 180) % 360) + 360) % 360) - 180;
      const r = (deg * Math.PI) / 180;
      rotateElement(element.id, deg);
      moveElement(element.id, {
        x: center.x - ((w / 2) * Math.cos(r) - (h / 2) * Math.sin(r)),
        y: center.y - ((w / 2) * Math.sin(r) + (h / 2) * Math.cos(r)),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      saveHistory();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-30 pointer-events-none"
    >
      {!element.locked && (
        <button
          type="button"
          aria-label="Xoay"
          onPointerDown={startRotate}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md flex items-center justify-center text-ink cursor-grab active:cursor-grabbing"
          style={{ left: rotatorX, top: rotatorY }}
        >
          <RotateCw size={16} />
        </button>
      )}
    <div
      className="pointer-events-auto absolute flex items-center gap-1 px-2 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
      style={{
        left,
        top,
        height: TOOLBAR_HEIGHT,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {element.type === "image" && (
        <>
          <Tooltip title="Lật ngang">
            <button
              type="button"
              className={btn}
              onClick={() =>
                updateElement(element.id, { flipX: !element.flipX })
              }
              aria-label="Lật ngang"
              aria-pressed={!!element.flipX}
            >
              <FlipHorizontal2 size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Lật dọc">
            <button
              type="button"
              className={btn}
              onClick={() =>
                updateElement(element.id, { flipY: !element.flipY })
              }
              aria-label="Lật dọc"
              aria-pressed={!!element.flipY}
            >
              <FlipVertical2 size={16} />
            </button>
          </Tooltip>
        </>
      )}
      <Tooltip title="Nhân đôi (Ctrl+D)">
        <button
          type="button"
          className={btn}
          onClick={duplicateSelection}
          aria-label="Nhân đôi"
        >
          <Copy size={16} />
        </button>
      </Tooltip>
      <Tooltip title="Xóa phần tử (Delete)">
        <button
          type="button"
          className={btn}
          onClick={deleteSelection}
          aria-label="Xóa phần tử"
        >
          <Trash2 size={16} />
        </button>
      </Tooltip>
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <button type="button" className={btn} aria-label="Xem thêm">
          <Ellipsis size={16} />
        </button>
      </Dropdown>
    </div>
    </div>
  );
};

export default ElementToolbar;

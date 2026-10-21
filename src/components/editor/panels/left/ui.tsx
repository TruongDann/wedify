"use client";

import React from "react";
import { Check, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

// Các thành phần giao diện dùng chung cho panel trái (phong cách Cinelove)

/** Tab gạch chân: chữ xám, tab đang chọn đậm + gạch đen 2px */
export function PanelTabs<K extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: K; label: string }[];
  active: K;
  onChange: (key: K) => void;
}) {
  return (
    <div className="flex gap-1 px-4 border-b border-line shrink-0">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative h-11 px-3.5 text-[14.5px] whitespace-nowrap transition-colors ${
              isActive
                ? "text-ink font-semibold"
                : "text-ink-3 font-medium hover:text-ink"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute left-2.5 right-2.5 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Chip lọc dạng viên thuốc; đang chọn nền xanh nhạt */
export const Chip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-8 px-3 rounded-full border text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
      active
        ? "bg-primary-soft border-primary text-link"
        : "bg-white border-line-strong text-ink hover:bg-surface-muted"
    }`}
  >
    {children}
  </button>
);

/**
 * Hàng chip cuộn ngang. Có nút mũi tên hai bên (chỉ hiện khi còn chip bị khuất), lăn chuột dọc
 * hoặc kéo chuột đều cuộn ngang được — thanh cuộn bị ẩn nên không có nút thì máy tính không cuộn được.
 */
export const ChipRow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const [edge, setEdge] = React.useState({ left: false, right: false });

  const update = React.useCallback(() => {
    const node = ref.current;
    if (!node) return;
    setEdge({
      left: node.scrollLeft > 4,
      right: node.scrollLeft + node.clientWidth < node.scrollWidth - 4,
    });
  }, []);

  React.useEffect(() => {
    update();
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [update, children]);

  const scrollBy = (direction: 1 | -1) =>
    ref.current?.scrollBy({ left: direction * 180, behavior: "smooth" });

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-line-strong shadow-sm flex items-center justify-center text-ink-2 hover:bg-surface-muted";

  return (
    <div className="relative">
      {edge.left && (
        <button type="button" aria-label="Cuộn sang trái" className={`${arrow} left-0`} onClick={() => scrollBy(-1)}>
          <ChevronLeft size={16} />
        </button>
      )}
      <div
        ref={ref}
        className="flex gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        onScroll={update}
        onWheel={(e) => {
          // Lăn chuột dọc trên hàng chip thì cuộn ngang
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) ref.current?.scrollBy({ left: e.deltaY });
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          drag.current = { active: true, moved: false, startX: e.clientX, startLeft: ref.current.scrollLeft };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.active || !ref.current) return;
          const dx = e.clientX - d.startX;
          if (Math.abs(dx) > 4) d.moved = true;
          ref.current.scrollLeft = d.startLeft - dx;
        }}
        onPointerUp={() => {
          drag.current.active = false;
        }}
        onPointerLeave={() => {
          drag.current.active = false;
        }}
        // Vừa kéo xong thì không coi là bấm vào chip
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.stopPropagation();
            e.preventDefault();
            drag.current.moved = false;
          }
        }}
      >
        {children}
      </div>
      {edge.right && (
        <button type="button" aria-label="Cuộn sang phải" className={`${arrow} right-0`} onClick={() => scrollBy(1)}>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

/** Tiêu đề mục nhỏ + hành động bên phải (vd: "Xem tất cả") */
export const SectionTitle: React.FC<{
  title: string;
  action?: React.ReactNode;
}> = ({ title, action }) => (
  <div className="flex items-center justify-between gap-2 mb-2 min-h-8">
    <h3 className="text-[13px] font-semibold text-ink-2">{title}</h3>
    {action}
  </div>
);

/** Nút chữ xanh nhỏ */
export const LinkButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", ...props }) => (
  <button
    type="button"
    {...props}
    className={`text-[13px] font-semibold text-link hover:underline flex items-center gap-1 ${className}`}
  />
);

/** Ô chọn: viền xám, khi chọn viền xanh + dấu tích góc phải */
export const Tile: React.FC<{
  selected?: boolean;
  title?: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ selected = false, title, onClick, className = "", children }) => (
  <button
    type="button"
    title={title}
    aria-pressed={selected}
    onClick={onClick}
    className={`relative rounded-[10px] border transition-colors ${
      selected ? "border-primary" : "border-line hover:border-line-strong"
    } ${className}`}
  >
    {children}
    {selected && (
      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#3574D4] text-white flex items-center justify-center ring-2 ring-white">
        <Check size={10} strokeWidth={3} />
      </span>
    )}
  </button>
);

/** Ô tìm kiếm nhỏ bo góc */
export const SearchBox: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <label className="flex items-center gap-2 h-8 px-3 rounded-xl border border-line-strong bg-white focus-within:border-primary transition-colors">
    <Search size={15} className="text-ink-3 shrink-0" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 min-w-0 bg-transparent text-[13.5px] text-ink placeholder:text-ink-4 outline-none"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="text-ink-4 hover:text-ink"
        aria-label="Xóa tìm kiếm"
      >
        <X size={14} />
      </button>
    )}
  </label>
);

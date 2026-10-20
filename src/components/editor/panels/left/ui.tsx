"use client";

import React from "react";
import { Check, Search, X } from "lucide-react";

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

/** Hàng chip cuộn ngang */
export const ChipRow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="flex gap-2 overflow-x-auto scrollbar-hide">{children}</div>
);

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

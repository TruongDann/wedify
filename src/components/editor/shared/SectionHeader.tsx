import React from "react";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  sectionKey: string;
  /** Giữ để tương thích; header kiểu Cinelove không hiển thị icon */
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: (key: string) => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  sectionKey,
  isExpanded,
  onToggle,
}) => (
  <button
    type="button"
    className="w-full flex items-center gap-2.5 px-4 h-13 text-left text-sm font-semibold text-ink hover:bg-primary-soft transition-colors"
    onClick={() => onToggle(sectionKey)}
    aria-expanded={isExpanded}
  >
    <ChevronRight
      size={15}
      className={`text-ink-3 shrink-0 transition-transform duration-200 ${
        isExpanded ? "rotate-90" : ""
      }`}
    />
    <span>{title}</span>
  </button>
);

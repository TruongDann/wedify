import React from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

interface SectionHeaderProps {
  title: string;
  sectionKey: string;
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: (key: string) => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  sectionKey,
  icon,
  isExpanded,
  onToggle,
}) => (
  <div
    className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium text-sm ${
      isExpanded ? "border-b border-gray-100" : ""
    }`}
    onClick={() => onToggle(sectionKey)}
  >
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <span>{title}</span>
    </div>
    {isExpanded ? (
      <DownOutlined className="text-xs" />
    ) : (
      <RightOutlined className="text-xs" />
    )}
  </div>
);

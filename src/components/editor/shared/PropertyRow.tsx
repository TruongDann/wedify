import React from "react";

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
  labelWidth?: string;
}

export const PropertyRow: React.FC<PropertyRowProps> = ({
  label,
  children,
  labelWidth = "w-24",
}) => (
  <div className="flex items-center gap-3 mb-3">
    <span className={`text-sm text-gray-600 ${labelWidth} shrink-0`}>
      {label}
    </span>
    <div className="flex-1 flex items-center gap-2">{children}</div>
  </div>
);

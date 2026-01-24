import React from "react";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  className = "",
}) => (
  <div className={`p-4 border-b border-gray-100 ${className}`}>
    {title && (
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
    )}
    {children}
  </div>
);

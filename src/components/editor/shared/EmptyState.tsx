import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  text: string;
  subText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  text,
  subText,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <div className="text-4xl mb-3">{icon}</div>
    <p className="text-sm">{text}</p>
    {subText && <p className="text-xs text-center mt-1">{subText}</p>}
  </div>
);

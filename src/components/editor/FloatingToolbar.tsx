"use client";

import React from "react";
import { Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { EditorElement } from "@/types/editor";

interface FloatingToolbarProps {
  selectedElement: EditorElement | null;
  stagePosition: { x: number; y: number };
  onDuplicate: () => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  selectedElement,
  stagePosition,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
}) => {
  if (!selectedElement) return null;

  // Calculate toolbar position accounting for element rotation
  // Position at the top-center of the rotated element, then offset upward
  const elementCenterX =
    selectedElement.position.x + selectedElement.size.width / 2;
  const elementCenterY =
    selectedElement.position.y + selectedElement.size.height / 2;

  // Distance from center to top edge
  const distanceToTop = selectedElement.size.height / 2;

  // Convert rotation to radians (Konva uses degrees)
  const rotationRad = (selectedElement.rotation * Math.PI) / 180;

  // Calculate rotated top-center position
  const topCenterX = elementCenterX - distanceToTop * Math.sin(rotationRad);
  const topCenterY = elementCenterY - distanceToTop * Math.cos(rotationRad);

  // Toolbar stays horizontal - offset straight up from element's rotated top-center
  const toolbarX = stagePosition.x + topCenterX;
  const toolbarY = stagePosition.y + topCenterY - 90; // Fixed vertical offset

  return (
    <div
      className="absolute z-50 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1"
      style={{
        left: `${toolbarX}px`,
        top: `${toolbarY}px`,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={onDuplicate}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Duplicate"
      >
        <Copy size={16} className="text-gray-700" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 hover:bg-red-50 rounded transition-colors"
        title="Delete"
      >
        <Trash2 size={16} className="text-red-600" />
      </button>
      <div className="w-px h-6 bg-gray-300" />
      <button
        onClick={onBringForward}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Bring Forward"
      >
        <ArrowUp size={16} className="text-gray-700" />
      </button>
      <button
        onClick={onSendBackward}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Send Backward"
      >
        <ArrowDown size={16} className="text-gray-700" />
      </button>
    </div>
  );
};

export default FloatingToolbar;

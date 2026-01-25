"use client";

import React from "react";
import { Button, Slider, ColorPicker, Switch } from "antd";
import {
  BgColorsOutlined,
  CopyOutlined,
  DragOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ShapeElement, EditorElement } from "@/types/editor";

// ==================== Types ====================

interface ShadowProps {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  color: string;
}

interface SectionHeaderProps {
  title: string;
  sectionKey: string;
  icon?: React.ReactNode;
  expandedSections: string[];
  onToggle: (key: string) => void;
}

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
}

// ==================== Shared Components ====================

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  sectionKey,
  icon,
  expandedSections,
  onToggle,
}) => (
  <div
    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
    onClick={() => onToggle(sectionKey)}
  >
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <span className="font-medium text-sm">{title}</span>
    </div>
    <span
      className={`text-gray-400 transition-transform ${expandedSections.includes(sectionKey) ? "rotate-180" : ""}`}
    >
      ▼
    </span>
  </div>
);

const PropertyRow: React.FC<PropertyRowProps> = ({ label, children }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="text-sm text-gray-600 w-24 shrink-0">{label}</span>
    {children}
  </div>
);

// ==================== Shape Color Section ====================

interface ShapeColorSectionProps {
  element: ShapeElement;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
}

export const ShapeColorSection: React.FC<ShapeColorSectionProps> = ({
  element,
  expandedSections,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Màu sắc"
      sectionKey="colors"
      icon={<BgColorsOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("colors") && (
      <div className="px-4 pt-3 pb-4">
        <PropertyRow label="Màu nền">
          <ColorPicker
            value={element.fill}
            onChange={(color) => onUpdate({ fill: color.toHexString() })}
          />
        </PropertyRow>
        <PropertyRow label="Màu viền">
          <ColorPicker
            value={element.stroke}
            onChange={(color) => onUpdate({ stroke: color.toHexString() })}
          />
        </PropertyRow>
        <PropertyRow label="Độ dày viền">
          <Slider
            value={element.strokeWidth}
            onChange={(value) => onUpdate({ strokeWidth: value })}
            min={0}
            max={20}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-8">
            {element.strokeWidth}px
          </span>
        </PropertyRow>
      </div>
    )}
  </div>
);

// ==================== Shape Shadow Section ====================

interface ShapeShadowSectionProps {
  shadow: ShadowProps;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
}

export const ShapeShadowSection: React.FC<ShapeShadowSectionProps> = ({
  shadow,
  expandedSections,
  onToggle,
  onUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Đổ bóng"
      sectionKey="shadow"
      icon={<CopyOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("shadow") && (
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Đổ bóng</span>
          <Switch
            checked={shadow.enabled}
            onChange={(checked) =>
              onUpdate({ shadow: { ...shadow, enabled: checked } })
            }
          />
        </div>

        {shadow.enabled && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">X</span>
                <input
                  type="number"
                  className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={shadow.x}
                  onChange={(e) =>
                    onUpdate({
                      shadow: { ...shadow, x: Number(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Y</span>
                <input
                  type="number"
                  className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={shadow.y}
                  onChange={(e) =>
                    onUpdate({
                      shadow: { ...shadow, y: Number(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>

            <PropertyRow label="Blur">
              <Slider
                value={shadow.blur}
                onChange={(v) => onUpdate({ shadow: { ...shadow, blur: v } })}
                min={0}
                max={50}
                className="flex-1"
              />
            </PropertyRow>

            <PropertyRow label="Màu">
              <ColorPicker
                value={shadow.color}
                onChange={(color) =>
                  onUpdate({
                    shadow: { ...shadow, color: color.toHexString() },
                  })
                }
              />
            </PropertyRow>
          </>
        )}
      </div>
    )}
  </div>
);

// ==================== Shape Position Section ====================

interface ShapePositionSectionProps {
  element: ShapeElement;
  expandedSections: string[];
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
  onPositionUpdate: (key: "x" | "y", value: number) => void;
  onSizeUpdate: (key: "width" | "height", value: number) => void;
}

export const ShapePositionSection: React.FC<ShapePositionSectionProps> = ({
  element,
  expandedSections,
  onToggle,
  onUpdate,
  onPositionUpdate,
  onSizeUpdate,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <SectionHeader
      title="Vị trí & Kích thước"
      sectionKey="position"
      icon={<DragOutlined />}
      expandedSections={expandedSections}
      onToggle={onToggle}
    />
    {expandedSections.includes("position") && (
      <div className="px-4 pt-3 pb-4">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {
              label: "X",
              value: element.position.x,
              onChange: (v: number) => onPositionUpdate("x", v),
            },
            {
              label: "Y",
              value: element.position.y,
              onChange: (v: number) => onPositionUpdate("y", v),
            },
            {
              label: "W",
              value: element.size.width,
              onChange: (v: number) => onSizeUpdate("width", v),
            },
            {
              label: "H",
              value: element.size.height,
              onChange: (v: number) => onSizeUpdate("height", v),
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{item.label}</span>
              <input
                type="number"
                className="w-full h-8 text-center bg-gray-100 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={Math.round(item.value)}
                onChange={(e) => item.onChange(Number(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
        <PropertyRow label="Xoay">
          <Slider
            value={element.rotation}
            onChange={(value) => onUpdate({ rotation: value })}
            min={-180}
            max={180}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-10">{element.rotation}°</span>
        </PropertyRow>
        <PropertyRow label="Độ mờ">
          <Slider
            value={element.opacity}
            onChange={(value) => onUpdate({ opacity: value })}
            min={0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">
            {element.opacity.toFixed(2)}
          </span>
        </PropertyRow>
      </div>
    )}
  </div>
);

// ==================== Delete Button ====================

interface DeleteButtonProps {
  onDelete: () => void;
}

export const ShapeDeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => (
  <div className="pt-1">
    <Button danger block icon={<DeleteOutlined />} onClick={onDelete}>
      Xóa phần tử
    </Button>
  </div>
);

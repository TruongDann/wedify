"use client";

import React from "react";
import { Button, ColorPicker, Input, InputNumber, Select, Switch } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ToolElement } from "@/types/editor";
import { FONT_SELECT_GROUPS } from "@/constants/fonts";
import { loadGoogleFont } from "@/utils/fontLoader";
import { PropertyRow } from "../../shared";
import { CONTACT_TYPES } from "../../widgets/DomWidgets";

interface ToolSettingsProps {
  element: ToolElement;
  onUpdate: (updates: Partial<ToolElement>) => void;
  onError: (message: string) => void;
}

const WIDGET_TITLES: Record<string, string> = {
  contactCard: "Liên hệ",
  guestbook: "Sổ lưu bút",
};

const DOM_STYLE_KINDS = ["contactCard", "guestbook"];

const fontOptions = FONT_SELECT_GROUPS;

const Color: React.FC<{ value?: string; fallback: string; alpha?: boolean; onChange: (value: string) => void }> = ({ value, fallback, alpha, onChange }) => (
  <ColorPicker
    value={value || fallback}
    showText
    onChange={(color) => onChange(alpha ? color.toRgbString() : color.toHexString())}
  />
);

export const ToolSettingsSection: React.FC<ToolSettingsProps> = ({ element, onUpdate, onError }) => {
  const props = element.props ?? {};
  const set = (patch: Record<string, any>) => onUpdate({ props: { ...props, ...patch } });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3 text-sm font-medium">Cài đặt {WIDGET_TITLES[element.tool] ?? "tiện ích"}</div>
      <div className="space-y-3 px-4 pb-4 pt-3">
        {element.tool === "guestbook" ? (
          <>
            <PropertyRow label="Tiêu đề"><Input value={props.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></PropertyRow>
            <Input.TextArea rows={2} value={props.description ?? ""} onChange={(e) => set({ description: e.target.value })} placeholder="Mô tả ngắn" />
            <PropertyRow label="Cho viết lời chúc"><Switch checked={props.showForm !== false} onChange={(v) => set({ showForm: v })} /></PropertyRow>
          </>
        ) : null}

        {element.tool === "contactCard" ? (
          <>
            <PropertyRow label="Tiêu đề"><Input value={props.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></PropertyRow>
            {(Array.isArray(props.items) ? props.items : []).map((item: any, index: number) => (
              <div key={index} className="space-y-1 rounded-lg border border-gray-200 p-2">
                <div className="flex gap-2">
                  <Input size="small" value={item.label ?? ""} placeholder="Tên (vd. Chú rể)" onChange={(e) => set({ items: props.items.map((it: any, i: number) => (i === index ? { ...it, label: e.target.value } : it)) })} />
                  <button type="button" aria-label="Xoá" className="text-rose-500" onClick={() => set({ items: props.items.filter((_: unknown, i: number) => i !== index) })}><DeleteOutlined /></button>
                </div>
                <div className="flex gap-2">
                  <Select size="small" style={{ width: 130 }} value={item.type ?? "phone"} options={CONTACT_TYPES} onChange={(v) => set({ items: props.items.map((it: any, i: number) => (i === index ? { ...it, type: v } : it)) })} />
                  <Input size="small" value={item.value ?? ""} placeholder="Số / link / email" onChange={(e) => set({ items: props.items.map((it: any, i: number) => (i === index ? { ...it, value: e.target.value } : it)) })} />
                </div>
              </div>
            ))}
            <Button size="small" icon={<PlusOutlined />} onClick={() => set({ items: [...(props.items ?? []), { label: "", type: "phone", value: "" }] })}>Thêm liên hệ</Button>
          </>
        ) : null}

        {DOM_STYLE_KINDS.includes(element.tool) ? (
          <>
            <PropertyRow label="Màu chính"><Color value={props.accent} fallback="#ef4565" onChange={(v) => set({ accent: v })} /></PropertyRow>
            <PropertyRow label="Màu chữ"><Color value={props.textColor} fallback="#3b1d2a" onChange={(v) => set({ textColor: v })} /></PropertyRow>
            <PropertyRow label="Màu nền"><Color value={props.bgColor} fallback="rgba(255,255,255,0.93)" alpha onChange={(v) => set({ bgColor: v })} /></PropertyRow>
            <PropertyRow label="Font"><Select className="flex-1" showSearch optionFilterProp="label" value={props.fontFamily ?? "Playfair Display"} onChange={async (v) => { await loadGoogleFont(v); set({ fontFamily: v }); }} options={fontOptions} virtual={false} /></PropertyRow>
            <PropertyRow label="Bo góc"><InputNumber min={0} max={80} value={props.radius ?? 22} onChange={(v) => set({ radius: Number(v) || 0 })} /></PropertyRow>
          </>
        ) : null}
      </div>
    </div>
  );
};

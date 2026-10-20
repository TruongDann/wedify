"use client";

import React from "react";
import { ColorPicker, Input, Select, Slider, Switch } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  FormOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { MapSettings, RsvpSettings, WidgetElement } from "@/types/editor";
import { FONTS } from "@/constants/fonts";
import { loadGoogleFont } from "@/utils/fontLoader";
import { layoutRsvp } from "@/components/widgets/widgetModel";
import { PropertyRow, SectionHeader } from "../../shared";

interface SectionProps {
  element: WidgetElement;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<WidgetElement>) => void;
}

export const WIDGET_LABELS: Record<WidgetElement["widget"], string> = {
  calendar: "Lịch",
  countdown: "Đếm ngược",
  rsvp: "Xác nhận tham dự",
  map: "Bản đồ",
  call: "Nút gọi",
  reminder: "Lời nhắc lịch",
  youtube: "Video YouTube",
  slideshow: "Trình chiếu ảnh",
  album: "Album ảnh",
  giftQr: "QR mừng cưới",
};

const Color: React.FC<{ value: string; onChange: (hex: string) => void }> = ({
  value,
  onChange,
}) => (
  <ColorPicker
    value={value === "transparent" ? undefined : value}
    showText={(color) => (value === "transparent" ? "Trong suốt" : color.toHexString())}
    allowClear
    onChange={(color) => onChange(color.toHexString())}
    onClear={() => onChange("transparent")}
  />
);

/** Ngày giờ, font, màu sắc — chung cho mọi tiện ích. */
export const WidgetStyleSection: React.FC<SectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => {
  const usesDate = ["calendar", "countdown", "reminder"].includes(element.widget);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title={WIDGET_LABELS[element.widget]}
        sectionKey="widgetStyle"
        icon={<SettingOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          {usesDate && (
            <PropertyRow label="Ngày giờ cưới">
              <Input
                type="datetime-local"
                value={element.eventDate}
                onChange={(e) => e.target.value && onUpdate({ eventDate: e.target.value })}
              />
            </PropertyRow>
          )}
          <PropertyRow label="Font">
            <Select
              value={element.fontFamily}
              onChange={async (value) => {
                await loadGoogleFont(value);
                onUpdate({ fontFamily: value });
              }}
              className="flex-1"
              virtual={false}
              options={FONTS.map((font) => ({
                value: font.name,
                label: <span style={{ fontFamily: font.name }}>{font.label}</span>,
              }))}
            />
          </PropertyRow>
          <PropertyRow label="Màu chữ">
            <Color value={element.color} onChange={(color) => onUpdate({ color })} />
          </PropertyRow>
          <PropertyRow label={element.widget === "countdown" ? "Màu ô" : "Màu nhấn"}>
            <Color value={element.accentColor} onChange={(accentColor) => onUpdate({ accentColor })} />
          </PropertyRow>
          {element.widget !== "countdown" && (
            <PropertyRow label="Màu nền">
              <Color
                value={element.backgroundColor}
                onChange={(backgroundColor) => onUpdate({ backgroundColor })}
              />
            </PropertyRow>
          )}
          <PropertyRow label="Bo góc">
            <Slider
              value={element.borderRadius}
              onChange={(borderRadius) => onUpdate({ borderRadius })}
              min={0}
              max={40}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-10">{element.borderRadius}</span>
          </PropertyRow>
        </div>
      )}
    </div>
  );
};

/** Nội dung form xác nhận tham dự. Bật/tắt câu hỏi thì khung tự đổi chiều cao cho vừa form. */
export const WidgetRsvpSection: React.FC<SectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => {
  const { rsvp } = element;
  const set = (patch: Partial<RsvpSettings>) => {
    const next = { ...rsvp, ...patch };
    onUpdate({
      rsvp: next,
      size: { ...element.size, height: layoutRsvp(next).height },
    });
  };
  const text = (label: string, key: keyof RsvpSettings) => (
    <PropertyRow label={label}>
      <Input value={rsvp[key] as string} onChange={(e) => set({ [key]: e.target.value })} />
    </PropertyRow>
  );
  const toggle = (label: string, key: keyof RsvpSettings) => (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-600">{label}</span>
      <Switch checked={rsvp[key] as boolean} onChange={(checked) => set({ [key]: checked })} />
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Nội dung form"
        sectionKey="widgetRsvp"
        icon={<FormOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          {text("Tiêu đề", "title")}
          {text("Ô họ tên", "nameLabel")}
          {text("Câu hỏi", "attendLabel")}
          {text("Đồng ý", "attendYesText")}
          {text("Từ chối", "attendNoText")}
          {toggle("Hỏi số người đi cùng", "enableGuestCount")}
          {rsvp.enableGuestCount && text("Nhãn số người", "guestCountLabel")}
          {toggle("Hỏi khách nhà trai / gái", "enableGuestSide")}
          {rsvp.enableGuestSide && (
            <>
              {text("Nhãn", "guestSideLabel")}
              {text("Nhà trai", "groomSideText")}
              {text("Nhà gái", "brideSideText")}
            </>
          )}
          {toggle("Ô lời chúc", "enableMessage")}
          {rsvp.enableMessage && text("Nhãn lời chúc", "messageLabel")}
          {text("Nút gửi", "submitText")}
          {text("Lời cảm ơn", "thankYouText")}
          <PropertyRow label="Màu nút">
            <Color value={rsvp.buttonColor} onChange={(buttonColor) => set({ buttonColor })} />
          </PropertyRow>
          <PropertyRow label="Chữ trên nút">
            <Color value={rsvp.buttonTextColor} onChange={(buttonTextColor) => set({ buttonTextColor })} />
          </PropertyRow>
        </div>
      )}
    </div>
  );
};

export const WidgetMapSection: React.FC<SectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => {
  const set = (patch: Partial<MapSettings>) => onUpdate({ map: { ...element.map, ...patch } });
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Địa điểm"
        sectionKey="widgetMap"
        icon={<EnvironmentOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          <PropertyRow label="Tên địa điểm">
            <Input value={element.map.placeName} onChange={(e) => set({ placeName: e.target.value })} />
          </PropertyRow>
          <PropertyRow label="Địa chỉ">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              value={element.map.address}
              onChange={(e) => set({ address: e.target.value })}
            />
          </PropertyRow>
          <PropertyRow label="Nút">
            <Input value={element.map.buttonText} onChange={(e) => set({ buttonText: e.target.value })} />
          </PropertyRow>
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <CalendarOutlined /> Bản đồ thật hiện ở trang xem thiệp.
          </p>
        </div>
      )}
    </div>
  );
};

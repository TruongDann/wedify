"use client";

import React from "react";
import {
  AppstoreOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  FormOutlined,
  GiftOutlined,
  NotificationOutlined,
  PhoneOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  createTextElement,
  createWidgetElement,
  useEditorStore,
} from "@/store/editorStore";
import type { WidgetKind } from "@/types/editor";
import { GUEST_NAME_TOKEN } from "@/components/card/guestName";
import { Section } from "../../shared";

interface WidgetItem {
  kind: WidgetKind | "guestName";
  label: string;
  description: string;
  icon: React.ReactNode;
}

const GROUPS: { title: string; items: WidgetItem[] }[] = [
  {
    title: "Thông tin sự kiện",
    items: [
      { kind: "calendar", label: "Lịch", description: "Lịch tháng, đánh dấu ngày cưới bằng trái tim", icon: <CalendarOutlined /> },
      { kind: "countdown", label: "Đếm ngược", description: "Ngày, giờ, phút, giây tới lễ cưới", icon: <FieldTimeOutlined /> },
      { kind: "map", label: "Bản đồ", description: "Google Maps và nút chỉ đường", icon: <EnvironmentOutlined /> },
      { kind: "reminder", label: "Lời nhắc lịch", description: "Khách thêm lễ cưới vào lịch điện thoại", icon: <NotificationOutlined /> },
      { kind: "call", label: "Nút gọi", description: "Bấm để gọi cô dâu / chú rể", icon: <PhoneOutlined /> },
    ],
  },
  {
    title: "Khách mời",
    items: [
      { kind: "rsvp", label: "Xác nhận tham dự", description: "Form để khách báo có đến hay không", icon: <FormOutlined /> },
      { kind: "guestName", label: "Tên khách mời tự động", description: "Hiện tên khách theo link mời riêng", icon: <UserOutlined /> },
      { kind: "giftQr", label: "QR mừng cưới", description: "Mã QR chuyển khoản tiền mừng", icon: <GiftOutlined /> },
    ],
  },
  {
    title: "Ảnh và video",
    items: [
      { kind: "album", label: "Album ảnh", description: "Lưới ảnh, bấm để xem lớn", icon: <AppstoreOutlined /> },
      { kind: "slideshow", label: "Trình chiếu ảnh", description: "Ảnh tự chuyển, mờ dần", icon: <PictureOutlined /> },
      { kind: "youtube", label: "Video YouTube", description: "Nhúng video từ YouTube", icon: <PlayCircleOutlined /> },
    ],
  },
];

export const WidgetTab: React.FC = () => {
  const { addElement, canvasSettings, elements } = useEditorStore();

  const handleAdd = (kind: WidgetItem["kind"]) => {
    if (kind === "guestName") {
      addElement(
        createTextElement({
          content: `Trân trọng kính mời\n${GUEST_NAME_TOKEN}`,
          fontFamily: "Cormorant Garamond",
          fontSize: 22,
          size: { width: 320, height: 70 },
          position: { x: Math.max(0, (canvasSettings.width - 320) / 2), y: 100 },
        }),
      );
      return;
    }
    // Dùng chung ngày cưới với tiện ích đã có để lịch, đếm ngược, lời nhắc khớp nhau
    const existing = elements.find((el) => el.type === "widget");
    const widget = createWidgetElement(kind, {
      ...(existing?.type === "widget" ? { eventDate: existing.eventDate } : {}),
    });
    addElement({
      ...widget,
      position: {
        x: Math.max(0, (canvasSettings.width - widget.size.width) / 2),
        y: 100,
      },
    });
  };

  return (
    <>
      {GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          <div className="space-y-2">
            {group.items.map((w) => (
              <button
                key={w.kind}
                onClick={() => handleAdd(w.kind)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 text-left transition-colors"
              >
                <span className="text-xl text-primary mt-0.5">{w.icon}</span>
                <span>
                  <span className="block text-sm font-medium text-gray-800">{w.label}</span>
                  <span className="block text-xs text-gray-500">{w.description}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
};

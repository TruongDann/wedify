"use client";

import React from "react";
import {
  createTextElement,
  createWidgetElement,
  useEditorStore,
} from "@/store/editorStore";
import type { WidgetKind } from "@/types/editor";
import { GUEST_NAME_TOKEN } from "@/components/card/guestName";
import { SectionTitle } from "./ui";

interface WidgetItem {
  kind: WidgetKind | "guestName";
  label: string;
  description: string;
  icon: string;
}

const GROUPS: { title: string; items: WidgetItem[] }[] = [
  {
    title: "Thông tin sự kiện",
    items: [
      { kind: "calendar", label: "Lịch", description: "Lịch tháng, đánh dấu ngày cưới bằng trái tim", icon: "/widgets/calendar.webp" },
      { kind: "countdown", label: "Đếm ngược", description: "Ngày, giờ, phút, giây tới lễ cưới", icon: "/widgets/countdown.webp" },
      { kind: "map", label: "Bản đồ", description: "Google Maps và nút chỉ đường", icon: "/widgets/map.webp" },
      { kind: "reminder", label: "Lời nhắc lịch", description: "Khách thêm lễ cưới vào lịch điện thoại", icon: "/widgets/reminder.webp" },
      { kind: "call", label: "Nút gọi", description: "Bấm để gọi cô dâu / chú rể", icon: "/widgets/call.webp" },
    ],
  },
  {
    title: "Khách mời",
    items: [
      { kind: "rsvp", label: "Xác nhận tham dự", description: "Form để khách báo có đến hay không", icon: "/widgets/rsvp.webp" },
      { kind: "guestName", label: "Tên khách mời tự động", description: "Hiện tên khách theo link mời riêng", icon: "/widgets/guest-name.webp" },
      { kind: "giftQr", label: "QR mừng cưới", description: "Mã QR chuyển khoản tiền mừng", icon: "/widgets/gift-qr.webp" },
    ],
  },
  {
    title: "Ảnh và video",
    items: [
      { kind: "album", label: "Album ảnh", description: "Lưới ảnh, bấm để xem lớn", icon: "/widgets/album.webp" },
      { kind: "slideshow", label: "Trình chiếu ảnh", description: "Ảnh tự chuyển, mờ dần", icon: "/widgets/slideshow.webp" },
      { kind: "youtube", label: "Video YouTube", description: "Nhúng video từ YouTube", icon: "/widgets/youtube.webp" },
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
    <div className="px-4 pt-2 pb-8 flex flex-col gap-5">
      {GROUPS.map((group) => (
        <section key={group.title}>
          <SectionTitle title={group.title} />
          <div className="grid grid-cols-2 gap-2">
            {group.items.map(({ kind, label, description, icon }) => (
              <button
                key={kind}
                type="button"
                title={description}
                onClick={() => handleAdd(kind)}
                className="min-h-23 flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border border-line bg-white text-ink hover:border-primary/40 hover:bg-primary-soft transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={icon}
                  alt=""
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain"
                />
                <span className="text-[13px] font-semibold leading-4 text-center">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

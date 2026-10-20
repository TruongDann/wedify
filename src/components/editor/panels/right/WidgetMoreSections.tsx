"use client";

import React from "react";
import { Button, Input, Select, Slider } from "antd";
import {
  DeleteOutlined,
  GiftOutlined,
  PhoneOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type {
  ButtonSettings,
  GiftSettings,
  MediaSettings,
  WidgetElement,
} from "@/types/editor";
import {
  BANKS,
  widgetButton,
  widgetGift,
  widgetMedia,
  youtubeId,
} from "@/components/widgets/widgetModel";
import { PropertyRow, SectionHeader } from "../../shared";

interface SectionProps {
  element: WidgetElement;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onUpdate: (updates: Partial<WidgetElement>) => void;
}

/** Chữ trên nút, số điện thoại (nút gọi), tên sự kiện (lời nhắc lịch). */
export const WidgetButtonSection: React.FC<SectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => {
  const button = widgetButton(element);
  const set = (patch: Partial<ButtonSettings>) =>
    onUpdate({ button: { ...button, ...patch } });
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Nội dung nút"
        sectionKey="widgetButton"
        icon={<PhoneOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          <PropertyRow label="Chữ trên nút">
            <Input value={button.label} onChange={(e) => set({ label: e.target.value })} />
          </PropertyRow>
          {element.widget === "call" ? (
            <PropertyRow label="Số điện thoại">
              <Input type="tel" value={button.phone} onChange={(e) => set({ phone: e.target.value })} />
            </PropertyRow>
          ) : (
            <>
              <PropertyRow label="Tên sự kiện">
                <Input value={button.eventTitle} onChange={(e) => set({ eventTitle: e.target.value })} />
              </PropertyRow>
              <PropertyRow label="Địa điểm">
                <Input
                  value={element.map.address}
                  onChange={(e) => onUpdate({ map: { ...element.map, address: e.target.value } })}
                />
              </PropertyRow>
              <p className="text-xs text-gray-400 mb-3">
                Khách chọn Google Calendar hoặc tải file .ics (Apple, Outlook); lịch nhắc trước 1 ngày.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const readImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Link YouTube, hoặc danh sách ảnh của trình chiếu / album. */
export const WidgetMediaSection: React.FC<SectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => {
  const media = widgetMedia(element);
  const [url, setUrl] = React.useState("");
  const set = (patch: Partial<MediaSettings>) => onUpdate({ media: { ...media, ...patch } });
  const badLink = !!media.videoUrl && !youtubeId(media.videoUrl);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const added = await Promise.all(Array.from(files).map(readImage));
    set({ images: [...media.images, ...added] });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title={element.widget === "youtube" ? "Video" : "Ảnh"}
        sectionKey="widgetMedia"
        icon={<PictureOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-3">
          {element.widget === "youtube" ? (
            <>
              <PropertyRow label="Link YouTube">
                <Input
                  placeholder="https://youtu.be/…"
                  value={media.videoUrl}
                  status={badLink ? "error" : undefined}
                  onChange={(e) => set({ videoUrl: e.target.value })}
                />
              </PropertyRow>
              {badLink && (
                <p className="text-xs text-red-500 -mt-2 mb-2">Không đọc được link YouTube này.</p>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {media.images.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      title="Xoá ảnh"
                      className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40 text-white"
                      onClick={() => set({ images: media.images.filter((_, j) => j !== i) })}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary cursor-pointer">
                  <PlusOutlined />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="flex gap-2 mb-3">
                <Input
                  size="small"
                  placeholder="Hoặc dán link ảnh"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  size="small"
                  disabled={!/^https?:\/\//.test(url)}
                  onClick={() => {
                    set({ images: [...media.images, url] });
                    setUrl("");
                  }}
                >
                  Thêm
                </Button>
              </div>
              {element.widget === "slideshow" ? (
                <PropertyRow label="Chuyển ảnh sau">
                  <Slider className="flex-1" min={1} max={10} value={media.interval} onChange={(interval) => set({ interval })} />
                  <span className="text-sm text-gray-500 w-10">{media.interval}s</span>
                </PropertyRow>
              ) : (
                <PropertyRow label="Số cột">
                  <Slider className="flex-1" min={1} max={4} value={media.columns} onChange={(columns) => set({ columns })} />
                  <span className="text-sm text-gray-500 w-10">{media.columns}</span>
                </PropertyRow>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

/** Tài khoản nhận tiền mừng — ảnh QR do VietQR tạo theo thông tin này. */
export const WidgetGiftSection: React.FC<SectionProps> = ({
  element,
  isExpanded,
  onToggle,
  onUpdate,
}) => {
  const gift = widgetGift(element);
  const set = (patch: Partial<GiftSettings>) => onUpdate({ gift: { ...gift, ...patch } });
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Tài khoản nhận mừng"
        sectionKey="widgetGift"
        icon={<GiftOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          <PropertyRow label="Tiêu đề">
            <Input value={gift.title} onChange={(e) => set({ title: e.target.value })} />
          </PropertyRow>
          <PropertyRow label="Ngân hàng">
            <Select
              className="flex-1"
              showSearch
              optionFilterProp="label"
              value={gift.bankCode}
              onChange={(bankCode) => set({ bankCode })}
              options={BANKS.map((b) => ({ value: b.code, label: b.name }))}
            />
          </PropertyRow>
          <PropertyRow label="Số tài khoản">
            <Input
              value={gift.accountNumber}
              onChange={(e) => set({ accountNumber: e.target.value.replace(/\s/g, "") })}
            />
          </PropertyRow>
          <PropertyRow label="Chủ tài khoản">
            <Input
              value={gift.accountName}
              onChange={(e) => set({ accountName: e.target.value.toUpperCase() })}
            />
          </PropertyRow>
          <PropertyRow label="Nội dung CK">
            <Input value={gift.note} onChange={(e) => set({ note: e.target.value })} />
          </PropertyRow>
          <p className="text-xs text-gray-400 mb-3">
            Mã QR tạo bởi VietQR — khách quét bằng app ngân hàng.
          </p>
        </div>
      )}
    </div>
  );
};

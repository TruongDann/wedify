"use client";

import React, { useRef, useState } from "react";
import { Button, ColorPicker, Input, InputNumber, Select, Switch } from "antd";
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import type { ToolElement } from "@/types/editor";
import { FONT_SELECT_GROUPS } from "@/constants/fonts";
import { VIETQR_BANKS, resolveBankCode } from "@/utils/vietqr";
import { uploadPhoto } from "@/lib/upload";
import { loadGoogleFont } from "@/utils/fontLoader";
import { BUTTON_ACTION_LABELS } from "../../elements/ToolElement";
import { PropertyRow } from "../../shared";
import { CONTACT_TYPES } from "../../widgets/DomWidgets";

interface ToolSettingsProps {
  element: ToolElement;
  onUpdate: (updates: Partial<ToolElement>) => void;
  onError: (message: string) => void;
}

const WIDGET_TITLES: Record<string, string> = {
  button: "Nút hành động",
  slideshow: "Trình chiếu ảnh",
  rsvpForm: "Form tham dự",
  giftBox: "Hộp quà QR",
  mapEmbed: "Bản đồ",
  video: "Video",
  contactCard: "Liên hệ",
  guestbook: "Sổ lưu bút",
};

const DOM_STYLE_KINDS = ["rsvpForm", "giftBox", "contactCard", "guestbook"];

const fontOptions = FONT_SELECT_GROUPS;

const Color: React.FC<{ value?: string; fallback: string; alpha?: boolean; onChange: (value: string) => void }> = ({ value, fallback, alpha, onChange }) => (
  <ColorPicker
    value={value || fallback}
    showText
    onChange={(color) => onChange(alpha ? color.toRgbString() : color.toHexString())}
  />
);

/** Tải ảnh QR có sẵn của chủ thiệp (tuỳ chọn, ưu tiên hơn mã tự tạo). */
const QrUpload: React.FC<{ value?: string; onChange: (url: string) => void; onError: (message: string) => void }> = ({ value, onChange, onError }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadPhoto(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Không thể tải ảnh lên (cần đăng nhập)");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="flex items-center gap-2">
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => void pick(e.target.files?.[0])} />
      <Button size="small" icon={<UploadOutlined />} loading={busy} onClick={() => ref.current?.click()}>Tải ảnh QR riêng</Button>
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="QR" className="h-8 w-8 rounded border border-gray-200 object-cover" />
          <button type="button" className="text-xs text-rose-500" onClick={() => onChange("")}>Bỏ ảnh</button>
        </>
      ) : null}
    </div>
  );
};

const ACTION_HINT: Record<string, string> = {
  map: "Link Google Maps (bỏ trống để tìm theo địa điểm của thiệp)",
  call: "Số điện thoại, vd. 0901234567",
  link: "Địa chỉ liên kết, bắt đầu bằng https://",
};

export const ToolSettingsSection: React.FC<ToolSettingsProps> = ({ element, onUpdate, onError }) => {
  const props = element.props ?? {};
  const set = (patch: Record<string, any>) => onUpdate({ props: { ...props, ...patch } });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const images: string[] = Array.isArray(props.images) ? props.images : [];

  const addImageFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      set({ images: [...images, await uploadPhoto(file)] });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Không thể tải ảnh lên (cần đăng nhập)");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3 text-sm font-medium">Cài đặt {WIDGET_TITLES[element.tool] ?? "tiện ích"}</div>
      <div className="space-y-3 px-4 pb-4 pt-3">
        {element.tool === "button" ? (
          <>
            <PropertyRow label="Hành động">
              <Select
                className="flex-1"
                value={props.action ?? "rsvp"}
                onChange={(v) => set({ action: v, label: BUTTON_ACTION_LABELS[v]?.label ?? props.label, icon: BUTTON_ACTION_LABELS[v]?.icon ?? props.icon })}
                options={Object.entries(BUTTON_ACTION_LABELS).map(([value, item]) => ({ value, label: `${item.icon} ${item.label}` }))}
              />
            </PropertyRow>
            <PropertyRow label="Chữ nút"><Input value={props.label ?? ""} onChange={(e) => set({ label: e.target.value })} /></PropertyRow>
            <PropertyRow label="Biểu tượng"><Input value={props.icon ?? ""} onChange={(e) => set({ icon: e.target.value })} maxLength={4} placeholder="Emoji" /></PropertyRow>
            {ACTION_HINT[props.action] ? (
              <div>
                <Input value={props.value ?? ""} onChange={(e) => set({ value: e.target.value })} placeholder={ACTION_HINT[props.action]} />
              </div>
            ) : null}
            <PropertyRow label="Kiểu">
              <Select className="flex-1" value={props.variant ?? "solid"} onChange={(v) => set({ variant: v })} options={[{ value: "solid", label: "Đặc" }, { value: "outline", label: "Viền" }]} />
            </PropertyRow>
            <PropertyRow label="Màu nút"><Color value={props.bgColor} fallback="#ef4565" onChange={(v) => set({ bgColor: v })} /></PropertyRow>
            <PropertyRow label="Màu chữ"><Color value={props.textColor} fallback="#ffffff" onChange={(v) => set({ textColor: v })} /></PropertyRow>
            <PropertyRow label="Cỡ chữ"><InputNumber min={10} max={40} value={props.fontSize ?? 17} onChange={(v) => set({ fontSize: Number(v) || 17 })} /></PropertyRow>
            <PropertyRow label="Font"><Select className="flex-1" showSearch optionFilterProp="label" value={props.fontFamily ?? "Montserrat"} onChange={async (v) => { await loadGoogleFont(v); set({ fontFamily: v }); }} options={fontOptions} virtual={false} /></PropertyRow>
          </>
        ) : null}

        {element.tool === "slideshow" ? (
          <>
            <PropertyRow label="Hiệu ứng">
              <Select className="flex-1" value={props.effect ?? "fade"} onChange={(v) => set({ effect: v })} options={[{ value: "fade", label: "Mờ dần" }, { value: "slide", label: "Trượt ngang" }]} />
            </PropertyRow>
            <PropertyRow label="Giây/ảnh"><InputNumber min={1.5} max={15} step={0.5} value={props.interval ?? 3} onChange={(v) => set({ interval: Number(v) || 3 })} /></PropertyRow>
            <PropertyRow label="Bo góc"><InputNumber min={0} max={80} value={props.radius ?? 18} onChange={(v) => set({ radius: Number(v) || 0 })} /></PropertyRow>
            <div className="space-y-2">
              {images.map((src, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                  <Input size="small" value={src} onChange={(e) => set({ images: images.map((item, i) => (i === index ? e.target.value : item)) })} />
                  <button type="button" aria-label="Xoá ảnh" onClick={() => set({ images: images.filter((_, i) => i !== index) })} className="text-rose-500"><DeleteOutlined /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="small" icon={<UploadOutlined />} loading={uploading} onClick={() => fileRef.current?.click()}>Tải ảnh lên</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => set({ images: [...images, ""] })}>Thêm link ảnh</Button>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => addImageFile(e.target.files?.[0])} />
            </div>
          </>
        ) : null}

        {/* ---------- Tiện ích dạng form / nhúng ---------- */}
        {element.tool === "rsvpForm" ? (
          <>
            <PropertyRow label="Tiêu đề"><Input value={props.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></PropertyRow>
            <Input.TextArea rows={2} value={props.description ?? ""} onChange={(e) => set({ description: e.target.value })} placeholder="Mô tả ngắn" />
            <PropertyRow label="Chữ nút"><Input value={props.buttonLabel ?? ""} onChange={(e) => set({ buttonLabel: e.target.value })} /></PropertyRow>
            <PropertyRow label="Hỏi số người"><Switch checked={props.showCount !== false} onChange={(v) => set({ showCount: v })} /></PropertyRow>
            <PropertyRow label="Hỏi liên hệ"><Switch checked={props.showContact !== false} onChange={(v) => set({ showContact: v })} /></PropertyRow>
          </>
        ) : null}

        {element.tool === "guestbook" ? (
          <>
            <PropertyRow label="Tiêu đề"><Input value={props.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></PropertyRow>
            <Input.TextArea rows={2} value={props.description ?? ""} onChange={(e) => set({ description: e.target.value })} placeholder="Mô tả ngắn" />
            <PropertyRow label="Cho viết lời chúc"><Switch checked={props.showForm !== false} onChange={(v) => set({ showForm: v })} /></PropertyRow>
          </>
        ) : null}

        {element.tool === "mapEmbed" ? (
          <>
            <PropertyRow label="Tiêu đề"><Input value={props.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></PropertyRow>
            <Input value={props.address ?? ""} onChange={(e) => set({ address: e.target.value })} placeholder="Địa chỉ (bỏ trống = lấy theo địa điểm của thiệp)" />
            <PropertyRow label="Độ phóng to">
              <Select className="flex-1" value={props.zoom ?? 16} onChange={(v) => set({ zoom: v })} options={[14, 15, 16, 17, 18, 19].map((z) => ({ value: z, label: String(z) }))} />
            </PropertyRow>
            <PropertyRow label="Hiện tiêu đề"><Switch checked={props.showTitle !== false} onChange={(v) => set({ showTitle: v })} /></PropertyRow>
            <PropertyRow label="Nút chỉ đường"><Switch checked={props.showDirections !== false} onChange={(v) => set({ showDirections: v })} /></PropertyRow>
            <PropertyRow label="Khóa bản đồ"><Switch checked={props.lock !== false} onChange={(v) => set({ lock: v })} /></PropertyRow>
            <PropertyRow label="Màu nút"><Color value={props.accent} fallback="#0d9488" onChange={(v) => set({ accent: v })} /></PropertyRow>
          </>
        ) : null}

        {element.tool === "video" ? (
          <>
            <Input value={props.url ?? ""} onChange={(e) => set({ url: e.target.value })} placeholder="Link YouTube (https://youtu.be/...)" />
            <PropertyRow label="Bo góc"><InputNumber min={0} max={80} value={props.radius ?? 22} onChange={(v) => set({ radius: Number(v) || 0 })} /></PropertyRow>
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

        {element.tool === "giftBox" ? (
          <>
            <PropertyRow label="Tiêu đề"><Input value={props.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></PropertyRow>
            <Input.TextArea rows={2} value={props.description ?? ""} onChange={(e) => set({ description: e.target.value })} placeholder="Lời cảm ơn" />
            <PropertyRow label="Nút tặng bằng tim"><Switch checked={props.showHearts !== false} onChange={(v) => set({ showHearts: v })} /></PropertyRow>
            {(Array.isArray(props.groups) ? props.groups : []).map((group: any, gi: number) => (
              <div key={gi} className="space-y-1 rounded-lg border border-gray-200 p-2">
                <div className="flex gap-2">
                  <Input size="small" value={group.name ?? ""} placeholder="Tên nhóm (Nhà trai...)" onChange={(e) => set({ groups: props.groups.map((g: any, i: number) => (i === gi ? { ...g, name: e.target.value } : g)) })} />
                  <button type="button" aria-label="Xoá nhóm" className="text-rose-500" onClick={() => set({ groups: props.groups.filter((_: unknown, i: number) => i !== gi) })}><DeleteOutlined /></button>
                </div>
                {(group.accounts ?? []).map((acc: any, ai: number) => {
                  const patch = (key: string, value: string) =>
                    set({ groups: props.groups.map((g: any, i: number) => (i === gi ? { ...g, accounts: g.accounts.map((a: any, j: number) => (j === ai ? { ...a, [key]: value } : a)) } : g)) });
                  return (
                    <div key={ai} className="space-y-1">
                      <Input size="small" value={acc.holder ?? ""} placeholder="Chủ tài khoản" onChange={(e) => patch("holder", e.target.value)} />
                      <Select size="small" className="w-full" showSearch optionFilterProp="label" value={acc.bank ? resolveBankCode(acc.bank) : undefined} placeholder="Chọn ngân hàng" options={VIETQR_BANKS} onChange={(v) => patch("bank", v)} />
                      <Input size="small" value={acc.number ?? ""} placeholder="Số tài khoản" onChange={(e) => patch("number", e.target.value.replace(/\s/g, ""))} />
                      <p className="text-[11px] text-gray-400">
                        {acc.qrImage ? "Đang dùng ảnh QR tải lên." : acc.bank && acc.number ? "Mã QR được tạo tự động từ ngân hàng + số tài khoản." : "Chọn ngân hàng và nhập số tài khoản để tự tạo mã QR."}
                      </p>
                      <QrUpload value={acc.qrImage} onChange={(url) => patch("qrImage", url)} onError={onError} />
                    </div>
                  );
                })}
              </div>
            ))}
            <Button size="small" icon={<PlusOutlined />} onClick={() => set({ groups: [...(props.groups ?? []), { name: "", accounts: [{ holder: "", bank: "", number: "", qrImage: "" }] }] })}>Thêm nhóm</Button>
            <p className="text-[11px] text-gray-400">Bỏ trống thì dùng tài khoản đã nhập ở form "Dùng mẫu này".</p>
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

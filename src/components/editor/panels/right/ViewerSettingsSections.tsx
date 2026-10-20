"use client";

import React from "react";
import { Input, Segmented, Slider, Switch } from "antd";
import { DesktopOutlined, MessageOutlined } from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import type { InteractionSettings, ViewerSettings } from "@/types/editor";
import { DEFAULT_INTERACTION, DEFAULT_VIEWER } from "@/components/card/ViewerExtras";
import { PropertyRow, SectionHeader } from "../../shared";

interface Props {
  expandedSections: string[];
  onToggle: (key: string) => void;
}

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }> = ({
  label,
  checked,
  onChange,
  hint,
}) => (
  <div className="mb-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <Switch size="small" checked={checked} onChange={onChange} />
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

/** Tự cuộn và bố cục trên máy tính của trang xem thiệp. */
export const ViewerDisplaySection: React.FC<Props> = ({ expandedSections, onToggle }) => {
  const { canvasSettings, setCanvasSettings } = useEditorStore();
  const viewer = { ...DEFAULT_VIEWER, ...canvasSettings.viewer };
  const set = (patch: Partial<ViewerSettings>) => setCanvasSettings({ viewer: { ...viewer, ...patch } });
  const isExpanded = expandedSections.includes("viewerDisplay");

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden">
      <SectionHeader title="Hiển thị" sectionKey="viewerDisplay" icon={<DesktopOutlined />} isExpanded={isExpanded} onToggle={onToggle} />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          <Toggle
            label="Tự động cuộn"
            checked={viewer.autoScroll}
            onChange={(autoScroll) => set({ autoScroll })}
            hint="Thiệp tự cuộn chậm sau khi khách mở; khách chạm vào thì dừng."
          />
          {viewer.autoScroll && (
            <PropertyRow label="Tốc độ cuộn">
              <span className="text-xs text-gray-400">Chậm</span>
              <Slider className="flex-1" min={15} max={120} value={viewer.scrollSpeed} onChange={(scrollSpeed) => set({ scrollSpeed })} />
              <span className="text-xs text-gray-400">Nhanh</span>
            </PropertyRow>
          )}
          <div className="text-sm text-gray-600 mb-2">Giao diện trên máy tính</div>
          <Segmented
            block
            className="mb-2"
            value={viewer.desktopLayout}
            onChange={(desktopLayout) => set({ desktopLayout: desktopLayout as ViewerSettings["desktopLayout"] })}
            options={[
              { value: "split", label: "Mới" },
              { value: "classic", label: "Cổ điển" },
            ]}
          />
          <p className="text-xs text-gray-400 mb-3">
            {viewer.desktopLayout === "split"
              ? "Thiệp ở giữa, thông tin thiệp và lời chúc ở hai bên."
              : "Chỉ thiệp ở giữa màn hình."}{" "}
            Trên điện thoại thiệp luôn hiện toàn màn hình.
          </p>
          {viewer.desktopLayout === "split" && (
            <>
              <PropertyRow label="Tiêu đề">
                <Input value={viewer.title} onChange={(e) => set({ title: e.target.value })} />
              </PropertyRow>
              <PropertyRow label="Lời giới thiệu">
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} value={viewer.description} onChange={(e) => set({ description: e.target.value })} />
              </PropertyRow>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/** Thanh tương tác: gửi lời chúc, thích thiệp, mừng cưới. */
export const ViewerInteractionSection: React.FC<Props> = ({ expandedSections, onToggle }) => {
  const { canvasSettings, setCanvasSettings, elements } = useEditorStore();
  const interaction = { ...DEFAULT_INTERACTION, ...canvasSettings.interaction };
  const set = (patch: Partial<InteractionSettings>) =>
    setCanvasSettings({ interaction: { ...interaction, ...patch } });
  const isExpanded = expandedSections.includes("viewerInteraction");
  const hasGift = elements.some((el) => el.type === "widget" && el.widget === "giftQr");

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden">
      <SectionHeader title="Tương tác" sectionKey="viewerInteraction" icon={<MessageOutlined />} isExpanded={isExpanded} onToggle={onToggle} />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          <Toggle label="Thanh tương tác" checked={interaction.enabled} onChange={(enabled) => set({ enabled })} hint="Thanh nổi cuối màn hình ở trang xem thiệp." />
          {interaction.enabled && (
            <div className="pl-3 border-l-2 border-gray-100">
              <Toggle label="Gửi lời chúc" checked={interaction.wishes} onChange={(wishes) => set({ wishes })} />
              <Toggle label="Thích thiệp" checked={interaction.like} onChange={(like) => set({ like })} />
              <Toggle
                label="Mừng cưới"
                checked={interaction.gift}
                onChange={(gift) => set({ gift })}
                hint={hasGift ? "Mở hộp QR của tiện ích QR mừng cưới." : "Cần thêm tiện ích QR mừng cưới để nút hiện ra."}
              />
              {interaction.wishes && (
                <>
                  <div className="text-sm text-gray-600 mb-2">Hiển thị lời chúc</div>
                  <Segmented
                    block
                    className="mb-3"
                    value={interaction.showWishesPublicly ? "public" : "private"}
                    onChange={(v) => set({ showWishesPublicly: v === "public" })}
                    options={[
                      { value: "public", label: "Công khai" },
                      { value: "private", label: "Chỉ mình bạn" },
                    ]}
                  />
                </>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mb-3">
            Lời chúc và lượt thích hiện lưu trên trình duyệt của khách (chưa có máy chủ).
          </p>
        </div>
      )}
    </div>
  );
};

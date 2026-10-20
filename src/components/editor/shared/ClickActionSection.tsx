import React from "react";
import { Input, Select } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import type { ClickAction, EditorElement } from "@/types/editor";
import { SectionHeader } from "./SectionHeader";
import { PropertyRow } from "./PropertyRow";
import { getClickAction } from "@/components/card/clickAction";

const describe = (el: EditorElement) => {
  switch (el.type) {
    case "text":
      return `Chữ: ${el.content.replace(/\s+/g, " ").slice(0, 28)}`;
    case "image":
      return "Ảnh";
    case "shape":
      return "Hình";
    case "widget":
      return `Tiện ích: ${el.widget}`;
    default:
      return "Phần tử";
  }
};

interface ClickActionSectionProps {
  element: EditorElement;
  elements: EditorElement[];
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  onChange: (updates: Partial<EditorElement>) => void;
}

/** "Hành động khi bấm": mở liên kết, cuộn tới phần tử khác, gọi điện, mở hộp QR mừng cưới. */
export const ClickActionSection: React.FC<ClickActionSectionProps> = ({
  element,
  elements,
  sectionKey,
  isExpanded,
  onToggle,
  onChange,
}) => {
  const action = getClickAction(element);
  // Lưu vào clickAction và bỏ hyperlink cũ để chỉ còn một nguồn
  const set = (clickAction: ClickAction) =>
    onChange({ clickAction, hyperlink: "" } as Partial<EditorElement>);
  const hasGift = elements.some((el) => el.type === "widget" && el.widget === "giftQr");
  const targets = elements
    .filter((el) => el.id !== element.id)
    .sort((a, b) => a.position.y - b.position.y);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <SectionHeader
        title="Hành động khi bấm"
        sectionKey={sectionKey}
        icon={<LinkOutlined />}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      {isExpanded && (
        <div className="px-4 pt-3 pb-1">
          <PropertyRow label="Khi bấm">
            <Select
              className="flex-1"
              value={action.type}
              onChange={(type: ClickAction["type"]) => {
                if (type === "none") set({ type });
                if (type === "link") set({ type, url: "" });
                if (type === "scroll") set({ type, targetId: targets[0]?.id ?? "" });
                if (type === "call") set({ type, phone: "" });
                if (type === "gift") set({ type });
              }}
              options={[
                { value: "none", label: "Không có" },
                { value: "link", label: "Mở liên kết" },
                { value: "scroll", label: "Cuộn tới phần tử" },
                { value: "call", label: "Gọi điện" },
                { value: "gift", label: "Mở hộp QR mừng cưới", disabled: !hasGift },
              ]}
            />
          </PropertyRow>
          {action.type === "link" && (
            <PropertyRow label="Liên kết">
              <Input
                placeholder="https://…"
                value={action.url}
                onChange={(e) => set({ type: "link", url: e.target.value })}
              />
            </PropertyRow>
          )}
          {action.type === "scroll" && (
            <PropertyRow label="Tới">
              <Select
                className="flex-1"
                showSearch
                optionFilterProp="label"
                value={action.targetId || undefined}
                placeholder="Chọn phần tử"
                onChange={(targetId: string) => set({ type: "scroll", targetId })}
                options={targets.map((el) => ({
                  value: el.id,
                  label: `${describe(el)} (y ${Math.round(el.position.y)})`,
                }))}
              />
            </PropertyRow>
          )}
          {action.type === "call" && (
            <PropertyRow label="Số điện thoại">
              <Input
                type="tel"
                value={action.phone}
                onChange={(e) => set({ type: "call", phone: e.target.value })}
              />
            </PropertyRow>
          )}
          {action.type === "gift" && (
            <p className="text-xs text-gray-400 mb-3">
              Mở hộp hiện mã QR của tiện ích QR mừng cưới trên thiệp.
            </p>
          )}
          {!hasGift && action.type !== "gift" && (
            <p className="text-xs text-gray-400 mb-3">
              Thêm tiện ích QR mừng cưới để dùng hành động mở hộp quà.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

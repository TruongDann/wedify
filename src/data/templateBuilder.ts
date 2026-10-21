/**
 * Bộ hàm dựng mẫu thiệp / khối mẫu bằng code: toạ độ viết như CSS (xoay quanh tâm),
 * mỗi phần tử có sẵn hiệu ứng xuất hiện. Dùng cho data/fallInLoveTemplate.ts và data/sectionBlocks.ts.
 */

import type {
  AnimationType,
  EditorElement,
  ElementAnimation,
  ImageElement,
  TextElement,
  WidgetElement,
  WidgetKind,
} from "@/types/editor";
import {
  createImageElement,
  createTextElement,
  createWidgetElement,
} from "@/store/helpers/elementHelpers";

export const WHITE = "#ffffff";
export const INK = "#1f1f1f";

export const unsplash = (id: string, width = 1000) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;

/** [left, top, width, height, rotation?] — toạ độ như CSS: phần tử xoay quanh tâm. */
export type Box = [number, number, number, number, number?];

/** Đổi sang toạ độ Konva: xoay quanh góc trên-trái. */
export const place = ([left, top, width, height, rotation = 0]: Box) => {
  const r = (rotation * Math.PI) / 180;
  const cx = left + width / 2;
  const cy = top + height / 2;
  const dx = -width / 2;
  const dy = -height / 2;
  return {
    position: {
      x: cx + dx * Math.cos(r) - dy * Math.sin(r),
      y: cy + dx * Math.sin(r) + dy * Math.cos(r),
    },
    size: { width, height },
    rotation,
  };
};

export const anim = (type: AnimationType, delay = 0): ElementAnimation => ({
  enabled: true,
  continuous: false,
  type,
  duration: 1.3,
  delay,
});

export interface TextStyle {
  font: string;
  size: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: TextElement["textAlign"];
  spacing?: number;
  lineHeight?: number;
  /** Bóng mờ để chữ đọc được trên ảnh (mặc định bật cho chữ trắng) */
  shadow?: boolean;
}

/**
 * Tạo một bộ dựng: các hàm text/photo/decor/widget thêm phần tử vào `elements`
 * theo thứ tự vẽ (phần tử sau nằm trên). `idPrefix` để id dễ đọc khi debug.
 */
export const createBuilder = (idPrefix: string, eventDate = "2027-05-20T11:00") => {
  const elements: EditorElement[] = [];

  const push = (el: Omit<EditorElement, "id" | "zIndex">) => {
    const index = elements.length + 1;
    elements.push({ ...el, id: `${idPrefix}-${index}`, zIndex: index } as EditorElement);
  };

  const text = (content: string, box: Box, s: TextStyle, animation: AnimationType = "slideUp", delay = 0) =>
    push(
      createTextElement({
        content,
        ...place(box),
        fontFamily: s.font,
        fontSize: s.size,
        fontWeight: s.bold ? 700 : 400,
        fontStyle: s.italic ? "italic" : "normal",
        textAlign: s.align ?? "center",
        color: s.color ?? INK,
        letterSpacing: s.spacing ?? 0,
        lineHeight: s.lineHeight ?? 1.3,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        shadow: {
          enabled: s.shadow ?? s.color === WHITE,
          x: 0,
          y: 1,
          blur: 6,
          color: s.color === WHITE ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.8)",
        },
        animation: anim(animation, delay),
      }),
    );

  const photo = (src: string, box: Box, animation: AnimationType = "slideUp", delay = 0.2, extra?: Partial<ImageElement>) =>
    push(
      createImageElement(src, {
        alt: "Ảnh cưới",
        ...place(box),
        objectFit: "cover",
        animation: anim(animation, delay),
        ...extra,
      }),
    );

  const decor = (name: string, box: Box, animation: AnimationType = "slideUp", delay = 0.2) =>
    push(
      createImageElement(`/assets/images/decor/${name}.svg`, {
        alt: "Họa tiết",
        ...place(box),
        objectFit: "fill",
        animation: anim(animation, delay),
      }),
    );

  const widget = (kind: WidgetKind, box: Box, overrides: Partial<WidgetElement> = {}) => {
    // Chiều cao 0 = lấy chiều cao mặc định của tiện ích (vd. form xác nhận tham dự)
    const size = box[3] ? undefined : createWidgetElement(kind).size;
    push(
      createWidgetElement(kind, {
        ...place(box),
        ...(size && { size: { width: box[2], height: size.height } }),
        eventDate,
        animation: anim("slideUp", 0.3),
        ...overrides,
      }),
    );
  };

  return { elements, text, photo, decor, widget };
};

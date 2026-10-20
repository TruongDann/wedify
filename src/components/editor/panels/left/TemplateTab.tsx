"use client";

import React from "react";
import { App } from "antd";
import { useEditorStore } from "@/store/editorStore";
import {
  createImageElement,
  createShapeElement,
  createTextElement,
  createWidgetElement,
} from "@/store/helpers/elementHelpers";
import type { EditorElement, Template } from "@/types/editor";
import { weddingTemplates } from "@/data/templates";
import { fallInLoveTemplate } from "@/data/fallInLoveTemplate";

const TEMPLATES: Template[] = [fallInLoveTemplate, ...weddingTemplates];

/** Bổ sung thuộc tính còn thiếu — các mẫu cũ chỉ khai báo một phần. */
const withDefaults = (el: EditorElement): EditorElement => {
  const base = (() => {
    switch (el.type) {
      case "text":
        return createTextElement();
      case "image":
        return createImageElement(el.src);
      case "shape":
        return createShapeElement(el.shapeType);
      case "widget":
        return createWidgetElement(el.widget);
      default:
        return {};
    }
  })();
  return { ...base, ...el } as EditorElement;
};

export const TemplateTab: React.FC = () => {
  const { modal } = App.useApp();

  const apply = (template: Template) => {
    const run = () =>
      useEditorStore
        .getState()
        .loadTemplate(template.elements.map(withDefaults), {
          ...template.canvasSettings,
          isMusicPlaying: false,
        });

    if (useEditorStore.getState().elements.length === 0) return run();
    modal.confirm({
      title: `Dùng mẫu "${template.name}"?`,
      content: "Thiệp đang thiết kế sẽ được thay bằng mẫu này. Bạn vẫn có thể bấm Hoàn tác để quay lại.",
      okText: "Dùng mẫu",
      cancelText: "Huỷ",
      onOk: run,
    });
  };

  return (
    <div className="px-4 pt-2 pb-8 grid grid-cols-2 gap-x-2 gap-y-4">
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => apply(template)}
          className="text-left group"
        >
          <div className="aspect-3/4 rounded-[10px] overflow-hidden border border-line bg-surface-muted group-hover:border-line-strong transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="block mt-1.5 text-[13px] font-medium leading-4 text-ink line-clamp-2">
            {template.name}
          </span>
        </button>
      ))}
    </div>
  );
};

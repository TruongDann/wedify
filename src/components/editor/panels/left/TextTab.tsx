"use client";

import React from "react";
import { Type } from "lucide-react";
import { Button } from "antd";
import { createTextElement, useEditorStore } from "@/store/editorStore";
import { TEXT_TEMPLATES } from "@/data/textTemplates";
import { SectionTitle } from "./ui";

const STYLE_CARD =
  "w-full text-left px-3 py-2.5 rounded-[10px] bg-surface-muted border border-transparent hover:border-line-strong transition-colors";

export const TextTab: React.FC = () => {
  const { addElement } = useEditorStore();

  const handleAddText = (
    options: {
      fontSize?: number;
      fontWeight?: number;
      fontFamily?: string;
      content?: string;
    } = {},
  ) => {
    addElement(createTextElement(options));
  };

  return (
    <div className="px-4 pt-2 pb-8 flex flex-col gap-5">
      <Button
        type="primary"
        block
        shape="round"
        size="large"
        onClick={() => handleAddText()}
        icon={<Type size={16} />}
        className="text-sm!"
      >
        Thêm hộp văn bản
      </Button>

      {/* Kiểu mặc định */}
      <section>
        <SectionTitle title="Kiểu mặc định" />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className={STYLE_CARD}
            onClick={() =>
              handleAddText({ content: "Thêm tiêu đề", fontSize: 32, fontWeight: 700 })
            }
          >
            <span className="text-[22px] font-bold text-ink">Thêm tiêu đề</span>
          </button>
          <button
            type="button"
            className={STYLE_CARD}
            onClick={() =>
              handleAddText({ content: "Thêm tiêu đề phụ", fontSize: 24, fontWeight: 600 })
            }
          >
            <span className="text-base font-semibold text-ink">
              Thêm tiêu đề phụ
            </span>
          </button>
          <button
            type="button"
            className={STYLE_CARD}
            onClick={() =>
              handleAddText({ content: "Thêm văn bản nội dung", fontSize: 16, fontWeight: 400 })
            }
          >
            <span className="text-[13px] text-ink-2">Thêm văn bản nội dung</span>
          </button>
        </div>
      </section>

      {/* Mẫu văn bản */}
      <section>
        <SectionTitle title="Mẫu văn bản" />
        <div className="grid grid-cols-2 gap-2">
          {TEXT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className="aspect-square p-3 rounded-xl border border-line bg-white hover:border-line-strong transition-colors flex items-center justify-center overflow-hidden"
              onClick={() =>
                handleAddText({
                  content: template.content,
                  fontSize: template.fontSize,
                  fontWeight: template.fontWeight,
                  fontFamily: template.fontFamily,
                })
              }
            >
              <span
                className="text-base font-bold text-center wrap-break-word w-full"
                style={template.previewStyle}
              >
                {template.content}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

"use client";

import React from "react";
import { App } from "antd";
import { weddingTemplates, templateTags } from "@/data/templates";
import { useEditorStore } from "@/store/editorStore";
import { Section } from "../../shared";

const renderLongFormPreview = (template: (typeof weddingTemplates)[number]) => {
  const accent = template.accent ?? "#ec4899";

  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <div className="relative h-28 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={template.thumbnail} alt={template.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700">
          {templateTags[template.id] ?? "Thiệp mời"}
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <div className="text-sm font-semibold">{template.name}</div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-white/80">
            <span>Story</span>
            <span>•</span>
            <span>Gallery</span>
            <span>•</span>
            <span>Hiệu ứng</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3">
        <div className="rounded-xl bg-slate-50 p-2">
          <div className="h-1.5 w-16 rounded-full" style={{ background: accent }} />
          <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">Mẫu cuộn dài</div>
          <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
            <div className="h-10 rounded-md bg-gradient-to-r from-slate-100 to-slate-50" />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['Câu chuyện', 'Gallery', 'Map'].map((label) => (
                <div key={label} className="rounded-md bg-slate-50 px-1 py-2 text-center text-[9px] text-slate-500">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplateTab: React.FC = () => {
  const { message } = App.useApp();
  const { clearCanvas, loadTemplate, appendRsvpFooter } = useEditorStore();

  const handleLoadTemplate = (template: (typeof weddingTemplates)[number]) => {
    loadTemplate(template.elements, template.canvasSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedTemplateId", template.id);
      localStorage.setItem("selectedTemplateName", template.name);
      localStorage.setItem("selectedTemplateTheme", JSON.stringify({ id: template.id, name: template.name }));
      window.dispatchEvent(new Event("template-theme-change"));
    }
    message.success(`Đã áp dụng mẫu: ${template.name}`);
  };

  const handleCreateBlank = () => {
    clearCanvas();
    message.success("Đã tạo trang trắng mới");
  };

  return (
    <Section title="Kho mẫu thiệp">
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleCreateBlank}
          className="w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          + Tạo thiệp trắng
        </button>

        <button
          type="button"
          onClick={() => {
            appendRsvpFooter();
            message.success("Đã thêm phần xác nhận tham dự ở cuối thiệp");
          }}
          className="w-full rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-pink-100 px-3 py-2.5 text-sm font-medium text-primary hover:from-primary/20 hover:to-pink-100 transition-colors"
        >
          + Thêm xác nhận tham dự
        </button>

        <div className="space-y-3">
          {weddingTemplates.map((template) => (
            <div
              key={template.id}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-primary/20 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              onClick={() => handleLoadTemplate(template)}
            >
              <div className="p-2">{renderLongFormPreview(template)}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

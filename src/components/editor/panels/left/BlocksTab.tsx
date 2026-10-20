"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useEditorStore } from "@/store/editorStore";
import { BLOCK_WIDTH, SECTION_BLOCKS, SectionBlock } from "@/data/sectionBlocks";
import { Section } from "../../shared";

const GAP = 20;

/** Chèn khối vào dưới cùng thiệp, kéo dài thiệp nếu cần, rồi cuộn tới khối vừa chèn. */
const insertBlock = (block: SectionBlock) => {
  const { elements, canvasSettings, setCanvasSettings, saveHistory } = useEditorStore.getState();
  const bottom = elements.reduce((max, el) => Math.max(max, el.position.y + el.size.height), 0);
  const top = elements.length ? bottom + GAP : 0;
  const dx = (canvasSettings.width - BLOCK_WIDTH) / 2;
  const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

  const added = block.build().map((el, i) => ({
    ...el,
    id: uuidv4(),
    zIndex: maxZ + i + 1,
    position: { x: el.position.x + dx, y: el.position.y + top },
  }));

  useEditorStore.setState({
    elements: [...elements, ...added],
    selectedElementId: null,
    selectedElementIds: [],
  });
  const needed = top + block.height + GAP;
  if (needed > canvasSettings.height) setCanvasSettings({ height: needed });
  else saveHistory();

  requestAnimationFrame(() => {
    const scroller = document.querySelector(".canvas-wrapper")?.closest(".overflow-auto");
    scroller?.scrollTo({ top: Math.max(0, top - 40), behavior: "smooth" });
  });
};

export const BlocksTab: React.FC = () => (
  <Section title="Khối mẫu">
    <p className="text-xs text-gray-500 mb-3">Bấm để thêm một phần dựng sẵn vào cuối thiệp.</p>
    <div className="grid grid-cols-2 gap-2">
      {SECTION_BLOCKS.map((block) => (
        <button
          key={block.id}
          title={block.description}
          onClick={() => insertBlock(block)}
          className="flex flex-col items-center justify-center text-center gap-1 p-3 aspect-square rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <span className="text-2xl">{block.emoji}</span>
          <span className="text-sm font-medium text-gray-800">{block.name}</span>
          <span className="text-[11px] leading-tight text-gray-500">{block.description}</span>
        </button>
      ))}
    </div>
  </Section>
);

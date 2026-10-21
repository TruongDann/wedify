"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Template } from "@/types/editor";

const PublicCanvas = dynamic(() => import("./PublicCanvas"), { ssr: false });

interface GuidedPreviewProps {
  template: Template | null;
  /** Chiều rộng khung hiển thị (px). Chiều cao tự tính theo tỉ lệ điện thoại. */
  width?: number;
  height?: number;
}

/** Khung điện thoại xem trước thiệp, cuộn bên trong giống trang xuất bản. */
const GuidedPreview: React.FC<GuidedPreviewProps> = ({ template, width = 390, height = 780 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: 0, height });

  useEffect(() => {
    setScroll((prev) => ({ ...prev, height }));
  }, [height]);

  return (
    <div
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.18)]"
      style={{ width, height }}
    >
      <div
        ref={scrollRef}
        className="scrollbar-hide h-full w-full overflow-y-auto overflow-x-hidden"
        onScroll={() => {
          const node = scrollRef.current;
          if (node) setScroll({ top: node.scrollTop, height: node.clientHeight });
        }}
      >
        {template ? (
          <PublicCanvas
            elements={template.elements as unknown as Array<Record<string, any>>}
            canvasSettings={template.canvasSettings as unknown as Record<string, any>}
            displayWidth={width}
            scrollTop={scroll.top}
            viewportHeight={scroll.height}
          />
        ) : null}
      </div>
    </div>
  );
};

export default GuidedPreview;

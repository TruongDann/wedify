"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

interface PreviewStageProps {
  /** Mức thu phóng của người dùng, nhân thêm vào tỉ lệ vừa khung. */
  zoom: number;
  /** Nút thu phóng, đặt sát cạnh phải khung điện thoại. */
  zoomControl?: React.ReactNode;
}

// Màn hình điện thoại thật (CSS px) và viền máy
const SCREEN = { width: 390, height: 844 };
const BEZEL = 10;
const FRAME = { width: SCREEN.width + BEZEL * 2, height: SCREEN.height + BEZEL * 2 };
// Lề trên/dưới của vùng xem (py-8)
const STAGE_PADDING = 64;

/**
 * Thiệp chạy thật (trang /preview) trong khung điện thoại.
 * 100% = khung vừa khít chiều cao vùng xem.
 */
export const PreviewStage: React.FC<PreviewStageProps> = ({ zoom, zoomControl }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => setFit(Math.min(1, (stage.clientHeight - STAGE_PADDING) / FRAME.height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const scale = fit * zoom;

  return (
    <div ref={stageRef} className="absolute inset-0 overflow-auto px-6 py-8 flex">
      {/* m-auto: căn giữa khi vừa, vẫn cuộn được khi phóng to vượt vùng xem */}
      <div className="editor-stage-in m-auto flex items-end gap-4">
        <div
          className="shrink-0"
          style={{ width: FRAME.width * scale, height: FRAME.height * scale }}
        >
          <div
            className="rounded-[48px] bg-ink shadow-lg"
            style={{
              width: FRAME.width,
              height: FRAME.height,
              padding: BEZEL,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div className="h-full w-full overflow-hidden rounded-[38px] bg-renderer-gray">
              <iframe
                src="/preview"
                title="Xem trước thiệp"
                allow="autoplay"
                className="block h-full w-full border-0"
              />
            </div>
          </div>
        </div>
        {zoomControl}
      </div>
    </div>
  );
};

export default PreviewStage;

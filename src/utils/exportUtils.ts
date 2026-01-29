/**
 * Export Utilities
 * Helper functions for exporting canvas to various formats
 */

import { message } from "antd";

export interface ExportOptions {
  format: "png" | "jpg" | "webp";
  quality?: number; // 0-1 for jpg/webp
  scale?: number; // 1 = 100%, 2 = 200%, etc.
  filename?: string;
}

/**
 * Export canvas to image file
 */
export const exportCanvasToImage = async (
  canvas: HTMLCanvasElement,
  options: ExportOptions,
): Promise<void> => {
  const { format, quality = 1, scale = 1, filename = "wedding-card" } = options;

  try {
    message.loading({ content: "Đang xuất ảnh...", key: "export" });

    let exportCanvas = canvas;

    // If scaling is needed, create a new canvas
    if (scale !== 1) {
      exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvas.width * scale;
      exportCanvas.height = canvas.height * scale;
      const ctx = exportCanvas.getContext("2d");
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);
      }
    }

    const mimeType = `image/${format === "jpg" ? "jpeg" : format}`;
    const dataUrl = exportCanvas.toDataURL(mimeType, quality);

    // Create download link
    const link = document.createElement("a");
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();

    message.success({ content: "Xuất ảnh thành công!", key: "export" });
  } catch (error) {
    console.error("Export error:", error);
    message.error({ content: "Có lỗi xảy ra khi xuất ảnh", key: "export" });
  }
};

/**
 * Export canvas to blob for further processing
 */
export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: "png" | "jpg" | "webp" = "png",
  quality: number = 1,
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const mimeType = `image/${format === "jpg" ? "jpeg" : format}`;
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
};

/**
 * Convert blob to base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Download data URL as file
 */
export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

/**
 * Copy canvas to clipboard
 */
export const copyCanvasToClipboard = async (
  canvas: HTMLCanvasElement,
): Promise<boolean> => {
  try {
    const blob = await canvasToBlob(canvas, "png");
    if (!blob) return false;

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);

    message.success("Đã sao chép vào clipboard!");
    return true;
  } catch (error) {
    console.error("Copy to clipboard error:", error);
    message.error("Không thể sao chép vào clipboard");
    return false;
  }
};

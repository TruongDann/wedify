import type {
  RemoveBackgroundRequest,
  RemoveBackgroundResponse,
} from "./removeBackground.worker";

/** Lỗi có thông báo dành cho người dùng */
export class RemoveBackgroundError extends Error {}

// MODNet cần ảnh đủ lớn: ảnh nhỏ hơn mức này thường bị nhận nhầm là toàn nền
const MIN_SIDE = 320;
// Ít hơn 1% điểm ảnh là chủ thể thì coi như không tìm thấy người trong ảnh
const MIN_FOREGROUND = 0.01;

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<
  number,
  { resolve: (r: RemoveBackgroundResponse) => void }
>();

const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL("./removeBackground.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<RemoveBackgroundResponse>) => {
      pending.get(event.data.id)?.resolve(event.data);
      pending.delete(event.data.id);
    };
    worker.onerror = () => {
      pending.forEach(({ resolve }, id) =>
        resolve({ id, ok: false, error: "worker crashed" }),
      );
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
};

const runModel = (src: string) =>
  new Promise<RemoveBackgroundResponse>((resolve) => {
    const id = nextId++;
    pending.set(id, { resolve });
    getWorker().postMessage({ id, src } satisfies RemoveBackgroundRequest);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new RemoveBackgroundError("Không tải được ảnh để xóa nền"));
    img.src = src;
  });

/**
 * Tách người khỏi nền ảnh, trả về ảnh PNG nền trong suốt dạng data URL.
 * Chạy hoàn toàn trên máy khách (Web Worker).
 */
export const removeBackground = async (original: string): Promise<string> => {
  // Ảnh thư viện Unsplash trong thiệp cũ là bản nhỏ 200px: lấy bản lớn để tách cho chuẩn
  const src = original.includes("images.unsplash.com")
    ? original.replace(/w=\d+/, "w=1600")
    : original;
  const image = await loadImage(src);
  if (Math.min(image.naturalWidth, image.naturalHeight) < MIN_SIDE) {
    throw new RemoveBackgroundError(
      `Ảnh quá nhỏ để xóa nền (cần cạnh ngắn từ ${MIN_SIDE}px), hãy dùng ảnh rõ nét hơn`,
    );
  }

  const result = await runModel(src);
  if (!result.ok) throw new Error(result.error);
  const { mask, width, height } = result;

  let foreground = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] > 128) foreground++;
  if (foreground / mask.length < MIN_FOREGROUND) {
    throw new RemoveBackgroundError(
      "Không tìm thấy người trong ảnh. Xóa nền AI hoạt động tốt nhất với ảnh chân dung, cô dâu chú rể",
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas");

  ctx.drawImage(image, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < mask.length; i++) {
    // Giữ phần vốn đã trong suốt của ảnh gốc (PNG)
    pixels.data[4 * i + 3] = Math.min(pixels.data[4 * i + 3], mask[i]);
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
};

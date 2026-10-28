import type { PreTrainedModel, Processor } from "@huggingface/transformers";

// MODNet: mô hình tách người khỏi nền (Apache-2.0), tải từ Hugging Face lần đầu rồi trình duyệt tự lưu cache
const MODEL_ID = "Xenova/modnet";

let loading: Promise<{ model: PreTrainedModel; processor: Processor }> | null = null;

const loadModel = () => {
  loading ??= (async () => {
    const { AutoModel, AutoProcessor } = await import("@huggingface/transformers");
    const [model, processor] = await Promise.all([
      AutoModel.from_pretrained(MODEL_ID, { dtype: "fp32" }),
      AutoProcessor.from_pretrained(MODEL_ID),
    ]);
    return { model, processor };
  })().catch((error) => {
    // Lỗi mạng thì lần bấm sau tải lại từ đầu
    loading = null;
    throw error;
  });
  return loading;
};

/** Tách người khỏi nền ảnh, trả về ảnh PNG nền trong suốt dạng data URL. Chạy hoàn toàn trên máy khách. */
export const removeBackground = async (src: string): Promise<string> => {
  const [{ model, processor }, { RawImage }] = await Promise.all([
    loadModel(),
    import("@huggingface/transformers"),
  ]);

  const image = await RawImage.fromURL(src);
  const { pixel_values } = await processor(image);
  const { output } = await model({ input: pixel_values });
  const mask = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
    image.width,
    image.height,
  );

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas");

  ctx.drawImage(image.toCanvas(), 0, 0);
  const pixels = ctx.getImageData(0, 0, image.width, image.height);
  for (let i = 0; i < mask.data.length; i++) {
    // Giữ phần vốn đã trong suốt của ảnh gốc (PNG)
    pixels.data[4 * i + 3] = Math.min(pixels.data[4 * i + 3], mask.data[i]);
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
};

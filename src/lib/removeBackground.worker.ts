/// <reference lib="webworker" />
import {
  AutoModel,
  AutoProcessor,
  RawImage,
  type PreTrainedModel,
  type Processor,
} from "@huggingface/transformers";

// MODNet: tách người khỏi nền (Apache-2.0, ~25MB), tải từ Hugging Face lần đầu rồi trình duyệt tự cache.
// Chạy trong worker để editor không bị đứng trong lúc mô hình tính.
const MODEL_ID = "Xenova/modnet";

let loading: Promise<{ model: PreTrainedModel; processor: Processor }> | null = null;

const loadModel = () => {
  loading ??= Promise.all([
    AutoModel.from_pretrained(MODEL_ID, { dtype: "fp32" }),
    AutoProcessor.from_pretrained(MODEL_ID),
  ])
    .then(([model, processor]) => ({ model, processor }))
    .catch((error) => {
      // Lỗi mạng thì lần sau tải lại từ đầu
      loading = null;
      throw error;
    });
  return loading;
};

export interface RemoveBackgroundRequest {
  id: number;
  src: string;
}

export type RemoveBackgroundResponse =
  | { id: number; ok: true; mask: Uint8Array; width: number; height: number }
  | { id: number; ok: false; error: string };

self.onmessage = async (event: MessageEvent<RemoveBackgroundRequest>) => {
  const { id, src } = event.data;
  try {
    const { model, processor } = await loadModel();
    const image = await RawImage.fromURL(src);
    const { pixel_values } = await processor(image);
    const { output } = await model({ input: pixel_values });
    const mask = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
      image.width,
      image.height,
    );
    const data = new Uint8Array(mask.data);
    const response: RemoveBackgroundResponse = {
      id,
      ok: true,
      mask: data,
      width: image.width,
      height: image.height,
    };
    self.postMessage(response, [data.buffer]);
  } catch (error) {
    const response: RemoveBackgroundResponse = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};

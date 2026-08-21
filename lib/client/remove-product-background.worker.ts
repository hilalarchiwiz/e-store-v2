import { pipeline } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/BEN2-ONNX";

type BackgroundRemovalResult = {
  toBlob: (type?: string, quality?: number) => Promise<Blob>;
};

type BackgroundRemover = (image: Blob) => Promise<BackgroundRemovalResult>;

type ModelProgress = {
  status: string;
  progress?: number;
};

type WorkerRequest = {
  id: number;
  file: File;
};

const workerScope = self as unknown as {
  postMessage: (message: unknown) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WorkerRequest>) => void,
  ) => void;
};

let removerPromise: Promise<BackgroundRemover> | null = null;
let lastReportedDownloadProgress = -1;

const sendProgress = (id: number, percent: number, message: string) => {
  workerScope.postMessage({ type: "progress", id, percent, message });
};

const getBackgroundRemover = (id: number) => {
  if (!removerPromise) {
    removerPromise = pipeline("background-removal", MODEL_ID, {
      device: "wasm",
      dtype: "fp16",
      progress_callback: (progress: ModelProgress) => {
        if (progress.status === "progress_total") {
          const downloadProgress = Math.max(
            0,
            Math.min(100, progress.progress ?? 0),
          );
          const roundedDownloadProgress = Math.floor(downloadProgress);
          if (roundedDownloadProgress === lastReportedDownloadProgress) return;
          lastReportedDownloadProgress = roundedDownloadProgress;
          sendProgress(
            id,
            5 + downloadProgress * 0.5,
            `Loading background-removal model (${roundedDownloadProgress}%)`,
          );
        } else if (progress.status === "ready") {
          sendProgress(id, 58, "Background-removal model ready");
        }
      },
    })
      .then((remover) => remover as unknown as BackgroundRemover)
      .catch((error) => {
        removerPromise = null;
        throw error;
      });
  }

  return removerPromise;
};

workerScope.addEventListener("message", async (event) => {
  const { id, file } = event.data;

  try {
    sendProgress(id, 2, "Preparing image");
    const remover = await getBackgroundRemover(id);

    sendProgress(id, 62, "Detecting the product");
    const result = await remover(file);

    sendProgress(id, 92, "Creating transparent image");
    const transparentImage = await result.toBlob("image/png", 1);

    sendProgress(id, 100, "Background removed");
    workerScope.postMessage({ type: "complete", id, blob: transparentImage });
  } catch (error) {
    workerScope.postMessage({
      type: "error",
      id,
      message: error instanceof Error ? error.message : "Background removal failed.",
    });
  }
});

export {};

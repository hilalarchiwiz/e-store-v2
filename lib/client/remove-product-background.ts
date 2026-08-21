export interface BackgroundRemovalProgress {
  percent: number;
  message: string;
}

type ProgressListener = (progress: BackgroundRemovalProgress) => void;

type WorkerResponse =
  | {
      type: "progress";
      id: number;
      percent: number;
      message: string;
    }
  | {
      type: "complete";
      id: number;
      blob: Blob;
    }
  | {
      type: "error";
      id: number;
      message: string;
    };

interface PendingRemoval {
  file: File;
  onProgress: ProgressListener;
  resolve: (file: File) => void;
  reject: (error: Error) => void;
}

let backgroundWorker: Worker | null = null;
let nextRequestId = 0;
const pendingRemovals = new Map<number, PendingRemoval>();

const rejectPendingRemovals = (message: string) => {
  const error = new Error(message);
  pendingRemovals.forEach(({ reject }) => reject(error));
  pendingRemovals.clear();
};

const getBackgroundWorker = () => {
  if (backgroundWorker) return backgroundWorker;

  const worker = new Worker(
    new URL("./remove-product-background.worker.ts", import.meta.url),
    { type: "module" },
  );

  worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const pending = pendingRemovals.get(response.id);
    if (!pending) return;

    if (response.type === "progress") {
      pending.onProgress({
        percent: response.percent,
        message: response.message,
      });
      return;
    }

    pendingRemovals.delete(response.id);

    if (response.type === "error") {
      pending.reject(new Error(response.message));
      return;
    }

    const originalName = pending.file.name.replace(/\.[^/.]+$/, "");
    pending.resolve(
      new File([response.blob], `${originalName}-no-background.png`, {
        type: "image/png",
        lastModified: Date.now(),
      }),
    );
  });

  worker.addEventListener("error", () => {
    rejectPendingRemovals("The background-removal worker stopped unexpectedly.");
    worker.terminate();
    if (backgroundWorker === worker) backgroundWorker = null;
  });

  worker.addEventListener("messageerror", () => {
    rejectPendingRemovals("The image could not be sent for background removal.");
  });

  backgroundWorker = worker;
  return worker;
};

export function removeProductBackground(
  file: File,
  onProgress: ProgressListener,
): Promise<File> {
  const id = ++nextRequestId;

  return new Promise<File>((resolve, reject) => {
    pendingRemovals.set(id, { file, onProgress, resolve, reject });

    try {
      getBackgroundWorker().postMessage({ id, file });
    } catch (error) {
      pendingRemovals.delete(id);
      reject(
        error instanceof Error
          ? error
          : new Error("The image could not be sent for background removal."),
      );
    }
  });
}

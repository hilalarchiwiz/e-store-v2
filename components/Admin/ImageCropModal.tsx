"use client";

import { Check, CropIcon, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface CropAspectOption {
  label: string;
  value: number | null;
}

interface ImageCropModalProps {
  file: File;
  title?: string;
  initialAspect?: number | null;
  aspectOptions?: CropAspectOption[];
  outputWidth?: number;
  onCancel: () => void;
  onComplete: (file: File) => void;
}

interface Size {
  width: number;
  height: number;
}

interface CropRectangle extends Size {
  x: number;
  y: number;
}

type ResizeHandle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
type InteractionMode = "move" | ResizeHandle;

interface DragState {
  pointerId: number;
  mode: InteractionMode;
  clientX: number;
  clientY: number;
  scaleX: number;
  scaleY: number;
  crop: CropRectangle;
}

const DEFAULT_ASPECTS: CropAspectOption[] = [
  { label: "Free crop", value: null },
  { label: "Square (1:1)", value: 1 },
  { label: "Landscape (4:3)", value: 4 / 3 },
  { label: "Portrait (3:4)", value: 3 / 4 },
  { label: "Wide (16:9)", value: 16 / 9 },
  { label: "Story (9:16)", value: 9 / 16 },
  { label: "Banner (16:5)", value: 16 / 5 },
];

const HANDLE_POSITIONS: Array<{
  handle: ResizeHandle;
  className: string;
  cursor: string;
}> = [
  { handle: "nw", className: "-left-2.5 -top-2.5", cursor: "cursor-nwse-resize" },
  { handle: "n", className: "left-1/2 -top-2.5 -translate-x-1/2", cursor: "cursor-ns-resize" },
  { handle: "ne", className: "-right-2.5 -top-2.5", cursor: "cursor-nesw-resize" },
  { handle: "e", className: "-right-2.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
  { handle: "se", className: "-bottom-2.5 -right-2.5", cursor: "cursor-nwse-resize" },
  { handle: "s", className: "-bottom-2.5 left-1/2 -translate-x-1/2", cursor: "cursor-ns-resize" },
  { handle: "sw", className: "-bottom-2.5 -left-2.5", cursor: "cursor-nesw-resize" },
  { handle: "w", className: "-left-2.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
];

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const getInitialCrop = (
  imageSize: Size,
  aspect: number | null,
): CropRectangle => {
  const inset = 0.92;
  let width = imageSize.width * inset;
  let height = imageSize.height * inset;

  if (aspect) {
    if (width / height > aspect) width = height * aspect;
    else height = width / aspect;
  }

  return {
    x: (imageSize.width - width) / 2,
    y: (imageSize.height - height) / 2,
    width,
    height,
  };
};

const aspectKey = (aspect: number | null) =>
  aspect === null ? "free" : String(aspect);

export default function ImageCropModal({
  file,
  title = "Adjust image",
  initialAspect = 1,
  aspectOptions = DEFAULT_ASPECTS,
  outputWidth = 1200,
  onCancel,
  onComplete,
}: ImageCropModalProps) {
  const sourceUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const topMaskRef = useRef<HTMLDivElement>(null);
  const bottomMaskRef = useRef<HTMLDivElement>(null);
  const leftMaskRef = useRef<HTMLDivElement>(null);
  const rightMaskRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);
  const draftCrop = useRef<CropRectangle | null>(null);

  const [naturalSize, setNaturalSize] = useState<Size>({ width: 0, height: 0 });
  const [aspect, setAspect] = useState<number | null>(initialAspect);
  const [crop, setCrop] = useState<CropRectangle | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const lockedAspect = aspectOptions.length === 1;
  const selectedAspectLabel =
    aspectOptions.find((option) => option.value === aspect)?.label ??
    (aspect === null ? "Free crop" : `${aspect.toFixed(2)}:1`);

  useEffect(
    () => () => {
      URL.revokeObjectURL(sourceUrl);
    },
    [sourceUrl],
  );

  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancelRef.current();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const minCropSize = useMemo(
    () =>
      Math.min(
        Math.max(8, Math.min(naturalSize.width, naturalSize.height) * 0.04),
        Math.min(naturalSize.width, naturalSize.height),
      ),
    [naturalSize],
  );

  const resetCrop = useCallback(
    (nextAspect = aspect) => {
      if (!naturalSize.width || !naturalSize.height) return;
      setAspect(nextAspect);
      setCrop(getInitialCrop(naturalSize, nextAspect));
      setErrorMessage("");
    },
    [aspect, naturalSize],
  );

  const resizeFreeform = (
    start: CropRectangle,
    handle: ResizeHandle,
    deltaX: number,
    deltaY: number,
  ): CropRectangle => {
    let left = start.x;
    let top = start.y;
    let right = start.x + start.width;
    let bottom = start.y + start.height;

    if (handle.includes("w")) left = clamp(left + deltaX, 0, right - minCropSize);
    if (handle.includes("e"))
      right = clamp(right + deltaX, left + minCropSize, naturalSize.width);
    if (handle.includes("n")) top = clamp(top + deltaY, 0, bottom - minCropSize);
    if (handle.includes("s"))
      bottom = clamp(bottom + deltaY, top + minCropSize, naturalSize.height);

    return { x: left, y: top, width: right - left, height: bottom - top };
  };

  const resizeWithAspect = (
    start: CropRectangle,
    handle: ResizeHandle,
    deltaX: number,
    deltaY: number,
    fixedAspect: number,
  ): CropRectangle => {
    const changesWidth = handle.includes("e") || handle.includes("w");
    const changesHeight = handle.includes("n") || handle.includes("s");

    if (changesWidth && changesHeight) {
      const anchorX = handle.includes("w") ? start.x + start.width : start.x;
      const anchorY = handle.includes("n") ? start.y + start.height : start.y;
      const horizontalWidth = handle.includes("w")
        ? start.width - deltaX
        : start.width + deltaX;
      const verticalHeight = handle.includes("n")
        ? start.height - deltaY
        : start.height + deltaY;
      const verticalWidth = verticalHeight * fixedAspect;
      const useHorizontal =
        Math.abs(horizontalWidth - start.width) >=
        Math.abs(verticalWidth - start.width);
      let width = useHorizontal ? horizontalWidth : verticalWidth;
      const maxWidthX = handle.includes("w")
        ? anchorX
        : naturalSize.width - anchorX;
      const maxHeightY = handle.includes("n")
        ? anchorY
        : naturalSize.height - anchorY;
      width = clamp(
        width,
        Math.max(minCropSize, minCropSize * fixedAspect),
        Math.min(maxWidthX, maxHeightY * fixedAspect),
      );
      const height = width / fixedAspect;

      return {
        x: handle.includes("w") ? anchorX - width : anchorX,
        y: handle.includes("n") ? anchorY - height : anchorY,
        width,
        height,
      };
    }

    if (changesWidth) {
      const anchorX = handle === "w" ? start.x + start.width : start.x;
      const centerY = start.y + start.height / 2;
      const requestedWidth = handle === "w" ? start.width - deltaX : start.width + deltaX;
      const maxWidthX = handle === "w" ? anchorX : naturalSize.width - anchorX;
      const maxWidthY = 2 * Math.min(centerY, naturalSize.height - centerY) * fixedAspect;
      const width = clamp(
        requestedWidth,
        Math.max(minCropSize, minCropSize * fixedAspect),
        Math.min(maxWidthX, maxWidthY),
      );
      const height = width / fixedAspect;
      return {
        x: handle === "w" ? anchorX - width : anchorX,
        y: centerY - height / 2,
        width,
        height,
      };
    }

    const anchorY = handle === "n" ? start.y + start.height : start.y;
    const centerX = start.x + start.width / 2;
    const requestedHeight = handle === "n" ? start.height - deltaY : start.height + deltaY;
    const maxHeightY = handle === "n" ? anchorY : naturalSize.height - anchorY;
    const maxHeightX = (2 * Math.min(centerX, naturalSize.width - centerX)) / fixedAspect;
    const height = clamp(
      requestedHeight,
      Math.max(minCropSize, minCropSize / fixedAspect),
      Math.min(maxHeightY, maxHeightX),
    );
    const width = height * fixedAspect;
    return {
      x: centerX - width / 2,
      y: handle === "n" ? anchorY - height : anchorY,
      width,
      height,
    };
  };

  const startInteraction = (
    event: React.PointerEvent,
    mode: InteractionMode,
  ) => {
    if (!crop || !previewRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    const previewBounds = previewRef.current.getBoundingClientRect();
    previewRef.current.setPointerCapture(event.pointerId);
    draftCrop.current = { ...crop };
    dragState.current = {
      pointerId: event.pointerId,
      mode,
      clientX: event.clientX,
      clientY: event.clientY,
      scaleX: naturalSize.width / previewBounds.width,
      scaleY: naturalSize.height / previewBounds.height,
      crop: { ...crop },
    };
  };

  const previewCrop = (nextCrop: CropRectangle) => {
    if (!naturalSize.width || !naturalSize.height) return;

    const left = (nextCrop.x / naturalSize.width) * 100;
    const top = (nextCrop.y / naturalSize.height) * 100;
    const width = (nextCrop.width / naturalSize.width) * 100;
    const height = (nextCrop.height / naturalSize.height) * 100;
    const bottom =
      ((naturalSize.height - nextCrop.y - nextCrop.height) /
        naturalSize.height) *
      100;
    const right =
      ((naturalSize.width - nextCrop.x - nextCrop.width) /
        naturalSize.width) *
      100;

    if (selectionRef.current) {
      selectionRef.current.style.left = `${left}%`;
      selectionRef.current.style.top = `${top}%`;
      selectionRef.current.style.width = `${width}%`;
      selectionRef.current.style.height = `${height}%`;
    }
    if (topMaskRef.current) topMaskRef.current.style.height = `${top}%`;
    if (bottomMaskRef.current)
      bottomMaskRef.current.style.height = `${bottom}%`;
    if (leftMaskRef.current) {
      leftMaskRef.current.style.top = `${top}%`;
      leftMaskRef.current.style.width = `${left}%`;
      leftMaskRef.current.style.height = `${height}%`;
    }
    if (rightMaskRef.current) {
      rightMaskRef.current.style.top = `${top}%`;
      rightMaskRef.current.style.width = `${right}%`;
      rightMaskRef.current.style.height = `${height}%`;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId || !previewRef.current) return;
    const deltaX = (event.clientX - drag.clientX) * drag.scaleX;
    const deltaY = (event.clientY - drag.clientY) * drag.scaleY;
    let nextCrop: CropRectangle;

    if (drag.mode === "move") {
      nextCrop = {
        ...drag.crop,
        x: clamp(drag.crop.x + deltaX, 0, naturalSize.width - drag.crop.width),
        y: clamp(drag.crop.y + deltaY, 0, naturalSize.height - drag.crop.height),
      };
    } else {
      nextCrop = aspect
        ? resizeWithAspect(drag.crop, drag.mode, deltaX, deltaY, aspect)
        : resizeFreeform(drag.crop, drag.mode, deltaX, deltaY);
    }

    draftCrop.current = nextCrop;
    previewCrop(nextCrop);
  };

  const stopInteraction = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    const completedCrop = draftCrop.current;
    dragState.current = null;
    draftCrop.current = null;
    if (completedCrop) setCrop(completedCrop);
    if (previewRef.current?.hasPointerCapture(event.pointerId)) {
      previewRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const updateDimension = (dimension: "width" | "height", value: number) => {
    if (!crop || !Number.isFinite(value)) return;

    if (!aspect) {
      setCrop({
        ...crop,
        [dimension]: clamp(
          value,
          minCropSize,
          dimension === "width"
            ? naturalSize.width - crop.x
            : naturalSize.height - crop.y,
        ),
      });
      return;
    }

    const maxWidth = Math.min(
      naturalSize.width - crop.x,
      (naturalSize.height - crop.y) * aspect,
    );
    const width = clamp(
      dimension === "width" ? value : value * aspect,
      Math.max(minCropSize, minCropSize * aspect),
      maxWidth,
    );
    setCrop({ ...crop, width, height: width / aspect });
  };

  const updatePosition = (axis: "x" | "y", value: number) => {
    if (!crop || !Number.isFinite(value)) return;
    setCrop({
      ...crop,
      [axis]: clamp(
        value,
        0,
        axis === "x"
          ? naturalSize.width - crop.width
          : naturalSize.height - crop.height,
      ),
    });
  };

  const applyCrop = async () => {
    if (!crop || !imageRef.current || processing) return;
    setErrorMessage("");
    setProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = Math.max(
        1,
        Math.round(outputWidth * (crop.height / crop.width)),
      );
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image crop is not supported.");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        imageRef.current,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error("Crop failed.")),
          "image/webp",
          0.9,
        );
      });
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      onComplete(
        new File([blob], `${originalName}-cropped.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        }),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The image could not be cropped. Please try another file.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const cropStyle = crop
    ? {
        left: `${(crop.x / naturalSize.width) * 100}%`,
        top: `${(crop.y / naturalSize.height) * 100}%`,
        width: `${(crop.width / naturalSize.width) * 100}%`,
        height: `${(crop.height / naturalSize.height) * 100}%`,
      }
    : undefined;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-title"
    >
      <div className="flex max-h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CropIcon size={20} />
            </span>
            <div className="min-w-0">
              <h2 id="image-crop-title" className="truncate text-lg font-bold text-gray-900">
                {title}
              </h2>
              <p className="hidden text-xs text-gray-500 sm:block">
                Drag the crop box or use its handles for an exact fit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel image crop"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto bg-[#f4f6f5] lg:grid-cols-[minmax(0,1fr)_330px] lg:overflow-hidden">
          <div className="flex min-h-70 items-center justify-center overflow-hidden bg-[#171a19] p-4 sm:min-h-96 sm:p-6 lg:min-h-0">
            <div
              ref={previewRef}
              data-crop-preview
              className="relative max-h-full max-w-full touch-none select-none"
              style={{
                backgroundColor: "#ffffff",
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                backgroundSize: "16px 16px",
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={stopInteraction}
              onPointerCancel={stopInteraction}
            >
              <img
                ref={imageRef}
                src={sourceUrl}
                alt="Image being cropped"
                draggable={false}
                onLoad={(event) => {
                  const size = {
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  };
                  setNaturalSize(size);
                  setCrop(getInitialCrop(size, initialAspect));
                }}
                className="block max-h-[52dvh] max-w-full object-contain lg:max-h-[68dvh]"
              />

              {crop && (
                <>
                  <div
                    ref={topMaskRef}
                    className="pointer-events-none absolute left-0 top-0 bg-black/60"
                    style={{ width: "100%", height: cropStyle?.top }}
                  />
                  <div
                    ref={bottomMaskRef}
                    className="pointer-events-none absolute bottom-0 left-0 bg-black/60"
                    style={{
                      width: "100%",
                      height: `${((naturalSize.height - crop.y - crop.height) / naturalSize.height) * 100}%`,
                    }}
                  />
                  <div
                    ref={leftMaskRef}
                    className="pointer-events-none absolute left-0 bg-black/60"
                    style={{
                      top: cropStyle?.top,
                      width: cropStyle?.left,
                      height: cropStyle?.height,
                    }}
                  />
                  <div
                    ref={rightMaskRef}
                    className="pointer-events-none absolute right-0 bg-black/60"
                    style={{
                      top: cropStyle?.top,
                      width: `${((naturalSize.width - crop.x - crop.width) / naturalSize.width) * 100}%`,
                      height: cropStyle?.height,
                    }}
                  />

                  <div
                    ref={selectionRef}
                    data-crop-selection
                    className="absolute cursor-move border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
                    style={cropStyle}
                    onPointerDown={(event) => startInteraction(event, "move")}
                  >
                    <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <span key={index} className="border-[0.5px] border-white/55" />
                      ))}
                    </div>
                    {HANDLE_POSITIONS.map(({ handle, className, cursor }) => (
                      <button
                        type="button"
                        key={handle}
                        aria-label={`Resize crop from ${handle}`}
                        onPointerDown={(event) => startInteraction(event, handle)}
                        className={`absolute z-10 size-5 rounded-full border-2 border-gray-500 bg-white shadow-md ${className} ${cursor}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="overflow-y-auto border-t border-gray-200 bg-white p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="mb-5">
              <div className="mb-1 flex items-center justify-between gap-3">
                <label htmlFor="crop-aspect" className="text-sm font-bold text-gray-900">
                  Aspect ratio
                </label>
                {lockedAspect && (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                    Recommended
                  </span>
                )}
              </div>
              <select
                id="crop-aspect"
                value={aspectKey(aspect)}
                disabled={lockedAspect}
                onChange={(event) =>
                  resetCrop(event.target.value === "free" ? null : Number(event.target.value))
                }
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                {aspectOptions.map((option) => (
                  <option key={`${option.label}-${aspectKey(option.value)}`} value={aspectKey(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                {lockedAspect
                  ? `${selectedAspectLabel} is required for this image location.`
                  : "Choose a preset or Free crop for a custom shape."}
              </p>
            </div>

            <fieldset className="mb-5">
              <legend className="mb-2 text-sm font-bold text-gray-900">Crop size</legend>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Width (px)"
                  value={crop?.width}
                  onChange={(value) => updateDimension("width", value)}
                />
                <NumberField
                  label="Height (px)"
                  value={crop?.height}
                  onChange={(value) => updateDimension("height", value)}
                />
              </div>
            </fieldset>

            <fieldset className="mb-5">
              <legend className="mb-2 text-sm font-bold text-gray-900">Crop position</legend>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="X position"
                  value={crop?.x}
                  onChange={(value) => updatePosition("x", value)}
                />
                <NumberField
                  label="Y position"
                  value={crop?.y}
                  onChange={(value) => updatePosition("y", value)}
                />
              </div>
            </fieldset>

            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
              <div className="flex justify-between gap-3">
                <span>Original image</span>
                <strong className="text-gray-800">
                  {naturalSize.width} × {naturalSize.height}px
                </strong>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span>Output image</span>
                <strong className="text-gray-800">
                  {crop
                    ? `${outputWidth} × ${Math.round(outputWidth * (crop.height / crop.width))}px`
                    : "—"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => resetCrop()}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RotateCcw size={16} />
              Reset crop
            </button>

            {errorMessage && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-600">
                {errorMessage}
              </p>
            )}
          </aside>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            disabled={!crop || processing}
            className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Check size={17} />
            )}
            {processing ? "Cropping..." : "Crop image"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number) => void;
}) {
  const formattedValue = value === undefined ? "" : String(Math.round(value));
  const [draftValue, setDraftValue] = useState(formattedValue);

  useEffect(() => {
    setDraftValue(formattedValue);
  }, [formattedValue]);

  const commitValue = () => {
    const nextValue = Number(draftValue);
    if (draftValue.trim() !== "" && Number.isFinite(nextValue)) {
      onChange(nextValue);
    } else {
      setDraftValue(formattedValue);
    }
  };

  return (
    <label className="block text-xs font-medium text-gray-600">
      {label}
      <input
        type="number"
        min={0}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="mt-1 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

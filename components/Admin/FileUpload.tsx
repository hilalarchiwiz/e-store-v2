"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ImageCropModal, { type CropAspectOption } from "./ImageCropModal";

interface FileUploadProps {
  defaultImageUrl?: string | null;
  title?: string;
  name?: string;
  aspectRatio?: number;
  allowAspectSelection?: boolean;
  cropOutputWidth?: number;
}

const ASPECT_OPTIONS: CropAspectOption[] = [
  { label: "Free crop", value: null },
  { label: "Square (1:1)", value: 1 },
  { label: "Landscape (4:3)", value: 4 / 3 },
  { label: "Portrait (3:4)", value: 3 / 4 },
  { label: "Wide (16:9)", value: 16 / 9 },
  { label: "Story (9:16)", value: 9 / 16 },
  { label: "Banner (16:5)", value: 16 / 5 },
];

const FileUpload = ({
  defaultImageUrl,
  title = "Add Image",
  name = "image",
  aspectRatio = 1,
  allowAspectSelection = true,
  cropOutputWidth = 1200,
}: FileUploadProps) => {
  const [preview, setPreview] = useState(defaultImageUrl || "");
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  useEffect(
    () => () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    },
    [previewObjectUrl],
  );

  const beginCrop = (file?: File) => {
    if (file?.type.startsWith("image/")) setPendingFile(file);
  };

  const useCroppedImage = (croppedFile: File) => {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(croppedFile);
      fileInputRef.current.files = dataTransfer.files;
    }
    selectedFileRef.current = croppedFile;

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    const nextPreviewUrl = URL.createObjectURL(croppedFile);
    setPreviewObjectUrl(nextPreviewUrl);
    setPreview(nextPreviewUrl);
    setPendingFile(null);
  };

  const cancelCrop = () => {
    setPendingFile(null);
    if (fileInputRef.current) {
      if (selectedFileRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(selectedFileRef.current);
        fileInputRef.current.files = dataTransfer.files;
      } else {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    beginCrop(event.dataTransfer.files?.[0]);
  };

  const lockedAspectLabel =
    ASPECT_OPTIONS.find(
      (option) =>
        option.value !== null && Math.abs(option.value - aspectRatio) < 0.001,
    )?.label ?? `Custom (${aspectRatio.toFixed(2)}:1)`;
  const lockedAspectOptions = [
    { label: lockedAspectLabel, value: aspectRatio },
  ];

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {title}
      </label>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors sm:p-8 ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30"
        }`}
      >
        <input
          type="file"
          name={name}
          accept="image/*"
          ref={fileInputRef}
          onChange={(event) => beginCrop(event.target.files?.[0])}
          className="hidden"
        />

        {preview ? (
          <div className="relative flex w-full flex-col items-center">
            <div className="relative h-56 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-[#f4f6f5] sm:h-72">
              <Image
                unoptimized
                fill
                src={preview}
                alt={`${title} preview`}
                className="object-contain p-2"
              />
            </div>
            <p className="mt-3 text-xs font-medium text-gray-500">
              Click or drag an image to replace and crop it
            </p>
            <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
              {previewObjectUrl ? "Cropped" : "Current"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-3">
            <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ImagePlus size={30} />
            </span>
            <div>
              <span className="font-semibold text-emerald-600">
                Click to upload
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG or WEBP. A crop editor opens before upload.
            </p>
          </div>
        )}
      </div>

      {pendingFile && (
        <ImageCropModal
          file={pendingFile}
          title={`Crop ${title}`}
          initialAspect={aspectRatio}
          aspectOptions={
            allowAspectSelection ? ASPECT_OPTIONS : lockedAspectOptions
          }
          outputWidth={cropOutputWidth}
          onCancel={cancelCrop}
          onComplete={useCroppedImage}
        />
      )}
    </div>
  );
};

export default FileUpload;

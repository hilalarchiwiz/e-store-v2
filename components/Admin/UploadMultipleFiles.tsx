'use client'
import imageCompression from 'browser-image-compression';
import { Plus, X, UploadCloud, Loader2, WandSparkles } from 'lucide-react'
import React, { useState, useRef, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { uploadMultipleImages, deleteImageFromBlob } from '@/lib/action/FileUpload'; // Assume deleteImageFromBlob is imported
import { removeProductBackground } from '@/lib/client/remove-product-background';

// Define the component props to accept default images (for Edit mode)
interface UploadMultipleFilesProps {
    defaultImages?: string[];
    onImagesChange?: (urls: string[]) => void; // Add this prop
}

type ProcessingPhase = 'background' | 'compression' | 'upload';

interface ProcessingProgress {
    phase: ProcessingPhase;
    percent: number;
    title: string;
    detail: string;
}

// A simple utility to convert FileList to an array of Files
const fileListToArray = (fileList: FileList): File[] => {
    const files: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
        files.push(fileList.item(i)!);
    }
    return files;
};

// Component to handle both file uploads and URL inputs
const UploadMultipleFiles = ({ defaultImages, onImagesChange }: UploadMultipleFilesProps) => {
    // 1. Initialize state with default images if provided
    const [images, setImages] = useState<string[]>(defaultImages || []);

    // State to handle the direct URL input field
    const [urlInput, setUrlInput] = useState('');

    // Use Next.js useTransition for client-side loading state
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition(); // New transition for delete operation

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
    const imagePreparationPending = useRef(false);
    const onImagesChangeRef = useRef(onImagesChange);

    // --- Handlers for URL Input ---

    const handleAddImageUrl = () => {
        if (urlInput.trim() && !images.includes(urlInput.trim())) {
            setImages([...images, urlInput.trim()]);
            setUrlInput('');
        }
    };

    // --- Handlers for Image Deletion ---

    const handleRemoveImage = (index: number) => {
        const imageUrlToDelete = images[index];

        // 2. Start delete transition
        startDeleteTransition(async () => {
            if (imageUrlToDelete.startsWith('https://')) { // Check if it's a remote/blob URL (not a local preview blob)
                console.log(`Attempting to delete image from server: ${imageUrlToDelete}`);

                // Call the new server action to delete from blob storage
                const { error } = await deleteImageFromBlob(imageUrlToDelete);

                if (error) {
                    console.error("Server Delete Error:", error);
                    // Decide if you want to proceed with local removal even if server failed.
                    // For safety, you might want to stop here and notify the user.
                    alert(`Failed to delete image on server. Please try again. Error: ${error}`);
                    return;
                }
            }

            // If deletion was successful (or if it was a local URL that didn't need server deletion),
            // proceed to remove it from the local state.
            setImages(images.filter((_, i) => i !== index));
        });
    };

    // --- Handlers for File Upload ---

    const prepareFilesForUpload = async (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length === 0 || imagePreparationPending.current) return;

        imagePreparationPending.current = true;
        const preparedFiles: File[] = [];

        try {
            for (let index = 0; index < imageFiles.length; index++) {
                const file = imageFiles[index];
                const preparedFile = await removeProductBackground(file, ({ percent, message }) => {
                    const overallPercent = Math.round(
                        ((index + percent / 100) / imageFiles.length) * 100,
                    );

                    setProcessingProgress({
                        phase: 'background',
                        percent: overallPercent,
                        title: 'Removing image background',
                        detail: `Image ${index + 1} of ${imageFiles.length} · ${message}`,
                    });
                });
                preparedFiles.push(preparedFile);
            }

            handleFileUpload(preparedFiles);
        } catch (error) {
            console.error('Background removal error:', error);
            setProcessingProgress(null);
            alert('Background removal failed. Please check your connection and try again.');
        } finally {
            imagePreparationPending.current = false;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = fileListToArray(files);
            if (fileArray.length > 0) {
                void prepareFilesForUpload(fileArray);
            }
        }
        e.target.value = '';
    };

    const handleFileUpload = (files: File[]) => {
        if (files.length === 0) return;

        startTransition(async () => {
            let uploadProgressTimer: number | null = null;

            try {
                const compressionProgress = files.map(() => 0);
                const compressedFiles = await Promise.all(
                    files.map((file, index) => imageCompression(file, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1200,
                        useWebWorker: true,
                        onProgress: (percent) => {
                            compressionProgress[index] = percent;
                            const averageProgress = compressionProgress.reduce(
                                (total, current) => total + current,
                                0,
                            ) / compressionProgress.length;

                            setProcessingProgress({
                                phase: 'compression',
                                percent: Math.round(averageProgress),
                                title: 'Optimizing product images',
                                detail: `Preparing ${files.length} image${files.length === 1 ? '' : 's'} for upload`,
                            });
                        },
                    }))
                );

                setProcessingProgress({
                    phase: 'upload',
                    percent: 82,
                    title: 'Uploading product images',
                    detail: 'Securely saving the finished images',
                });

                uploadProgressTimer = window.setInterval(() => {
                    setProcessingProgress((current) =>
                        current?.phase === 'upload' && current.percent < 95
                            ? { ...current, percent: current.percent + 1 }
                            : current,
                    );
                }, 300);

                const { urls, error } = await uploadMultipleImages(compressedFiles);
                window.clearInterval(uploadProgressTimer);
                uploadProgressTimer = null;

                if (error) alert(error);
                if (urls.length > 0) {
                    setImages((prevImages) => [...prevImages, ...urls]);
                }
                setProcessingProgress({
                    phase: 'upload',
                    percent: 100,
                    title: 'Upload complete',
                    detail: `${urls.length} image${urls.length === 1 ? '' : 's'} saved successfully`,
                });
                await new Promise((resolve) => window.setTimeout(resolve, 350));
            } catch (err) {
                console.error("Compression/Upload error:", err);
                alert('The images could not be uploaded. Please try again.');
            } finally {
                if (uploadProgressTimer !== null) {
                    window.clearInterval(uploadProgressTimer);
                }
                setProcessingProgress(null);
            }
        });
    };

    const handleUploadClick = () => {
        if (processingProgress || imagePreparationPending.current) return;
        fileInputRef.current?.click();
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const files = fileListToArray(event.dataTransfer.files);
        if (files.length > 0) {
            void prepareFilesForUpload(files);
        }
    };

    useEffect(() => {
        onImagesChangeRef.current = onImagesChange;
    }, [onImagesChange]);

    useEffect(() => {
        onImagesChangeRef.current?.(images);
    }, [images]);
    return (
        <div className="py-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 ">Product Images</h2>

            {/* Direct URL Input */}
            <div className="flex gap-3 mb-4">
                <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="Enter image URL"
                />
                <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="flex items-center gap-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:bg-emerald-400"
                    disabled={!urlInput.trim() || isDeleting}
                >
                    <Plus className="w-5 h-5" />
                    Add URL
                </button>
            </div>

            {/* File Upload Area */}
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors mb-6 ${processingProgress ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={handleUploadClick}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    disabled={Boolean(processingProgress)}
                    style={{ display: 'none' }}
                />

                {isPending ? (
                    <div className="flex items-center justify-center text-emerald-600">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Uploading images...
                    </div>
                ) : (
                    <div className='flex items-center justify-center gap-2 text-gray-600'>
                        <UploadCloud className="w-6 h-6 text-emerald-500" />
                        <span className="font-semibold">Drag & drop files here, or click to browse</span>
                        <p className="text-sm text-gray-500 mt-1">(Supports multiple images)</p>
                    </div>
                )}
            </div>


            {/* Image Previews */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.length === 0 && !isPending && !isDeleting && (
                    <p className="col-span-4 text-center text-gray-500">No images added yet.</p>
                )}

                {images.map((image, index) => (
                    <div key={index} className="relative group">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            {/* <Image
                                src={image}
                                alt={`Product ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                            /> */}

                            {
                                images && images.length > 0 && images[0] !== ''
                                    ? <Image
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-contain p-2"
                                    /> : ''
                            }

                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            // Display loading state during deletion
                            disabled={isDeleting}
                            className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-opacity 
                                        opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Show spinner on the delete button */}
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Hidden Field for Form Submission (Crucial for the main Server Action) */}
            {/* The final list of URLs is submitted here */}
            {images.map((url, index) => (
                <input
                    key={index}
                    type="hidden"
                    name="images" // The array name expected by the create/update action
                    value={url}
                />
            ))}

            {processingProgress && (
                <ImageProcessingProgress progress={processingProgress} />
            )}
        </div>
    )
}

export default UploadMultipleFiles

function ImageProcessingProgress({ progress }: { progress: ProcessingProgress }) {
    const steps = [
        { label: 'Remove background', phase: 'background' as const },
        { label: 'Optimize', phase: 'compression' as const },
        { label: 'Upload', phase: 'upload' as const },
    ];
    const activeStep = progress.phase === 'background'
        ? 0
        : progress.phase === 'compression'
            ? 1
            : 2;

    return (
        <div
            className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            aria-label={progress.title}
        >
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <WandSparkles className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-gray-900">{progress.title}</h3>
                            <span className="text-sm font-bold tabular-nums text-emerald-700">
                                {Math.round(progress.percent)}%
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{progress.detail}</p>
                    </div>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-emerald-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-300 ease-out"
                        style={{ width: `${Math.max(2, Math.min(100, progress.percent))}%` }}
                    />
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                    {steps.map((step, index) => {
                        const completed = index < activeStep;
                        const active = index === activeStep;

                        return (
                            <div key={step.label} className="text-center">
                                <span className={`mx-auto flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                                    completed || active
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {completed ? '✓' : index + 1}
                                </span>
                                <span className={`mt-1.5 block text-[10px] font-semibold sm:text-xs ${
                                    active ? 'text-emerald-700' : 'text-gray-500'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {progress.phase === 'background' && (
                    <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700">
                        The AI model is downloaded only on first use, then cached by your browser. Images stay on this device until the final upload.
                    </p>
                )}
            </div>
        </div>
    );
}

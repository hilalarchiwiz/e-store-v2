'use client'
import imageCompression from 'browser-image-compression';
import { Plus, X, UploadCloud, Loader2 } from 'lucide-react'
import React, { useState, useRef, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { uploadMultipleImages, deleteImageFromBlob } from '@/lib/action/FileUpload'; // Assume deleteImageFromBlob is imported

// Define the component props to accept default images (for Edit mode)
interface UploadMultipleFilesProps {
    defaultImages?: string[];
    onImagesChange?: (urls: string[]) => void; // Add this prop
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
                const { success, error } = await deleteImageFromBlob(imageUrlToDelete);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = fileListToArray(files);
            handleFileUpload(fileArray);
        }
        e.target.value = '';
    };

    const handleFileUpload = (files: File[]) => {
        if (files.length === 0) return;

        startTransition(async () => {
            // // Assume uploadMultipleImages returns public URLs
            // const { urls, error } = await uploadMultipleImages(files);

            // if (error) {
            //     console.error("Upload Error:", error);
            //     alert(`Error: ${error}`);
            // }

            // if (urls.length > 0) {
            //     setImages((prevImages) => [...prevImages, ...urls]);
            // }

            try {
                // 1. COMPRESS IMAGES BEFORE UPLOAD
                const compressionOptions = {
                    maxSizeMB: 1,          // Max 1MB per image
                    maxWidthOrHeight: 1200, // Reasonable web size
                    useWebWorker: true
                };

                const compressedFiles = await Promise.all(
                    files.map(file => imageCompression(file, compressionOptions))
                );

                // 2. UPLOAD COMPRESSED FILES
                const { urls, error } = await uploadMultipleImages(compressedFiles);

                if (error) alert(error);
                if (urls.length > 0) {
                    setImages((prevImages) => [...prevImages, ...urls]);
                }
            } catch (err) {
                console.error("Compression/Upload error:", err);
            }
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    }

    useEffect(() => {
        onImagesChange?.(images);
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors mb-6"
                onClick={handleUploadClick}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
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
                                        className="object-cover"
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
        </div>
    )
}

export default UploadMultipleFiles
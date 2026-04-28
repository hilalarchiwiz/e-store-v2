"use client";

import { Package } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';

const FileUpload = ({ defaultImageUrl, title = "Add Image", name = "image" }: any) => {
    console.log(defaultImageUrl);
    const [preview, setPreview] = useState(defaultImageUrl);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (defaultImageUrl) setPreview(defaultImageUrl);
    }, [defaultImageUrl]);

    // Helper to handle file selection
    const handleFile = (file: any) => {
        if (file && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Manually sync the file to the hidden input if dropped
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        handleFile(file);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {title}
            </label>

            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-emerald-400 transition-colors
                    ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"}`}
            >
                {/* Hidden File Input */}
                <input
                    type="file"
                    name={name}
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {preview ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                        <Image
                            unoptimized
                            width={300}
                            height={300}
                            src={preview}
                            alt="Preview"
                            className="w-[500px] h-[300px] object-contain"
                        />
                        <p className="mt-2 text-xs text-gray-500 font-medium">Click or drag to replace</p>
                        <div className="absolute top-0 right-1 bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                            {preview === defaultImageUrl ? "Current" : "New"}
                        </div>
                    </div>
                ) : (
                    // <div className="flex flex-col items-center justify-center py-6">
                    //     <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    //     </svg>
                    //     <p className="text-sm text-gray-600">
                    //         <span className="font-semibold">Click to upload</span> or drag and drop
                    //     </p>
                    //     <p className="text-xs text-gray-500 mt-1">PNG, JPG or WebP (MAX. 800x400px)</p>
                    // </div>

                    <div>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <button type="button" className="text-emerald-600 font-medium hover:text-emerald-700">
                                    Click to upload
                                </button>
                                <span className="text-gray-500"> or drag and drop</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                PNG, JPG or WEBP (max. 2MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
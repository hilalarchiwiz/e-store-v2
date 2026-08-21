'use client';

import { useState } from 'react';
import {
    ChevronDown,
    ImageOff,
    LoaderCircle,
    WandSparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { removeProductBackground } from '@/lib/client/remove-product-background';
import { replaceGalleryImageBackground } from '../(actions)/gallery.action';

export interface GalleryProduct {
    id: number;
    title: string;
    images: string[];
}

interface ProductGalleryManagerProps {
    products: GalleryProduct[];
    canUpdate: boolean;
}

interface ProgressState {
    percent: number;
    message: string;
}

const getImageKey = (productId: number, imageIndex: number) => `${productId}:${imageIndex}`;

const addCacheVersion = (imageUrl: string, version?: number) => {
    if (!version) return imageUrl;

    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}galleryVersion=${version}`;
};

const getFileName = (imageUrl: string) => {
    try {
        return decodeURIComponent(new URL(imageUrl).pathname.split('/').pop() || 'product-image');
    } catch {
        return 'product-image';
    }
};

export default function ProductGalleryManager({
    products,
    canUpdate,
}: ProductGalleryManagerProps) {
    const [openProductId, setOpenProductId] = useState<number | null>(null);
    const [activeImageKey, setActiveImageKey] = useState<string | null>(null);
    const [progress, setProgress] = useState<ProgressState | null>(null);
    const [imageVersions, setImageVersions] = useState<Record<string, number>>({});

    const clearBackground = async (
        productId: number,
        imageUrl: string,
        imageIndex: number,
    ) => {
        if (activeImageKey) return;

        const imageKey = getImageKey(productId, imageIndex);
        setActiveImageKey(imageKey);
        setProgress({ percent: 3, message: 'Downloading the selected image' });

        try {
            const query = new URLSearchParams({
                productId: String(productId),
                url: imageUrl,
            });
            const response = await fetch(`/api/admin/gallery-image?${query.toString()}`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Unable to download this Azure image.');
            }

            const sourceBlob = await response.blob();
            const sourceFile = new File([sourceBlob], getFileName(imageUrl), {
                type: sourceBlob.type || 'image/webp',
                lastModified: Date.now(),
            });

            setProgress({ percent: 10, message: 'Starting background removal' });
            const transparentFile = await removeProductBackground(sourceFile, (workerProgress) => {
                setProgress({
                    percent: Math.min(88, Math.round(10 + workerProgress.percent * 0.78)),
                    message: workerProgress.message,
                });
            });

            setProgress({ percent: 91, message: 'Replacing the same Azure image' });
            const formData = new FormData();
            formData.set('productId', String(productId));
            formData.set('imageUrl', imageUrl);
            formData.set('image', transparentFile);

            const result = await replaceGalleryImageBackground(formData);
            if (!result?.success) {
                throw new Error(result?.message || 'Unable to replace the Azure image.');
            }

            setProgress({ percent: 100, message: 'Background cleared' });
            setImageVersions((current) => ({
                ...current,
                [imageKey]: result.version || Date.now(),
            }));
            toast.success(result.message || 'Background cleared successfully.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Background removal failed.');
        } finally {
            setActiveImageKey(null);
            setProgress(null);
        }
    };

    return (
        <div className="min-w-0 max-w-full divide-y divide-slate-200 overflow-hidden">
            {products.map((product) => {
                const isOpen = openProductId === product.id;
                const firstImage = product.images[0];

                return (
                    <section key={product.id} className="min-w-0 max-w-full overflow-hidden bg-white">
                        <button
                            type="button"
                            onClick={() => setOpenProductId(isOpen ? null : product.id)}
                            className="flex min-w-0 max-w-full items-center gap-4 overflow-hidden px-5 py-4 text-left transition-colors hover:bg-slate-50"
                            aria-expanded={isOpen}
                        >
                            <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                {firstImage ? (
                                    <img
                                        src={addCacheVersion(
                                            firstImage,
                                            imageVersions[getImageKey(product.id, 0)],
                                        )}
                                        alt=""
                                        className="h-full w-full object-contain"
                                        loading="lazy"
                                    />
                                ) : (
                                    <ImageOff className="h-6 w-6 text-slate-400" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="line-clamp-2 break-words text-base font-semibold leading-6 text-slate-800">
                                    {product.title}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {product.images.length} {product.images.length === 1 ? 'image' : 'images'}
                                </p>
                            </div>

                            <ChevronDown
                                className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {isOpen && (
                            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5">
                                {product.images.length === 0 ? (
                                    <p className="text-sm text-slate-500">This product has no images.</p>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        {product.images.map((imageUrl, imageIndex) => {
                                            const imageKey = getImageKey(product.id, imageIndex);
                                            const isProcessing = activeImageKey === imageKey;

                                            return (
                                                <article
                                                    key={imageKey}
                                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                                >
                                                    <div
                                                        className="flex h-52 items-center justify-center p-3"
                                                        style={{
                                                            backgroundColor: '#f8fafc',
                                                            backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                                                            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                                                            backgroundSize: '16px 16px',
                                                        }}
                                                    >
                                                        <img
                                                            src={addCacheVersion(imageUrl, imageVersions[imageKey])}
                                                            alt={`${product.title} image ${imageIndex + 1}`}
                                                            className="h-full w-full object-contain"
                                                            loading="lazy"
                                                        />
                                                    </div>

                                                    <div className="border-t border-slate-200 p-3">
                                                        <div className="mb-3 flex items-center justify-between gap-3">
                                                            <span className="text-xs font-medium text-slate-500">
                                                                Image {imageIndex + 1}
                                                            </span>
                                                            {canUpdate && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => clearBackground(
                                                                        product.id,
                                                                        imageUrl,
                                                                        imageIndex,
                                                                    )}
                                                                    disabled={activeImageKey !== null}
                                                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                                >
                                                                    {isProcessing ? (
                                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <WandSparkles className="h-4 w-4" />
                                                                    )}
                                                                    {isProcessing ? 'Clearing...' : 'Clear BG'}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {isProcessing && progress && (
                                                            <div aria-live="polite">
                                                                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-slate-600">
                                                                    <span className="truncate">{progress.message}</span>
                                                                    <span className="font-semibold">{progress.percent}%</span>
                                                                </div>
                                                                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                                    <div
                                                                        className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                                                                        style={{ width: `${progress.percent}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

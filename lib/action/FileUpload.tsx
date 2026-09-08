"use server";

import { BlobServiceClient } from "@azure/storage-blob";
import sharp from "sharp";
import prisma from "@/lib/prisma";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "images";
const AZURE_STORAGE_ACCOUNT_NAME = "staticportal";

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

/**
 * HELPER: Compresses a buffer using Sharp
 * Converts to WebP for best compression/quality ratio
 */
async function compressImage(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Limit max width to 1200px
        .webp({ quality: 80 }) // Convert to WebP with 80% quality
        .toBuffer();
}

export async function uploadImage(formData: FormData) {
    const imageFile = formData.get("image") as File;

    if (!imageFile || imageFile.size === 0) {
        return { success: false, message: 'No image file provided.' };
    }

    // Change extension to .webp since we are converting it
    const fileNameWithoutExt = imageFile.name.replace(/\.[^/.]+$/, "").replace(/\s/g, "_");
    const uniqueFileName = `${Date.now()}-${fileNameWithoutExt}.webp`;

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);

    try {
        const originalBuffer = Buffer.from(await imageFile.arrayBuffer());

        // 2. COMPRESS BEFORE UPLOAD
        const compressedBuffer = await compressImage(originalBuffer);

        await blockBlobClient.uploadData(compressedBuffer, {
            blobHTTPHeaders: { blobContentType: "image/webp" }
        });

        return {
            success: "Image compressed and uploaded successfully",
            url: blockBlobClient.url,
            fileName: uniqueFileName
        };

    } catch (error) {
        const err = error as Error | { message: string };
        return { success: false, message: err.message };
    }
}

export async function uploadMultipleImages(imageFiles: File[]): Promise<{ urls: string[], error?: string }> {
    if (!imageFiles || imageFiles.length === 0) {
        return { urls: [], error: "No image files provided." };
    }

    const successfulUrls: string[] = [];
    let hasError = false;

    for (const imageFile of imageFiles) {
        try {
            const fileNameWithoutExt = imageFile.name.replace(/\.[^/.]+$/, "").replace(/\s/g, "_");
            const uniqueFileName = `${Date.now()}-${fileNameWithoutExt}.webp`;
            const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);

            const arrayBuffer = await imageFile.arrayBuffer();
            const originalBuffer = Buffer.from(arrayBuffer);

            // 3. COMPRESS BEFORE UPLOAD
            const compressedBuffer = await compressImage(originalBuffer);

            await blockBlobClient.uploadData(compressedBuffer, {
                blobHTTPHeaders: { blobContentType: "image/webp" }
            });

            successfulUrls.push(blockBlobClient.url);
        } catch (error) {
            console.error(`Error uploading ${imageFile.name}:`, error);
            hasError = true;
        }
    }

    return {
        urls: successfulUrls,
        error: hasError ? "Some images failed to upload." : undefined
    };
}
function getBlobNameFromUrl(url: string): string | null {
    if (!url || !AZURE_STORAGE_ACCOUNT_NAME) return null;

    const expectedPrefix = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/`;

    if (url.startsWith(expectedPrefix)) {
        return url.substring(expectedPrefix.length);
    }

    const parts = url.split(`/${CONTAINER_NAME}/`);
    if (parts.length > 1) {
        return parts[1];
    }

    return null;
}

/**
 * Deletes multiple images from Azure Blob Storage.
 * @param imageUrls An array of public URLs of the images to delete.
 */
export async function deleteMultipleImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(async (url) => {
        const blobName = getBlobNameFromUrl(url);

        if (!blobName) {
            console.warn(`Could not extract blob name from URL: ${url}. Skipping deletion.`);
            return;
        }

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        try {
            // A URL may be shared by multiple products. Keep any still in use.
            const referenced = await prisma.product.findFirst({
                where: { images: { has: url } }, select: { id: true },
            });
            if (referenced) return;
            if (await blockBlobClient.exists()) {
                await blockBlobClient.delete();
                console.log(`Successfully deleted blob: ${blobName}`);
            } else {
                console.warn(`Blob not found: ${blobName}. Skipping deletion.`);
            }
        } catch (error) {
            console.error(`Error deleting blob ${blobName} from Azure:`, error);
        }
    });

    await Promise.all(deletePromises);
}

/**
 * Deletes a single image from Azure Blob Storage.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImageFromBlob(imageUrl: string): Promise<{ success: boolean, error?: string }> {
    // Old browser tabs may still call this action. Never delete a persisted image
    // independently of the record update that removes its URL.
    return { success: false, error: "Remove the image in the edit form and save the product to apply the change." };
}

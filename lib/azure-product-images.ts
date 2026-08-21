import 'server-only';

import { BlobServiceClient } from '@azure/storage-blob';
import sharp, { type Sharp } from 'sharp';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'images';
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'staticportal';

const getContainerClient = () => {
    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set.');
    }

    return BlobServiceClient
        .fromConnectionString(connectionString)
        .getContainerClient(containerName);
};

export function getManagedProductBlobName(imageUrl: string) {
    try {
        const parsedUrl = new URL(imageUrl);
        const expectedHost = `${accountName}.blob.core.windows.net`;
        const containerPrefix = `/${containerName}/`;

        if (
            parsedUrl.protocol !== 'https:'
            || parsedUrl.hostname.toLowerCase() !== expectedHost.toLowerCase()
            || !parsedUrl.pathname.startsWith(containerPrefix)
        ) {
            return null;
        }

        const encodedBlobName = parsedUrl.pathname.slice(containerPrefix.length);
        if (!encodedBlobName) return null;

        return decodeURIComponent(encodedBlobName);
    } catch {
        return null;
    }
}

function getOutputFormat(blobName: string) {
    const extension = blobName.split('.').pop()?.toLowerCase();

    if (extension === 'webp') {
        return {
            contentType: 'image/webp',
            encode: (image: Sharp) => image.webp({ lossless: true, effort: 4 }),
        };
    }

    if (extension === 'png') {
        return {
            contentType: 'image/png',
            encode: (image: Sharp) => image.png({ compressionLevel: 9 }),
        };
    }

    // JPEG cannot preserve transparency. Keep the exact blob name while storing
    // transparent PNG bytes with the correct content type.
    return {
        contentType: 'image/png',
        encode: (image: Sharp) => image.png({ compressionLevel: 9 }),
    };
}

export async function replaceManagedProductImage(imageUrl: string, imageFile: File) {
    const blobName = getManagedProductBlobName(imageUrl);
    if (!blobName) {
        throw new Error('This image is not stored in the configured Azure product-image container.');
    }

    if (!imageFile.type.startsWith('image/') || imageFile.size === 0) {
        throw new Error('The processed file is not a valid image.');
    }

    const blockBlobClient = getContainerClient().getBlockBlobClient(blobName);
    if (!(await blockBlobClient.exists())) {
        throw new Error('The original Azure image no longer exists.');
    }

    const inputBuffer = Buffer.from(await imageFile.arrayBuffer());
    const format = getOutputFormat(blobName);
    const outputBuffer = await format.encode(sharp(inputBuffer).rotate()).toBuffer();

    await blockBlobClient.uploadData(outputBuffer, {
        blobHTTPHeaders: {
            blobContentType: format.contentType,
            blobCacheControl: 'no-cache, no-store, must-revalidate',
        },
    });

    return { imageUrl, blobName };
}

export async function downloadManagedProductImage(imageUrl: string) {
    const blobName = getManagedProductBlobName(imageUrl);
    if (!blobName) {
        throw new Error('This is not a managed Azure product image.');
    }

    const blockBlobClient = getContainerClient().getBlockBlobClient(blobName);
    const [buffer, properties] = await Promise.all([
        blockBlobClient.downloadToBuffer(),
        blockBlobClient.getProperties(),
    ]);

    return {
        buffer,
        contentType: properties.contentType || 'application/octet-stream',
    };
}

'use server'

import { BlobServiceClient } from '@azure/storage-blob';
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "images";

const AZURE_STORAGE_ACCOUNT_NAME = "staticportal"
if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set.");
}
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
export const uploadToAzure = async (file: File) => {
    try {
        const imageFile = file;

        if (!imageFile || imageFile.size === 0) {
            return { error: "No image file provided or the file is empty." };
        }
        const uniqueFileName = `${Date.now()}-${imageFile.name.replace(/\s/g, "_")}`;

        const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);


        const buffer = Buffer.from(await imageFile.arrayBuffer());

        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: imageFile.type }
        });

        const publicUrl = blockBlobClient.url;

        console.log(`Successfully uploaded to Azure Blob Storage. URL: ${publicUrl}`);

        return {
            success: true,
            url: publicUrl,
        }

    } catch (error) {
        console.error("Error uploading image to Azure Blob Storage:", error);
        return { error: "Failed to upload image to Azure Blob Storage." };
    }

};
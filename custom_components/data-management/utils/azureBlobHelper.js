import { BlobServiceClient } from "@azure/storage-blob";

/* Uploads file content to Azure Blob Storage using a SAS token URL. */
export async function uploadToAzureBlob(sasUrl, blobName, content) {
  try {
    const blobServiceClient = new BlobServiceClient(sasUrl);
    const containerClient = blobServiceClient.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: content.type || "application/octet-stream" // Use file's MIME type or fallback
      }
    };

    // Upload file/blob data directly
    await blockBlobClient.uploadData(content, uploadOptions);

    // Return blob URL without SAS token
    const blobUrl = blockBlobClient.url.split('?')[0];
    return blobUrl;

  } catch (err) {
    console.error("Upload failed:", err.message);
    throw err;
  }
}

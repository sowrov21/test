import { BlobServiceClient } from "@azure/storage-blob";

/* Uploads file content to Azure Blob Storage using a SAS token URL. */
export async function uploadToAzureBlob(sasUrl,containerName, blobName, path , content) {
  try {
    const blobServiceClient = new BlobServiceClient(sasUrl);
    const containerClient = blobServiceClient.getContainerClient("");//already provided in sas url
    path = path.startsWith("/") ? path.substring(1): path;
    const blockBlobClient = containerClient.getBlockBlobClient(path+blobName);

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

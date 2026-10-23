const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Get configured Azure Blob Container Client
 */
const getBlobContainerClient = async () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'events';

  let blobServiceClient = null;

  if (connectionString && connectionString.trim()) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString.trim());
  } else if (accountName && accountKey) {
    const credential = new StorageSharedKeyCredential(accountName.trim(), accountKey.trim());
    blobServiceClient = new BlobServiceClient(
      `https://${accountName.trim()}.blob.core.windows.net`,
      credential
    );
  }

  if (!blobServiceClient) {
    return null;
  }

  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  // Ensure container exists with public blob read access
  try {
    await containerClient.createIfNotExists({
      access: 'blob'
    });
  } catch (err) {
    // If container already exists or permission to create is restricted, continue
  }

  return { containerClient, containerName };
};

/**
 * Upload Image Buffer to Azure Blob Storage with Local Storage Fallback
 * 
 * @param {Buffer} buffer - File buffer
 * @param {string} originalFilename - Original filename
 * @param {string} mimeType - e.g. 'image/png', 'image/jpeg'
 * @param {string} prefix - Filename prefix (e.g. 'event-poster')
 * @returns {Promise<{ success: boolean, url: string, blobName: string, storageType: 'azure' | 'local' }>}
 */
const uploadImageToAzureBlob = async (buffer, originalFilename, mimeType, prefix = 'event-poster') => {
  if (!buffer || buffer.length === 0) {
    throw new Error('No image file buffer provided for upload.');
  }

  // Derive file extension
  let ext = path.extname(originalFilename || '').toLowerCase().replace('.', '');
  if (ext === 'svg' || mimeType === 'image/svg+xml') {
    throw new Error('SVG image uploads are prohibited for security reasons (prevents script execution). Please upload a PNG, JPG, or WEBP image.');
  }

  if (!ext || ext.length > 5) {
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = 'jpg';
    else if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';
    else if (mimeType === 'image/gif') ext = 'gif';
    else ext = 'png';
  }

  const randomId = crypto.randomBytes(4).toString('hex');
  const safeBase = (path.basename(originalFilename || '', path.extname(originalFilename || '')) || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 30);
  const blobName = `${prefix}-${Date.now()}-${safeBase}-${randomId}.${ext}`;

  // 1. Try uploading to Azure Blob Storage
  try {
    const azureConfig = await getBlobContainerClient();
    if (azureConfig && azureConfig.containerClient) {
      const { containerClient } = azureConfig;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: mimeType || 'image/png',
          blobCacheControl: 'public, max-age=31536000'
        }
      });

      return {
        success: true,
        url: blockBlobClient.url,
        blobName,
        storageType: 'azure'
      };
    }
  } catch (azureErr) {
    console.warn('Azure Blob Storage upload notice (falling back to local storage):', azureErr.message);
  }

  // 2. Fallback to Local Public Storage directory if Azure is not configured yet
  try {
    const uploadDir = path.join(__dirname, '../../public/uploads/events');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFilePath = path.join(uploadDir, blobName);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = `/uploads/events/${blobName}`;

    return {
      success: true,
      url: publicUrl,
      blobName,
      storageType: 'local'
    };
  } catch (localErr) {
    console.error('Local fallback storage error:', localErr);
    throw new Error('Failed to store image file: ' + localErr.message);
  }
};

module.exports = {
  uploadImageToAzureBlob,
  getBlobContainerClient
};

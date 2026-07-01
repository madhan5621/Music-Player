/**
 * Google Drive utility functions
 */

/**
 * Extract file ID from various Google Drive link formats
 */
export function extractDriveFileId(link) {
  if (!link) return null;
  
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{25,})$/
  ];

  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Validate that a string contains a valid Google Drive link or file ID
 */
export function validateDriveLink(link) {
  const fileId = extractDriveFileId(link);
  return !!fileId && fileId.length >= 25;
}

/**
 * Generate a direct stream/download URL from a Google Drive file ID
 */
export function generateStreamUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Generate the backend proxy stream URL
 */
export function generateProxyStreamUrl(fileId, backendUrl = '') {
  return `${backendUrl}/api/stream/${fileId}`;
}

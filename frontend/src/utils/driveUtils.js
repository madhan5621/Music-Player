/**
 * Google Drive utility functions (frontend)
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

export function validateDriveLink(link) {
  const fileId = extractDriveFileId(link);
  return !!fileId && fileId.length >= 25;
}

export function generateStreamUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

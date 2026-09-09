import * as FileSystem from 'expo-file-system/legacy';

/**
 * POSTs a local file to a Convex upload URL and returns its storage id.
 * Upload URLs are single-use, so mint one per file.
 */
export async function uploadFile(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
): Promise<string> {
  const res = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: 'POST',
    headers: { 'Content-Type': contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Upload failed (HTTP ${res.status})`);
  }

  const { storageId } = JSON.parse(res.body) as { storageId?: string };
  if (!storageId) throw new Error('Upload response had no storageId');
  return storageId;
}

/** Content type for a recorded clip, from its file extension. */
export function videoContentType(uri: string): string {
  return uri.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
}

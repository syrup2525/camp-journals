import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
}

export async function removeFileIfExists(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export function resolveUploadPath(uploadDir: string, fileName: string) {
  return path.join(uploadDir, path.basename(fileName));
}


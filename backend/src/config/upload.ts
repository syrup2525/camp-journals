import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'fastify-multer';
import { env } from './env.js';
import { AppError } from '../utils/errors.js';
import { getSafeExtension, isAllowedUpload, MAX_UPLOAD_FILES, VIDEO_MAX_BYTES } from '../utils/mediaPolicy.js';

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_request, file, callback) => {
    const extension = getSafeExtension(file.originalname, file.mimetype);

    if (!extension) {
      callback(new AppError('지원하지 않는 파일 형식입니다.', 'INVALID_FILE_TYPE', 400), '');
      return;
    }

    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: VIDEO_MAX_BYTES,
    files: MAX_UPLOAD_FILES,
  },
  fileFilter: (_request, file, callback) => {
    const safeName = path.basename(file.originalname);

    if (!isAllowedUpload(safeName, file.mimetype)) {
      callback(new AppError('지원하지 않는 파일 형식입니다.', 'INVALID_FILE_TYPE', 400), false);
      return;
    }

    callback(null, true);
  },
});


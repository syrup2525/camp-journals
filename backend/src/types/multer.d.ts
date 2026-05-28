declare module 'fastify-multer' {
  import type { FastifyPluginCallback, preHandlerHookHandler } from 'fastify';

  export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer?: Buffer;
  }

  interface DiskStorageOptions {
    destination: string | ((request: unknown, file: MulterFile, callback: (error: Error | null, destination: string) => void) => void);
    filename: (request: unknown, file: MulterFile, callback: (error: Error | null, filename: string) => void) => void;
  }

  interface MulterOptions {
    storage?: unknown;
    dest?: string;
    limits?: {
      fileSize?: number;
      files?: number;
      fields?: number;
      parts?: number;
    };
    fileFilter?: (request: unknown, file: MulterFile, callback: (error: Error | null, acceptFile?: boolean) => void) => void;
  }

  interface MulterInstance {
    array(fieldName: string, maxCount?: number): preHandlerHookHandler;
    any(): preHandlerHookHandler;
  }

  interface MulterFactory {
    (options?: MulterOptions): MulterInstance;
    diskStorage(options: DiskStorageOptions): unknown;
    contentParser: FastifyPluginCallback;
  }

  const multer: MulterFactory;
  export default multer;
}


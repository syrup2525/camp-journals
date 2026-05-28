export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, code = 'APP_ERROR', statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}


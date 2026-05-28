import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '../types/journal';

declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string;
    };
  }
}

const env = import.meta.env as ImportMetaEnv & {
  API_BASE_URL?: string;
};

const runtimeApiBaseUrl = typeof window !== 'undefined' ? window.__APP_CONFIG__?.API_BASE_URL : undefined;

export const API_BASE_URL = (runtimeApiBaseUrl || env.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const message = error.response?.data?.message || error.message || '요청을 처리하지 못했습니다.';
    const code = error.response?.data?.code;
    return Promise.reject(new ApiError(message, code, error.response?.status));
  },
);

export function unwrapData<T>(payload: unknown): T {
  const data = payload as { data?: T; result?: T };
  return (data.data ?? data.result ?? payload) as T;
}

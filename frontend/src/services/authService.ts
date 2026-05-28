import { apiClient, unwrapData } from './apiClient';
import { normalizeUser } from './normalizers';
import type { User } from '../types/journal';

export interface LoginPayload {
  username: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post('/api/auth/login', payload);
  const data = unwrapData<{ user?: unknown } | unknown>(response.data);
  const rawUser = (data as { user?: unknown }).user ?? data;
  return normalizeUser(rawUser);
}

export async function logout() {
  await apiClient.post('/api/auth/logout');
}

export async function getMe(): Promise<User | null> {
  try {
    const response = await apiClient.get('/api/auth/me');
    const data = unwrapData<{ user?: unknown } | unknown>(response.data);
    const rawUser = (data as { user?: unknown }).user ?? data;
    if (!rawUser) {
      return null;
    }
    return normalizeUser(rawUser);
  } catch (error) {
    return null;
  }
}

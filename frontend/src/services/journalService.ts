import { apiClient, unwrapData } from './apiClient';
import { normalizeJournal } from './normalizers';
import type { Id, Journal, JournalInput } from '../types/journal';

function unwrapJournal(payload: unknown) {
  const data = unwrapData<{ journal?: unknown } | unknown>(payload);
  const rawJournal = (data as { journal?: unknown }).journal ?? data;
  return normalizeJournal(rawJournal);
}

function unwrapJournalList(payload: unknown) {
  const data = unwrapData<{ journals?: unknown[]; items?: unknown[] } | unknown[]>(payload);

  if (Array.isArray(data)) {
    return data.map(normalizeJournal);
  }

  return (data.journals ?? data.items ?? []).map(normalizeJournal);
}

export async function getJournals(): Promise<Journal[]> {
  const response = await apiClient.get('/api/journals');
  return unwrapJournalList(response.data);
}

export async function getJournal(id: Id): Promise<Journal> {
  const response = await apiClient.get(`/api/journals/${id}`);
  return unwrapJournal(response.data);
}

export async function createJournal(payload: JournalInput): Promise<Journal> {
  const response = await apiClient.post('/api/journals', payload);
  return unwrapJournal(response.data);
}

export async function updateJournal(id: Id, payload: JournalInput): Promise<Journal> {
  const response = await apiClient.put(`/api/journals/${id}`, payload);
  return unwrapJournal(response.data);
}

export async function deleteJournal(id: Id) {
  await apiClient.delete(`/api/journals/${id}`);
}

export async function uploadJournalMedia(journalId: Id, files: File[]) {
  if (files.length === 0) {
    return;
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  await apiClient.post(`/api/journals/${journalId}/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function deleteJournalMedia(journalId: Id, mediaId: Id) {
  await apiClient.delete(`/api/journals/${journalId}/media/${mediaId}`);
}


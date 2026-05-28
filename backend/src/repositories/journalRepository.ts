import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database.js';
import { mapJournal, type JournalRow } from '../models/mappers.js';
import { findMediaByJournalIds } from './mediaRepository.js';
import { findHashtagsByJournalIds, replaceJournalHashtags } from './hashtagRepository.js';
import type { Id, Journal, JournalInput } from '../types/domain.js';

type JournalRecord = JournalRow & RowDataPacket;

export async function findAllJournals(): Promise<Journal[]> {
  const [rows] = await db.query<JournalRecord[]>(
    'SELECT * FROM journals ORDER BY camping_date DESC, created_at DESC, id DESC',
  );
  const journalIds = rows.map((row) => row.id);
  const [mediaByJournal, hashtagsByJournal] = await Promise.all([
    findMediaByJournalIds(journalIds),
    findHashtagsByJournalIds(journalIds),
  ]);

  return rows.map((row) => mapJournal(row, mediaByJournal.get(row.id) ?? [], hashtagsByJournal.get(row.id) ?? []));
}

export async function findJournalById(id: Id): Promise<Journal | null> {
  const [rows] = await db.query<JournalRecord[]>('SELECT * FROM journals WHERE id = ? LIMIT 1', [id]);
  const row = rows[0];

  if (!row) {
    return null;
  }

  const [mediaByJournal, hashtagsByJournal] = await Promise.all([
    findMediaByJournalIds([row.id]),
    findHashtagsByJournalIds([row.id]),
  ]);
  return mapJournal(row, mediaByJournal.get(row.id) ?? [], hashtagsByJournal.get(row.id) ?? []);
}

export async function createJournal(userId: Id, input: JournalInput): Promise<Journal> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO journals (user_id, camping_date, place_name, address, short_memo)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, input.campingDate, input.placeName, input.address, input.shortMemo],
  );
  await replaceJournalHashtags(result.insertId, input.hashtags);

  const journal = await findJournalById(result.insertId);

  if (!journal) {
    throw new Error('Failed to create journal');
  }

  return journal;
}

export async function updateJournal(id: Id, input: JournalInput): Promise<Journal | null> {
  await db.execute(
    `UPDATE journals
     SET camping_date = ?, place_name = ?, address = ?, short_memo = ?
     WHERE id = ?`,
    [input.campingDate, input.placeName, input.address, input.shortMemo, id],
  );
  await replaceJournalHashtags(id, input.hashtags);

  return findJournalById(id);
}

export async function deleteJournal(id: Id) {
  await db.execute('DELETE FROM journals WHERE id = ?', [id]);
}

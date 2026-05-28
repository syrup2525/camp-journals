import type { RowDataPacket } from 'mysql2';
import { db } from '../config/database.js';
import type { Id } from '../types/domain.js';

interface HashtagRow extends RowDataPacket {
  journal_id: Id;
  tag: string;
}

export async function findHashtagsByJournalIds(journalIds: Id[]): Promise<Map<Id, string[]>> {
  const map = new Map<Id, string[]>();

  if (journalIds.length === 0) {
    return map;
  }

  const placeholders = journalIds.map(() => '?').join(', ');
  const [rows] = await db.query<HashtagRow[]>(
    `SELECT journal_id, tag FROM journal_hashtags WHERE journal_id IN (${placeholders}) ORDER BY id ASC`,
    journalIds,
  );

  rows.forEach((row) => {
    const list = map.get(row.journal_id) ?? [];
    list.push(row.tag);
    map.set(row.journal_id, list);
  });

  return map;
}

export async function replaceJournalHashtags(journalId: Id, hashtags: string[]) {
  await db.execute('DELETE FROM journal_hashtags WHERE journal_id = ?', [journalId]);

  if (hashtags.length === 0) {
    return;
  }

  const values = hashtags.map((tag) => [journalId, tag]);
  await db.query('INSERT INTO journal_hashtags (journal_id, tag) VALUES ?', [values]);
}


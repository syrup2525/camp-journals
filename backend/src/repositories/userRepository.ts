import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database.js';
import { mapUser, type UserRow } from '../models/mappers.js';
import type { User } from '../types/domain.js';

type UserRecord = UserRow & RowDataPacket;

export interface UserWithPassword extends User {
  passwordHash: string;
}

function mapUserWithPassword(row: UserRecord): UserWithPassword {
  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
  };
}

export async function findUserByUsername(username: string): Promise<UserWithPassword | null> {
  const [rows] = await db.query<UserRecord[]>('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
  return rows[0] ? mapUserWithPassword(rows[0]) : null;
}

export async function findUserById(id: number): Promise<User | null> {
  const [rows] = await db.query<UserRecord[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function createUser(username: string, passwordHash: string, displayName: string | null): Promise<User> {
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)',
    [username, passwordHash, displayName],
  );

  const user = await findUserById(result.insertId);

  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}


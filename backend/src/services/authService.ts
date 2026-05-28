import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/userRepository.js';
import type { User } from '../types/domain.js';
import { AppError } from '../utils/errors.js';

export async function verifyLogin(username: string, password: string): Promise<User> {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new AppError('아이디 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS', 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError('아이디 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS', 401);
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserById(id: number) {
  return userRepository.findUserById(id);
}

export async function createUser(username: string, password: string, displayName: string | null) {
  const existingUser = await userRepository.findUserByUsername(username);

  if (existingUser) {
    throw new AppError('이미 존재하는 아이디입니다.', 'USER_ALREADY_EXISTS', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  return userRepository.createUser(username, passwordHash, displayName);
}


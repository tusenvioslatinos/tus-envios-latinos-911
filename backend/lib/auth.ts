import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminAuthPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: AdminAuthPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): AdminAuthPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminAuthPayload;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
};

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from './db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'chakra-garage-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

export function verifyAdmin(username: string, password: string): { success: boolean; token?: string; role?: string; error?: string } {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return { success: false, error: 'Invalid credentials' };
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return { success: true, token, role: user.role };
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

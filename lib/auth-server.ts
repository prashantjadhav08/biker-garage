import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from './db/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'chakra-garage-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export async function verifyAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; role?: string; error?: string }> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
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
  } catch (err: any) {
    console.error('[AUTH] Error:', err);
    return { success: false, error: 'An error occurred' };
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function seedDefaultUsers(): Promise<void> {
  try {
    // Seed admin
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (!existingAdmin) {
      const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
      await supabase.from('users').insert({
        username: 'admin',
        password_hash: hash,
        role: 'admin',
      });
      console.log('[AUTH] Seeded default admin user');
    }

    // Seed staff
    const { data: existingStaff } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'staff')
      .single();

    if (!existingStaff) {
      const hash = bcrypt.hashSync(process.env.STAFF_PASSWORD || 'Staff@123', 10);
      await supabase.from('users').insert({
        username: 'staff',
        password_hash: hash,
        role: 'staff',
      });
      console.log('[AUTH] Seeded default staff user');
    }
  } catch (err) {
    console.error('[AUTH] Error seeding users:', err);
  }
}

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
    // First, ensure default users exist
    await seedDefaultUsers();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('[AUTH] Query error for user', username, ':', error.code, error.message);
      return { success: false, error: 'Invalid credentials' };
    }

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
  } catch (err: any) {
    console.error('[AUTH] Unexpected error:', err);
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
    const { data: existingAdmin, error: selectAdminErr } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (selectAdminErr && selectAdminErr.code !== 'PGRST116') {
      console.error('[AUTH] Error checking admin existence:', selectAdminErr.code, selectAdminErr.message);
      return;
    }

    if (!existingAdmin) {
      const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
      const { error: insertAdminErr } = await supabase.from('users').insert({
        username: 'admin',
        password_hash: hash,
        role: 'admin',
      });

      if (insertAdminErr) {
        console.error('[AUTH] FAILED to seed admin user:', insertAdminErr.code, insertAdminErr.message);
        if (insertAdminErr.code === '42501') {
          console.error('[AUTH] CAUSE: Using ANON key instead of SERVICE_ROLE key. Fix SUPABASE_SERVICE_ROLE_KEY in Render Environment.');
        }
      } else {
        console.log('[AUTH] Seeded default admin user');
      }
    }

    // Seed staff
    const { data: existingStaff, error: selectStaffErr } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'staff')
      .single();

    if (selectStaffErr && selectStaffErr.code !== 'PGRST116') {
      console.error('[AUTH] Error checking staff existence:', selectStaffErr.code, selectStaffErr.message);
      return;
    }

    if (!existingStaff) {
      const hash = bcrypt.hashSync(process.env.STAFF_PASSWORD || 'Staff@123', 10);
      const { error: insertStaffErr } = await supabase.from('users').insert({
        username: 'staff',
        password_hash: hash,
        role: 'staff',
      });

      if (insertStaffErr) {
        console.error('[AUTH] FAILED to seed staff user:', insertStaffErr.code, insertStaffErr.message);
        if (insertStaffErr.code === '42501') {
          console.error('[AUTH] CAUSE: Using ANON key instead of SERVICE_ROLE key. Fix SUPABASE_SERVICE_ROLE_KEY in Render Environment.');
        }
      } else {
        console.log('[AUTH] Seeded default staff user');
      }
    }
  } catch (err) {
    console.error('[AUTH] Unexpected error seeding users:', err);
  }
}

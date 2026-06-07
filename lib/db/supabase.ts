import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://rfscxcglgiyohzrmegqs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('[Supabase] FATAL: SUPABASE_SERVICE_ROLE_KEY is not set. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Diagnostic: verify connection and permissions on startup
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    if (error) {
      console.error('[Supabase] Connection test FAILED:', error.code, error.message);
      if (error.code === '42501') {
        console.error('[Supabase] PERMISSION DENIED. You are probably using the ANON key instead of the SERVICE_ROLE key.');
        console.error('[Supabase] Go to Supabase → Project Settings → API, copy the SERVICE_ROLE key (red "secret" badge), and set it as SUPABASE_SERVICE_ROLE_KEY in Render.');
      }
      return false;
    }
    console.log('[Supabase] Connection test OK. Users table accessible.');
    return true;
  } catch (err) {
    console.error('[Supabase] Connection test exception:', err);
    return false;
  }
}

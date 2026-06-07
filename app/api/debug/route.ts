import { NextResponse } from 'next/server';
import { supabase, verifySupabaseConnection } from '@/lib/db/supabase';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    supabase_url: process.env.SUPABASE_URL || 'not set',
    key_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    key_preview: process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 50) + '...'
      : 'missing',
  };

  try {
    // Decode JWT payload to show role
    const token = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        results.key_role = payload.role;
        results.key_project = payload.ref;
        results.key_exp = new Date(payload.exp * 1000).toISOString();
      }
    }
  } catch (e) {
    results.key_decode_error = String(e);
  }

  // Test each table
  const tables = ['users', 'bikes', 'bills', 'parts', 'service_items_catalog'];
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        results[`${table}_test`] = { ok: false, code: error.code, message: error.message };
      } else {
        results[`${table}_test`] = { ok: true, row_count: count };
      }
    } catch (e: any) {
      results[`${table}_test`] = { ok: false, exception: e.message };
    }
  }

  const response = NextResponse.json(results);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

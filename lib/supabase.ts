import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
}

// Client Standar untuk Publik / Client Component
export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');

// Client Admin khusus Sisi Server (Bypass RLS)
if (!supabaseServiceRoleKey) {
  throw new Error(
    '❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY tidak terbaca di sisi server! Periksa file .env.local Anda.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
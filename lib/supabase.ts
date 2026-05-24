import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
}

// 1. Client Standar (Aman dipanggil di Client Component / Browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Client Admin (Bypass RLS - HANYA BERJALAN DI SERVER)
// Menggunakan pengecekan "typeof window" agar browser tidak memicu error
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase; // Fallback aman jika browser tidak sengaja membaca baris ini
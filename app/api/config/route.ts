import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan service role agar admin bisa bypass RLS
);

// 1. Ambil status deadline saat ini
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('global_config')
      .select('value')
      .eq('key', 'is_deadline_closed')
      .single();

    if (error) throw error;

    return NextResponse.json({ isDeadlineClosed: data?.value ?? false });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal mengambil konfigurasi portal.' }, { status: 500 });
  }
}

// 2. Ubah status deadline (Pemicu dari Halaman Admin)
export async function POST(request: Request) {
  try {
    const { isDeadlineClosed } = await request.json();

    const { error } = await supabaseAdmin
      .from('global_config')
      .update({ value: isDeadlineClosed, updated_at: new Date() })
      .eq('key', 'is_deadline_closed');

    if (error) throw error;

    return NextResponse.json({ success: true, isDeadlineClosed });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal mengubah segel pilar waktu.' }, { status: 500 });
  }
}
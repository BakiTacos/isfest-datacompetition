import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Ambil daftar semua tim beserta status berkasnya
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select('id, team_name, has_ipynb, has_ppt, has_laporan')
      .order('team_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat data tim.' }, { status: 500 });
  }
}

// PATCH: Perbarui status salah satu berkas milik spesifik tim
export async function PATCH(request: Request) {
  try {
    const { teamId, field, value } = await request.json();

    // Pastikan field yang diubah hanya yang diizinkan untuk keamanan
    const allowedFields = ['has_ipynb', 'has_ppt', 'has_laporan'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Field tidak valid' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('teams')
      .update({ [field]: value })
      .eq('id', teamId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui berkas.' }, { status: 500 });
  }
}
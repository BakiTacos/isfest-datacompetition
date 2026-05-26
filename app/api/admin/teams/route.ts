import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Ambil daftar semua tim beserta status berkas dan rincian nilainya
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select(`
        id, 
        team_name, 
        jenis_lomba, 
        has_ipynb, 
        has_ppt, 
        has_laporan,
        has_mockup,
        has_video,
        has_prototype,
        score_ipynb,
        score_laporan,
        score_ppt,
        final_score
      `)
      .order('team_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat data tim.' }, { status: 500 });
  }
}

// PATCH: Perbarui status berkas atau nilai spesifik milik suatu tim
export async function PATCH(request: Request) {
  try {
    const { teamId, field, value } = await request.json();

    // Pastikan field yang diubah hanya yang ada di database untuk mencegah injeksi berbahaya
    const allowedFields = [
      'has_ipynb', 
      'has_ppt', 
      'has_laporan',
      'has_mockup',
      'has_video',
      'has_prototype',
      'score_ipynb',
      'score_laporan',
      'score_ppt',
      'final_score' // Digunakan khusus untuk input manual nilai UI/UX
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Field tidak diizinkan oleh sistem.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('teams')
      .update({ [field]: value })
      .eq('id', teamId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui data.' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ===================================================================
// 1. GET: Mengambil Sisa Kuota dan Link Drive saat halaman Submit dimuat
// ===================================================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID tidak ditemukan' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select('quota_remaining, final_link')
      .eq('id', teamId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      quotaRemaining: data?.quota_remaining ?? 0,
      finalLink: data?.final_link ?? ''
    });
  } catch (err: any) {
    console.error('Error Fetching Team Status:', err.message);
    return NextResponse.json({ error: 'Gagal memuat data asrama.' }, { status: 500 });
  }
}

// ===================================================================
// 2. POST: Menerima unggahan CSV, Kalkulasi RMSE, dan Kurangi Kuota
// ===================================================================
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const teamId = formData.get('teamId') as string;

    if (!file || !teamId) {
      return NextResponse.json({ error: 'File atau Team ID hilang.' }, { status: 400 });
    }

    // A. Cek Kuota Saat Ini Sebelum Memproses
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('quota_remaining, best_rmse')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;

    if (teamData.quota_remaining <= 0) {
      return NextResponse.json({ error: 'Kuota submisi harian Anda telah habis!' }, { status: 403 });
    }

    // B. Proses Membaca File CSV (Contoh)
    const fileText = await file.text();
    // Di sini Anda biasanya mem-parsing fileText (CSV) dan membandingkannya dengan kunci jawaban.
    // Karena kita tidak memiliki data kunci jawaban di sini, kita akan membuat simulasi kalkulasi.
    
    // TODO: Ganti angka acak ini dengan fungsi hitung RMSE asli Anda jika sudah siap
    // Simulasi RMSE (Makin kecil makin bagus, misal antara 0.1000 hingga 0.9000)
    const calculatedRmse = (Math.random() * 0.8) + 0.1; 

    // C. Tentukan apakah skor ini adalah yang terbaik (Paling Kecil)
    const currentBest = teamData.best_rmse;
    const isNewBest = currentBest === null || calculatedRmse < currentBest;
    const newBestRmse = isNewBest ? calculatedRmse : currentBest;

    // D. Update Database: Kurangi Kuota, Perbarui Skor Terbaik, dan Stempel Waktu
    const { error: updateError } = await supabaseAdmin
      .from('teams')
      .update({
        quota_remaining: teamData.quota_remaining - 1,
        best_rmse: newBestRmse,
        updated_at: new Date() // Penting untuk logika tie-breaker (seri) kita sebelumnya!
      })
      .eq('id', teamId);

    if (updateError) throw updateError;

    // E. Kembalikan Hasil ke Frontend
    return NextResponse.json({
      success: true,
      score: calculatedRmse,
      isNewBest: isNewBest,
      message: isNewBest 
        ? 'Luar Biasa! Ramuan Anda memecahkan rekor asrama sebelumnya.' 
        : 'Berhasil dikirim, namun belum mengalahkan rekor terbaik Anda.'
    });

  } catch (err: any) {
    console.error('Error Submitting CSV:', err.message);
    return NextResponse.json({ error: 'Terjadi gangguan magis saat membaca CSV.' }, { status: 500 });
  }
}
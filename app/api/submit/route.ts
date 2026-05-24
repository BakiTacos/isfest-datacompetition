import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 1. Validasi input form
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const teamId = formData.get('team_id') as string;

    if (!file || !teamId) {
      return NextResponse.json({ error: 'Data submisi tidak lengkap.' }, { status: 400 });
    }

    // 2. Baca dan bersihkan file CSV
    const fileText = await file.text();
    const lines = fileText.replace(/\r\n/g, '\n').trim().split('\n');

    if (lines.length < 2) {
      return NextResponse.json({ error: 'File CSV kosong atau hanya berisi header.' }, { status: 400 });
    }

    // 3. Validasi header (wajib: id, utilization_rate)
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    if (header.length < 2 || header[0] !== 'id' || header[1] !== 'utilization_rate') {
      return NextResponse.json(
        { error: 'Format header CSV salah! Harus: id, utilization_rate' },
        { status: 400 }
      );
    }

    // 4. Parsing baris data peserta (skip header)
    const submissionMap = new Map<string, number>();
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length >= 2) {
        const id = parts[0].trim();
        const rawValue = parts[1].trim();
        const value = parseFloat(rawValue);
        if (!isNaN(value)) {
          submissionMap.set(id, value);
        }
      }
    }

    // 5. Ambil kunci jawaban dari database
    const { data: solutionData, error: dbError } = await supabaseAdmin
      .from('solution_key')
      .select('id, utilization_rate')
      .order('id', { ascending: true });

    if (dbError || !solutionData) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Gagal memuat kunci jawaban.' }, { status: 500 });
    }

    // 6. ✅ Validasi kelengkapan ID (setiap ID solusi harus ada di file submisi)
    const missingIds: string[] = [];
    for (const item of solutionData) {
      if (!submissionMap.has(item.id)) {
        missingIds.push(item.id);
      }
    }
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `ID berikut tidak ditemukan dalam file submisi: ${missingIds.slice(0, 10).join(', ')}${missingIds.length > 10 ? '...' : ''}` },
        { status: 400 }
      );
    }

    // (Opsional) Beri peringatan jika ada kelebihan baris, tapi tidak di-error
    if (submissionMap.size > solutionData.length) {
      console.warn(`Peringatan: File submisi memiliki ${submissionMap.size} baris, tetapi hanya ${solutionData.length} ID yang digunakan.`);
    }

    // 7. Hitung RMSE
    let sumSquaredError = 0;
    let validCount = 0;

    for (const item of solutionData) {
      const predicted = submissionMap.get(item.id)!; // sudah pasti ada
      const actual = item.utilization_rate;
      const error = predicted - actual;
      sumSquaredError += error * error;
      validCount++;
    }

    const rmse = Math.sqrt(sumSquaredError / validCount);

    // 8. Update rekor terbaik tim
    const { data: teamData, error: fetchError } = await supabaseAdmin
      .from('teams')
      .select('best_rmse')
      .eq('id', teamId)
      .single();

    if (fetchError || !teamData) {
      return NextResponse.json({ error: 'Identitas tim tidak terdaftar.' }, { status: 404 });
    }

    const currentBest = teamData.best_rmse;
    const isNewBest = currentBest === null || rmse < currentBest;

    if (isNewBest) {
      const { error: updateError } = await supabaseAdmin
        .from('teams')
        .update({ best_rmse: rmse })
        .eq('id', teamId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Gagal menyimpan rekor terbaik.' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      rmse,
      message: isNewBest ? 'Rekor baru tercipta!' : 'Skor berhasil dihitung.'
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada sistem juri. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
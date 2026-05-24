import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const MAX_LINES = 1000000; // Mengakomodasi hingga 1 juta baris
const DAILY_QUOTA = 5;

const cleanQuote = (str: string) => str.replace(/^["']|["']$/g, '').trim();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');

    if (!teamId) {
      return NextResponse.json({ error: 'ID Tim tidak disertakan.' }, { status: 400 });
    }

    // Ambil tanggal hari ini berdasarkan zona waktu WIB Jakarta
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    const { data: teamData, error: fetchError } = await supabaseAdmin
      .from('teams')
      // 👇 Tambahkan 'final_link' di dalam select
      .select('submission_count, last_submit_date, final_link') 
      .eq('id', teamId)
      .single();

    if (fetchError || !teamData) {
      return NextResponse.json({ error: 'Identitas tim tidak ditemukan.' }, { status: 404 });
    }

    let currentCount = teamData.submission_count || 0;

    // Jika hari sudah berganti, berarti kuota harian kembali utuh
    if (teamData.last_submit_date !== today) {
      currentCount = 0;
    }

    // Hitung sisa kuota (maksimal 5)
    const quotaRemaining = Math.max(0, 5 - currentCount);

    // 👇 Kembalikan juga finalLink ke frontend
    return NextResponse.json({ 
      quotaRemaining,
      finalLink: teamData.final_link || '' 
    });
  } catch (err: any) {
    console.error('API GET Error:', err);
    return NextResponse.json({ error: 'Gagal memuat status kuota.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const teamId = formData.get('team_id') as string;

    if (!file || !teamId) return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.csv')) return NextResponse.json({ error: 'Format wajib .csv' }, { status: 415 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Ukuran file maks 16MB.' }, { status: 413 });

    // 1. VALIDASI KUOTA HARIAN
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const { data: teamData, error: fetchError } = await supabaseAdmin
      .from('teams')
      .select('best_rmse, submission_count, last_submit_date')
      .eq('id', teamId)
      .single();

    if (fetchError || !teamData) return NextResponse.json({ error: 'Asrama tidak valid.' }, { status: 404 });

    let currentCount = teamData.submission_count || 0;
    if (teamData.last_submit_date !== today) currentCount = 0;
    if (currentCount >= DAILY_QUOTA) return NextResponse.json({ error: 'Kuota 5x submisi harian habis.' }, { status: 429 });

    // 2. PARSING CSV SUBMISI PESERTA
    const fileText = await file.text();
    const lines = fileText.replace(/\r\n/g, '\n').trim().split('\n');
    
    if (lines.length > MAX_LINES) return NextResponse.json({ error: 'Baris melebihi batas.' }, { status: 413 });
    if (lines.length < 2) return NextResponse.json({ error: 'File submisi kosong.' }, { status: 400 });

    const submissionRows: { id: string; value: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length >= 2) {
        const id = cleanQuote(parts[0]);
        const value = parseFloat(cleanQuote(parts[1]));
        if (!isNaN(value)) submissionRows.push({ id, value });
      }
    }

    // 3. UNDUH & PARSING KUNCI JAWABAN DARI SUPABASE STORAGE
    const { data: storageData, error: storageError } = await supabaseAdmin
      .storage
      .from('competitions')
      .download('solution_key.csv');

    if (storageError || !storageData) {
      console.error('Storage Error:', storageError);
      return NextResponse.json({ error: 'Sistem gagal memuat kunci jawaban rahasia.' }, { status: 500 });
    }

    const solutionText = await storageData.text();
    const solutionLines = solutionText.replace(/\r\n/g, '\n').trim().split('\n');
    const solutionRows: { id: string; value: number }[] = [];

    for (let i = 1; i < solutionLines.length; i++) {
      if (!solutionLines[i].trim()) continue;
      const parts = solutionLines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length >= 2) {
        const id = cleanQuote(parts[0]);
        const value = parseFloat(cleanQuote(parts[1]));
        if (!isNaN(value)) solutionRows.push({ id, value });
      }
    }

    // 4. VALIDASI JUMLAH BARIS KETAT (Identikan dengan Pandas)
    if (solutionRows.length !== submissionRows.length) {
      return NextResponse.json({ 
        error: `❌ Error: Jumlah baris submisi (${submissionRows.length}) tidak cocok dengan kunci jawaban (${solutionRows.length})!` 
      }, { status: 400 });
    }

    // Sortir kedua array berdasarkan ID secara alfabetis agar sinkron head-to-head
    solutionRows.sort((a, b) => a.id.localeCompare(b.id));
    submissionRows.sort((a, b) => a.id.localeCompare(b.id));

    // 5. KALKULASI METRIK & PROTEKSI FRAUD
    let sumSquaredError = 0;
    let sumPred = 0;
    const predictedValues: number[] = [];
    const n = solutionRows.length;

    for (let i = 0; i < n; i++) {
      const actualItem = solutionRows[i];
      const predItem = submissionRows[i];

      if (actualItem.id !== predItem.id) {
        return NextResponse.json({ 
          error: `❌ Error: Urutan ID pada baris ke-${i+1} tidak sinkron! (Harapan: ${actualItem.id}, Diterima: ${predItem.id})` 
        }, { status: 400 });
      }

      const diff = predItem.value - actualItem.value;
      sumSquaredError += diff * diff;
      sumPred += predItem.value;
      predictedValues.push(predItem.value);
    }

    const rmse = Math.sqrt(sumSquaredError / n);
    
    // Hitung Standard Deviation untuk melacak prediksi konstan (asal-asalan)
    const meanPred = sumPred / n;
    let sumVariance = 0;
    for (const val of predictedValues) {
      sumVariance += Math.pow(val - meanPred, 2);
    }
    const stdPred = Math.sqrt(sumVariance / n);

    if (stdPred < 1e-4) {
      return NextResponse.json({ error: '⚠️ WARNING: Model ditolak karena mendeteksi nilai prediksi konstan/homogen.' }, { status: 406 });
    }
    if (rmse < 0.001) {
      return NextResponse.json({ error: '🚨 ALERT: Skor terlalu sempurna. Indikasi kebocoran dataset.' }, { status: 406 });
    }

    // 6. AMAN - UPDATE REKOR PAPAN PERINGKAT
    const isNewBest = teamData.best_rmse === null || rmse < teamData.best_rmse;
    const updatePayload: any = { submission_count: currentCount + 1, last_submit_date: today };
    if (isNewBest) updatePayload.best_rmse = rmse;

    const { error: updateError } = await supabaseAdmin.from('teams').update(updatePayload).eq('id', teamId);
    if (updateError) return NextResponse.json({ error: 'Gagal memperbarui rekor asrama.' }, { status: 500 });

    return NextResponse.json({
      success: true,
      rmse,
      message: isNewBest ? 'Rekor baru tercipta!' : 'Skor berhasil dihitung. Evaluasi model dinamis dan wajar.'
    });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Terjadi anomali pada sistem juri.' }, { status: 500 });
  }
}
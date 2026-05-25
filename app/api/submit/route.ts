import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_LINES = 1000000; // Mengakomodasi hingga 1 juta baris
const DAILY_QUOTA = 5;

const cleanQuote = (str: string) => str.replace(/^["']|["']$/g, '').trim();

// ==========================================
// GET: Mengambil Sisa Kuota Harian Tim
// ==========================================
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
      .select('submission_count, last_submit_date, final_link, team_name, best_rmse',) 
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
    const quotaRemaining = Math.max(0, DAILY_QUOTA - currentCount);

    return NextResponse.json({ 
      quotaRemaining,
      finalLink: teamData.final_link || '' 
    });
  } catch (err: any) {
    console.error('API GET Error:', err);
    return NextResponse.json({ error: 'Gagal memuat status kuota.' }, { status: 500 });
  }
}

// ==========================================
// POST: Evaluasi Prediksi (Baca Storage -> Kalkulasi RMSE)
// ==========================================
// ==========================================
// POST: Evaluasi Prediksi (Baca Storage -> Kalkulasi RMSE)
// ==========================================
export async function POST(request: Request) {
  try {
    // 1. TERIMA JSON DARI FRONTEND
    const body = await request.json();
    const { teamId, filePath } = body;

    if (!teamId || !filePath) {
      return NextResponse.json({ error: 'Mantra tidak lengkap. ID atau Path file hilang.' }, { status: 400 });
    }

    // 2. VALIDASI KUOTA HARIAN (Keamanan Ganda di Server)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const { data: teamData, error: fetchError } = await supabaseAdmin
      .from('teams')
      .select('team_name, best_rmse, submission_count, last_submit_date') // ✅ team_name DITAMBAHKAN DI SINI
      .eq('id', teamId)
      .single();

    if (fetchError || !teamData) return NextResponse.json({ error: 'Asrama tidak valid.' }, { status: 404 });

    let currentCount = teamData.submission_count || 0;
    if (teamData.last_submit_date !== today) currentCount = 0;
    if (currentCount >= DAILY_QUOTA) return NextResponse.json({ error: 'Energi sihir harian Anda telah habis.' }, { status: 429 });

    // 3. UNDUH FILE SUBMISI DARI STORAGE
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('submissions')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Download Error:', downloadError);
      return NextResponse.json({ error: 'Gagal menarik gulungan dari ruang penyimpanan.' }, { status: 500 });
    }

    // 4. PARSING CSV SUBMISI PESERTA
    const fileText = await fileData.text();
    const lines = fileText.replace(/\r\n/g, '\n').trim().split('\n');
    
    if (lines.length > MAX_LINES) return NextResponse.json({ error: 'Baris melebihi batas yang diizinkan.' }, { status: 413 });
    if (lines.length < 2) return NextResponse.json({ error: 'Gulungan kosong, tidak ada data prediksi.' }, { status: 400 });

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

    // 5. UNDUH & PARSING KUNCI JAWABAN
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

    // 6. VALIDASI JUMLAH BARIS & URUTAN
    if (solutionRows.length !== submissionRows.length) {
      return NextResponse.json({ 
        error: `❌ Error: Jumlah baris (${submissionRows.length}) tidak cocok dengan kitab rahasia (${solutionRows.length})!` 
      }, { status: 400 });
    }

    solutionRows.sort((a, b) => a.id.localeCompare(b.id));
    submissionRows.sort((a, b) => a.id.localeCompare(b.id));

    // 7. KALKULASI METRIK (RMSE) & PROTEKSI FRAUD
    let sumSquaredError = 0;
    let sumPred = 0;
    const predictedValues: number[] = [];
    const n = solutionRows.length;

    for (let i = 0; i < n; i++) {
      const actualItem = solutionRows[i];
      const predItem = submissionRows[i];

      if (actualItem.id !== predItem.id) {
        return NextResponse.json({ 
          error: `❌ Error: Identitas baris ke-${i+1} tidak selaras! (Harapan: ${actualItem.id}, Diterima: ${predItem.id})` 
        }, { status: 400 });
      }

      const diff = predItem.value - actualItem.value;
      sumSquaredError += diff * diff;
      sumPred += predItem.value;
      predictedValues.push(predItem.value);
    }

    const rmse = Math.sqrt(sumSquaredError / n);
    
    // Proteksi Prediksi Konstan
    const meanPred = sumPred / n;
    let sumVariance = 0;
    for (const val of predictedValues) {
      sumVariance += Math.pow(val - meanPred, 2);
    }
    const stdPred = Math.sqrt(sumVariance / n);

    if (stdPred < 1e-4) {
      return NextResponse.json({ error: '⚠️ WARNING: Mantra ditolak karena mendeteksi nilai prediksi yang monoton.' }, { status: 406 });
    }
    if (rmse < 0.001) {
      return NextResponse.json({ error: '🚨 ALERT: Skor terlalu sempurna. Terdapat anomali kebocoran.' }, { status: 406 });
    }

    // 8. UPDATE REKOR PAPAN PERINGKAT
    const isNewBest = teamData.best_rmse === null || rmse < teamData.best_rmse;
    const updatePayload: any = { submission_count: currentCount + 1, last_submit_date: today };
    if (isNewBest) updatePayload.best_rmse = rmse;

    const { error: updateError } = await supabaseAdmin.from('teams').update(updatePayload).eq('id', teamId);
    if (updateError) return NextResponse.json({ error: 'Gagal memahat rekor asrama ke dalam pilar batu.' }, { status: 500 });

    if (isNewBest) {
      // ==========================================
      // 9A. LOGIKA PEMBERSIHAN STORAGE (HIGHLANDER)
      // ==========================================
      try {
        const { data: existingFiles } = await supabaseAdmin.storage.from('submissions').list(teamId);
        
        if (existingFiles && existingFiles.length > 0) {
          const currentFileName = filePath.split('/').pop(); 
          
          const filesToDelete = existingFiles
            .filter(f => f.name !== currentFileName) 
            .map(f => `${teamId}/${f.name}`); 
            
          if (filesToDelete.length > 0) {
            await supabaseAdmin.storage.from('submissions').remove(filesToDelete);
          }
        }
      } catch (cleanupError) {
        console.error("Gagal membersihkan ruang penyimpanan:", cleanupError);
      }

      // ==========================================
      // 9B. LOGIKA PENCATATAN AKTIVITAS (LIVE LOG)
      // ==========================================
      try {
        // 1. Cari tahu ranking tim ini sekarang (Hitung jumlah tim yang RMSE-nya lebih kecil/lebih baik)
        const { count: rankCount } = await supabaseAdmin
          .from('teams')
          .select('id', { count: 'exact', head: true })
          .lt('best_rmse', rmse)
          .not('best_rmse', 'is', null);

        const newRank = (rankCount || 0) + 1; // Jika ada 2 tim yang lebih baik, berarti dia rank 3
        const teamName = teamData.team_name;
        const formattedRmse = rmse.toFixed(5);
        
        let logMessage = "";
        let logType = 'update';

        // Fungsi pembantu untuk memilih teks acak dari sebuah array
        const getRandomMsg = (messages: string[]) => messages[Math.floor(Math.random() * messages.length)];

        // KONDISI 1: Submisi Pertama Kali
        if (teamData.best_rmse === null) {
          logType = 'rank_up';
          logMessage = getRandomMsg([
            `👑 **${teamName}** berhasil menancapkan bendera pertama kali di papan peringkat dengan RMSE **${formattedRmse}**!`,
            `📜 Gulungan mantra **${teamName}** akhirnya terbuka! Skor perdana mereka: **${formattedRmse}**!`,
            `✨ Pendatang baru di arena! **${teamName}** memulai debutnya dengan akurasi **${formattedRmse}**.`
          ]);
        } 
        // KONDISI 2: Berhasil Menyalip ke Top 3!
        else if (newRank <= 3) { 
          logType = 'rank_up';
          logMessage = getRandomMsg([
            `🔥 GOKILLL! **${teamName}** mendobrak masuk ke posisi **#${newRank}**! Papan peringkat berguncang keras! 💥`,
            `⚡ SENSASIONAL! Dengan RMSE **${formattedRmse}**, **${teamName}** merebut takhta posisi **#${newRank}**!`,
            `🏆 **${teamName}** menembakkan sihir mematikan! Posisi **#${newRank}** kini dalam genggaman mereka!`,
            `🚨 ALERT! **${teamName}** baru saja membajak peringkat **#${newRank}** dengan akurasi dewa!`
          ]);
        } 
        // KONDISI 3 & 4: Peningkatan Berdasarkan Selisih Skor
        else {
          const improvement = teamData.best_rmse - rmse;
          
          if (improvement > 0.05) { // Angka 0.05 bisa disesuaikan dengan skala dataset Anda
            // Peningkatan drastis (Lompatan jauh)
            logType = 'rank_up';
            logMessage = getRandomMsg([
              `🚀 LOMPATAN JAUH! **${teamName}** mempertajam akurasi secara drastis menjadi **${formattedRmse}**!`,
              `☄️ **${teamName}** menemukan formula rahasia! Skor mereka melesat tajam ke **${formattedRmse}**!`,
              `⚔️ Serangan balik mematikan dari **${teamName}**! Rekor lama mereka hancur berkeping-keping.`
            ]);
          } else {
            // Peningkatan minor (Optimasi perlahan / fine-tuning)
            logType = 'update';
            logMessage = getRandomMsg([
              `🔮 Sedikit demi sedikit! **${teamName}** mengasah mantra mereka menjadi **${formattedRmse}**!`,
              `🛠️ **${teamName}** melakukan *fine-tuning* dan berhasil mengamankan RMSE **${formattedRmse}**.`,
              `🧩 Akurasi meningkat! **${teamName}** terus bereksperimen dengan skor baru **${formattedRmse}**.`,
              `⚡ Evaluasi sukses. Mantra **${teamName}** kini sedikit lebih tajam di angka **${formattedRmse}**.`
            ]);
          }
        }

        // Simpan log yang sudah dirangkai ke database
        const { error: insertError } = await supabaseAdmin.from('activity_logs').insert({
          message: logMessage,
          type: logType
        });
        
        if (insertError) console.error("🚨 Gagal Insert Log:", insertError.message);

      } catch (logError) {
        console.error("Gagal mencatat log aktivitas:", logError);
      }
    }

    return NextResponse.json({
      success: true,
      rmse,
      message: isNewBest ? 'Mantra sempurna! Rekor baru tercipta.' : 'Skor tercatat. Evaluasi kekuatan mantra Anda kembali.'
    });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Terjadi guncangan pada inti server.' }, { status: 500 });
  }
}
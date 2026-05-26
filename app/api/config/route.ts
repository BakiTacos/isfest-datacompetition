import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// Fungsi kalkulator poin klasemen
function calculateBaselineScore(
  globalRank: number, 
  hasIpynb: boolean, 
  hasPpt: boolean, 
  hasLaporan: boolean
): number {
  let rankScore = 0;
  if (globalRank === 1) rankScore = 25;
  else if (globalRank === 2) rankScore = 24;
  else if (globalRank === 3) rankScore = 23;
  else if (globalRank === 4) rankScore = 22;
  else if (globalRank === 5) rankScore = 21;
  else if (globalRank >= 6 && globalRank <= 10) rankScore = 20;
  else if (globalRank >= 11 && globalRank <= 20) rankScore = 15;
  else if (globalRank === 999) rankScore = 0; 
  else rankScore = 10; 

  let fileScore = 0;
  if (hasIpynb) fileScore += 5;
  if (hasPpt) fileScore += 5;
  if (hasLaporan) fileScore += 5;

  return rankScore + fileScore;
}

// GET: Ambil SELURUH konfigurasi (Deadline & Akses Soal)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('global_config')
      .select('key, value');

    if (error) throw error;

    // Petakan array database menjadi objek konfigurasi
    let isDeadlineClosed = false;
    let isOpen = false;

    data?.forEach(item => {
      // Pastikan membaca boolean baik dalam bentuk string maupun boolean murni
      if (item.key === 'is_deadline_closed') {
        isDeadlineClosed = item.value === 'true' || item.value === true;
      }
      if (item.key === 'is_open') {
        isOpen = item.value === 'true' || item.value === true;
      }
    });

    return NextResponse.json({ isDeadlineClosed, isOpen });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal mengambil konfigurasi portal.' }, { status: 500 });
  }
}

// POST: Perbarui konfigurasi spesifik berdasarkan input
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ==========================================
    // SKENARIO 1: ADMIN MENGUBAH STATUS AKSES SOAL
    // ==========================================
    if (body.isOpen !== undefined) {
      const { error } = await supabaseAdmin
        .from('global_config')
        .update({ value: body.isOpen, updated_at: new Date() })
        .eq('key', 'is_open');
      
      if (error) throw error;
      return NextResponse.json({ success: true, isOpen: body.isOpen });
    }

    // ==========================================
    // SKENARIO 2: ADMIN MENGUBAH STATUS DEADLINE
    // ==========================================
    if (body.isDeadlineClosed !== undefined) {
      const isDeadlineClosed = body.isDeadlineClosed;

      if (isDeadlineClosed === true) {
        // Kalkulasi Poin Data Competition Saat Gerbang Ditutup
        const { data: teams, error: fetchError } = await supabaseAdmin
          .from('teams')
          .select('id, team_name, best_rmse, has_ipynb, has_ppt, has_laporan, jenis_lomba, score_ipynb, score_laporan, score_ppt')
          .eq('jenis_lomba', 'Data Competition') 
          .order('best_rmse', { ascending: true, nullsFirst: false })
          .order('updated_at', { ascending: true });

        if (fetchError) throw fetchError;

        if (teams && teams.length > 0) {
          const updatePromises = teams.map(async (team, index) => {
            const globalRank = team.best_rmse !== null ? (index + 1) : 999; 

            const baselineScore = calculateBaselineScore(
              globalRank,
              team.has_ipynb ?? false,
              team.has_ppt ?? false,
              team.has_laporan ?? false
            );

            // Total akumulasi: Baseline + Input Panitia
            const totalPoinPanitia = (team.score_ipynb ?? 0) + (team.score_laporan ?? 0) + (team.score_ppt ?? 0);
            const totalFinalScore = baselineScore + totalPoinPanitia;

            const { error: updateError } = await supabaseAdmin
              .from('teams')
              .update({ 
                baseline_score: baselineScore,
                final_score: totalFinalScore 
              })
              .eq('id', team.id);

            if (updateError) {
               console.error(`Gagal update poin untuk ${team.team_name}:`, updateError.message);
               throw updateError; 
            }
          });

          await Promise.all(updatePromises);
        }
      } else {
        // Saat portal dibuka kembali, reset final_score ke null agar rincian kembali tersembunyi
        await supabaseAdmin
          .from('teams')
          .update({ final_score: null, baseline_score: 0 }) 
          .eq('jenis_lomba', 'Data Competition');
      }

      // Simpan status gerbang deadline ke tabel global_config
      const { error: configError } = await supabaseAdmin
        .from('global_config')
        .update({ value: isDeadlineClosed, updated_at: new Date() })
        .eq('key', 'is_deadline_closed');

      if (configError) throw configError;

      return NextResponse.json({ success: true, isDeadlineClosed });
    }

    // Jika body tidak dikenali
    return NextResponse.json({ error: 'Format permintaan tidak dikenali.' }, { status: 400 });

  } catch (err: any) {
    console.error('🚨 Error Kendali Sistem:', err.message);
    return NextResponse.json({ error: 'Gagal memproses konfigurasi.' }, { status: 500 });
  }
}
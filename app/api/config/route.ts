import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

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
  else if (globalRank === 999) rankScore = 0; // Tim yang tidak mengumpulkan berkas/RMSE null
  else rankScore = 10; 

  let fileScore = 0;
  if (hasIpynb) fileScore += 5;
  if (hasPpt) fileScore += 5;
  if (hasLaporan) fileScore += 5;

  return rankScore + fileScore;
}

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

export async function POST(request: Request) {
  try {
    const { isDeadlineClosed } = await request.json();

    if (isDeadlineClosed === true) {
      const { data: teams, error: fetchError } = await supabaseAdmin
        .from('teams')
        // ✨ PERBAIKAN 1: Tarik kolom rincian skor panitia dari database
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

          // ✨ PERBAIKAN 2: Hitung total nilai akhir gabungan (Baseline + Input Juri)
          const totalPoinPanitia = (team.score_ipynb ?? 0) + (team.score_laporan ?? 0) + (team.score_ppt ?? 0);
          const totalFinalScore = baselineScore + totalPoinPanitia;

          const { error: updateError } = await supabaseAdmin
            .from('teams')
            .update({ 
              baseline_score: baselineScore,
              final_score: totalFinalScore // ✨ Gunakan total akumulasi nilai asli
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
      // Saat portal dibuka kembali, reset final_score ke null agar rincian tersembunyi
      await supabaseAdmin
        .from('teams')
        .update({ final_score: null, baseline_score: 0 }) 
        .eq('jenis_lomba', 'Data Competition');
    }

    const { error: configError } = await supabaseAdmin
      .from('global_config')
      .update({ value: isDeadlineClosed, updated_at: new Date() })
      .eq('key', 'is_deadline_closed');

    if (configError) throw configError;

    return NextResponse.json({ success: true, isDeadlineClosed });
  } catch (err: any) {
    console.error('🚨 Error Kendali Waktu:', err.message);
    return NextResponse.json({ error: 'Gagal memproses mantra penutupan gerbang.' }, { status: 500 });
  }
}
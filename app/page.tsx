import { supabaseAdmin } from '@/lib/supabase';
import Navbar from './components/Navbar';
import Mascot from './components/Mascot';
// Sesuaikan path ini jika Anda meletakkan file LeaderboardTable di dalam folder /leaderboard
import LeaderboardTable, { TeamLeaderboard } from './components/leaderboard/LeaderBoardTable';
import ActivityLog from './components/ActivityLog'; 
import Image from 'next/image';

export const dynamic = 'force-dynamic';

// Fungsi untuk membaca status gerbang deadline dari database
async function getDeadlineStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('global_config')
      .select('value')
      .eq('key', 'is_deadline_closed')
      .single();
    
    if (error) return false; 
    return data?.value === 'true' || data?.value === true;
  } catch (err) {
    return false;
  }
}

// Perbarui query SELECT untuk menarik semua data tim beserta jenis lomba dan kelengkapan UI/UX
async function getLeaderboardData(): Promise<TeamLeaderboard[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select(`
        id, 
        team_name, 
        jenis_lomba, 
        best_rmse, 
        final_score, 
        has_ipynb, 
        has_ppt, 
        has_laporan,
        has_mockup,
        has_video,
        has_prototype,
        score_ppt,
        score_ipynb,
        score_laporan
      `) 
      // NullsFirst: false memastikan UI/UX (yang RMSE-nya null) berada di bawah sebelum di-sort ulang oleh Frontend
      .order('best_rmse', { ascending: true, nullsFirst: false })
      .order('updated_at', { ascending: true });

    if (error) {
      console.error('🚨 Supabase DB Error:', error.message);
      return [];
    }
    
    // Pemetaan data ke interface Frontend
    return (data || []).map(team => ({
      id: team.id,
      team_name: team.team_name,
      jenis_lomba: team.jenis_lomba || 'Data Competition', // Default jika kosong
      best_rmse: team.best_rmse,
      final_points: team.final_score ?? null,
      has_ipynb: team.has_ipynb ?? false,
      has_ppt: team.has_ppt ?? false,
      has_laporan: team.has_laporan ?? false,
      has_mockup: team.has_mockup ?? false,
      has_video: team.has_video ?? false,
      has_prototype: team.has_prototype ?? false,
      score_ipynb: team.score_ipynb ?? 0,      /* TAMBAHKAN INI */
      score_laporan: team.score_laporan ?? 0,  /* TAMBAHKAN INI */
      score_ppt: team.score_ppt ?? 0
    }));
  } catch (err: any) {
    console.error('🚨 Critical Server Error:', err.message);
    return [];
  }
}

export default async function HomePage() {
  // Jalankan kedua fetch secara paralel agar halaman render lebih cepat
  const [leaderboard, isDeadlineClosed] = await Promise.all([
    getLeaderboardData(),
    getDeadlineStatus()
  ]);

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f]">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/background-leaderboard.png" alt="Mystical Forest Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#0a101d]/20" />
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 lg:pt-32 pb-12 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start justify-center">
          
          {/* Kolom Kiri: Maskot (Menempati 4 Kolom Grid) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-start w-full sticky top-32">
            <div className="w-[80%] sm:w-[90%] md:w-full max-w-[280px] lg:w-full lg:max-w-none">
              <Mascot />
            </div>
          </div>

          {/* Kolom Kanan: Tabel & Log Aktivitas (Menempati 8 Kolom Grid) */}
          <div className="lg:col-span-8 w-full flex flex-col gap-8">
            
            {/* Mengirimkan data gabungan ke komponen LeaderboardTable yang baru */}
            <LeaderboardTable 
              data={leaderboard} 
              isDeadlineClosed={isDeadlineClosed} 
            />
            
            <ActivityLog /> 

          </div>

        </div>
      </div>
    </main>
  );
}
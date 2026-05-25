import { supabaseAdmin } from '@/lib/supabase';
import Navbar from './components/Navbar';
import Mascot from './components/Mascot';
import LeaderboardTable, { TeamLeaderboard } from './components/LeaderBoardTable';
import ActivityLog from './components/ActivityLog'; 
import Image from 'next/image';

export const dynamic = 'force-dynamic';

// 👇 PERBAIKAN 1: Fungsi untuk membaca status gerbang deadline dari database
async function getDeadlineStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('global_config')
      .select('value')
      .eq('key', 'is_deadline_closed')
      .single();
    
    if (error) return false; // Default aman: false (Live)
    return data?.value ?? false;
  } catch (err) {
    return false;
  }
}

// 👇 PERBAIKAN 2: Perbarui query SELECT untuk menarik status file dan poin juri
async function getLeaderboardData(): Promise<TeamLeaderboard[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      // Tambahkan kolom berkas dan poin akhir di sini
      .select('id, team_name, best_rmse, has_ipynb, has_ppt, has_laporan, final_score') 
      .order('best_rmse', { ascending: true, nullsFirst: false })
      .order('updated_at', { ascending: true });

    if (error) {
      console.error('🚨 Supabase DB Error:', error.message);
      return [];
    }
    
    // Konversi mapping data jika nama kolom di DB berbeda dengan di interface Frontend
    return (data || []).map(team => ({
      id: team.id,
      team_name: team.team_name,
      best_rmse: team.best_rmse,
      has_ipynb: team.has_ipynb ?? false,
      has_ppt: team.has_ppt ?? false,
      has_laporan: team.has_laporan ?? false,
      final_points: team.final_score ?? null // Mapping final_score (DB) ke final_points (UI)
    }));
  } catch (err: any) {
    console.error('🚨 Critical Server Error:', err.message);
    return [];
  }
}

export default async function HomePage() {
  // 👇 PERBAIKAN 3: Jalankan kedua fetch secara paralel agar halaman render lebih cepat
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
          
          {/* Kolom Maskot */}
          <div className="lg:col-span-4 flex flex-col items-center justify-start w-full sticky top-32">
            <div className="w-[80%] sm:w-[90%] md:w-full max-w-[280px] lg:w-full lg:max-w-none">
              <Mascot />
            </div>
          </div>

          {/* Kolom Tabel & Log Aktivitas */}
          <div className="lg:col-span-8 w-full flex flex-col gap-8">
            
            {/* 👇 Teruskan status penutup gerbang ke dalam komponen tabel */}
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
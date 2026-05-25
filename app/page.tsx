import { supabaseAdmin } from '@/lib/supabase';
import Navbar from './components/Navbar';
import Mascot from './components/Mascot';
import LeaderboardTable, { TeamLeaderboard } from './components/LeaderBoardTable';
import ActivityLog from './components/ActivityLog'; 
import Image from 'next/image';

export const dynamic = 'force-dynamic';

async function getLeaderboardData(): Promise<TeamLeaderboard[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select('id, team_name, best_rmse')
      .order('best_rmse', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('🚨 Supabase DB Error:', error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    console.error('🚨 Critical Server Error:', err.message);
    return [];
  }
}

export default async function HomePage() {
  const leaderboard = await getLeaderboardData();

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f]">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/background-leaderboard.png" alt="Mystical Forest Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#0a101d]/20" />
      </div>

      <Navbar />

      {/* 👇 PERBAIKAN 1: pt-8 md:pt-12 diubah menjadi pt-24 lg:pt-32 untuk memberi ruang pada Navbar & Chat Bubble */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 lg:pt-32 pb-12 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start justify-center">
          
          {/* 👇 PERBAIKAN 2: sticky top-24 diubah menjadi top-32 agar Maskot tidak berhenti terlalu mepet atas */}
          <div className="lg:col-span-4 flex flex-col items-center justify-start w-full sticky top-32">
            <div className="w-[80%] sm:w-[90%] md:w-full max-w-[280px] lg:w-full lg:max-w-none">
              <Mascot />
            </div>
          </div>

          {/* 👇 PERBAIKAN 3: Papan Peringkat & Activity Log digabung di kolom kanan */}
          <div className="lg:col-span-8 w-full flex flex-col gap-8">
            
            <LeaderboardTable data={leaderboard} />
            
            <ActivityLog /> 

          </div>

        </div>
      </div>
    </main>
  );
}
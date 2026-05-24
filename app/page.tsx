import { supabaseAdmin } from '@/lib/supabase';
import Navbar from './components/Navbar';
import Mascot from './components/Mascot';
import LeaderboardTable, { TeamLeaderboard } from './components/LeaderBoardTable';
import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

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
      
      {/* LAYER BACKGROUND GAMBAR HUTAN PINUS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/background-leaderboard.png"
          alt="Mystical Forest Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0a101d]/20" />
      </div>

      <Navbar />

      {/* Grid Utama: Maskot & Papan Peringkat - responsif mobile */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 relative z-10">
        {/* Pada mobile, gunakan flex kolom dengan justify-center */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center justify-center">
          
          {/* KIRI: Maskot - ukuran lebih kecil di mobile */}
          <div className="lg:col-span-4 flex justify-center w-full lg:pt-10">
            <div className="w-[80%] sm:w-[90%] md:w-full max-w-[280px] lg:max-w-none">
              <Mascot />
            </div>
          </div>

          {/* KANAN: Papan Peringkat dengan paginasi - lebar penuh di mobile */}
          <div className="lg:col-span-8 w-full">
            <LeaderboardTable data={leaderboard} />
          </div>
        </div>
      </div>
    </main>
  );
}
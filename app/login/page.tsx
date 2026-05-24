'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Memanggil client aman (Anon Key)
import Image from 'next/image';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 🔮 Validasi langsung ke tabel 'teams'
      const { data, error } = await supabase
        .from('teams')
        .select('id, team_name')
        .eq('username', username.trim()) // Cek username
        .eq('password', password)        // Cek password
        .single(); // Harus persis ketemu 1 baris

      if (error || !data) {
        throw new Error('Mantra ditolak! Username asrama atau kata sandi Anda salah.');
      }

      // Jika berhasil, simpan ID dan Nama Tim ke dalam Cookie
      document.cookie = `team_id=${data.id}; path=/; max-age=86400`;
      document.cookie = `team_name=${encodeURIComponent(data.team_name)}; path=/; max-age=86400`;

      // Buka gerbang menuju halaman submisi
      router.push('/submit');
      router.refresh();
      
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f] flex items-center justify-center">
      
      {/* 🌲 LAYER BACKGROUND GAMBAR HUTAN PINUS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/background-leaderboard.png"
          alt="Mystical Forest Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0a101d]/60 backdrop-blur-sm" />
      </div>

      {/* 🔮 FORM LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#ffec1f] transition-colors mb-6 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Arena
        </Link>

        <div className="bg-[#172135]/60 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden border border-slate-600/40 backdrop-blur-xl p-8 md:p-10 transition-all duration-500">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ffec1f]/10 border border-[#ffec1f]/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,236,31,0.15)]">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className={`${cinzel.className} text-2xl md:text-3xl font-bold text-[#ffec1f] tracking-wider mb-2`}>
              Masuk ke Arena
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Gunakan Username Tim dan Kata Sandi Anda untuk mengakses gerbang submisi.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
            {/* Input Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">
                Username Tim
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0a101d]/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#ffec1f] focus:ring-1 focus:ring-[#ffec1f]/50 transition-all text-sm"
                placeholder="e.g. macm3"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">
                Kata Sandi Sihir
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a101d]/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#ffec1f] focus:ring-1 focus:ring-[#ffec1f]/50 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-xs font-medium text-center flex items-center justify-center gap-2">
                <span>🛑</span> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-slate-950 font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-amber-900/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Memvalidasi...' : 'Buka Gerbang'}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}
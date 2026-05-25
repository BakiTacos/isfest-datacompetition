'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cinzel } from 'next/font/google';
import Image from 'next/image';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

export default function AddTeamPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [jenisLomba, setJenisLomba] = useState('Data Competition'); // State baru untuk Jenis Lomba
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 🪄 Konversi Otomatis: "Gryffindor Data" -> "gryffindordata"
  const generatedUsername = teamName.toLowerCase().replace(/\s+/g, '');

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const adminId = getCookie('admin_id');
    
    if (!adminId) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !password) return;

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/create-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Sisipkan jenisLomba ke dalam pengiriman data
        body: JSON.stringify({ teamName, username: generatedUsername, password, jenisLomba }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem saat meracik identitas.');
      }

      setStatus({ type: 'success', text: data.message });
      setTeamName('');
      setPassword('');
      setJenisLomba('Data Competition'); // Kembalikan ke default

      setTimeout(() => setStatus(null), 5000);
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-slate-200 font-sans relative flex flex-col items-center justify-center p-4">
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/background-leaderboard.png"
          alt="Mystical Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0a101d]/75 backdrop-blur-[4px]" />
      </div>

      <div className="w-full max-w-md bg-[#172135]/60 rounded-3xl p-8 border border-slate-600/30 backdrop-blur-xl relative z-10 shadow-2xl shadow-black/60">
        <div className="text-center mb-6">
          <h1 className={`${cinzel.className} text-xl md:text-2xl font-bold text-[#ffec1f] tracking-wider mb-1`}>
            Gerbang Pendaftaran Tim
          </h1>
          <p className="text-slate-400 text-xs">Registrasi identitas asrama/kelompok peserta baru</p>
        </div>

        <form onSubmit={handleCreateTeam} className="space-y-4">
          
          {/* BIDANG LOMBA */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bidang Lomba</label>
            <div className="relative">
              <select
                value={jenisLomba}
                onChange={(e) => setJenisLomba(e.target.value)}
                className="w-full bg-[#0a101d]/60 border border-slate-600/40 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#ffec1f]/60 transition-colors appearance-none cursor-pointer"
              >
                <option value="Data Competition" className="bg-[#172135]">Data Competition</option>
                <option value="UI/UX" className="bg-[#172135]">UI/UX</option>
              </select>
              {/* Custom Arrow Icon untuk mempercantik select */}
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* NAMA TIM */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nama Tim</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-[#0a101d]/60 border border-slate-600/40 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#ffec1f]/60 transition-colors placeholder:text-slate-600"
              placeholder="Contoh: Gryffindor Data"
            />
          </div>

          {/* MENAMPILKAN GENERATED USERNAME (Read-Only) */}
          {teamName && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Sistem akan membuat Username:</span>
                <span className="text-[#ffec1f] font-mono text-sm">{generatedUsername}</span>
              </div>
            </div>
          )}

          {/* PASSWORD AWAL */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password Awal</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a101d]/60 border border-slate-600/40 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#ffec1f]/60 transition-colors placeholder:text-slate-600"
              placeholder="••••••••"
            />
          </div>

          {status && (
            <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <span>{status.type === 'success' ? '✨' : '🛑'}</span>
              <p>{status.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:transform-none mt-2"
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftarkan Akun Tim'}
          </button>
        </form>
      </div>
    </main>
  );
}
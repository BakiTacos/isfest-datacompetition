'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/admin/add-team');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background yang seragam */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background-leaderboard.png"
          alt="Mystical Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0a101d]/80 backdrop-blur-[4px]" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-[#172135]/60 border border-slate-600/40 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ffec1f]/10 border border-[#ffec1f]/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,236,31,0.15)]">
            <span className="text-2xl">🗝️</span>
          </div>
          <h1 className={`${cinzel.className} text-xl font-bold text-[#ffec1f] tracking-widest`}>
            Portal Panitia
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Otoritas Tertinggi Arena</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Username Admin</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0a101d]/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-200 text-sm focus:border-[#ffec1f] focus:ring-1 focus:ring-[#ffec1f]/50 transition-all focus:outline-none"
              placeholder="Masukkan identitas..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Kata Sandi</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a101d]/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-200 text-sm focus:border-[#ffec1f] focus:ring-1 focus:ring-[#ffec1f]/50 transition-all focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-[10px] text-center font-medium">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            {isLoading ? 'Membuka Gerbang...' : 'Masuk ke Portal'}
          </button>
        </form>
      </div>
    </main>
  );
}
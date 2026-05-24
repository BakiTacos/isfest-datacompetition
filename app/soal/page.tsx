'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import MascotSide from '../components/Mascot-Side'; // 👈 IMPORT MASKOT DI SINI
import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

export default function SoalPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const id = getCookie('team_id');
    const name = getCookie('team_name');

    if (!id) {
      router.push('/login');
    } else {
      setTeamId(id);
      setTeamName(name ? decodeURIComponent(name).replace(/%20/g, ' ') : 'Penyihir Tanpa Nama');
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a101d] flex items-center justify-center">
        <p className="text-[#ffec1f] animate-pulse font-bold tracking-widest uppercase">Membuka Arsip...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f] flex flex-col">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/background-leaderboard.png" alt="Mystical Forest Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#0a101d]/60 backdrop-blur-[2px]" />
      </div>

      <Navbar />

      <div className="flex-grow max-w-5xl w-full mx-auto px-4 md:px-6 py-8 relative z-10 flex flex-col items-center">
        
        {/* PANEL IDENTITAS */}
        <div className="w-full bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-5 mb-8 backdrop-blur-md flex flex-row items-center gap-4 shadow-xl shadow-black/40">
          <div className="w-12 h-12 rounded-full bg-[#ffec1f]/10 border border-[#ffec1f]/30 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(255,236,31,0.2)] shrink-0">
            📚
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akses Diberikan Kepada Asrama</h3>
            <h2 className={`${cinzel.className} text-lg md:text-xl font-bold text-[#ffec1f]`}>{teamName}</h2>
          </div>
        </div>

        {/* KONTEN UTAMA: BUKU PANDUAN */}
        <div className="w-full bg-[#172135]/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-slate-600/30 backdrop-blur-xl p-6 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-slate-800/50 rounded-2xl border border-slate-600/50 flex items-center justify-center text-6xl shadow-inner animate-[float_4s_ease-in-out_infinite]">
              📖
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className={`${cinzel.className} text-2xl md:text-3xl font-bold text-white tracking-wider mb-3`}>
                Kitab Panduan ISFEST
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Pelajari seluruh peraturan turnamen, kriteria penilaian (RMSE), rincian kolom dataset, dan mekanisme perlombaan. Pastikan asrama Anda membaca kitab ini sebelum mulai meracik model algoritma prediksi.
              </p>
              <a href="/files/Handbook_ISFEST.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#ffec1f] hover:bg-white text-slate-900 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(255,236,31,0.3)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Buka Kitab Panduan
              </a>
            </div>
          </div>
        </div>

        {/* KONTEN KEDUA: GRID DATASET */}
        <div className="w-full">
          <div className="text-center mb-6">
            <h2 className={`${cinzel.className} text-xl md:text-2xl font-bold text-white tracking-wider`}>
              Bahan Baku Ramuan
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">Unduh gulungan dataset ini untuk melatih model sihir Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TRAIN DATA */}
            <div className="bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center text-center hover:border-emerald-500/50 hover:bg-[#172135] transition-all group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="font-bold text-slate-200 text-lg mb-2">Train.csv</h3>
              <p className="text-slate-400 text-xs mb-6 flex-grow">
                Gulungan data historis yang memuat fitur perbankan beserta <span className="text-emerald-400 font-semibold">jawaban target</span> untuk melatih model Anda.
              </p>
              <a href="/files/train.csv" download className="w-full bg-slate-800 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-lg transition-colors">Unduh Data Latih</a>
            </div>

            {/* TEST DATA */}
            <div className="bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center text-center hover:border-blue-500/50 hover:bg-[#172135] transition-all group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔮</div>
              <h3 className="font-bold text-slate-200 text-lg mb-2">Test.csv</h3>
              <p className="text-slate-400 text-xs mb-6 flex-grow">
                Data uji yang <span className="text-blue-400 font-semibold">tidak memiliki target</span>. Ramalkan nilainya menggunakan model terbaik yang telah asrama Anda latih.
              </p>
              <a href="/files/test.csv" download className="w-full bg-slate-800 hover:bg-blue-600 border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-lg transition-colors">Unduh Data Uji</a>
            </div>

            {/* SAMPLE SUBMISSION */}
            <div className="bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center text-center hover:border-amber-500/50 hover:bg-[#172135] transition-all group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📜</div>
              <h3 className="font-bold text-slate-200 text-lg mb-2">Sample_Submission.csv</h3>
              <p className="text-slate-400 text-xs mb-6 flex-grow">
                Cetak biru format jawaban yang diterima oleh sistem juri otomatis di Ruang Submisi.
              </p>
              <a href="/files/sample_submission.csv" download className="w-full bg-slate-800 hover:bg-amber-600 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-lg transition-colors">Unduh Format</a>
            </div>

          </div>
        </div>
      </div>

      {/* 🔮 MASKOT DITAMBAHKAN DI SINI */}
      <MascotSide />

    </main>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

export default function SubmitPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // State baru untuk Skor dan Kuota
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(5); // Default 5

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
      
      // 🚀 AMBIL DATA KUOTA ASLI DARI DATABASE SAAT REFRESH
      const fetchCurrentQuota = async () => {
        try {
          const response = await fetch(`/api/submit?team_id=${id}`);
          if (response.ok) {
            const data = await response.json();
            setQuotaRemaining(data.quotaRemaining); // Sinkronkan state dengan database
          }
        } catch (err) {
          console.error("Gagal menyinkronkan energi sihir harian:", err);
        }
      };

      fetchCurrentQuota();
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'team_id=; path=/; max-age=0';
    document.cookie = 'team_name=; path=/; max-age=0';
    router.push('/login');
    router.refresh();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setMessage(null);
    setCurrentScore(null);
    if (!selectedFile.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Mantra ditolak! Hanya menerima gulungan format .csv' });
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file || !teamId) return;
    if (quotaRemaining <= 0) {
      setMessage({ type: 'error', text: 'Energi sihir habis! Anda telah mencapai batas 5x submisi hari ini.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setCurrentScore(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('team_id', teamId);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        console.error("Server Error Raw:", textResponse);
        throw new Error("Server anomali. Gagal memecahkan mantra.");
      }

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengevaluasi model.');
      }

      // Tampilkan hasil sukses
      setMessage({ type: 'success', text: result.message });
      setCurrentScore(result.rmse); // Simpan skor untuk ditampilkan di UI
      
      // Kurangi kuota di frontend (Pastikan backend juga mengurangi ini di database)
      setQuotaRemaining(prev => Math.max(0, prev - 1));
      setFile(null);
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  if (!teamId) return null;

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f] flex flex-col">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/background-leaderboard.png"
          alt="Mystical Forest Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0a101d]/60 backdrop-blur-[2px]" />
      </div>

      <Navbar />

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 md:px-6 py-8 relative z-10 flex flex-col items-center">
        
        {/* PANEL IDENTITAS & KUOTA */}
        <div className="w-full bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-5 mb-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-xl shadow-black/40">
          <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-[#ffec1f]/10 border border-[#ffec1f]/30 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(255,236,31,0.2)] shrink-0">
              🧙‍♂️
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asrama Aktif</h3>
              <h2 className={`${cinzel.className} text-lg md:text-xl font-bold text-[#ffec1f]`}>{teamName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            {/* Indikator Kuota Harian */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sisa Kuota Harian</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-6 rounded-full transition-all duration-500 ${
                      i < quotaRemaining 
                        ? 'bg-[#ffec1f] shadow-[0_0_8px_rgba(255,236,31,0.6)]' 
                        : 'bg-slate-700/50 border border-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-300 mt-1 font-mono">{quotaRemaining} / 5 Gulungan</span>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
              title="Keluar Arena"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* HASIL SKOR (Muncul setelah submit sukses) */}
        {currentScore !== null && (
          <div className="w-full bg-gradient-to-r from-emerald-900/40 to-[#131b2c]/80 border border-emerald-500/30 rounded-2xl p-6 mb-6 backdrop-blur-md flex flex-col items-center justify-center animate-[float_3s_ease-in-out_infinite] shadow-[0_0_20px_rgba(16,185,129,0.1)] text-center">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Evaluasi Mantra Selesai</h3>
            <p className="text-slate-300 text-sm mb-2">{message?.text}</p>
            <div className="flex items-end gap-2">
              <span className="text-slate-400 text-sm mb-1.5 font-medium">RMSE :</span>
              <span className={`${cinzel.className} text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
                {currentScore.toFixed(5)}
              </span>
            </div>
            
            <Link href="/" className="mt-4 text-xs text-[#ffec1f] hover:text-white underline decoration-[#ffec1f]/40 underline-offset-4 transition-colors">
              Lihat Posisi Anda di Papan Peringkat &rarr;
            </Link>
          </div>
        )}

        {/* PANEL UPLOAD */}
        <div className="w-full bg-[#172135]/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-slate-600/30 backdrop-blur-xl p-6 md:p-10">
          <div className="text-center mb-8">
            <h1 className={`${cinzel.className} text-2xl md:text-3xl font-bold text-white tracking-wider mb-2`}>
              Ruang Submisi
            </h1>
            <p className="text-slate-400 text-sm">
              Letakkan gulungan prediksi Anda di altar ini.
            </p>
          </div>

          <div 
            onClick={() => quotaRemaining > 0 && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
              quotaRemaining <= 0 
                ? 'border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-60'
                : isDragging 
                  ? 'border-[#ffec1f] bg-[#ffec1f]/10 cursor-pointer' 
                  : file 
                    ? 'border-emerald-500/50 bg-emerald-500/5 cursor-pointer' 
                    : 'border-slate-600/50 bg-[#0a101d]/40 hover:border-[#ffec1f]/50 hover:bg-[#ffec1f]/5 cursor-pointer'
            }`}
          >
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={quotaRemaining <= 0}
            />

            {quotaRemaining <= 0 ? (
              <div className="text-center">
                <div className="text-4xl mb-3 opacity-60">⏳</div>
                <p className="text-red-400 font-medium text-base mb-1">Energi Sihir Habis</p>
                <p className="text-slate-500 text-xs">Silakan kembali besok untuk mengunggah mantra baru.</p>
              </div>
            ) : file ? (
              <div className="text-center animate-fade-in">
                <div className="text-4xl mb-3">📜</div>
                <p className="text-[#ffec1f] font-semibold text-lg">{file.name}</p>
                <p className="text-slate-400 text-xs mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                <p className="text-slate-500 text-xs mt-4 underline decoration-slate-600 hover:text-slate-300">Klik untuk mengganti gulungan</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-3 opacity-60">☁️</div>
                <p className="text-slate-200 font-medium text-base mb-1">Tarik & Lepas file prediksi di sini</p>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">atau klik untuk menelusuri</p>
              </div>
            )}
          </div>

          {/* Pesan Error (selain skor sukses) */}
          {message?.type === 'error' && (
            <div className="mt-6 p-4 rounded-xl text-sm font-medium border flex items-start gap-3 animate-fade-in bg-red-500/10 border-red-500/30 text-red-400">
              <span className="text-lg leading-none">🛑</span>
              <p>{message.text}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || isUploading || quotaRemaining <= 0}
            className="w-full mt-6 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-slate-950 font-bold text-sm md:text-base uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-amber-900/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
          >
            {isUploading ? 'Sistem Sedang Mengevaluasi...' : 'Serahkan Prediksi'}
          </button>

        </div>
      </div>
    </main>
  );
}
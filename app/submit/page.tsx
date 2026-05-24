'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Image from 'next/image';
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

  // 🛡️ Mengecek status otentikasi dari Cookie saat halaman dimuat
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
      // Jika tidak ada cookie ID, usir kembali ke halaman login
      router.push('/login');
    } else {
      setTeamId(id);
      setTeamName(name ? decodeURIComponent(name) : 'Penyihir Tanpa Nama');
    }
  }, [router]);

  // Fungsi Keluar (Logout)
  const handleLogout = () => {
    document.cookie = 'team_id=; path=/; max-age=0';
    document.cookie = 'team_name=; path=/; max-age=0';
    router.push('/login');
    router.refresh();
  };

  // Fungsi penanganan Drag & Drop File
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
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setMessage(null);
    if (!selectedFile.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Mantra ditolak! Hanya menerima gulungan format .csv' });
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  // 🚀 Fungsi Pengiriman File ke Server (API Route)
  const handleSubmit = async () => {
    if (!file || !teamId) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('team_id', teamId);

    try {
        const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
        });

        // 🛡️ BACA RESPONS SEBAGAI TEKS DULU
        const textResponse = await response.text();
        
        // 🛡️ COBA PARSING KE JSON
        let result;
        try {
        result = JSON.parse(textResponse);
        } catch (e) {
        // Jika gagal parsing, berarti server mengirimkan HTML/Teks eror (bukan JSON)
        console.error("Server Error Raw:", textResponse);
        throw new Error("Server mengirimkan data yang tidak valid. Cek konsol server Anda.");
        }

        if (!response.ok) {
        throw new Error(result.error || 'Gagal mengevaluasi model.');
        }

        setMessage({ type: 'success', text: result.message });
        setFile(null);
    } catch (error: any) {
        setMessage({ type: 'error', text: error.message });
    } finally {
        setIsUploading(false);
    }
    };

  // Hindari rendering UI sebelum pengecekan cookie selesai
  if (!teamId) return null;

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f] flex flex-col">
      
      {/* 🌲 LAYER BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/background-leaderboard.png"
          alt="Mystical Forest Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0a101d]/50 backdrop-blur-[2px]" />
      </div>

      <Navbar />

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 md:px-6 py-12 relative z-10 flex flex-col items-center justify-center">
        
        {/* Panel Identitas Tim */}
        <div className="w-full bg-[#131b2c]/60 border border-slate-600/40 rounded-2xl p-4 md:p-6 mb-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-xl shadow-black/30">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-[#ffec1f]/10 border border-[#ffec1f]/30 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(255,236,31,0.2)]">
              🧙‍♂️
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asrama Aktif</h3>
              <h2 className={`${cinzel.className} text-xl md:text-2xl font-bold text-[#ffec1f]`}>{teamName}</h2>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
          >
            Keluar Arena
          </button>
        </div>

        {/* Panel Form Upload */}
        <div className="w-full bg-[#172135]/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-slate-600/30 backdrop-blur-xl p-6 md:p-10">
          <div className="text-center mb-8">
            <h1 className={`${cinzel.className} text-3xl font-bold text-white tracking-wider mb-2`}>
              Ruang Submisi
            </h1>
            <p className="text-slate-400 text-sm">
              Letakkan gulungan prediksi Anda di altar ini. Sistem akan mengevaluasi mantra Anda secara otomatis.
            </p>
          </div>

          {/* Area Drag & Drop (Altar Sihir) */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragging 
                ? 'border-[#ffec1f] bg-[#ffec1f]/10' 
                : file 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-slate-600/50 bg-[#0a101d]/40 hover:border-[#ffec1f]/50 hover:bg-[#ffec1f]/5'
            }`}
          >
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {file ? (
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
                <div className="mt-4 inline-block bg-slate-800 text-slate-400 px-3 py-1 rounded-md text-[10px] font-mono border border-slate-700">
                  Wajib berformat .csv
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-medium border flex items-start gap-3 animate-fade-in ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <span className="text-lg leading-none">{message.type === 'success' ? '✨' : '🛑'}</span>
              <p>{message.text}</p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="w-full mt-6 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-slate-950 font-bold text-sm md:text-base uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-amber-900/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sistem Sedang Mengevaluasi...
              </>
            ) : (
              'Serahkan Prediksi'
            )}
          </button>

        </div>
      </div>
    </main>
  );
}
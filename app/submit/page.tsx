'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import TeamHeader from '../components/submit/TeamHeader';
import ScoreCard from '../components/submit/ScoreCard';
import CsvUploader from '../components/submit/CsvUploader';
import DriveLinkPanel from '../components/submit/DriveLinkPanel';

export default function SubmitPage() {
  const router = useRouter();

  // State Global Halaman
  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(5);
  const [initialDriveLink, setInitialDriveLink] = useState<string>('');
  
  // State untuk menampilkan hasil submission
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [scoreMessage, setScoreMessage] = useState<string>('');
  
  // State BARU untuk status gerbang
  const [isDeadlineClosed, setIsDeadlineClosed] = useState<boolean>(false);

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
      
      const fetchCurrentStatus = async () => {
        try {
          // Ambil data tim dan status deadline secara paralel agar lebih cepat
          const [statusRes, configRes] = await Promise.all([
            fetch(`/api/submit?team_id=${id}`),
            fetch('/api/config')
          ]);

          if (statusRes.ok) {
            const data = await statusRes.json();
            setQuotaRemaining(data.quotaRemaining);
            if (data.finalLink) setInitialDriveLink(data.finalLink);
          }

          if (configRes.ok) {
            const configData = await configRes.json();
            setIsDeadlineClosed(configData.isDeadlineClosed);
          }
        } catch (err) {
          console.error("Gagal menyinkronkan data asrama:", err);
        }
      };

      fetchCurrentStatus();
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'team_id=; path=/; max-age=0';
    document.cookie = 'team_name=; path=/; max-age=0';
    router.push('/login');
    router.refresh();
  };

  const handleUploadSuccess = (score: number, message: string) => {
    setCurrentScore(score);
    setScoreMessage(message);
    setQuotaRemaining(prev => Math.max(0, prev - 1)); // Kurangi kuota setelah sukses
  };

  if (!teamId) return null; // Render kosong saat mengecek auth

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f] flex flex-col">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/background-leaderboard.png" alt="Mystical Forest Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#0a101d]/60 backdrop-blur-[2px]" />
      </div>

      <Navbar />

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 md:px-6 py-8 relative z-10 flex flex-col items-center">
        
        {/* 1. Header Identitas */}
        <TeamHeader 
          teamName={teamName || ''} 
          quotaRemaining={quotaRemaining} 
          onLogout={handleLogout} 
        />

        {/* 2. Kartu Hasil Evaluasi (Muncul jika ada skor) */}
        {currentScore !== null && (
          <ScoreCard score={currentScore} message={scoreMessage} />
        )}

        {/* LOGIKA BLOKIR DEADLINE: Render bersyarat berdasarkan isDeadlineClosed */}
        {isDeadlineClosed ? (
          <div className="w-full mt-6 p-6 md:p-8 bg-red-950/30 border border-red-500/40 rounded-2xl text-center backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-fade-in">
            <div className="text-4xl mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">⏳</div>
            <h3 className="text-xl md:text-2xl font-bold text-red-400 mb-3 tracking-wide">
              Gerbang Waktu Telah Terkunci!
            </h3>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Masa pengiriman mantra dan artefak telah berakhir. Semua data saat ini sedang dalam proses evaluasi oleh Tim ISFEST. Silakan pantau Papan Peringkat untuk melihat posisi akhir.
            </p>
            
            {/* Tampilkan link yang sudah disetor agar peserta merasa aman */}
            {initialDriveLink && (
              <div className="mt-8 p-4 bg-[#131b2c]/80 rounded-xl border border-slate-600/40 inline-block w-full max-w-lg text-left">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tautan Artefak Terakhir Anda:
                </p>
                <a 
                  href={initialDriveLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline break-all transition-colors"
                >
                  {initialDriveLink}
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 3. Panel Unggah CSV (Hanya muncul jika gerbang terbuka) */}
            <CsvUploader 
              teamId={teamId} 
              quotaRemaining={quotaRemaining} 
              onUploadSuccess={handleUploadSuccess} 
            />

            {/* 4. Panel Tautan Drive (Hanya muncul jika gerbang terbuka) */}
            <DriveLinkPanel 
              teamId={teamId} 
              initialLink={initialDriveLink} 
            />
          </>
        )}

      </div>
    </main>
  );
}
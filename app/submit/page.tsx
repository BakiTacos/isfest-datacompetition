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
          const response = await fetch(`/api/submit?team_id=${id}`);
          if (response.ok) {
            const data = await response.json();
            setQuotaRemaining(data.quotaRemaining);
            if (data.finalLink) setInitialDriveLink(data.finalLink);
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

        {/* 3. Panel Unggah CSV */}
        <CsvUploader 
          teamId={teamId} 
          quotaRemaining={quotaRemaining} 
          onUploadSuccess={handleUploadSuccess} 
        />

        {/* 4. Panel Tautan Drive */}
        <DriveLinkPanel 
          teamId={teamId} 
          initialLink={initialDriveLink} 
        />

      </div>
    </main>
  );
}
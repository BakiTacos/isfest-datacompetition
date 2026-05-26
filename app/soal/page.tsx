'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MascotSide from '../components/Mascot-Side';
import Image from 'next/image';
import { Cinzel } from 'next/font/google';

// Import Komponen Baru
import HandbookCard from '../components/soal/HandBookCard';
import LockedOverlay from '../components/soal/LockedOverlay';
import DatasetCard from '../components/soal/DatasetCard';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function SoalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [jenisLomba, setJenisLomba] = useState<string | null>(null);
  const [isDatasetOpen, setIsDatasetOpen] = useState<boolean>(false);
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

    const fetchPageData = async () => {
      try {
        const url = id ? `/api/soal?team_id=${id}` : '/api/soal';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setIsDatasetOpen(data.isDatasetOpen);
          
          if (id) {
            setIsLoggedIn(true);
            setTeamName(name ? decodeURIComponent(name).replace(/%20/g, ' ') : 'Penyihir Tanpa Nama');
            setJenisLomba(data.jenisLomba);
          }
        }
      } catch (err) {
        console.error("Gagal membaca arsip:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a101d] flex items-center justify-center">
        <p className="text-[#ffec1f] animate-pulse font-bold tracking-widest uppercase">Membaca Arsip Rahasia...</p>
      </div>
    );
  }

  // --- DATA KONTEN ---
  const dataHandbookDataComp = {
    title: 'Kitab Panduan Data Competition',
    desc: 'Pelajari seluruh peraturan turnamen, kriteria penilaian (RMSE), rincian kolom dataset, dan mekanisme perlombaan pembuatan model.',
    link: '/files/Handbook_Data.pdf',
    icon: '/assets/book-open.png'
  };

  const dataHandbookUIUX = {
    title: 'Kitab Panduan UI/UX',
    desc: 'Pelajari kriteria penilaian desain, tata cara perancangan antarmuka (wireframe/prototype), dan aturan presentasi pengalaman pengguna (UX).',
    link: '/files/Handbook_UIUX.pdf',
    icon: '/assets/book-open.png'
  };

  const isUIUX = jenisLomba === 'UI/UX';

  return (
    <main className="min-h-screen text-slate-200 font-sans relative overflow-x-hidden selection:bg-[#ffec1f]/20 selection:text-[#ffec1f] flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/background-leaderboard.png" alt="Mystical Forest Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#0a101d]/70 backdrop-blur-[2px]" />
      </div>

      <Navbar />

      <div className="flex-grow max-w-5xl w-full mx-auto px-4 md:px-6 py-8 relative z-10 flex flex-col items-center">
        
        {/* PANEL IDENTITAS (Hanya Jika Login) */}
        {isLoggedIn && (
          <div className="w-full bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-5 mb-8 backdrop-blur-md flex flex-row items-center justify-between shadow-xl shadow-black/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#172135] border border-[#ffec1f]/30 flex items-center justify-center relative shadow-[0_0_10px_rgba(255,236,31,0.2)] shrink-0 overflow-hidden">
                <Image src="/assets/witch-hat.png" alt="Asrama" width={32} height={32} className="object-contain drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akses Asrama ({jenisLomba})</h3>
                <h2 className={`${cinzel.className} text-lg md:text-xl font-bold text-[#ffec1f]`}>{teamName}</h2>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAMPILAN PUBLIK (Belum Login): Menampilkan Teaser Berkas */}
        {/* ============================================================== */}
        {!isLoggedIn && (
          <div className="w-full flex flex-col gap-8 animate-fade-in mb-8">
            <div className="text-center mb-4">
              <h1 className={`${cinzel.className} text-3xl font-bold text-white mb-2`}>Perpustakaan ISFEST</h1>
              <p className="text-slate-400 text-sm">Silakan baca panduan perlombaan. Untuk mengakses soal dan dataset, asrama Anda harus melakukan login terlebih dahulu.</p>
            </div>

            {/* 1. Buku Panduan (Terang & Bisa Diakses Publik) */}
            <div className="flex flex-col gap-6">
              <HandbookCard {...dataHandbookDataComp} />
              <HandbookCard {...dataHandbookUIUX} />
            </div>

            {/* 2. Area Soal & Dataset (Diblur & Ditutup Gembok Login) */}
            <div className="relative mt-8 pt-8 border-t border-slate-600/30">
              
              {/* Overlay Khusus untuk Belum Login */}
              <LockedOverlay message="Akses Terlarang: Asrama Belum Login" />

              {/* Konten Bayangan (Blur) untuk Memancing Penasaran */}
              <div className="blur-md pointer-events-none select-none opacity-50 flex flex-col gap-8">
                
                {/* Mockup Soal */}
                <HandbookCard 
                  title="Dokumen Rahasia (Soal & Brief)"
                  desc="Dokumen tersegel yang berisi studi kasus, ketentuan soal, format jawaban, dan parameter kompetisi resmi ISFEST."
                  link="#"
                  icon="/assets/blank-paper.png"
                />

                {/* Mockup Dataset */}
                <div>
                  <div className="text-center mb-6">
                    <h2 className={`${cinzel.className} text-xl md:text-2xl font-bold text-white tracking-wider`}>Bahan Baku Ramuan</h2>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">Unduh gulungan dataset ini untuk melatih model sihir Anda.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DatasetCard title="Train.csv" icon="/assets/book-stack.png" desc="Data historis beserta target." link="#" colorTheme="emerald" />
                    <DatasetCard title="Test.csv" icon="/assets/quill.png" desc="Data uji tanpa target." link="#" colorTheme="blue" />
                    <DatasetCard title="Sample_Submission.csv" icon="/assets/letter.png" desc="Format cetak biru jawaban." link="#" colorTheme="amber" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAMPILAN PRIVATE (Sudah Login): Tampilkan Sesuai Bidang Lomba */}
        {/* ============================================================== */}
        {isLoggedIn && (
          <div className="w-full flex flex-col gap-8 animate-fade-in">
            
            {/* 1. HANDBOOK (Sesuai Bidang) */}
            <HandbookCard {...(isUIUX ? dataHandbookUIUX : dataHandbookDataComp)} />

            {/* 2. SOAL / BRIEF KASUS (Dengan Logika Gembok/Blur) */}
            <div className="relative">
              {!isDatasetOpen && <LockedOverlay message="Berkas Soal Belum Dibuka" />}
              
              <div className={!isDatasetOpen ? 'blur-md pointer-events-none select-none opacity-60' : ''}>
                <HandbookCard 
                  title={isUIUX ? 'Brief Kasus UI/UX' : 'Soal Analisis Data'}
                  desc={isUIUX ? 'Unduh studi kasus (brief) yang harus dipecahkan oleh asrama Anda. Rancang solusi digital terbaik.' : 'Pelajari ketentuan soal, format jawaban, dan parameter prediksi dengan saksama.'}
                  link={isUIUX ? '/files/Soal_UIUX.pdf' : '/files/Soal_Data.pdf'}
                  icon="/assets/blank-paper.png"
                />
              </div>
            </div>

            {/* 3. GRID DATASET (Khusus Data Competition, Dengan Logika Gembok/Blur) */}
            {!isUIUX && (
              <div className="relative mt-2">
                {!isDatasetOpen && <LockedOverlay message="Akses Dataset Belum Dibuka" />}
                
                <div className={!isDatasetOpen ? 'blur-md pointer-events-none select-none opacity-60' : ''}>
                  <div className="text-center mb-6">
                    <h2 className={`${cinzel.className} text-xl md:text-2xl font-bold text-white tracking-wider`}>Bahan Baku Ramuan</h2>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">Unduh gulungan dataset ini untuk melatih model sihir Anda.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DatasetCard title="Train.csv" icon="/assets/book-stack.png" desc="Data historis beserta target." link="#" colorTheme="emerald" />
                    <DatasetCard title="Test.csv" icon="/assets/quill.png" desc="Data uji tanpa target." link="#" colorTheme="blue" />
                    <DatasetCard title="Sample_Submission.csv" icon="/assets/letter.png" desc="Format cetak biru jawaban." link="#" colorTheme="amber" />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      <MascotSide />
    </main>
  );
}
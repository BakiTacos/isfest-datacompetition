'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Cek session storage agar animasi hanya jalan 1x per sesi browser
    const hasSeenIntro = sessionStorage.getItem('hasSeenIsfestIntro');
    
    if (hasSeenIntro) {
      setShow(false);
      return;
    }

    // Mulai animasi memudar setelah 2.5 detik
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500);

    // Hapus komponen dari layar setelah 3.5 detik
    const removeTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('hasSeenIsfestIntro', 'true');
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0a101d] transition-opacity duration-1000 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Efek Cahaya Latar (Aura Sihir) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-[#f59e0b] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* WADAH ANIMASI BUKU & PENA */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)] flex justify-center items-center">
          
          {/* 1. Buku Terbuka (Animasi Mengambang Naik Turun) */}
          <div className="absolute w-full h-full animate-[float_4s_ease-in-out_infinite]">
            <Image
              src="/assets/book-open.png"
              alt="Magic Book"
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* 2. Pena Bulu Merah (Animasi Menulis) */}
          <div 
            className="absolute -right-4 -top-8 w-28 h-28 md:w-32 md:h-32 z-10"
            style={{
              animation: 'write 1.5s ease-in-out infinite',
              transformOrigin: 'bottom left' // Sumbu putar berada di ujung pena
            }}
          >
            <Image
              src="/assets/quill-red.png"
              alt="Magic Quill"
              fill
              priority
              className="object-contain drop-shadow-[5px_10px_5px_rgba(0,0,0,0.5)]"
            />
          </div>
          
        </div>

        {/* Teks Intro */}
        <h1 className={`${cinzel.className} text-3xl md:text-5xl font-bold text-[#ffec1f] tracking-widest text-center drop-shadow-lg mb-3 animate-fade-in`}>
          ISFEST 2026
        </h1>
        
        <div className="flex items-center gap-3 mt-2">
          <div className="w-4 h-4 rounded-full border-t-2 border-r-2 border-[#ffec1f] animate-spin" />
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest animate-pulse">
            Menuliskan Takdir Asrama...
          </p>
        </div>
      </div>

      {/* DEFINISI KEYFRAME CSS UNTUK ANIMASI KUSTOM */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        /* Animasi pena seakan-akan sedang menulis (kombinasi rotasi dan geser kecil) */
        @keyframes write {
          0% { transform: rotate(0deg) translate(0px, 0px); }
          25% { transform: rotate(-5deg) translate(-5px, 5px); }
          50% { transform: rotate(5deg) translate(5px, -5px); }
          75% { transform: rotate(-2deg) translate(-2px, 2px); }
          100% { transform: rotate(0deg) translate(0px, 0px); }
        }
      `}</style>
    </div>
  );
}
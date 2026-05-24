'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

export default function NotFound() {
  return (
    // Kita menggunakan flex-grow agar konten mengisi ruang dan footer tetap di bawah
    <main className="flex-grow flex flex-col items-center justify-center relative p-6 text-center">
      
      {/* BACKGROUND TETAP FIXED AGAR TIDAK TERPUTUS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/background-leaderboard.png"
          alt="Mystical Forest Background"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
        {/* Overlay yang menyatu dengan warna background layout.tsx (#0a101d) */}
        <div className="absolute inset-0 bg-[#0a101d]/80 backdrop-blur-[2px]" />
      </div>

      {/* KONTEN 404 (Relative z-10 agar di atas background) */}
      <div className="relative z-10 flex flex-col items-center max-w-lg">
        
        <div className="relative w-40 h-40 mb-6 animate-[float_4s_ease-in-out_infinite]">
          <Image 
            src="/mascot-side.png" 
            alt="Lost Mascot" 
            fill 
            className="object-contain drop-shadow-[0_0_20px_rgba(255,236,31,0.2)]" 
          />
        </div>

        <h1 className={`${cinzel.className} text-6xl md:text-8xl font-black text-[#ffec1f] mb-4 drop-shadow-lg`}>
          404
        </h1>
        
        <h2 className={`${cinzel.className} text-xl md:text-2xl font-bold text-white tracking-widest mb-4`}>
          Mantra Salah Arah
        </h2>
        
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10 max-w-sm">
          Gulungan yang Anda cari sepertinya telah terbawa angin sihir ke dimensi lain. Tidak ada data di sini, Penyihir.
        </p>

        <Link 
          href="/" 
          className="bg-[#ffec1f] hover:bg-white text-slate-950 font-bold px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,236,31,0.3)]"
        >
          Kembali ke Arena Utama
        </Link>
      </div>

      {/* ANIMASI FLOAT */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </main>
  );
}
'use client';

import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background sama seperti AdminLogin */}
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

      {/* Konten utama */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6 py-12 text-center">
        <div className="relative w-40 h-40 mb-8 animate-[float_4s_ease-in-out_infinite]">
          <Image 
            src="/mascot-side.png" 
            alt="Mascot Maintenance" 
            fill 
            className="object-contain" 
          />
        </div>

        <h1 className={`${cinzel.className} text-4xl md:text-6xl font-black text-[#ffec1f] mb-4`}>
          Sistem Sedang Diperbaiki
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
          Para penyihir sedang memperbarui mantra di dalam sistem. Arena akan kembali dibuka dalam waktu singkat.
        </p>

        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-[#ffec1f] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-[#ffec1f] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-[#ffec1f] animate-bounce" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </main>
  );
}
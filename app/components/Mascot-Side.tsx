'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function MascotSide() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* BALON PERCAKAPAN (Muncul saat di-hover) */}
      <div 
        className={`transition-all duration-300 transform origin-bottom-right mb-2 bg-[#172135]/90 border border-[#ffec1f]/50 backdrop-blur-md p-3 rounded-2xl rounded-br-none shadow-[0_0_15px_rgba(255,236,31,0.2)] text-xs md:text-sm text-slate-200 max-w-[200px] text-center ${
          isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        <span className="block font-bold text-[#ffec1f] mb-1">Psstt...</span>
        Semangat meracik mantra datanya, Penyihir! ✨
      </div>

      {/* GAMBAR MASKOT (Animasi floating custom) */}
      <div 
        className="relative w-28 h-28 md:w-36 md:h-36 transition-transform duration-300 hover:scale-110"
        style={{
          animation: 'float 4s ease-in-out infinite'
        }}
      >
        <Image
          src="/mascot-side.png" // Pastikan nama file sesuai dengan yang Anda simpan di public/
          alt="ISFEST Mascot"
          fill
          className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* DEFINISI KEYFRAME CSS UNTUK ANIMASI FLOAT */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
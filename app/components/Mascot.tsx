'use client';

import { useState } from 'react';
import Image from 'next/image';

const SPELLS = [
  "Alohomora! Semoga model regresi Anda terbuka jalannya menuju puncak! 🪄",
  "Expecto Patronum! Usir jauh-jauh Overfitting dari arsitektur XGBoost Anda! 🌌",
  "Kombinasi parameter Anda memancarkan aura magis yang kuat! 🧪",
  "Ribbit! Tingkat eror RMSE sekecil ini hanya bisa dicapai oleh penyihir data sejati! 🐸",
  "Forge the Future! Terus lakukan tuning, puncak House Standings sudah dekat! ✨"
];

export default function Mascot() {
  const [activeSpell, setActiveSpell] = useState<string>("");
  const [showBubble, setShowBubble] = useState<boolean>(false);

  const castSpell = () => {
    const randomIndex = Math.floor(Math.random() * SPELLS.length);
    setActiveSpell(SPELLS[randomIndex]);
    setShowBubble(true);

    setTimeout(() => {
      setShowBubble(false);
    }, 4000);
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Gelembung Mantra Penyihir (Spell Bubble) */}
      <div className={`absolute -top-12 md:-top-16 z-20 max-w-[260px] bg-[#223753]/95 border border-[#ffec1f]/40 px-4 py-3 rounded-2xl text-xs text-slate-100 shadow-xl transition-all duration-300 backdrop-blur-md text-center font-medium ${
        showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
      }`}>
        <p className="leading-relaxed">{activeSpell}</p>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#223753] border-r border-b border-[#ffec1f]/40 rotate-45"></div>
      </div>

      {/* Area Sensitif Sentuhan/Hover Maskot */}
      <div 
        onClick={castSpell}
        onMouseEnter={castSpell}
        className="relative h-[260px] md:h-[380px] lg:h-[450px] w-full max-w-[240px] md:max-w-[300px] cursor-pointer animate-[float_4s_ease-in-out_infinite] group"
      >
        <div className="absolute inset-0 bg-[#ffec1f]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <Image
          src="/mascot-wand.png"
          alt="ISFEST 2026 Wizard Mascot"
          fill
          priority
          className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    </div>
  );
}
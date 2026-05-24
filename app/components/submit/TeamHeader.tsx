import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });

interface TeamHeaderProps {
  teamName: string;
  quotaRemaining: number;
  onLogout: () => void;
}

export default function TeamHeader({ teamName, quotaRemaining, onLogout }: TeamHeaderProps) {
  return (
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
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sisa Kuota Harian</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-2 w-6 rounded-full transition-all duration-500 ${i < quotaRemaining ? 'bg-[#ffec1f] shadow-[0_0_8px_rgba(255,236,31,0.6)]' : 'bg-slate-700/50 border border-slate-600'}`} />
            ))}
          </div>
          <span className="text-xs text-slate-300 mt-1 font-mono">{quotaRemaining} / 5 Gulungan</span>
        </div>

        <button onClick={onLogout} className="p-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors" title="Keluar Arena">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    </div>
  );
}
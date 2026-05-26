'use client';

import { GlobalConfig } from '../types';

interface ControlPanelProps {
  config: GlobalConfig;
  isLoading: boolean;
  onToggleConfig: (key: 'is_deadline_closed' | 'is_open', targetState: boolean) => void;
}

export default function ControlPanel({ config, isLoading, onToggleConfig }: ControlPanelProps) {
  return (
    <div className="w-full bg-[#172135]/60 border border-slate-600/40 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-600/30 pb-4">
        <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,236,31,0.5)]">🔮</span>
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">Pusat Kendali Sistem</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Kontrol 1: Akses Soal (is_open) */}
        <div className="bg-[#131b2c]/80 rounded-xl p-4 border border-slate-600/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Akses Soal Lomba</span>
            <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase ${
              config.isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {config.isOpen ? 'TERBUKA' : 'TERTUTUP'}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onToggleConfig('is_open', false)}
              disabled={isLoading || !config.isOpen}
              className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-[11px] border tracking-wide transition-all ${
                !config.isOpen ? 'bg-red-600/20 text-red-400 border-red-500/40' : 'bg-[#172135] text-slate-400 border-slate-600/40 hover:bg-slate-700'
              }`}
            >TUTUP SOAL</button>
            <button
              onClick={() => onToggleConfig('is_open', true)}
              disabled={isLoading || config.isOpen}
              className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-[11px] border tracking-wide transition-all ${
                config.isOpen ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' : 'bg-[#172135] text-slate-400 border-slate-600/40 hover:bg-slate-700'
              }`}
            >BUKA SOAL</button>
          </div>
        </div>

        {/* Kontrol 2: Deadline (is_deadline_closed) */}
        <div className="bg-[#131b2c]/80 rounded-xl p-4 border border-slate-600/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gerbang Submisi</span>
            <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase ${
              config.isDeadlineClosed ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {config.isDeadlineClosed ? 'TERKUNCI' : 'LIVE'}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onToggleConfig('is_deadline_closed', false)}
              disabled={isLoading || !config.isDeadlineClosed}
              className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-[11px] border tracking-wide transition-all ${
                !config.isDeadlineClosed ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' : 'bg-[#172135] text-slate-400 border-slate-600/40 hover:bg-slate-700'
              }`}
            >BUKA PORTAL</button>
            <button
              onClick={() => onToggleConfig('is_deadline_closed', true)}
              disabled={isLoading || config.isDeadlineClosed}
              className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-[11px] border tracking-wide transition-all ${
                config.isDeadlineClosed ? 'bg-red-600/20 text-red-400 border-red-500/40' : 'bg-[#172135] text-slate-400 border-slate-600/40 hover:bg-red-900/30 hover:text-red-400'
              }`}
            >KUNCI DEADLINE</button>
          </div>
        </div>

      </div>
    </div>
  );
}
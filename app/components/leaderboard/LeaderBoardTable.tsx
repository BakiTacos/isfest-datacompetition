'use client';

import { useState } from 'react';
import TableDataComp from './TableDataComp';
import TableUIUX from './TableUIUX';

export interface TeamLeaderboard {
  id: string;
  team_name: string;
  jenis_lomba: string; 
  best_rmse?: number | null;
  final_points?: number | null;
  has_ipynb?: boolean;
  has_laporan?: boolean;
  has_ppt?: boolean;
  has_mockup?: boolean;
  has_video?: boolean;
  has_prototype?: boolean;
  score_ipynb?: number;
  score_laporan?: number;
  score_ppt?: number;
}

interface LeaderboardTableProps {
  data: TeamLeaderboard[];
  isDeadlineClosed: boolean;
}

export default function LeaderboardTable({ data, isDeadlineClosed }: LeaderboardTableProps) {
  const [activeTab, setActiveTab] = useState<'Data Competition' | 'UI/UX'>('Data Competition');

  // Filter data berdasarkan jenis lomba
  const filteredData = data.filter(team => team.jenis_lomba === activeTab);

  return (
    // ✨ PERBAIKAN: Pastikan kontainer utama memiliki w-full dan overflow-hidden agar ukurannya tidak jebol
    <div className="bg-[#172135]/40 rounded-2xl shadow-2xl shadow-black/40 border border-slate-600/30 backdrop-blur-md flex flex-col w-full overflow-hidden">
      
      {/* Header & Navigasi Tabs */}
      {/* ✨ PERBAIKAN: Ubah padding menjadi px-4 md:px-6 agar tidak terlalu tebal di HP */}
      <div className="px-4 py-4 md:px-6 border-b border-slate-600/30 flex flex-col sm:flex-row sm:items-center justify-between bg-[#131b2c]/50 gap-3 md:gap-4">
        
        {/* ✨ PERBAIKAN: Kurangi sedikit ukuran teks header di HP (text-lg) dan tambahkan truncate agar aman jika layar sangat kecil */}
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide text-center sm:text-left truncate">
          {isDeadlineClosed ? 'Papan Peringkat Akhir' : 'Leaderboard'}
        </h2>
        
        <div className="flex w-full sm:w-auto bg-[#0a101d]/80 p-1 rounded-xl border border-slate-700/50">
          
          {/* ✨ PERBAIKAN: Tambahkan whitespace-nowrap dan kecilkan font di HP (text-[10px]) */}
          <button 
            onClick={() => setActiveTab('Data Competition')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
              activeTab === 'Data Competition' 
                ? 'bg-[#172135] text-emerald-400 shadow-md border border-slate-600/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Data Competition
          </button>
          
          {/* ✨ PERBAIKAN: Sama untuk UI/UX */}
          <button 
            onClick={() => setActiveTab('UI/UX')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
              activeTab === 'UI/UX' 
                ? 'bg-[#172135] text-blue-400 shadow-md border border-slate-600/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            UI/UX
          </button>

        </div>
      </div>

      {/* Render Tabel Sesuai Tab Aktif */}
      {activeTab === 'Data Competition' ? (
        <TableDataComp data={filteredData} isDeadlineClosed={isDeadlineClosed} />
      ) : (
        <TableUIUX data={filteredData} isDeadlineClosed={isDeadlineClosed} />
      )}

    </div>
  );
}
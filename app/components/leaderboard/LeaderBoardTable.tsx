'use client';

import { useState } from 'react';
import TableDataComp from './TableDataComp';
import TableUIUX from './TableUIUX';

export interface TeamLeaderboard {
  id: string;
  team_name: string;
  jenis_lomba: string; // Harus ditarik dari Supabase di page.tsx
  best_rmse?: number | null;
  final_points?: number | null;
  has_ipynb?: boolean;
  has_laporan?: boolean;
  has_ppt?: boolean;
  has_mockup?: boolean;
  has_video?: boolean;
  has_prototype?: boolean;
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
    <div className="bg-[#172135]/40 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden border border-slate-600/30 backdrop-blur-md flex flex-col">
      
      {/* Header & Navigasi Tabs */}
      <div className="px-5 py-4 md:px-8 border-b border-slate-600/30 flex flex-col md:flex-row md:items-center justify-between bg-[#131b2c]/50 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
          {isDeadlineClosed ? 'Papan Peringkat Akhir' : 'Leaderboard'}
        </h2>
        
        {/* Toggle Navigasi Lomba */}
        <div className="flex bg-[#0a101d]/80 p-1 rounded-xl border border-slate-700/50">
          <button 
            onClick={() => setActiveTab('Data Competition')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'Data Competition' 
                ? 'bg-[#172135] text-emerald-400 shadow-md border border-slate-600/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Data Competition
          </button>
          <button 
            onClick={() => setActiveTab('UI/UX')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
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
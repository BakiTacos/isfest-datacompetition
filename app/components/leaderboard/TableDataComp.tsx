'use client';

import { useState } from 'react';

// StatusBadge bisa digunakan ulang di komponen tabel
export const StatusBadge = ({ isUploaded, label }: { isUploaded: boolean, label: string }) => (
  <div className={`flex items-center gap-1 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
    isUploaded 
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
      : 'bg-slate-700/30 text-slate-500 border-slate-600/30'
  }`}>
    <span>{isUploaded ? '✓' : '−'}</span>
    <span className="hidden md:inline">{label}</span>
    <span className="md:hidden">{label.substring(0, 3)}</span>
  </div>
);

export default function TableDataComp({ data, isDeadlineClosed }: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = [...data].sort((a, b) => {
    if (isDeadlineClosed) {
      const pointA = a.final_points ?? 0;
      const pointB = b.final_points ?? 0;
      return pointB - pointA;
    } else {
      if (a.best_rmse === null) return 1;
      if (b.best_rmse === null) return -1;
      return a.best_rmse - b.best_rmse;
    }
  });
  
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="overflow-x-auto w-full animate-fade-in">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#172135]/30 text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">
          <tr className="border-b border-slate-600/30">
            <th className="py-4 px-4 md:py-5 md:px-8 text-center w-16 md:w-28">Rank</th>
            <th className="py-4 px-4 md:py-5 md:px-8">Nama Kelompok & Berkas</th>
            <th className="py-4 px-4 md:py-5 md:px-8 text-center w-28 md:w-40">RMSE</th>
            {isDeadlineClosed && <th className="py-4 px-4 md:py-5 md:px-8 text-right w-24 md:w-36 text-[#ffec1f]">Poin</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600/20 text-sm">
          {currentData.length === 0 ? (
            <tr><td colSpan={isDeadlineClosed ? 4 : 3} className="py-16 text-center text-slate-400 italic">Belum ada submisi Data Competition.</td></tr>
          ) : (
            currentData.map((team, index) => {
              const globalRank = startIndex + index + 1;
              let badgeStyle = 'border-slate-500/30 bg-slate-600/10 text-slate-300';
              if (globalRank === 1) badgeStyle = 'border-[#ffec1f]/60 bg-[#ffec1f]/15 text-[#ffec1f] drop-shadow-[0_0_8px_rgba(255,236,31,0.3)]';
              else if (globalRank === 2) badgeStyle = 'border-slate-300/50 bg-slate-400/15 text-slate-200';
              else if (globalRank === 3) badgeStyle = 'border-amber-600/60 bg-amber-600/15 text-amber-500';

              return (
                <tr key={team.id} className="hover:bg-[#25344f]/30 transition-colors duration-150">
                  <td className="py-3 px-3 md:py-4 md:px-8 text-center">
                    <div className={`flex items-center justify-center mx-auto w-10 h-10 md:w-[52px] md:h-[52px] rounded-xl border text-sm md:text-lg font-bold ${badgeStyle}`}>#{globalRank}</div>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-8">
                    <div className="flex flex-col gap-1.5 md:gap-2">
                      <span className="font-semibold text-slate-100 tracking-wide text-xs md:text-sm truncate">{team.team_name}</span>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <StatusBadge isUploaded={team.has_ipynb} label="ipynb" />
                        <StatusBadge isUploaded={team.has_laporan} label="Laporan" />
                        <StatusBadge isUploaded={team.has_ppt} label="PPT" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-8 text-center font-mono text-slate-300 font-medium text-xs md:text-sm tracking-wide">
                    {team.best_rmse !== null ? team.best_rmse.toFixed(5) : <span className="text-slate-500 font-sans font-normal text-xs italic">-</span>}
                  </td>
                  {isDeadlineClosed && (
                    <td className="py-3 px-3 md:py-4 md:px-8 text-right font-mono text-[#ffec1f] font-extrabold text-sm md:text-base tracking-wide">
                      {team.final_points !== undefined && team.final_points !== null ? team.final_points : '-'}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {/* Paginasi Data Comp */}
      {data.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-600/30 bg-[#131b2c]/40 flex items-center justify-between mt-auto">
          <span className="text-[10px] md:text-xs text-slate-400 font-medium">Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} dari {data.length} tim</span>
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-600/50 bg-[#172135] text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
            <span className="text-xs font-bold text-[#ffec1f]">{currentPage} <span className="text-slate-500">/ {totalPages}</span></span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#ffec1f]/30 bg-[#ffec1f]/10 text-[#ffec1f] hover:bg-[#ffec1f]/20 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
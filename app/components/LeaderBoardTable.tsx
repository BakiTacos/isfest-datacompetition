'use client';

import { useState } from 'react';

// Interface tipe data
export interface TeamLeaderboard {
  id: string;
  team_name: string;
  best_rmse: number | null;
}

interface LeaderboardTableProps {
  data: TeamLeaderboard[];
}

export default function LeaderboardTable({ data }: LeaderboardTableProps) {
  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Kalkulasi total halaman
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  
  // Memotong data sesuai halaman aktif
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="bg-[#172135]/40 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden border border-slate-600/30 backdrop-blur-md flex flex-col">
      
      {/* Header Leaderboard */}
      <div className="px-5 py-5 md:px-8 md:py-6 border-b border-slate-600/30 flex items-center justify-between bg-[#131b2c]/50">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Leaderboard
          </h2>
        </div>
      </div>

      {/* Tabel Peringkat */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#172135]/30 text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">
            <tr className="border-b border-slate-600/30">
              <th className="py-4 px-4 md:py-5 md:px-8 text-center w-16 md:w-28">Rank</th>
              <th className="py-4 px-4 md:py-5 md:px-8">Nama Kelompok</th>
              <th className="py-4 px-4 md:py-5 md:px-8 text-right w-32 md:w-48">
                Skor Terbaik <span className="hidden md:inline">(RMSE)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600/20 text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-16 text-center text-slate-400 italic">
                  Belum ada kelompok yang melakukan submisi.
                </td>
              </tr>
            ) : (
              currentData.map((team, index) => {
                // Menghitung Rank Global (bukan rank per halaman)
                const globalRank = startIndex + index + 1;
                const isTop3 = globalRank <= 3;
                
                // Style medali hanya berlaku untuk Top 3 keseluruhan
                let badgeStyle = 'border-slate-500/30 bg-slate-600/10 text-slate-300';
                if (globalRank === 1) badgeStyle = 'border-[#ffec1f]/60 bg-[#ffec1f]/15 text-[#ffec1f] drop-shadow-[0_0_8px_rgba(255,236,31,0.3)]';
                else if (globalRank === 2) badgeStyle = 'border-slate-300/50 bg-slate-400/15 text-slate-200';
                else if (globalRank === 3) badgeStyle = 'border-amber-600/60 bg-amber-600/15 text-amber-500';

                return (
                  <tr key={team.id} className="hover:bg-[#25344f]/30 transition-colors duration-150">
                    <td className="py-3 px-3 md:py-4 md:px-8 text-center">
                      <div className={`flex items-center justify-center mx-auto w-10 h-10 md:w-[52px] md:h-[52px] rounded-xl border text-sm md:text-lg font-bold ${badgeStyle}`}>
                        #{globalRank}
                      </div>
                    </td>
                    <td className="py-3 px-3 md:py-4 md:px-8 font-semibold text-slate-100 tracking-wide text-xs md:text-sm max-w-[140px] md:max-w-none truncate md:whitespace-normal">
                      {team.team_name}
                    </td>
                    <td className="py-3 px-3 md:py-4 md:px-8 text-right font-mono text-[#ffec1f] font-extrabold text-sm md:text-base tracking-wide">
                      {team.best_rmse !== null ? (
                        team.best_rmse.toFixed(5)
                      ) : (
                        <span className="text-slate-500 font-sans font-normal text-xs italic">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Kontrol Paginasi (Muncul Jika Data > 0) */}
      {data.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-600/30 bg-[#131b2c]/40 flex items-center justify-between mt-auto">
          <span className="text-[10px] md:text-xs text-slate-400 font-medium">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, data.length)} dari {data.length} tim
          </span>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-600/50 bg-[#172135] text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-[#ffec1f]">
              {currentPage} <span className="text-slate-500">/ {totalPages}</span>
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#ffec1f]/30 bg-[#ffec1f]/10 text-[#ffec1f] hover:bg-[#ffec1f]/20 disabled:opacity-40 disabled:border-slate-600/50 disabled:bg-[#172135] disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
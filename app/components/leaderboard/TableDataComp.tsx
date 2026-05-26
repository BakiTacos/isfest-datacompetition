'use client';

import { useState } from 'react';

// StatusBadge untuk visualisasi "Kelengkapan File"
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

  // 1. Kalkulasi Poin Peringkat & Total Poin Dinamis secara Real-time
  const dataWithCalculatedPoints = [...data]
    .sort((a, b) => {
      if (a.best_rmse === null) return 1;
      if (b.best_rmse === null) return -1;
      return a.best_rmse - b.best_rmse; 
    })
    .map((team, index) => {
      const rmseRank = team.best_rmse !== null ? (index + 1) : 999;
      
      let poinPeringkat = 0;
      if (rmseRank === 999) poinPeringkat = 0;
      else if (rmseRank === 1) poinPeringkat = 25;
      else if (rmseRank === 2) poinPeringkat = 24;
      else if (rmseRank === 3) poinPeringkat = 23;
      else if (rmseRank === 4) poinPeringkat = 22;
      else if (rmseRank === 5) poinPeringkat = 21;
      else if (rmseRank >= 6 && rmseRank <= 10) poinPeringkat = 20;
      else if (rmseRank >= 11 && rmseRank <= 20) poinPeringkat = 15;
      else poinPeringkat = 10;

      // KALKULASI BERKAS
      const poinIpynb = team.has_ipynb ? 5 : 0;
      const poinLaporan = team.has_laporan ? 5 : 0;
      const poinPpt = team.has_ppt ? 5 : 0;
      const totalPoinBerkas = poinIpynb + poinLaporan + poinPpt;

      // KALKULASI PANITIA
      const scoreIpynb = Number(team.score_ipynb || 0);
      const scoreLaporan = Number(team.score_laporan || 0);
      const scorePpt = Number(team.score_ppt || 0);
      const poinPanitia = scoreIpynb + scoreLaporan + scorePpt;

      // TOTAL POIN AKHIR (Hanya dihitung jika RMSE tidak null)
      const calculated_final_points = team.best_rmse !== null 
        ? (poinPeringkat + totalPoinBerkas + poinPanitia) 
        : null;

      return { 
        ...team, 
        poinPeringkat,
        poinIpynb,
        poinLaporan,
        poinPpt,
        totalPoinBerkas,
        scoreIpynb,
        scoreLaporan,
        scorePpt,
        poinPanitia,
        calculated_final_points
      }; 
    });

  // 2. Sorting berdasarkan Total Poin yang baru dihitung
  const sortedData = [...dataWithCalculatedPoints].sort((a, b) => {
    if (isDeadlineClosed) {
      const pointA = a.calculated_final_points ?? 0;
      const pointB = b.calculated_final_points ?? 0;
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
    <div className="w-full flex flex-col animate-fade-in">
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full min-w-max text-left border-collapse whitespace-nowrap md:whitespace-normal">
          <thead className="bg-[#172135]/30 text-slate-300 text-[10px] md:text-xs font-semibold uppercase tracking-[0.10em] md:tracking-[0.12em]">
            <tr className="border-b border-slate-600/30">
              <th className="py-4 px-3 md:py-5 md:px-5 text-center w-12 md:w-20">Rank</th>
              <th className="py-4 px-3 md:py-5 md:px-5 min-w-[200px]">Tim & Status Berkas</th>
              <th className="py-4 px-3 md:py-5 md:px-5 text-center text-blue-300">RMSE</th>
              
              {isDeadlineClosed && (
                <>
                  <th className="py-4 px-2 md:py-5 md:px-4 text-center">Poin Peringkat</th>
                  <th className="py-4 px-2 md:py-5 md:px-4 text-center text-emerald-400/80">Kelengkapan File</th>
                  <th className="py-4 px-2 md:py-5 md:px-4 text-center text-purple-400/80">Penilaian Panitia</th>
                </>
              )}
              
              <th className="py-4 px-3 md:py-5 md:px-5 text-right text-[#ffec1f] text-xs md:text-sm shadow-[#ffec1f]">Total Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600/20 text-xs md:text-sm">
            {currentData.length === 0 ? (
              <tr><td colSpan={isDeadlineClosed ? 7 : 4} className="py-16 text-center text-slate-400 italic">Belum ada submisi Data Competition.</td></tr>
            ) : (
              currentData.map((team, index) => {
                const globalRank = startIndex + index + 1; 
                
                let badgeStyle = 'border-slate-500/30 bg-slate-600/10 text-slate-300';
                if (globalRank === 1) badgeStyle = 'border-[#ffec1f]/60 bg-[#ffec1f]/15 text-[#ffec1f] drop-shadow-[0_0_8px_rgba(255,236,31,0.3)]';
                else if (globalRank === 2) badgeStyle = 'border-slate-300/50 bg-slate-400/15 text-slate-200';
                else if (globalRank === 3) badgeStyle = 'border-amber-600/60 bg-amber-600/15 text-amber-500';

                return (
                  <tr key={team.id} className="hover:bg-[#25344f]/30 transition-colors duration-150">
                    <td className="py-3 px-3 md:py-4 md:px-5 text-center align-middle">
                      <div className={`flex items-center justify-center mx-auto w-8 h-8 md:w-10 md:h-10 rounded-xl border font-bold ${badgeStyle}`}>
                        #{globalRank}
                      </div>
                    </td>
                    
                    <td className="py-3 px-3 md:py-4 md:px-5 align-middle">
                      <div className="flex flex-col gap-1.5 md:gap-2">
                        <span className="font-semibold text-slate-100 tracking-wide truncate">{team.team_name}</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge isUploaded={team.has_ipynb} label="ipynb" />
                          <StatusBadge isUploaded={team.has_laporan} label="Laporan" />
                          <StatusBadge isUploaded={team.has_ppt} label="PPT" />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 md:py-4 md:px-5 text-center font-mono text-blue-200 font-medium tracking-wide align-middle">
                      {team.best_rmse !== null ? team.best_rmse.toFixed(5) : <span className="text-slate-500 font-sans font-normal italic">-</span>}
                    </td>

                    {isDeadlineClosed && (
                      <>
                        <td className="py-3 px-2 md:py-4 md:px-4 text-center font-mono text-slate-300 align-middle">
                          {team.calculated_final_points !== null ? team.poinPeringkat : '-'}
                        </td>

                        <td className="py-3 px-2 md:py-4 md:px-4 text-center align-middle">
                          {team.calculated_final_points !== null ? (
                            <div className="relative group inline-flex flex-col items-center justify-center cursor-help">
                              <span className="font-mono text-emerald-300 font-bold text-sm md:text-base border-b border-dashed border-emerald-500/50 pb-0.5">
                                +{team.totalPoinBerkas} <span className="text-[10px] opacity-70">ⓘ</span>
                              </span>
                              
                              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col w-36 bg-[#131b2c] rounded-lg border border-emerald-500/40 p-2 text-[10px] shadow-2xl z-50">
                                <div className="text-center text-slate-300 border-b border-slate-700 pb-1 mb-1 font-sans font-semibold">Rincian Berkas</div>
                                <div className="flex justify-between w-full text-emerald-200">
                                  <span>IPYNB:</span> <span className="font-mono">{team.poinIpynb}/5</span>
                                </div>
                                <div className="flex justify-between w-full text-emerald-200">
                                  <span>Laporan:</span> <span className="font-mono">{team.poinLaporan}/5</span>
                                </div>
                                <div className="flex justify-between w-full text-emerald-200">
                                  <span>PPT:</span> <span className="font-mono">{team.poinPpt}/5</span>
                                </div>
                              </div>
                            </div>
                          ) : '-'}
                        </td>
                        
                        <td className="py-3 px-2 md:py-4 md:px-4 text-center align-middle">
                          {team.calculated_final_points !== null ? (
                            <div className="relative group inline-flex flex-col items-center justify-center cursor-help">
                              <span className="font-mono text-purple-300 font-bold text-sm md:text-base border-b border-dashed border-purple-500/50 pb-0.5">
                                +{team.poinPanitia} <span className="text-[10px] opacity-70">ⓘ</span>
                              </span>
                              
                              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col w-36 bg-[#131b2c] rounded-lg border border-purple-500/40 p-2 text-[10px] shadow-2xl z-50">
                                <div className="text-center text-slate-300 border-b border-slate-700 pb-1 mb-1 font-sans font-semibold">Rincian Panitia</div>
                                <div className="flex justify-between w-full text-purple-200">
                                  <span>Code:</span> <span className="font-mono">{team.scoreIpynb}/30</span>
                                </div>
                                <div className="flex justify-between w-full text-purple-200">
                                  <span>Laporan:</span> <span className="font-mono">{team.scoreLaporan}/15</span>
                                </div>
                                <div className="flex justify-between w-full text-purple-200">
                                  <span>PPT:</span> <span className="font-mono">{team.scorePpt}/15</span>
                                </div>
                              </div>
                            </div>
                          ) : '-'}
                        </td>
                      </>
                    )}

                    <td className="py-3 px-3 md:py-4 md:px-5 text-right font-mono text-[#ffec1f] font-extrabold text-sm md:text-base tracking-wide bg-[#131b2c]/20 align-middle">
                      {isDeadlineClosed 
                        ? (team.calculated_final_points !== null ? team.calculated_final_points : '-') 
                        : '0'
                      }
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div> 
      
      {/* Pagination control tetap sama */}
      {data.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-600/30 bg-[#131b2c]/40 flex items-center justify-between w-full mt-auto">
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
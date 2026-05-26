'use client';

import { useState, useEffect } from 'react';
import { TeamAdminData } from '../types';

interface AdminTableProps {
  teams: TeamAdminData[];
  jenisLomba: 'Data Competition' | 'UI/UX';
  onUpdateField: (teamId: string, field: string, value: any) => Promise<void>;
}

export default function AdminTable({ teams, jenisLomba, onUpdateField }: AdminTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Menentukan batas maksimum nilai berdasarkan kriteria lomba
  const getMaxScore = (field: string): number => {
    if (jenisLomba === 'Data Competition') {
      if (field === 'score_ipynb') return 30;
      if (field === 'score_laporan') return 15;
      if (field === 'score_ppt') return 15;
    }
    // Default jika ada kriteria UI/UX (bisa disesuaikan misal maks 100)
    return 100;
  };

  // Fungsi menangani input nilai angka dengan validasi range & kalkulasi instan
  const handleScoreUpdate = async (teamId: string, field: string, value: string, currentVal: number) => {
    let numValue = parseInt(value, 10);
    
    // Jika input kosong atau bukan angka, kembalikan ke nilai sebelumnya
    if (isNaN(numValue)) {
      return;
    }

    const maxLimit = getMaxScore(field);
    
    // Validasi range: Cegah nilai minus atau melebihi batas maksimum
    if (numValue < 0) numValue = 0;
    if (numValue > maxLimit) numValue = maxLimit;

    // Jika nilainya sama dengan yang di database, tidak perlu hit API
    if (numValue === currentVal) return;
    
    setProcessingId(`${teamId}-${field}`);
    try {
      await onUpdateField(teamId, field, numValue);
    } catch (error) {
      console.error("Gagal mengupdate nilai:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Fungsi toggle file boolean
  const handleToggleFile = async (teamId: string, field: string, currentValue: boolean) => {
    setProcessingId(`${teamId}-${field}`);
    try {
      await onUpdateField(teamId, field, !currentValue);
    } catch (error) {
      console.error("Gagal mengupdate status berkas:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Komponen Tombol Toggle Berkas
  const FileToggle = ({ team, field, label }: { team: TeamAdminData, field: keyof TeamAdminData, label: string }) => {
    const isChecked = Boolean(team[field]);
    const isProcessing = processingId === `${team.id}-${field}`;

    return (
      <button
        onClick={() => handleToggleFile(team.id, field, isChecked)}
        disabled={isProcessing}
        className={`flex items-center gap-1 px-2 py-1 rounded border text-[9px] md:text-[10px] font-bold uppercase transition-all min-w-[70px] justify-center ${
          isChecked 
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30' 
            : 'bg-slate-800/50 text-slate-500 border-slate-600/40 hover:bg-slate-700 hover:text-white'
        } disabled:opacity-50`}
      >
        {isProcessing ? '⏳' : (isChecked ? `✅ ${label}` : `− ${label}`)}
      </button>
    );
  };

  // Komponen Input Nilai dengan Informasi Maksimum & Validasi
  const ScoreInput = ({ team, field, label }: { team: TeamAdminData, field: keyof TeamAdminData, label: string }) => {
    const currentScore = (team[field] as number) ?? 0;
    const [localVal, setLocalVal] = useState<string>(String(currentScore));
    const isProcessing = processingId === `${team.id}-${field}`;
    const maxLimit = getMaxScore(field as string);

    // Sinkronisasi state lokal jika data prop berubah dari database (Real-time update handler)
    useEffect(() => {
      setLocalVal(String(currentScore));
    }, [currentScore]);

    const isOverLimit = parseInt(localVal, 10) > maxLimit;

    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="relative flex flex-col items-center">
          <input
            type="number"
            min={0}
            max={maxLimit}
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={() => handleScoreUpdate(team.id, field as string, localVal, currentScore)}
            disabled={isProcessing}
            className={`w-14 bg-[#0a101d] border rounded px-2 py-1 text-xs text-center focus:outline-none transition-colors disabled:opacity-50 ${
              isOverLimit 
                ? 'border-red-500 text-red-400 focus:border-red-400 font-bold animate-pulse' 
                : 'border-purple-500/30 text-purple-300 focus:border-purple-400'
            }`}
          />
          {isProcessing && <span className="absolute -right-4 top-1 text-[10px] animate-spin">⏳</span>}
          
          {/* Label Range Info Kecil di Bawah Input */}
          <span className={`text-[8px] mt-0.5 tracking-tight ${isOverLimit ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
            Maks {maxLimit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto w-full custom-scrollbar animate-fade-in">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="bg-[#172135]/30 text-slate-300 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
          <tr className="border-b border-slate-600/30">
            <th className="py-4 px-4 w-48">Nama Kelompok</th>
            <th className="py-4 px-4 text-center">Verifikasi Berkas</th>
            <th className="py-4 px-4 text-center border-l border-slate-600/30">Input Nilai Panitia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600/20 text-sm">
          {teams.length === 0 ? (
            <tr><td colSpan={3} className="py-12 text-center text-slate-400 italic">Tidak ada tim yang ditemukan.</td></tr>
          ) : (
            teams.map((team) => (
              <tr key={team.id} className="hover:bg-[#25344f]/20 transition-colors">
                <td className="py-4 px-4 font-semibold text-slate-100 align-middle">
                  {team.team_name}
                </td>
                
                {/* KOLOM BERKAS (Dinamis) */}
                <td className="py-4 px-4 align-middle">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {jenisLomba === 'Data Competition' ? (
                      <>
                        <FileToggle team={team} field="has_ipynb" label="Code" />
                        <FileToggle team={team} field="has_laporan" label="Lap" />
                        <FileToggle team={team} field="has_ppt" label="PPT" />
                      </>
                    ) : (
                      <>
                        <FileToggle team={team} field="has_laporan" label="Lap" />
                        <FileToggle team={team} field="has_mockup" label="Mock" />
                        <FileToggle team={team} field="has_video" label="Vid" />
                        <FileToggle team={team} field="has_prototype" label="Proto" />
                        <FileToggle team={team} field="has_ppt" label="PPT" />
                      </>
                    )}
                  </div>
                </td>

                {/* KOLOM NILAI (Dinamis) */}
                <td className="py-4 px-4 border-l border-slate-600/30 bg-[#131b2c]/30 align-middle">
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {jenisLomba === 'Data Competition' ? (
                      <>
                        <ScoreInput team={team} field="score_ipynb" label="Code" />
                        <ScoreInput team={team} field="score_laporan" label="Laporan" />
                        <ScoreInput team={team} field="score_ppt" label="PPT" />
                      </>
                    ) : (
                      <>
                        <ScoreInput team={team} field="final_score" label="Nilai Akhir UI/UX" />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
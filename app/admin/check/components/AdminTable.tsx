'use client';

import { useState } from 'react';
import { TeamAdminData } from '../types';

interface AdminTableProps {
  teams: TeamAdminData[];
  jenisLomba: 'Data Competition' | 'UI/UX';
  onUpdateField: (teamId: string, field: string, value: any) => Promise<void>;
}

export default function AdminTable({ teams, jenisLomba, onUpdateField }: AdminTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fungsi khusus untuk menangani input nilai angka (onBlur agar tidak trigger API tiap ketik)
  const handleScoreUpdate = async (teamId: string, field: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    setProcessingId(`${teamId}-${field}`);
    await onUpdateField(teamId, field, numValue);
    setProcessingId(null);
  };

  // Fungsi toggle file boolean
  const handleToggleFile = async (teamId: string, field: string, currentValue: boolean) => {
    setProcessingId(`${teamId}-${field}`);
    await onUpdateField(teamId, field, !currentValue);
    setProcessingId(null);
  };

  // Komponen Tombol Toggle
  const FileToggle = ({ team, field, label }: { team: TeamAdminData, field: keyof TeamAdminData, label: string }) => {
    const isChecked = Boolean(team[field]);
    const isProcessing = processingId === `${team.id}-${field}`;

    return (
      <button
        onClick={() => handleToggleFile(team.id, field, isChecked)}
        disabled={isProcessing}
        className={`flex items-center gap-1 px-2 py-1 rounded border text-[9px] md:text-[10px] font-bold uppercase transition-all min-w-[70px] justify-center ${
          isChecked ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-slate-800/50 text-slate-500 border-slate-600/40 hover:bg-slate-700 hover:text-white'
        } disabled:opacity-50`}
      >
        {isProcessing ? '⏳' : (isChecked ? `✅ ${label}` : `− ${label}`)}
      </button>
    );
  };

  // Komponen Input Nilai
  const ScoreInput = ({ team, field, label }: { team: TeamAdminData, field: keyof TeamAdminData, label: string }) => {
    const [localVal, setLocalVal] = useState<string>(String(team[field] ?? 0));
    const isProcessing = processingId === `${team.id}-${field}`;

    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="relative">
          <input
            type="number"
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={() => handleScoreUpdate(team.id, field, localVal)}
            disabled={isProcessing}
            className="w-14 bg-[#0a101d] border border-purple-500/30 rounded px-2 py-1 text-xs text-center text-purple-300 focus:outline-none focus:border-purple-400 transition-colors disabled:opacity-50"
          />
          {isProcessing && <span className="absolute -right-4 top-1 text-[10px] animate-spin">⏳</span>}
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
            <tr><td colSpan={3} className="py-12 text-center text-slate-400 italic">Tidak ada asrama yang ditemukan.</td></tr>
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
                        {/* Asumsi UI/UX menggunakan field final_score sebagai nilai akhir manual */}
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
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TeamData {
  id: string;
  team_name: string;
  has_ipynb: boolean;
  has_ppt: boolean;
  has_laporan: boolean;
}

export default function AdminCheckPage() {
  // State untuk Deadline
  const [isDeadlineClosed, setIsDeadlineClosed] = useState<boolean>(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  const [configMessage, setConfigMessage] = useState<string>('');

  // State untuk Daftar Tim
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState<boolean>(true);
  
  // State untuk melacak baris yang sedang diproses (loading state per tombol)
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Ambil konfigurasi deadline
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setIsDeadlineClosed(data.isDeadlineClosed);
        }
      } catch (err) {
        console.error('Gagal memuat konfigurasi:', err);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    // Ambil data kelengkapan tim
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/admin/teams');
        if (res.ok) {
          const data = await res.json();
          setTeams(data);
        }
      } catch (err) {
        console.error('Gagal memuat data tim:', err);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchConfig();
    fetchTeams();
  }, []);

  // Handler: Ubah Status Gerbang
  const handleToggleDeadline = async (targetState: boolean) => {
    setIsLoadingConfig(true);
    setConfigMessage('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeadlineClosed: targetState }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsDeadlineClosed(data.isDeadlineClosed);
        setConfigMessage(
          targetState 
            ? '🔒 Gerbang DIKUNCI! Poin klasemen akhir diaktifkan.' 
            : '🔓 Gerbang DIBUKA! Peserta dapat melakukan submisi kembali.'
        );
      } else {
        setConfigMessage('❌ Gagal mengubah status gerbang.');
      }
    } catch (err) {
      setConfigMessage('❌ Terjadi kesalahan koneksi server.');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Handler: Ubah Status Berkas per Tim
  const handleToggleFile = async (teamId: string, field: keyof TeamData, currentValue: boolean) => {
    setProcessingId(`${teamId}-${field}`);
    const newValue = !currentValue;

    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, field, value: newValue }),
      });

      if (res.ok) {
        // Perbarui UI lokal jika sukses di database
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === teamId ? { ...team, [field]: newValue } : team
          )
        );
      } else {
        alert('Gagal memperbarui status berkas.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setProcessingId(null);
    }
  };

  // Komponen kecil untuk tombol toggle berkas
  const FileToggleButton = ({ team, field, label }: { team: TeamData, field: 'has_ipynb' | 'has_ppt' | 'has_laporan', label: string }) => {
    const isChecked = team[field];
    const isProcessing = processingId === `${team.id}-${field}`;

    return (
      <button
        onClick={() => handleToggleFile(team.id, field, isChecked)}
        disabled={isProcessing}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all w-24 justify-center ${
          isChecked
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:bg-emerald-500/30'
            : 'bg-slate-800/50 text-slate-400 border-slate-600/40 hover:bg-slate-700/80 hover:text-white'
        } disabled:opacity-50`}
      >
        {isProcessing ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <span>{isChecked ? '✅' : '−'} {label}</span>
        )}
      </button>
    );
  };

  return (
    <main className="min-h-screen text-slate-200 font-sans relative flex flex-col items-center p-4 md:p-8">
      {/* Background Maskot/Cyber Theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/background-leaderboard.png" alt="Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#0a101d]/85 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8 items-center mt-4">
        
        {/* =========================================
            PANEL 1: KENDALI WAKTU (DEADLINE)
        ========================================= */}
        <div className="w-full max-w-md bg-[#172135]/60 border border-slate-600/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="w-14 h-14 bg-[#ffec1f]/10 border border-[#ffec1f]/30 rounded-xl flex items-center justify-center text-xl text-[#ffec1f]">
              🔮
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Pusat Kendali Waktu</h1>
          </div>

          <div className="bg-[#131b2c]/80 rounded-xl p-4 border border-slate-600/20 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full border-b border-slate-600/20 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Gerbang</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                isDeadlineClosed ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {isDeadlineClosed ? 'TERKUNCI (CLOSED)' : 'TERBUKA (LIVE)'}
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => handleToggleDeadline(false)}
                disabled={isLoadingConfig || !isDeadlineClosed}
                className={`py-2 rounded-xl font-bold text-[11px] border tracking-wide transition-all ${
                  !isDeadlineClosed ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' : 'bg-[#172135] text-slate-400 border-slate-600/40 hover:bg-slate-700/50 hover:text-white'
                } disabled:opacity-40`}
              >
                BUKA PORTAL
              </button>
              <button
                onClick={() => handleToggleDeadline(true)}
                disabled={isLoadingConfig || isDeadlineClosed}
                className={`py-2 rounded-xl font-bold text-[11px] border tracking-wide transition-all ${
                  isDeadlineClosed ? 'bg-red-600/20 text-red-400 border-red-500/40' : 'bg-[#172135] text-slate-400 border-slate-600/40 hover:bg-red-950/30 hover:text-red-400'
                } disabled:opacity-40`}
              >
                KUNCI DEADLINE
              </button>
            </div>
          </div>
          {configMessage && <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-700/30 text-[11px] font-medium text-center text-slate-300">{configMessage}</div>}
        </div>


        {/* =========================================
            PANEL 2: VERIFIKASI ARTEFAK PESERTA
        ========================================= */}
        <div className="w-full bg-[#172135]/60 border border-slate-600/40 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-600/30 bg-[#131b2c]/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>📜</span> Verifikasi Artefak Final
            </h2>
            <span className="text-xs text-slate-400 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-600/30">
              Total: {teams.length} Tim
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-[#172135]/30 text-slate-300 text-[11px] font-semibold uppercase tracking-wider">
                <tr className="border-b border-slate-600/30">
                  <th className="py-4 px-6 w-1/3">Nama Kelompok</th>
                  <th className="py-4 px-6 text-center">Source Code (.ipynb)</th>
                  <th className="py-4 px-6 text-center">Laporan (.pdf)</th>
                  <th className="py-4 px-6 text-center">Pitch Deck (.ppt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/20 text-sm">
                {isLoadingTeams ? (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-400 animate-pulse">Memuat mantra asrama...</td></tr>
                ) : teams.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-400 italic">Belum ada tim yang terdaftar.</td></tr>
                ) : (
                  teams.map((team) => (
                    <tr key={team.id} className="hover:bg-[#25344f]/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-100">{team.team_name}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <FileToggleButton team={team} field="has_ipynb" label="ipynb" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <FileToggleButton team={team} field="has_laporan" label="Laporan" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <FileToggleButton team={team} field="has_ppt" label="PPT" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
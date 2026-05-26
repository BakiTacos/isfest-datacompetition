'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TeamAdminData, GlobalConfig } from './types';
import ControlPanel from './components/ControlPanel';
import AdminTable from './components/AdminTable';

export default function AdminCheckPage() {
  const [config, setConfig] = useState<GlobalConfig>({ isDeadlineClosed: false, isOpen: false });
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  
  const [teams, setTeams] = useState<TeamAdminData[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState<boolean>(true);

  // State Filter & Pencarian
  const [activeTab, setActiveTab] = useState<'Data Competition' | 'UI/UX'>('Data Competition');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Initial Data
  useEffect(() => {
    const fetchConfigsAndTeams = async () => {
      try {
        const [configRes, teamsRes] = await Promise.all([
          fetch('/api/config'), // Pastikan endpoint GET /api/config me-return { isDeadlineClosed, isOpen }
          fetch('/api/admin/teams')
        ]);
        
        if (configRes.ok) setConfig(await configRes.json());
        if (teamsRes.ok) setTeams(await teamsRes.json());
      } catch (err) {
        console.error('Gagal memuat data admin:', err);
      } finally {
        setIsLoadingConfig(false);
        setIsLoadingTeams(false);
      }
    };
    fetchConfigsAndTeams();
  }, []);

  // Handler: Update Global Config
  const handleToggleConfig = async (key: 'is_deadline_closed' | 'is_open', targetState: boolean) => {
    setIsLoadingConfig(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Endpoint POST /api/config Anda harus mampu menerima dan memperbarui kedua kunci ini
        body: JSON.stringify({ [key === 'is_deadline_closed' ? 'isDeadlineClosed' : 'isOpen']: targetState }),
      });

      if (res.ok) {
        setConfig(prev => ({ 
          ...prev, 
          [key === 'is_deadline_closed' ? 'isDeadlineClosed' : 'isOpen']: targetState 
        }));
      } else {
        alert(`Gagal memperbarui pengaturan ${key}.`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Handler: Update Field Tim (Checkbox / Input Nilai)
  const handleUpdateTeamField = async (teamId: string, field: string, value: any) => {
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, field, value }),
      });

      if (res.ok) {
        setTeams(prevTeams => 
          prevTeams.map(team => team.id === teamId ? { ...team, [field]: value } : team)
        );
      } else {
        alert('Gagal memperbarui data tim.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan saat update data.');
    }
  };

  // Filter Logika
  const filteredTeams = teams.filter(team => {
    const matchLomba = (team.jenis_lomba || 'Data Competition') === activeTab;
    const matchSearch = team.team_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLomba && matchSearch;
  });

  return (
    <main className="min-h-screen text-slate-200 font-sans relative flex flex-col items-center p-4 md:p-8 selection:bg-[#ffec1f]/20 selection:text-[#ffec1f]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/background-leaderboard.png" alt="Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#0a101d]/85 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-6 md:gap-8 items-center">
        
        {/* PANEL 1: KENDALI SISTEM */}
        <ControlPanel config={config} isLoading={isLoadingConfig} onToggleConfig={handleToggleConfig} />

        {/* PANEL 2: TABEL MANAJEMEN TIM */}
        <div className="w-full bg-[#172135]/60 border border-slate-600/40 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden">
          
          {/* Header Tabel & Filter */}
          <div className="px-5 py-4 md:px-6 border-b border-slate-600/30 bg-[#131b2c]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs Filter Jenis Lomba */}
            <div className="flex bg-[#0a101d]/80 p-1 rounded-xl border border-slate-700/50 w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('Data Competition')}
                className={`flex-1 md:flex-none whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'Data Competition' ? 'bg-[#172135] text-emerald-400 border border-slate-600/50' : 'text-slate-500'}`}
              >Data Competition</button>
              <button 
                onClick={() => setActiveTab('UI/UX')}
                className={`flex-1 md:flex-none whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'UI/UX' ? 'bg-[#172135] text-blue-400 border border-slate-600/50' : 'text-slate-500'}`}
              >UI/UX</button>
            </div>

            {/* Pencarian Tim */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari asrama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a101d]/80 border border-slate-600/50 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#ffec1f]/50 transition-all"
              />
              <span className="absolute left-3 top-2 text-slate-500">🔍</span>
            </div>
          </div>

          {/* Render Tabel Dinamis */}
          {isLoadingTeams ? (
            <div className="py-16 text-center text-slate-400 animate-pulse text-sm">Menyinkronkan data dari aula besar...</div>
          ) : (
            <AdminTable 
              teams={filteredTeams} 
              jenisLomba={activeTab} 
              onUpdateField={handleUpdateTeamField} 
            />
          )}

        </div>
      </div>
    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface LogEntry {
  id: number;
  created_at: string;
  message: string;
  type: 'rank_up' | 'update' | 'system';
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fungsi untuk mengambil 5 log terbaru
  const fetchLogs = async () => {
    setIsUpdating(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setLogs(data);
    }
    setIsUpdating(false);
  };

  useEffect(() => {
    // 1. Ambil data pertama kali saat halaman dibuka
    fetchLogs();

    // 2. PLAN B: Polling - Lakukan pengecekan setiap 10 detik di background!
    // Cara ini 100% AMAN dari blokir WebSocket jaringan mana pun.
    const intervalId = setInterval(() => {
      fetchLogs();
    }, 10000); // 10000 ms = 10 detik

    return () => clearInterval(intervalId); // Bersihkan saat komponen ditutup
  }, []);

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="bg-[#131b2c]/60 border border-slate-600/20 rounded-xl p-4 backdrop-blur-md max-w-full w-full relative overflow-hidden">
      
      {/* Indikator Loading Tipis saat Polling berjalan */}
      {isUpdating && <div className="absolute top-0 left-0 w-full h-0.5 bg-[#ffec1f]/50 animate-pulse"></div>}

      <div className="flex items-center gap-2 mb-3 border-b border-slate-600/20 pb-2">
        <span className="flex h-2 w-2 relative">
        </span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Log Pertarungan</h3>
      </div>

      <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic py-2">Menunggu pergerakan mantra dari para asrama...</p>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className={`p-2 rounded border transition-all duration-300 ${
                log.type === 'rank_up' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                  : 'bg-slate-800/40 border-slate-700/30 text-slate-300'
              }`}
            >
              <span className="text-slate-500 mr-2">[{formatTime(log.created_at)}]</span>
              <span dangerouslySetInnerHTML={{ __html: log.message.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>') }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
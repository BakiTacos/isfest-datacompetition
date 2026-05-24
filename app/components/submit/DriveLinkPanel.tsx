import { useState, useEffect } from 'react';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });

interface DriveLinkPanelProps {
  teamId: string;
  initialLink: string;
}

export default function DriveLinkPanel({ teamId, initialLink }: DriveLinkPanelProps) {
  const [driveLink, setDriveLink] = useState(initialLink);
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [linkMessage, setLinkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sinkronisasi jika initialLink berubah dari fetch awal parent
  useEffect(() => {
    if (initialLink) setDriveLink(initialLink);
  }, [initialLink]);

  const handleSaveLink = async () => {
    if (!teamId) return;
    setIsSavingLink(true);
    setLinkMessage(null);

    try {
      const response = await fetch('/api/submit-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, drive_link: driveLink }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan tautan artefak.');

      setLinkMessage({ type: 'success', text: 'Tautan artefak berhasil disimpan di perpusatakaan sihir!' });
    } catch (error: any) {
      setLinkMessage({ type: 'error', text: error.message });
    } finally {
      setIsSavingLink(false);
    }
  };

  return (
    <div className="w-full bg-[#172135]/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-slate-600/30 backdrop-blur-xl p-6 md:p-8 mt-6">
      <div className="mb-6">
        <h2 className={`${cinzel.className} text-xl md:text-2xl font-bold text-white tracking-wider mb-2 flex items-center gap-3`}>
          <span>🔗</span> Artefak Akhir <span className="text-[10px] bg-slate-700/50 text-slate-300 py-1 px-2 rounded-md uppercase font-sans tracking-widest ml-2 border border-slate-600/50">Wajib</span>
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Kumpulkan tautan Google Drive yang berisi <strong>PowerPoint (PPT), Laporan Analisis, dan Source Code (.ipynb)</strong>. Tautan dapat diubah kapan saja sebelum waktu kompetisi berakhir. Pastikan akses tautan diatur menjadi <em className="text-slate-300">"Anyone with the link can view"</em>.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="url"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            className="w-full bg-[#0a101d]/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
            placeholder="https://drive.google.com/drive/folders/..."
          />
        </div>

        {linkMessage && (
          <div className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 animate-fade-in ${
            linkMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className="text-base leading-none">{linkMessage.type === 'success' ? '✨' : '🛑'}</span>
            <p>{linkMessage.text}</p>
          </div>
        )}

        <div className="flex justify-end mt-2">
          <button
            onClick={handleSaveLink}
            disabled={isSavingLink || !driveLink.trim()}
            className="w-full md:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSavingLink ? 'Menyimpan Tautan...' : 'Simpan Tautan Drive'}
          </button>
        </div>
      </div>
    </div>
  );
}
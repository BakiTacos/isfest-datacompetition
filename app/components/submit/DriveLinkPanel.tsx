'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface DriveLinkPanelProps {
  teamId: string;
  initialLink: string;
}

export default function DriveLinkPanel({ teamId, initialLink }: DriveLinkPanelProps) {
  const [link, setLink] = useState(initialLink);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  
  // State untuk Modal Konfirmasi
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (initialLink) {
      setLink(initialLink);
      // Opsi UX: Beri tahu peserta bahwa sistem sudah menyimpan tautan mereka sebelumnya
      setMessage({ text: 'Tautan Anda sebelumnya sudah tersimpan di dalam sistem.', type: 'success' });
    }
  }, [initialLink]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fungsi yang dipanggil saat tombol awal diklik
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.includes('drive.google.com')) {
      setMessage({ text: 'Harap masukkan tautan Google Drive yang valid.', type: 'error' });
      return;
    }
    // Buka modal alih-alih langsung menyimpan
    setShowConfirmModal(true);
    setIsAgreed(false); // Reset checkbox setiap kali modal dibuka
  };

  // Fungsi aktual untuk menyimpan data ke database (dipanggil dari dalam modal)
  const handleFinalSubmit = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    setShowConfirmModal(false); // Tutup modal saat proses dimulai

    try {
      const res = await fetch('/api/submit/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, link }),
      });

      if (res.ok) {
        setMessage({ text: 'Tautan Artefak berhasil disegel dalam sistem!', type: 'success' });
      } else {
        const errorData = await res.json();
        setMessage({ text: errorData.error || 'Gagal menyimpan tautan.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Terjadi gangguan magis pada server.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="w-full mt-6 bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl relative overflow-hidden transition-all hover:border-blue-500/30">
        
        {/* Dekorasi Latar Belakang */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <div className="text-8xl">🔗</div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Tautan Artefak (Google Drive)</h2>
          </div>
          
          <p className="text-sm text-slate-400 mb-6">
            Kumpulkan seluruh berkas final Anda (.ipynb, PPT, Laporan) ke dalam satu folder Google Drive. <strong className="text-emerald-400 font-semibold">Pastikan akses folder disetel ke "Anyone with the link" (Publik).</strong>
          </p>

          <form onSubmit={handlePreSubmit} className="flex flex-col md:flex-row gap-3">
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-grow bg-[#172135] border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#ffec1f]/50 focus:ring-1 focus:ring-[#ffec1f]/30 transition-all"
              required
            />
            <button
              type="submit"
              disabled={isSaving}
              className="md:w-auto w-full bg-[#ffec1f] hover:bg-white text-slate-900 font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,236,31,0.2)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSaving ? 'Menyimpan...' : (initialLink ? 'Perbarui Tautan' : 'Kunci Tautan')}
            </button>
          </form>

          {message.text && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              <span>{message.type === 'success' ? '✅' : '❌'}</span>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          MODAL KONFIRMASI (MessageBox) Menggunakan Portal
      ========================================= */}
      {showConfirmModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-fade-in">
          {/* Latar Belakang Gelap (Blur) */}
          <div className="absolute inset-0 bg-[#0a101d]/80 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          
          {/* Kotak Modal */}
          <div className="relative z-10 w-full max-w-lg bg-[#131b2c] border border-red-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            
            <div className="px-6 py-5 border-b border-slate-700/50 bg-[#172135]/50 flex items-center gap-3">
              <span className="text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">📜</span>
              <h3 className="text-lg font-bold text-white tracking-wide">Sumpah Penyegelan Artefak</h3>
            </div>
            
            <div className="p-6 text-sm text-slate-300 leading-relaxed">
              <p className="mb-4">
                Sebelum tautan ini dikunci, panitia ISFEST mengingatkan bahwa <strong>kelengkapan berkas sangat memengaruhi klasemen akhir.</strong> 
              </p>
              
              <ul className="space-y-2 mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 font-mono text-xs">
                <li className="flex justify-between"><span>📄 Source Code (.ipynb)</span> <span className="text-[#ffec1f] font-bold">5 Poin</span></li>
                <li className="flex justify-between"><span>📊 Pitch Deck (.ppt)</span> <span className="text-[#ffec1f] font-bold">5 Poin</span></li>
                <li className="flex justify-between"><span>📑 Laporan Analisis (.pdf)</span> <span className="text-[#ffec1f] font-bold">5 Poin</span></li>
                <li className="border-t border-slate-700 pt-2 flex justify-between text-emerald-400 font-bold">
                  <span>Total Poin Berkas</span> <span>Maks. 15 Poin</span>
                </li>
              </ul>
              
              <p className="text-red-400 font-medium mb-5 bg-red-950/20 p-3 rounded-lg border border-red-500/20 text-xs">
                ⚠️ Kehilangan poin berkas akan berakibat fatal pada skor akhir (Final Score) dan memperkecil peluang asrama Anda untuk lolos ke tahap Grand Final. Setelah disahkan, isi tautan ini tidak boleh diubah kembali.
              </p>

              {/* Checkbox Persetujuan */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-5 h-5 border-2 border-slate-500 rounded bg-slate-800 checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                  />
                  <svg className="absolute w-5 h-5 text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none p-1 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors select-none">
                  Saya sadar akan risiko ini dan menyatakan bahwa seluruh berkas di dalam tautan Drive tersebut sudah <strong className="text-emerald-400">LENGKAP</strong>, disetel ke mode <strong className="text-emerald-400">PUBLIK</strong>, dan bersifat <strong className="text-emerald-400">FINAL</strong>.
                </span>
              </label>
            </div>

            <div className="px-6 py-4 bg-[#172135]/80 border-t border-slate-700/50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={!isAgreed}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  isAgreed 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                Kunci & Sahkan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
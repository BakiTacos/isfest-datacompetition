import { useState, useRef } from 'react';
import { Cinzel } from 'next/font/google';
import { createClient } from '@supabase/supabase-js';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
interface CsvUploaderProps {
  teamId: string;
  quotaRemaining: number;
  onUploadSuccess: (score: number, message: string) => void;
}

export default function CsvUploader({ teamId, quotaRemaining, onUploadSuccess }: CsvUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setMessage(null);
    if (!selectedFile.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Mantra ditolak! Hanya menerima gulungan format .csv' });
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmitCSV = async () => {
    if (!file || !teamId || quotaRemaining <= 0) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('team_id', teamId);

    try {
      const filePath = `submissions/${teamId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, file);

      if (uploadError) throw new Error("Gagal mengunggah file ke penyimpanan.");

      const response = await fetch('/api/submit', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, filePath }) 
      });
      const textResponse = await response.text();
      let result;
      try { result = JSON.parse(textResponse); } catch (e) { throw new Error("Server anomali. Gagal memecahkan mantra."); }

      if (!response.ok) throw new Error(result.error || 'Gagal mengevaluasi model.');

      onUploadSuccess(result.rmse, result.message);
      setFile(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-[#172135]/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-slate-600/30 backdrop-blur-xl p-6 md:p-10">
      <div className="text-center mb-8">
        <h1 className={`${cinzel.className} text-2xl md:text-3xl font-bold text-white tracking-wider mb-2`}>Ruang Submisi</h1>
        <p className="text-slate-400 text-sm">Letakkan gulungan prediksi Anda di altar ini.</p>
      </div>

      <div 
        onClick={() => quotaRemaining > 0 && fileInputRef.current?.click()}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${quotaRemaining <= 0 ? 'border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-60' : isDragging ? 'border-[#ffec1f] bg-[#ffec1f]/10 cursor-pointer' : file ? 'border-emerald-500/50 bg-emerald-500/5 cursor-pointer' : 'border-slate-600/50 bg-[#0a101d]/40 hover:border-[#ffec1f]/50 hover:bg-[#ffec1f]/5 cursor-pointer'}`}
      >
        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={quotaRemaining <= 0} />
        {quotaRemaining <= 0 ? (
          <div className="text-center"><div className="text-4xl mb-3 opacity-60">⏳</div><p className="text-red-400 font-medium text-base mb-1">Energi Sihir Habis</p><p className="text-slate-500 text-xs">Silakan kembali besok.</p></div>
        ) : file ? (
          <div className="text-center animate-fade-in"><div className="text-4xl mb-3">📜</div><p className="text-[#ffec1f] font-semibold text-lg">{file.name}</p><p className="text-slate-400 text-xs mt-1">{(file.size / 1024).toFixed(2)} KB</p><p className="text-slate-500 text-xs mt-4 underline decoration-slate-600 hover:text-slate-300">Klik untuk mengganti</p></div>
        ) : (
          <div className="text-center"><div className="text-4xl mb-3 opacity-60">☁️</div><p className="text-slate-200 font-medium text-base mb-1">Tarik & Lepas file prediksi di sini</p><p className="text-slate-500 text-xs uppercase tracking-widest font-bold">atau klik untuk menelusuri</p></div>
        )}
      </div>

      {message?.type === 'error' && (
        <div className="mt-6 p-4 rounded-xl text-sm font-medium border flex items-start gap-3 animate-fade-in bg-red-500/10 border-red-500/30 text-red-400">
          <span className="text-lg leading-none">🛑</span><p>{message.text}</p>
        </div>
      )}

      <button onClick={handleSubmitCSV} disabled={!file || isUploading || quotaRemaining <= 0} className="w-full mt-6 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-slate-950 font-bold text-sm md:text-base uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-amber-900/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2">
        {isUploading ? 'Sistem Sedang Mengevaluasi...' : 'Serahkan Prediksi'}
      </button>
    </div>
  );
}
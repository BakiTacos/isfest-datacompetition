import Link from 'next/link';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });

interface ScoreCardProps {
  score: number;
  message: string;
}

export default function ScoreCard({ score, message }: ScoreCardProps) {
  return (
    <div className="w-full bg-gradient-to-r from-emerald-900/40 to-[#131b2c]/80 border border-emerald-500/30 rounded-2xl p-6 mb-6 backdrop-blur-md flex flex-col items-center justify-center animate-[float_3s_ease-in-out_infinite] shadow-[0_0_20px_rgba(16,185,129,0.1)] text-center">
      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Evaluasi Mantra Selesai</h3>
      <p className="text-slate-300 text-sm mb-2">{message}</p>
      <div className="flex items-end gap-2">
        <span className="text-slate-400 text-sm mb-1.5 font-medium">RMSE :</span>
        <span className={`${cinzel.className} text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
          {score.toFixed(5)}
        </span>
      </div>
      <Link href="/" className="mt-4 text-xs text-[#ffec1f] hover:text-white underline decoration-[#ffec1f]/40 underline-offset-4 transition-colors">
        Lihat Posisi Anda di Papan Peringkat &rarr;
      </Link>
    </div>
  );
}
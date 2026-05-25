import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function HandbookCard({ title, desc, link, icon }: { title: string, desc: string, link: string, icon: string }) {
  return (
    <div className="w-full bg-[#172135]/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-slate-600/30 backdrop-blur-xl p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-28 h-28 shrink-0 bg-slate-800/50 rounded-2xl border border-slate-600/50 flex items-center justify-center relative shadow-inner p-4">
          <Image src={icon} alt="Kitab Panduan" fill className="object-contain p-4 drop-shadow-lg" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className={`${cinzel.className} text-2xl font-bold text-white tracking-wider mb-2`}>{title}</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">{desc}</p>
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#ffec1f] hover:bg-white text-slate-900 font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,236,31,0.3)]">
            Buka Kitab Panduan
          </a>
        </div>
      </div>
    </div>
  );
}
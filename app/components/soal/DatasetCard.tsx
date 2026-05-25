import Image from 'next/image';

export default function DatasetCard({ title, icon, desc, link, colorTheme }: any) {
  const themeStyles: any = {
    emerald: 'hover:border-emerald-500/50 hover:bg-[#172135] group-hover:scale-110',
    blue: 'hover:border-blue-500/50 hover:bg-[#172135] group-hover:scale-110',
    amber: 'hover:border-amber-500/50 hover:bg-[#172135] group-hover:scale-110',
  };
  const btnStyles: any = {
    emerald: 'bg-slate-800 hover:bg-emerald-600 border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-white',
    blue: 'bg-slate-800 hover:bg-blue-600 border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white',
    amber: 'bg-slate-800 hover:bg-amber-600 border-slate-600 hover:border-amber-500 text-slate-300 hover:text-white',
  };

  return (
    <div className={`bg-[#131b2c]/80 border border-slate-600/40 rounded-2xl p-6 flex flex-col items-center text-center transition-all group ${themeStyles[colorTheme]}`}>
      <div className="relative w-20 h-20 mb-4 transition-transform group-hover:scale-110">
        <Image src={icon} alt={title} fill className="object-contain drop-shadow-lg" />
      </div>
      <h3 className="font-bold text-slate-200 text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-xs mb-6 flex-grow">{desc}</p>
      <a href={link} download className={`w-full font-bold text-[10px] uppercase tracking-widest py-3 rounded-lg transition-colors border ${btnStyles[colorTheme]}`}>
        Unduh {title.split('.')[0]}
      </a>
    </div>
  );
}
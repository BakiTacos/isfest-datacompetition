export default function LockedOverlay({ message }: { message: string }) {
  // Cek apakah pesannya terkait "Login" untuk mengubah sub-teks
  const isLoginWarning = message.toLowerCase().includes('login');

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a101d]/60 backdrop-blur-sm rounded-3xl border border-slate-500/30">
      <div className="bg-[#172135]/90 border border-slate-500/50 px-6 py-5 rounded-2xl flex flex-col items-center shadow-2xl shadow-black max-w-sm text-center">
        <span className="text-4xl mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">🔒</span>
        <h3 className="text-white font-bold tracking-widest text-sm md:text-base uppercase mb-2">
          {message}
        </h3>
        
        {isLoginWarning ? (
          <a href="/login" className="mt-2 bg-[#ffec1f] hover:bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors pointer-events-auto">
            Pergi ke Ruang Login
          </a>
        ) : (
          <p className="text-slate-400 text-xs mt-1">
            Tunggu instruksi selanjutnya dari panitia.
          </p>
        )}
      </div>
    </div>
  );
}
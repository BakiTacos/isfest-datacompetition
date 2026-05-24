'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState(''); // Ubah dari email ke username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Kirim username, bukan email
        body: JSON.stringify({ username, password }), 
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Jika berhasil, arahkan ke halaman tambah tim
      router.push('/admin/add-team');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a101d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#172135] p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Portal Panitia</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            {/* Label dan Input disesuaikan untuk Username */}
            <label className="text-xs font-bold text-slate-400 uppercase">Username Admin</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              placeholder="Contoh: superadmin"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          
          {error && <p className="text-red-400 text-xs bg-red-900/20 p-2 rounded">{error}</p>}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-colors mt-4"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
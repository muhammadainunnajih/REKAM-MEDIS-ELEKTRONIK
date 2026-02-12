
import React, { useState } from 'react';
import { HeartPulse, ArrowLeft, Cloud, Lock, User, RefreshCcw, AlertCircle, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { AppUser } from '../types';

interface LoginProps {
  onLogin: (user: AppUser) => void;
  users: AppUser[];
  onConnectKlinik: (id: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, onConnectKlinik }) => {
  const [view, setView] = useState<'LOGIN' | 'CONNECT'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [klinikIdInput, setKlinikIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (foundUser) {
      if (foundUser.status === 'Aktif') onLogin(foundUser);
      else setError('Akun Anda dinonaktifkan.');
    } else {
      setError('Username/Password salah. Pastikan data sudah tersinkron jika ini perangkat baru.');
    }
  };

  const handleConnectCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const isConnected = await onConnectKlinik(klinikIdInput.trim());
    setIsLoading(false);
    
    if (isConnected) {
      setSuccess('SINKRONISASI BERHASIL! Silakan login menggunakan akun staf.');
      setTimeout(() => setView('LOGIN'), 1500);
    } else {
      setError('Gagal menghubungkan. Klinik ID tidak ditemukan atau periksa internet.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
               <HeartPulse size={32} />
             </div>
             <h1 className="text-xl font-black text-white tracking-tight uppercase">EMR Klinik Sehat</h1>
             <p className="text-[10px] text-blue-100 font-bold tracking-[0.2em] uppercase">Sistem Rekam Medis Cloud</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} />
              <p className="text-xs font-bold leading-relaxed">{success}</p>
            </div>
          )}

          {view === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Staf</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="Masukkan username" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 text-xs uppercase tracking-widest transition-all active:scale-95">Masuk Sistem</button>
              
              <div className="pt-6 border-t border-slate-50 text-center">
                <button type="button" onClick={() => setView('CONNECT')} className="text-xs font-black text-blue-600 flex items-center justify-center gap-2 mx-auto hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest">
                  <Globe size={14} /> Hubungkan Klinik ID Baru
                </button>
              </div>
            </form>
          )}

          {view === 'CONNECT' && (
            <form onSubmit={handleConnectCloud} className="space-y-5 animate-in slide-in-from-right-4">
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold leading-relaxed text-center">Gunakan Klinik ID dari perangkat utama untuk menyinkronkan data Klinik ini ke perangkat baru.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Klinik ID</label>
                <input type="text" required value={klinikIdInput} onChange={e => setKlinikIdInput(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-blue-600 font-black tracking-widest outline-none focus:border-blue-400" placeholder="Masukkan ID (contoh: XYZ-123)" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95">
                {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <Zap size={18} />}
                {isLoading ? 'MENGHUBUNGKAN...' : 'SINKRONKAN DATA CLOUD'}
              </button>
              <button type="button" onClick={() => setView('LOGIN')} className="w-full text-xs font-black text-slate-400 flex items-center justify-center gap-2 uppercase tracking-widest"><ArrowLeft size={14} /> Kembali ke Login</button>
            </form>
          )}
        </div>
      </div>
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
        <Cloud size={12} className="text-blue-400" /> EMR SYSTEM v2.1.0
      </p>
    </div>
  );
};

export default Login;

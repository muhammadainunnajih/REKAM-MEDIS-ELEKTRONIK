
import React, { useState, useEffect } from 'react';
import { HeartPulse, ArrowLeft, CheckCircle2, Mail, Lock, User, UserPlus, AlertCircle, RefreshCcw } from 'lucide-react';
import { AppUser } from '../types';

interface LoginProps {
  onLogin: (user: AppUser) => void;
  users: AppUser[];
}

type AuthState = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'SUCCESS_RESET';

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminpassword');
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // Simulasi cek sinkronisasi saat startup
  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      if (foundUser.status === 'Aktif') {
        onLogin(foundUser);
      } else {
        setError('Akun Anda tidak aktif.');
      }
    } else {
      setError('Username atau password salah.');
    }
  };

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-bounce mb-8">
          <HeartPulse size={40} />
        </div>
        <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.2em] text-xs">
          <RefreshCcw size={16} className="animate-spin" />
          Menyinkronkan Data Klinik...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <HeartPulse size={44} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-800">Klinik Sehat</h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">EMR Cloud System</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-xs font-bold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Masuk Sekarang
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Sistem Rekam Medis Terenkripsi
        </p>
      </div>
      <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
        © 2025 Klinik Sehat Utama • Cloud Enabled
      </p>
    </div>
  );
};

export default Login;

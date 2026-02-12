
import React, { useState } from 'react';
import { HeartPulse, ArrowLeft, Cloud, Lock, User, RefreshCcw, AlertCircle, Zap, Globe, CheckCircle2, Mail, UserPlus, ShieldAlert } from 'lucide-react';
import { AppUser, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: AppUser) => void;
  onRegister: (user: AppUser) => void;
  users: AppUser[];
  onConnectKlinik: (id: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, users, onConnectKlinik }) => {
  const [view, setView] = useState<'LOGIN' | 'CONNECT' | 'FORGOT' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [klinikIdInput, setKlinikIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registration states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Perawat');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (users.some(u => u.username.toLowerCase() === regUsername.toLowerCase())) {
      setError('Username sudah digunakan.');
      return;
    }

    const newUser: AppUser = {
      id: `u-${Date.now()}`,
      name: regName,
      email: regEmail,
      username: regUsername,
      password: regPassword,
      role: regRole,
      lastActive: 'Baru Terdaftar',
      status: 'Aktif'
    };

    onRegister(newUser);
    setSuccess('Pendaftaran berhasil! Silakan login.');
    setTimeout(() => {
      setUsername(regUsername);
      setView('LOGIN');
      setSuccess(null);
    }, 2000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(`Instruksi pemulihan telah dikirim ke ${forgotEmail}. Silakan periksa kotak masuk atau hubungi administrator.`);
    setTimeout(() => {
      setView('LOGIN');
      setSuccess(null);
    }, 4000);
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
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Staf</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="Masukkan username" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={() => setView('FORGOT')} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Lupa Password?</button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 text-xs uppercase tracking-widest transition-all active:scale-95">Masuk Sistem</button>
              
              <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
                <button type="button" onClick={() => setView('REGISTER')} className="text-xs font-black text-slate-600 flex items-center justify-center gap-2 mx-auto hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest border border-slate-100 w-full">
                  <UserPlus size={14} className="text-blue-500" /> Daftar Akun Baru
                </button>
                <button type="button" onClick={() => setView('CONNECT')} className="text-xs font-black text-blue-600 flex items-center justify-center gap-2 mx-auto hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest">
                  <Globe size={14} /> Hubungkan Klinik ID Baru
                </button>
              </div>
            </form>
          )}

          {view === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in slide-in-from-right-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400" placeholder="dr. Nama Lengkap" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400" placeholder="nama@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                  <input type="text" required value={regUsername} onChange={e => setRegUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400" placeholder="user123" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peran (Role)</label>
                <select value={regRole} onChange={e => setRegRole(e.target.value as UserRole)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400">
                  <option value="Perawat">Perawat / Staf Administrasi</option>
                  <option value="Dokter">Dokter</option>
                  <option value="Apoteker">Apoteker</option>
                  <option value="Kasir">Kasir</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-100 text-xs uppercase tracking-widest transition-all">Daftar Sekarang</button>
              <button type="button" onClick={() => setView('LOGIN')} className="w-full text-xs font-black text-slate-400 flex items-center justify-center gap-2 uppercase tracking-widest mt-2"><ArrowLeft size={14} /> Kembali ke Login</button>
            </form>
          )}

          {view === 'FORGOT' && (
            <form onSubmit={handleForgotSubmit} className="space-y-6 animate-in slide-in-from-right-4">
               <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                <ShieldAlert className="text-blue-600 shrink-0" size={24} />
                <p className="text-[10px] text-blue-600 font-bold leading-relaxed">Masukkan email terdaftar Anda. Kami akan mengirimkan instruksi pemulihan atau hubungi Admin Klinik untuk reset password secara manual.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Terdaftar</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="nama@email.com" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95">
                Kirim Instruksi
              </button>
              <button type="button" onClick={() => setView('LOGIN')} className="w-full text-xs font-black text-slate-400 flex items-center justify-center gap-2 uppercase tracking-widest"><ArrowLeft size={14} /> Batal</button>
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

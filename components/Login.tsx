
import React, { useState } from 'react';
import { HeartPulse, ArrowLeft, CheckCircle2, Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
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
  
  // Registration States
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: ''
  });

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const foundUser = users.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      if (foundUser.status === 'Aktif') {
        onLogin(foundUser);
      } else {
        setError('Akun Anda saat ini tidak aktif. Silakan hubungi Administrator.');
      }
    } else {
      setError('Username atau password salah.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful registration
    alert(`Akun untuk ${regData.fullName} berhasil dibuat! Silakan login.`);
    setAuthState('LOGIN');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate reset link sent
    setAuthState('SUCCESS_RESET');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <HeartPulse size={36} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Klinik Sehat</h1>
            <p className="text-sm text-slate-500 font-medium">
              {authState === 'LOGIN' && 'Silakan login untuk melanjutkan'}
              {authState === 'REGISTER' && 'Daftar akun staf baru'}
              {authState === 'FORGOT_PASSWORD' && 'Pulihkan kata sandi Anda'}
              {authState === 'SUCCESS_RESET' && 'Permintaan Terkirim'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-xs font-bold leading-relaxed">{error}</p>
          </div>
        )}

        {/* LOGIN VIEW */}
        {authState === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 ml-1">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-blue-50/50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 ml-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-blue-50/50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setAuthState('FORGOT_PASSWORD')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Lupa Password?
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => setAuthState('REGISTER')}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Belum punya akun? Daftar
              </button>
            </div>
          </form>
        )}

        {/* REGISTER VIEW */}
        {authState === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                required
                value={regData.fullName}
                onChange={(e) => setRegData({...regData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-400 transition-all font-medium"
                placeholder="Nama Lengkap Staf"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 ml-1">Email</label>
              <input 
                type="email" 
                required
                value={regData.email}
                onChange={(e) => setRegData({...regData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-400 transition-all font-medium"
                placeholder="email@klinik.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 ml-1">Username</label>
                <input 
                  type="text" 
                  required
                  value={regData.username}
                  onChange={(e) => setRegData({...regData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-400 transition-all font-medium"
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 ml-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-400 transition-all font-medium"
                  placeholder="Min. 8 Karakter"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                Daftar Akun
              </button>
              <button 
                type="button"
                onClick={() => setAuthState('LOGIN')}
                className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Kembali ke Login
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {authState === 'FORGOT_PASSWORD' && (
          <form onSubmit={handleResetSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm flex-shrink-0">
                <Mail size={18} />
              </div>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 ml-1">Email Terdaftar</label>
              <input 
                type="email" 
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-400 transition-all font-medium"
                placeholder="nama@klinik.com"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100"
              >
                Kirim Tautan Reset
              </button>
              <button 
                type="button"
                onClick={() => setAuthState('LOGIN')}
                className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Kembali ke Login
              </button>
            </div>
          </form>
        )}

        {/* SUCCESS RESET VIEW */}
        {authState === 'SUCCESS_RESET' && (
          <div className="text-center py-4 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800">Email Terkirim!</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                Silakan periksa kotak masuk email <strong>{resetEmail}</strong> untuk melanjutkan proses pemulihan.
              </p>
            </div>
            <button 
              onClick={() => setAuthState('LOGIN')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg"
            >
              Kembali ke Login
            </button>
            <p className="text-xs text-slate-400 font-medium italic">
              Tidak menerima email? Periksa folder spam atau <button className="text-blue-500 font-bold hover:underline">Kirim ulang</button>
            </p>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        © 2025 Klinik Sehat Utama • EMR System v2.1
      </p>
    </div>
  );
};

export default Login;

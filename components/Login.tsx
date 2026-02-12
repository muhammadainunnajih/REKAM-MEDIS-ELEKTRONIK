
import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, ArrowLeft, Cloud, Lock, User, RefreshCcw, AlertCircle, Zap, Globe, CheckCircle2, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AppUser } from '../types';

interface LoginProps {
  onLogin: (user: AppUser) => void;
  users: AppUser[];
  onConnectKlinik: (id: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, onConnectKlinik }) => {
  const [view, setView] = useState<'LOGIN' | 'CONNECT' | 'SCAN'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [klinikIdInput, setKlinikIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (foundUser) {
      if (foundUser.status === 'Aktif') onLogin(foundUser);
      else setError('Akun Anda dinonaktifkan.');
    } else {
      setError('Username/Password salah. Pastikan sudah Tarik Data Cloud jika ini HP baru.');
    }
  };

  const startScanner = () => {
    setView('SCAN');
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((decodedText) => {
        setKlinikIdInput(decodedText);
        scanner.clear();
        setView('CONNECT');
      }, (error) => {});
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setView('CONNECT');
  };

  const handleConnectCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const isConnected = await onConnectKlinik(klinikIdInput.trim());
    setIsLoading(false);
    
    if (isConnected) {
      setSuccess('SINKRONISASI BERHASIL! Silakan login.');
      setTimeout(() => setView('LOGIN'), 1500);
    } else {
      setError('Klinik ID tidak valid atau internet bermasalah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center relative">
          <div className="relative z-10 flex flex-col items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
               <HeartPulse size={32} />
             </div>
             <h1 className="text-xl font-black text-white tracking-tight uppercase">EMR Klinik Cloud</h1>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} />
              <p className="text-xs font-bold">{success}</p>
            </div>
          )}

          {view === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Staf</label>
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400" placeholder="Masukkan username" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 text-xs uppercase tracking-widest transition-all active:scale-95">Masuk Sistem</button>
              <div className="pt-4 border-t border-slate-50 text-center">
                <button type="button" onClick={() => setView('CONNECT')} className="text-xs font-black text-blue-600 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
                  <Globe size={14} /> Hubungkan Klinik ID (Scan QR)
                </button>
              </div>
            </form>
          )}

          {view === 'CONNECT' && (
            <form onSubmit={handleConnectCloud} className="space-y-5 animate-in slide-in-from-right-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold leading-relaxed text-center">Masukkan ID atau Scan QR Code dari perangkat Admin untuk sinkronisasi akun.</p>
              </div>
              <div className="space-y-4">
                <button type="button" onClick={startScanner} className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-black flex items-center justify-center gap-3 hover:bg-blue-50 transition-all">
                  <Camera size={20} /> SCAN QR CODE ADMIN
                </button>
                <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-100"></div><span className="text-[10px] font-black text-slate-300">ATAU KETIK ID</span><div className="flex-1 h-px bg-slate-100"></div></div>
                <input type="text" required value={klinikIdInput} onChange={e => setKlinikIdInput(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-blue-600 font-black tracking-widest outline-none focus:border-blue-400" placeholder="KL-XXXXXX" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95">
                {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <Zap size={18} />}
                {isLoading ? 'MENGHUBUNGKAN...' : 'TARIK DATA CLOUD'}
              </button>
              <button type="button" onClick={() => setView('LOGIN')} className="w-full text-xs font-black text-slate-400 flex items-center justify-center gap-2"><ArrowLeft size={14} /> Kembali</button>
            </form>
          )}

          {view === 'SCAN' && (
            <div className="space-y-4 animate-in fade-in">
              <div id="reader" className="overflow-hidden rounded-2xl border-4 border-blue-600"></div>
              <button onClick={stopScanner} className="w-full py-4 bg-rose-50 text-rose-600 font-black rounded-2xl flex items-center justify-center gap-2 text-xs uppercase"><X size={18} /> Batalkan Scan</button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
        <Cloud size={12} /> SYNC ENGINE V3.0 • READY
      </p>
    </div>
  );
};

export default Login;

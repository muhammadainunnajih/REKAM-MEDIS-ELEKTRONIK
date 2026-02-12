
import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCcw } from 'lucide-react';
import { AppUser } from '../types';

interface HeaderProps {
  onLogout: () => void;
  currentUser: AppUser | null;
  isSyncing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogout, currentUser, isSyncing }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sistem Rekam Medis Elektronik</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">Data Terpusat & Real-time</p>
            {isSyncing && (
               <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase animate-pulse">
                 <RefreshCcw size={10} className="animate-spin" /> Sinkronisasi...
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <p className="font-bold text-lg text-slate-800 tabular-nums">{formatTime(time)}</p>
          <p className="text-xs text-slate-500">{formatDate(time)}</p>
        </div>

        <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-sm text-slate-800 leading-tight">{currentUser?.name || 'Guest'}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{currentUser?.role || 'Unassigned'}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-200">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ml-2"
            title="Keluar"
          >
            <LogOut size={16} />
            <span className="hidden lg:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

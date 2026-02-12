
import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCcw, Cloud, CloudOff, CloudRain } from 'lucide-react';
import { AppUser } from '../types';

interface HeaderProps {
  onLogout: () => void;
  currentUser: AppUser | null;
  cloudStatus?: 'offline' | 'online' | 'syncing' | 'error';
  onSync?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, currentUser, cloudStatus = 'offline', onSync }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusInfo = () => {
    switch(cloudStatus) {
      case 'online': return { icon: Cloud, color: 'text-emerald-500', label: 'Terhubung' };
      case 'syncing': return { icon: RefreshCcw, color: 'text-blue-500 animate-spin', label: 'Sinkronisasi' };
      case 'error': return { icon: CloudRain, color: 'text-rose-500', label: 'Error' };
      default: return { icon: CloudOff, color: 'text-slate-400', label: 'Offline' };
    }
  };

  const status = getStatusInfo();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">EMR Dashboard</h2>
          <div className="flex items-center gap-3">
             <div 
              onClick={onSync}
              className={`flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-2 py-0.5 rounded transition-colors ${status.color}`}
              title="Klik untuk paksa sinkronisasi"
             >
               <status.icon size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Multi-Device Enabled</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <p className="font-bold text-lg text-slate-800 tabular-nums">
            {time.toLocaleTimeString('id-ID', { hour12: false })}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>

        <div className="h-10 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-sm text-slate-800 leading-tight">{currentUser?.name}</p>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">{currentUser?.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-90"
            title="Keluar"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

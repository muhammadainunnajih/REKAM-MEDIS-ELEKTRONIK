
import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
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
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Sistem Rekam Medis Elektronik</h2>
        <p className="text-sm text-slate-500">Kelola data pasien dan riwayat medis dengan mudah</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-bold text-lg text-slate-800 tabular-nums">{formatTime(time)}</p>
          <p className="text-xs text-slate-500">{formatDate(time)}</p>
        </div>

        <div className="h-10 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-sm text-slate-800">nizaramr</p>
            <p className="text-xs text-slate-500">Perawat</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

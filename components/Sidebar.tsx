
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Pill, 
  Wallet, 
  CalendarClock, 
  Package, 
  BarChart3, 
  UserCog, 
  Settings,
  HeartPulse
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  clinicName: string;
  clinicLogo: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, clinicName, clinicLogo }) => {
  const menuItems = [
    { type: ViewType.DASHBOARD, icon: LayoutDashboard },
    { type: ViewType.DATA_PASIEN, icon: Users },
    { type: ViewType.DATA_DOKTER, icon: Stethoscope },
    { type: ViewType.APOTEK, icon: Pill },
    { type: ViewType.KASIR, icon: Wallet },
    { type: ViewType.JADWAL, icon: CalendarClock },
    { type: ViewType.INVENTARIS, icon: Package },
    { type: ViewType.LAPORAN, icon: BarChart3 },
    { type: ViewType.USER_MGMT, icon: UserCog },
    { type: ViewType.PENGATURAN, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen shadow-sm">
      <div className="p-6 flex items-center gap-3">
        {clinicLogo ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
            <img src={clinicLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <HeartPulse size={24} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-bold text-slate-800 text-sm leading-tight truncate">{clinicName}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sistem EMR</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeView === item.type;
          return (
            <button
              key={item.type}
              onClick={() => onViewChange(item.type)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-50/50' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              {item.type}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-50">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Versi Aplikasi</p>
          <p className="text-[10px] text-slate-500 font-bold text-center">v2.1.0-STABLE</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

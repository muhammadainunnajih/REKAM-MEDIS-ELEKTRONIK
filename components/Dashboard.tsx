
import React from 'react';
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  Plus, 
  ChevronRight,
  Search,
  UserPlus
} from 'lucide-react';
import { Stats, Patient } from '../types';

interface DashboardProps {
  stats: Stats;
  latestPatients: Patient[];
  onViewAll: () => void;
  onAddPatient: () => void;
  clinicName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, latestPatients, onViewAll, onAddPatient, clinicName }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Selamat datang di {clinicName}</p>
        </div>
        <button 
          onClick={onAddPatient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          Tambah Pasien Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-start group hover:border-blue-200 transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pasien</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.totalPatients}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-start group hover:border-emerald-200 transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Rekam Medis</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.totalMedicalRecords}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-start group hover:border-orange-200 transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pasien Hari Ini</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.patientsToday}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Patients Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-black text-slate-800 uppercase tracking-tight text-sm">Pasien Baru Terdaftar</h2>
            <button onClick={onViewAll} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {latestPatients.length > 0 ? latestPatients.map((patient) => (
              <div key={patient.rmNumber} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{patient.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">No. RM: {patient.rmNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-300 uppercase">{patient.lastVisit}</span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            )) : (
              <div className="p-20 text-center text-slate-300">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase">Belum ada data pasien.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Menu */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col">
          <h2 className="font-black text-slate-800 mb-8 uppercase tracking-tight text-sm">Aksi Cepat</h2>
          <div className="space-y-4 flex-1">
            <button 
              onClick={onViewAll}
              className="w-full flex items-center gap-4 p-5 rounded-3xl hover:bg-blue-50 transition-all group border-2 border-slate-50 hover:border-blue-100"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Search size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 text-sm">Cari Pasien</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Kelola Database</p>
              </div>
            </button>

            <button 
              onClick={onAddPatient}
              className="w-full flex items-center gap-4 p-5 rounded-3xl hover:bg-emerald-50 transition-all group border-2 border-slate-50 hover:border-emerald-100"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <UserPlus size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 text-sm">Daftar Baru</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Registrasi Pasien</p>
              </div>
            </button>
          </div>
          
          <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Tips Hari Ini</p>
            <p className="text-xs leading-relaxed font-medium">"Selalu pastikan nomor telepon pasien terverifikasi untuk pengiriman notifikasi resep."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

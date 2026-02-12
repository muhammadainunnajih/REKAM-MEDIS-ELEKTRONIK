
import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, User, Stethoscope, Clock, 
  CheckCircle2, Volume2, SkipForward, XCircle, 
  Filter, Play, Timer, UserCheck, History
} from 'lucide-react';
import { QueueItem } from '../types';

interface ScheduleProps {
  queue: QueueItem[];
  onUpdateStatus: (id: string, status: QueueItem['status']) => void;
  onCallPatient: (id: string) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ queue, onUpdateStatus, onCallPatient }) => {
  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Umum' | 'Gigi' | 'Selesai'>('Semua');

  const currentCalling = useMemo(() => {
    return queue.find(q => q.status === 'Diperiksa');
  }, [queue]);

  const nextInQueue = useMemo(() => {
    return queue.find(q => q.status === 'Menunggu');
  }, [queue]);

  const filteredQueue = useMemo(() => {
    if (activeFilter === 'Selesai') return queue.filter(q => q.status === 'Selesai');
    
    let list = queue.filter(q => q.status !== 'Selesai' && q.status !== 'Batal');
    if (activeFilter === 'Umum') return list.filter(q => q.poli === 'Umum');
    if (activeFilter === 'Gigi') return list.filter(q => q.poli === 'Gigi');
    return list;
  }, [queue, activeFilter]);

  const poliStats = useMemo(() => {
    const umum = queue.filter(q => q.poli === 'Umum' && q.status !== 'Selesai').length;
    const gigi = queue.filter(q => q.poli === 'Gigi' && q.status !== 'Selesai').length;
    return { umum, gigi };
  }, [queue]);

  const handleCall = (item: QueueItem) => {
    const utterance = new SpeechSynthesisUtterance(`Nomor antrian ${item.no}, ${item.patientName}, silahkan menuju Poli ${item.poli}`);
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);
    
    onCallPatient(item.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jadwal & Antrian</h1>
          <p className="text-slate-500">Sistem otomatis: Antrian diproses saat rekam medis disimpan</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {nextInQueue ? (
            <button 
              onClick={() => handleCall(nextInQueue)}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <Volume2 size={20} /> Panggil Antrian Selanjutnya
            </button>
          ) : (
            <div className="bg-slate-100 text-slate-400 px-6 py-2.5 rounded-xl font-bold italic text-sm">
              Tidak ada antrian menunggu
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Active Call Status Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-blue-50/50 text-center relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 relative z-10">Antrian Sekarang</p>
            {currentCalling ? (
              <div className="animate-in zoom-in duration-300 relative z-10">
                <div className="inline-block p-4 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-200 mb-4 animate-pulse">
                  <h2 className="text-5xl font-black">{currentCalling.no}</h2>
                </div>
                <h3 className="text-lg font-black text-slate-800">{currentCalling.patientName}</h3>
                <p className="text-xs font-bold text-blue-500 bg-blue-50 inline-block px-3 py-1 rounded-full mt-1">Poli {currentCalling.poli}</p>
                <p className="text-[10px] text-slate-400 mt-4 italic font-medium">Input rekam medis di menu Data Pasien untuk selesaikan antrian ini.</p>
                <div className="mt-6 flex gap-2 justify-center">
                   <button 
                    onClick={() => handleCall(currentCalling)}
                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="Panggil Ulang Suara"
                   >
                     <Volume2 size={20} />
                   </button>
                   <button 
                    onClick={() => onUpdateStatus(currentCalling.id, 'Selesai')}
                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                    title="Selesaikan Manual"
                   >
                     <CheckCircle2 size={20} />
                   </button>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <Timer size={48} className="mx-auto text-slate-100 mb-2" />
                <p className="text-sm font-bold text-slate-300">Menunggu Panggilan</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserCheck size={14}/> Kapasitas Poli Aktif
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-700">Poli Umum</span>
                  <span className="text-xs font-black text-blue-600">{poliStats.umum}/20</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${(poliStats.umum / 20) * 100}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-700">Poli Gigi</span>
                  <span className="text-xs font-black text-emerald-600">{poliStats.gigi}/10</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(poliStats.gigi / 10) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CalendarClock size={20}/></div>
              <h2 className="font-black text-slate-800 uppercase tracking-tight">Antrian Terdaftar</h2>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['Semua', 'Umum', 'Gigi', 'Selesai'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    activeFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-50">
            {filteredQueue.length > 0 ? (
              filteredQueue.map(item => (
                <div 
                  key={item.id} 
                  className={`px-6 py-5 flex items-center justify-between transition-all group ${
                    item.status === 'Diperiksa' ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      item.status === 'Diperiksa' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 
                      item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                      'bg-white border border-slate-200 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-black leading-none mb-0.5">NO</span>
                      <span className="text-xl font-black">{item.no}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-base">{item.patientName}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <Stethoscope size={12} className="text-blue-400"/> Poli {item.poli}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <Clock size={12} className="text-orange-400"/> {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                      item.status === 'Diperiksa' ? 'bg-blue-100 text-blue-700 animate-pulse' : 
                      item.status === 'Menunggu' ? 'bg-slate-100 text-slate-500' : 
                      item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.status}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status === 'Menunggu' && (
                        <button 
                          onClick={() => handleCall(item)}
                          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md active:scale-90"
                          title="Panggil Sekarang"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                      )}
                      {item.status !== 'Selesai' && (
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'Batal')}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          title="Batalkan"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center">
                {activeFilter === 'Selesai' ? <History size={64} className="mx-auto text-slate-100 mb-4" /> : <CalendarClock size={64} className="mx-auto text-slate-100 mb-4" />}
                <p className="font-bold text-slate-400">Tidak ada data untuk filter ini.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Antrian Hari Ini: <span className="text-slate-800">{queue.length}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;

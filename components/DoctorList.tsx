
import React, { useState, useMemo } from 'react';
import { Search, Plus, Clock, Edit2, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorListProps {
  doctors: Doctor[];
  onAdd: (doctor: Doctor) => void;
  onUpdate: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
}

type ModalMode = 'add' | 'edit';

const DoctorList: React.FC<DoctorListProps> = ({ doctors, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  const openModal = (mode: ModalMode, doctor: Doctor | null = null) => {
    setModalMode(mode);
    setSelectedDoctor(doctor || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      specialization: '',
      status: 'Tersedia',
      patientsToday: 0
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    if (modalMode === 'add') {
      onAdd(selectedDoctor);
    } else {
      onUpdate(selectedDoctor);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (doctorToDelete) {
      onDelete(doctorToDelete.id);
      setIsDeleteModalOpen(false);
      setDoctorToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Dokter</h1>
          <p className="text-slate-500">Kelola jadwal dan ketersediaan tenaga medis</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau spesialisasi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => openModal('add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md shadow-blue-100 whitespace-nowrap"
          >
            <Plus size={20} />
            Tambah Dokter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doc => (
            <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-blue-200 transition-all relative">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                  onClick={() => openModal('edit', doc)}
                  className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => confirmDelete(doc)}
                  className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                  {doc.name.split(' ').filter(n => n.length > 3)[0]?.charAt(0) || doc.name.charAt(4)}
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  doc.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-700' : 
                  doc.status === 'Sibuk' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {doc.status}
                </span>
              </div>

              <div className="pt-2">
                <h3 className="font-bold text-slate-800 line-clamp-1">{doc.name}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{doc.specialization}</p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-slate-300"/> 
                  {doc.patientsToday} Pasien Hari Ini
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Data dokter tidak ditemukan.
          </div>
        )}
      </div>

      {/* Modal Add / Edit Dokter */}
      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">
                {modalMode === 'add' ? 'Tambah Dokter Baru' : 'Edit Data Dokter'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={selectedDoctor.name}
                  onChange={(e) => setSelectedDoctor({...selectedDoctor, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                  placeholder="Contoh: dr. John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spesialisasi / Poli</label>
                <input 
                  type="text" required
                  value={selectedDoctor.specialization}
                  onChange={(e) => setSelectedDoctor({...selectedDoctor, specialization: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                  placeholder="Contoh: Poli Umum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select 
                    value={selectedDoctor.status}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, status: e.target.value as any})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Sibuk">Sibuk</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pasien Hari Ini</label>
                  <input 
                    type="number"
                    value={selectedDoctor.patientsToday}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, patientsToday: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Save size={18} />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Dokter */}
      {isDeleteModalOpen && doctorToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Data Dokter?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus <strong>{doctorToDelete.name}</strong>? Data jadwal terkait mungkin akan terpengaruh.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={executeDelete}
                  className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-md shadow-rose-100"
                >
                  Ya, Hapus Sekarang
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;

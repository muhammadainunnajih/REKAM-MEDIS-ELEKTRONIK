
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Edit2, Trash2, Eye, X, Save, 
  UserPlus, AlertTriangle, ClipboardList, Plus, 
  ChevronDown, ChevronUp, History, Stethoscope, BadgeCheck, CreditCard
} from 'lucide-react';
import { Patient, MedicalEntry } from '../types';

interface PatientListProps {
  patients: Patient[];
  medicalRecords: MedicalEntry[];
  onUpdate: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onAdd: (patient: Patient) => void;
  onAddMedicalRecord: (record: MedicalEntry) => void;
  onUpdateMedicalRecord: (record: MedicalEntry) => void;
  onDeleteMedicalRecord: (id: string) => void;
}

type ModalMode = 'view' | 'edit' | 'add';

const PatientList: React.FC<PatientListProps> = ({ 
  patients, medicalRecords, onUpdate, onDelete, onAdd, onAddMedicalRecord, onUpdateMedicalRecord, onDeleteMedicalRecord 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Rekam Medis
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<MedicalEntry>>({
    doctorName: 'dr. Andi Wijaya',
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // State Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.rmNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const openModal = (mode: ModalMode, patient: Patient | null = null) => {
    setModalMode(mode);
    setSelectedPatient(patient || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      rmNumber: `RM${Date.now()}`,
      birthDate: '',
      gender: 'Laki-laki',
      lastVisit: new Date().toLocaleDateString('id-ID'),
      type: 'Umum'
    });
    setIsModalOpen(true);
  };

  const openMedicalModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsMedicalModalOpen(true);
    setIsAddingEntry(false);
    setEditingEntryId(null);
  };

  const handleAddMedicalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (editingEntryId) {
      // Update existing
      const entry: MedicalEntry = {
        id: editingEntryId,
        patientId: selectedPatient.id,
        date: newEntry.date || new Date().toLocaleDateString('id-ID'),
        doctorName: newEntry.doctorName || 'Dokter Umum',
        subjective: newEntry.subjective || '',
        objective: newEntry.objective || '',
        assessment: newEntry.assessment || '',
        plan: newEntry.plan || '',
        isProcessed: newEntry.isProcessed
      };
      onUpdateMedicalRecord(entry);
    } else {
      // Add new
      const entry: MedicalEntry = {
        id: `mr-${Date.now()}`,
        patientId: selectedPatient.id,
        date: new Date().toLocaleDateString('id-ID'),
        doctorName: newEntry.doctorName || 'Dokter Umum',
        subjective: newEntry.subjective || '',
        objective: newEntry.objective || '',
        assessment: newEntry.assessment || '',
        plan: newEntry.plan || ''
      };
      onAddMedicalRecord(entry);
    }

    setIsAddingEntry(false);
    setEditingEntryId(null);
    setNewEntry({
      doctorName: 'dr. Andi Wijaya',
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    });
  };

  const startEditMedicalEntry = (record: MedicalEntry) => {
    setEditingEntryId(record.id);
    setNewEntry({ ...record });
    setIsAddingEntry(true);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Hapus catatan medis ini?')) {
      onDeleteMedicalRecord(id);
    }
  };

  const confirmDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (patientToDelete) {
      onDelete(patientToDelete.id);
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (modalMode === 'add') onAdd(selectedPatient);
    else onUpdate(selectedPatient);
    setIsModalOpen(false);
  };

  const currentPatientRecords = useMemo(() => {
    if (!selectedPatient) return [];
    return medicalRecords.filter(mr => mr.patientId === selectedPatient.id);
  }, [medicalRecords, selectedPatient]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Pasien</h1>
          <p className="text-slate-500">Daftar seluruh pasien terdaftar di Klinik Sehat</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau No. RM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Pasien Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Informasi Pasien</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori Pasien</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Rekam Medis</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Lahir / Gender</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 w-fit ${
                          patient.type === 'BPJS' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {patient.type === 'BPJS' ? <BadgeCheck size={12} /> : <CreditCard size={12} />}
                          {patient.type}
                        </span>
                        {patient.type === 'BPJS' && patient.bpjsClass && (
                          <span className="text-[10px] text-slate-400 font-bold ml-1 italic">{patient.bpjsClass}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{patient.rmNumber}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-700">{patient.birthDate}</p>
                        <p className="text-xs text-slate-400">{patient.gender}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openMedicalModal(patient)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                          title="Rekam Medis"
                        >
                          <ClipboardList size={16} />
                          <span className="hidden group-hover:inline ml-1">Rekam Medis</span>
                        </button>
                        <button onClick={() => openModal('view', patient)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md"><Eye size={16} /></button>
                        <button onClick={() => openModal('edit', patient)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md"><Edit2 size={16} /></button>
                        <button onClick={() => confirmDelete(patient)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Data pasien tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rekam Medis (EMR) */}
      {isMedicalModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ClipboardList size={20}/></div>
                <div>
                  <h3 className="font-bold text-slate-800">Rekam Medis Pasien</h3>
                  <p className="text-xs text-slate-500">{selectedPatient.name} • {selectedPatient.rmNumber} ({selectedPatient.type}{selectedPatient.bpjsClass ? ` - ${selectedPatient.bpjsClass}` : ''})</p>
                </div>
              </div>
              <button onClick={() => setIsMedicalModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Kunjungan</p>
                  <p className="text-2xl font-black text-slate-800">{currentPatientRecords.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Umur</p>
                  <p className="text-2xl font-black text-slate-800">
                    {new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear()} Th
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-end items-center">
                  {!isAddingEntry && (
                    <button 
                      onClick={() => {
                        setIsAddingEntry(true);
                        setEditingEntryId(null);
                        setNewEntry({
                          doctorName: 'dr. Andi Wijaya',
                          subjective: '',
                          objective: '',
                          assessment: '',
                          plan: ''
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                      <Plus size={18} /> Buat Rekam Medis Baru
                    </button>
                  )}
                </div>
              </div>

              {/* Form Tambah/Edit Entry Baru (SOAP) */}
              {isAddingEntry && (
                <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
                  <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2">
                      <Stethoscope size={18}/> {editingEntryId ? 'Edit Catatan Medis' : 'Input Catatan Medis'} (SOAP)
                    </h4>
                    <button onClick={() => { setIsAddingEntry(false); setEditingEntryId(null); }} className="text-blue-400 hover:text-blue-600"><X size={18}/></button>
                  </div>
                  <form onSubmit={handleAddMedicalEntry} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Dokter Pemeriksa</label>
                        <input 
                          type="text" 
                          required
                          value={newEntry.doctorName}
                          onChange={e => setNewEntry({...newEntry, doctorName: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Tanggal Kunjungan</label>
                        <input type="text" disabled value={newEntry.date || new Date().toLocaleDateString('id-ID')} className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-lg text-sm text-slate-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Subjective (S) - Keluhan Pasien</label>
                        <textarea 
                          rows={2}
                          required
                          value={newEntry.subjective}
                          onChange={e => setNewEntry({...newEntry, subjective: e.target.value})}
                          placeholder="Contoh: Batuk berdahak, demam malam hari..."
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        ></textarea>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Objective (O) - Hasil Pemeriksaan</label>
                        <textarea 
                          rows={2}
                          value={newEntry.objective}
                          onChange={e => setNewEntry({...newEntry, objective: e.target.value})}
                          placeholder="Contoh: TD 110/70, Suhu 37C, Ronchi (+)"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        ></textarea>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Assessment (A) - Diagnosa</label>
                        <textarea 
                          rows={2}
                          required
                          value={newEntry.assessment}
                          onChange={e => setNewEntry({...newEntry, assessment: e.target.value})}
                          placeholder="Contoh: ISPA / Pharyngitis Akut"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        ></textarea>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Plan (P) - Terapi / Resep</label>
                        <textarea 
                          rows={2}
                          required
                          value={newEntry.plan}
                          onChange={e => setNewEntry({...newEntry, plan: e.target.value})}
                          placeholder="Contoh: Amoxicillin 500mg 3x1, PCT 500mg prn"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setIsAddingEntry(false); setEditingEntryId(null); }} className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Batal</button>
                      <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">
                        {editingEntryId ? 'Perbarui Catatan Medis' : 'Simpan Catatan Medis'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Daftar Riwayat Medis */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <History size={18}/> Riwayat Kunjungan
                </h4>
                {currentPatientRecords.length > 0 ? (
                  currentPatientRecords.map((record, index) => (
                    <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
                      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white group-hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                            {currentPatientRecords.length - index}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{record.date}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">Pemeriksa: <span className="text-blue-600 font-semibold">{record.doctorName}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditMedicalEntry(record)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Rekam Medis"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEntry(record.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Rekam Medis"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase">Selesai</span>
                        </div>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subjective (S)</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{record.subjective}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Objective (O)</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{record.objective}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Assessment (A)</p>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed">{record.assessment}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Plan (P)</p>
                            <p className="text-sm text-slate-700 italic leading-relaxed">{record.plan}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <History size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400">Belum ada riwayat rekam medis untuk pasien ini.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-white text-right">
              <button onClick={() => setIsMedicalModalOpen(false)} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal View / Edit / Add Pasien (Updated with Type & Class) */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">
                {modalMode === 'add' ? 'Tambah Pasien Baru' : modalMode === 'edit' ? 'Edit Data Pasien' : 'Detail Pasien'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" required disabled={modalMode === 'view'}
                  value={selectedPatient.name}
                  onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Pasien</label>
                  <select 
                    disabled={modalMode === 'view'}
                    value={selectedPatient.type}
                    onChange={(e) => {
                      const type = e.target.value as 'Umum' | 'BPJS';
                      setSelectedPatient({...selectedPatient, type, bpjsClass: type === 'BPJS' ? 'Kelas 3' : undefined});
                    }}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >
                    <option value="Umum">Umum</option>
                    <option value="BPJS">BPJS Kesehatan</option>
                  </select>
                </div>

                {selectedPatient.type === 'BPJS' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelas BPJS</label>
                    <select 
                      disabled={modalMode === 'view'}
                      value={selectedPatient.bpjsClass}
                      onChange={(e) => setSelectedPatient({...selectedPatient, bpjsClass: e.target.value as any})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                    >
                      <option value="Kelas 1">Kelas 1</option>
                      <option value="Kelas 2">Kelas 2</option>
                      <option value="Kelas 3">Kelas 3</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Rekam Medis</label>
                  <input type="text" disabled value={selectedPatient.rmNumber} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Kelamin</label>
                  <select 
                    disabled={modalMode === 'view'}
                    value={selectedPatient.gender}
                    onChange={(e) => setSelectedPatient({...selectedPatient, gender: e.target.value as any})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Lahir</label>
                  <input 
                    type="date" required disabled={modalMode === 'view'}
                    value={selectedPatient.birthDate}
                    onChange={(e) => setSelectedPatient({...selectedPatient, birthDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kunjungan Terakhir</label>
                  <input type="text" disabled value={selectedPatient.lastVisit} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                {modalMode !== 'view' && (
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700">
                    <Save size={18} /> Simpan Data
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus (Existing) */}
      {isDeleteModalOpen && patientToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Data Pasien?</h3>
            <p className="text-sm text-slate-500 mb-6">Apakah Anda yakin menghapus <strong>{patientToDelete.name}</strong>? Tindakan ini menghapus seluruh riwayat medisnya.</p>
            <div className="flex flex-col gap-2">
              <button onClick={executeDelete} className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700">Ya, Hapus Sekarang</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;

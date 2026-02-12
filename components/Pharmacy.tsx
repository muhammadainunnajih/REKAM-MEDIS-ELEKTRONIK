
import React, { useState, useMemo } from 'react';
import { 
  Pill, Search, Package, ShoppingCart, Clock, Plus, Edit2, 
  Trash2, X, Save, AlertTriangle, FileText, ChevronRight, 
  CheckCircle2, Beaker, ArrowRight, Volume2, UserSearch, Timer
} from 'lucide-react';
import { Medicine, MedicalEntry, QueueItem, Patient } from '../types';

interface PharmacyProps {
  medicines: Medicine[];
  medicalRecords: MedicalEntry[];
  queue: QueueItem[];
  patients: Patient[];
  onAdd: (medicine: Medicine) => void;
  onUpdate: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
  onProcessPrescription: (recordId: string, medicineId: string, quantity: number) => void;
}

type ModalMode = 'add' | 'edit';

const Pharmacy: React.FC<PharmacyProps> = ({ 
  medicines, medicalRecords, queue, patients, onAdd, onUpdate, onDelete, onProcessPrescription 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  
  // State Penyiapan Obat (Multi-item Support)
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<MedicalEntry | null>(null);
  const [prepItems, setPrepItems] = useState<{ medicineId: string; quantity: number }[]>([
    { medicineId: '', quantity: 1 }
  ]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medicines, searchTerm]);

  const unprocessedCount = useMemo(() => {
    return medicalRecords.filter(mr => !mr.isProcessed).length;
  }, [medicalRecords]);

  const lowStockCount = useMemo(() => {
    return medicines.filter(m => m.stock < 100).length;
  }, [medicines]);

  const patientsBeingExamined = useMemo(() => {
    const examinedPatientIds = queue
      .filter(q => q.status === 'Diperiksa')
      .map(q => q.patientId);
    
    return patients.filter(p => examinedPatientIds.includes(p.id));
  }, [queue, patients]);

  const openModal = (mode: ModalMode, medicine: Medicine | null = null) => {
    setModalMode(mode);
    setSelectedMedicine(medicine || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      stock: 0,
      price: 0,
      category: 'Tablet',
      type: 'Tablet'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    if (modalMode === 'add') onAdd(selectedMedicine);
    else onUpdate(selectedMedicine);
    setIsModalOpen(false);
  };

  const confirmDelete = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (medicineToDelete) {
      onDelete(medicineToDelete.id);
      setIsDeleteModalOpen(false);
      setMedicineToDelete(null);
    }
  };

  // --- MULTI-ITEM PREP LOGIC ---
  const openPrepModal = (record: MedicalEntry) => {
    setActiveRecipe(record);
    // Initial guess for the first item
    const guessedMedicine = medicines.find(m => record.plan.toLowerCase().includes(m.name.toLowerCase()));
    setPrepItems([
      { medicineId: guessedMedicine?.id || '', quantity: 10 }
    ]);
    setIsPrepModalOpen(true);
  };

  const handleAddPrepItem = () => {
    setPrepItems([...prepItems, { medicineId: '', quantity: 1 }]);
  };

  const handleRemovePrepItem = (index: number) => {
    if (prepItems.length === 1) return;
    setPrepItems(prepItems.filter((_, i) => i !== index));
  };

  const handleUpdatePrepItem = (index: number, field: 'medicineId' | 'quantity', value: any) => {
    const newItems = [...prepItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPrepItems(newItems);
  };

  const handleExecutePrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecipe) return;

    // Filter valid items
    const validItems = prepItems.filter(item => item.medicineId !== '' && item.quantity > 0);
    
    if (validItems.length === 0) {
      alert("Pilih minimal satu obat yang valid.");
      return;
    }

    // Process all items
    validItems.forEach(item => {
      onProcessPrescription(
        activeRecipe.id,
        item.medicineId,
        item.quantity
      );
    });

    setIsPrepModalOpen(false);
    setActiveRecipe(null);
  };

  const handleCallPatient = (record: MedicalEntry) => {
    const patient = patients.find(p => p.id === record.patientId);
    const queueInfo = queue.find(q => q.patientId === record.patientId);
    
    if (patient) {
      const queueNo = queueInfo ? queueInfo.no : '';
      const message = `Antrian nomor ${queueNo}, ${patient.name}, silakan mengambil obat di loket Apotek.`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Apotek</h1>
          <p className="text-slate-500">Manajemen stok obat dan resep pasien terintegrasi</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsRecipeModalOpen(true)}
            className="relative flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <FileText size={18} className="text-blue-500" />
            Lihat Resep
            {unprocessedCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unprocessedCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => openModal('add')}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Input Stok Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h2 className="font-black text-slate-800 uppercase tracking-tight text-sm">Inventori Obat Aktif</h2>
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari obat atau kategori..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400 transition-all" 
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Informasi Obat</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map(item => (
                    <tr key={item.id} className="text-sm hover:bg-slate-50/50 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${item.stock < 100 ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                            <Pill size={18} />
                          </div>
                          <div>
                            <p className="font-black text-slate-700">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Rp {item.price.toLocaleString('id-ID')} / unit</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-lg ${item.stock < 100 ? 'text-rose-500' : 'text-slate-800'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('edit', item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 size={16} /></button>
                          <button onClick={() => confirmDelete(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Data tidak tersedia</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-tight">Kondisi Apotek</h3>
            <div className="space-y-4">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                   <Package size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Katalog Obat</p>
                   <p className="text-2xl font-black text-blue-900">{medicines.length}</p>
                 </div>
              </div>

              <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                lowStockCount > 0 ? 'bg-rose-50/50 border-rose-100 animate-pulse' : 'bg-slate-50/50 border-slate-100'
              }`}>
                 <div className={`w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                   <AlertTriangle size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Kritis</p>
                   <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-900' : 'text-slate-600'}`}>{lowStockCount}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Daftar Resep TERINTEGRASI */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><FileText size={24}/></div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Monitoring Resep & Antrian</h3>
                  <p className="text-xs text-slate-500 font-medium">Data real-time dari poli pemeriksaan</p>
                </div>
              </div>
              <button onClick={() => setIsRecipeModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Timer size={14} className="text-orange-400" /> Sedang Diperiksa di Poli (Menunggu Resep)
                  </h4>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full">{patientsBeingExamined.length} PASIEN</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {patientsBeingExamined.length > 0 ? (
                    patientsBeingExamined.map((patient) => {
                      const q = queue.find(qi => qi.patientId === patient.id);
                      return (
                        <div key={patient.id} className="bg-white p-4 rounded-2xl border-2 border-dashed border-orange-100 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center font-black">
                                {q?.no}
                             </div>
                             <div>
                               <p className="text-sm font-bold text-slate-700">{patient.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">Lokasi: Poli {q?.poli}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                             <span className="text-[10px] font-black text-orange-400 uppercase">Proses...</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-6 text-center text-slate-300 italic text-xs font-bold border-2 border-dashed border-slate-100 rounded-2xl">
                      Tidak ada pasien di ruang periksa saat ini.
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500" /> Resep Siap Diproses (Dari Dokter)
                  </h4>
                  <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{medicalRecords.length} TOTAL</span>
                </div>

                <div className="space-y-3">
                  {[...medicalRecords].sort((a, b) => b.id.localeCompare(a.id)).map((record) => {
                    const patient = patients.find(p => p.id === record.patientId);
                    const queueInfo = queue.find(q => q.patientId === record.patientId);
                    return (
                      <div key={record.id} className={`bg-white p-5 rounded-2xl border-2 transition-all ${
                        !record.isProcessed ? 'border-blue-400 shadow-md ring-4 ring-blue-50 animate-in slide-in-from-left-4' : 'border-slate-100'
                      }`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-sm">{queueInfo?.no || 'RM'}</span>
                              <h5 className="font-black text-slate-800">{patient?.name}</h5>
                              {!record.isProcessed && (
                                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Baru</span>
                              )}
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                               <p className="text-xs text-slate-600 font-bold italic leading-relaxed">" {record.plan} "</p>
                            </div>
                            <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               <span>Dokter: {record.doctorName}</span>
                               <span>•</span>
                               <span>Jam: {record.date}</span>
                            </div>
                          </div>
                          
                          <div className="flex shrink-0 gap-2">
                            {record.isProcessed ? (
                              <>
                                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                  <CheckCircle2 size={14} /> OBAT SELESAI
                                </div>
                                <button 
                                  onClick={() => handleCallPatient(record)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all active:scale-90 shadow-lg shadow-blue-100 flex items-center gap-2"
                                  title="Panggil Ambil Obat"
                                >
                                  <Volume2 size={16} />
                                  <span className="text-[10px] font-black uppercase">Panggil</span>
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => openPrepModal(record)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group"
                              >
                                Siapkan Obat Sekarang <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-200 bg-white flex justify-between items-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem EMR - Integrasi Farmasi</p>
               <button onClick={() => setIsRecipeModalOpen(false)} className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all">Selesai / Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Penyiapan Obat (Multi-item Support) */}
      {isPrepModalOpen && activeRecipe && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><Beaker size={20}/><h3 className="font-bold">Penyiapan Resep Multi-Item</h3></div>
              <button onClick={() => setIsPrepModalOpen(false)} className="text-white/60 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleExecutePrep} className="p-8 space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Resep Dokter:</p>
                <p className="text-sm font-bold text-slate-700 italic">"{activeRecipe.plan}"</p>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Obat Yang Disiapkan</label>
                  <button 
                    type="button" 
                    onClick={handleAddPrepItem}
                    className="text-blue-600 text-xs font-black flex items-center gap-1 hover:underline uppercase tracking-tighter"
                  >
                    <Plus size={14}/> Tambah Obat
                  </button>
                </div>
                
                {prepItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end bg-slate-50/50 p-3 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Pilih Obat</label>
                      <select 
                        required
                        value={item.medicineId}
                        onChange={e => handleUpdatePrepItem(index, 'medicineId', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="">-- Pilih Obat --</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                            {m.name} (Sisa: {m.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24 space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Jumlah</label>
                      <input 
                        type="number" required min="1"
                        value={item.quantity}
                        onChange={e => handleUpdatePrepItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-white"
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleRemovePrepItem(index)}
                      className={`p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all ${prepItems.length === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsPrepModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 text-xs uppercase tracking-widest transition-all">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all">
                  Selesaikan Penyiapan <ArrowRight size={18}/>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Existing Hapus Modal */}
      {isDeleteModalOpen && medicineToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Item Obat?</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Data <strong>{medicineToDelete.name}</strong> akan hilang dari database.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest">Ya, Hapus Sekarang</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest">Batalkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;

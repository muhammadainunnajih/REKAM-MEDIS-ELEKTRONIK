
import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, 
  Cloud, 
  Save, 
  RefreshCcw, 
  Upload, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Database, 
  DownloadCloud, 
  UploadCloud, 
  Trash2, 
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  ChevronDown
} from 'lucide-react';
import { ClinicSettings, Patient, Doctor, Medicine, InventoryItem, Transaction, AppUser, MedicalEntry, QueueItem } from '../types';

interface SettingsProps {
  clinicSettings: ClinicSettings;
  onUpdateClinicSettings: (settings: ClinicSettings) => void;
  patients: Patient[]; 
  doctors: Doctor[]; 
  medicines: Medicine[]; 
  inventory: InventoryItem[]; 
  transactions: Transaction[]; 
  users: AppUser[]; 
  medicalRecords: MedicalEntry[];
  queue: QueueItem[];
  setPatients: (p: Patient[]) => void; 
  setDoctors: (d: Doctor[]) => void; 
  setMedicines: (m: Medicine[]) => void; 
  setInventory: (i: InventoryItem[]) => void; 
  setTransactions: (t: Transaction[]) => void; 
  setUsers: (u: AppUser[]) => void; 
  setMedicalRecords: (mr: MedicalEntry[]) => void;
  setQueue: (q: QueueItem[]) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  clinicSettings, onUpdateClinicSettings, 
  patients, doctors, medicines, inventory, transactions, users, medicalRecords, queue,
  setPatients, setDoctors, setMedicines, setInventory, setTransactions, setUsers, setMedicalRecords, setQueue,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'Profil' | 'Tampilan' | 'Cloud' | 'Data'>('Profil');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSettings, setLocalSettings] = useState<ClinicSettings>({ ...clinicSettings });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocalSettings({ ...clinicSettings }); }, [clinicSettings]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateClinicSettings(localSettings);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const registerNewCloudId = async () => {
    setIsGenerating(true);
    try {
      const dataToSync = { 
        clinicSettings: { ...localSettings, isCloudEnabled: true }, 
        users, patients, doctors, medicines, inventory, transactions, medicalRecords, queue,
        lastSync: new Date().toISOString()
      };

      const response = await fetch('https://api.npoint.io/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync)
      });

      if (!response.ok) throw new Error("Network Error");
      const result = await response.json();
      
      if (result && result.id) {
        const newSettings = { ...localSettings, klinikId: result.id, isCloudEnabled: true };
        setLocalSettings(newSettings);
        onUpdateClinicSettings(newSettings);
        alert(`BERHASIL! Simpan ID Klinik ini: ${result.id}\nGunakan ID ini untuk menghubungkan perangkat lain.`);
      }
    } catch (error) {
      alert("Gagal membuat ID Cloud. Periksa koneksi internet Anda.");
    } finally { setIsGenerating(false); }
  };

  const handleBackup = () => {
    const fullData = {
      clinicSettings, patients, doctors, medicines, inventory, transactions, users, medicalRecords, queue,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_EMR_${clinicSettings.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm("Peringatan: Impor data akan menimpa data saat ini. Lanjutkan?")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.clinicSettings) onUpdateClinicSettings(data.clinicSettings);
          if (data.patients) setPatients(data.patients);
          if (data.doctors) setDoctors(data.doctors);
          if (data.medicines) setMedicines(data.medicines);
          if (data.inventory) setInventory(data.inventory);
          if (data.transactions) setTransactions(data.transactions);
          if (data.users) setUsers(data.users);
          if (data.medicalRecords) setMedicalRecords(data.medicalRecords);
          if (data.queue) setQueue(data.queue);
          alert("Data berhasil dipulihkan!");
        } catch (err) {
          alert("Gagal membaca file backup. Pastikan format file valid.");
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleFactoryReset = () => {
    if (resetConfirmText.toLowerCase() === 'hapus semua data') {
      localStorage.clear();
      alert("Seluruh data telah dihapus. Aplikasi akan dimuat ulang.");
      onLogout();
      window.location.reload();
    } else {
      alert("Konfirmasi tidak valid.");
    }
  };

  const timezones = [
    { value: 'Asia/Jakarta', label: 'WIB (Asia/Jakarta)' },
    { value: 'Asia/Makassar', label: 'WITA (Asia/Makassar)' },
    { value: 'Asia/Jayapura', label: 'WIT (Asia/Jayapura)' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Konfigurasi Klinik & Pemeliharaan Data</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in slide-in-from-right-4">
            <CheckCircle2 size={14} /> PENGATURAN DISIMPAN!
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-72 bg-slate-50/50 border-r border-slate-100 p-6 space-y-2">
          <button onClick={() => setActiveTab('Profil')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Profil' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}>
            <Building2 size={18} /> Profil Klinik
          </button>
          <button onClick={() => setActiveTab('Tampilan')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Tampilan' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}>
            <Globe size={18} /> Regional & Waktu
          </button>
          <button onClick={() => setActiveTab('Cloud')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Cloud' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}>
            <Cloud size={18} /> Cloud Sync
          </button>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button onClick={() => setActiveTab('Data')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Data' ? 'bg-rose-600 text-white shadow-xl shadow-rose-100' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}>
              <Database size={18} /> Pemeliharaan Data
            </button>
          </div>
        </div>

        <div className="flex-1 p-10 overflow-y-auto">
          {activeTab === 'Profil' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Logo Klinik</label>
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-[2rem] border-4 border-slate-50 bg-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
                      {localSettings.logo ? (
                        <img src={localSettings.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={48} className="text-slate-300" />
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-blue-600/60 text-white opacity-0 group-hover:opacity-100 transition-all rounded-[2rem] flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
                    >
                      <Upload size={24} />
                      <span className="text-[10px] font-black uppercase">Ganti Logo</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Klinik</label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input type="text" value={localSettings.name} onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Kontak</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input type="email" value={localSettings.email} onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input type="text" value={localSettings.phone} onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Klinik Lengkap</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-5 text-slate-300" />
                      <textarea rows={3} value={localSettings.address} onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Tampilan' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600"><Globe size={32} /></div>
                 <div>
                   <h3 className="text-lg font-black text-slate-800">Preferensi Regional</h3>
                   <p className="text-sm text-slate-500 font-medium">Atur format waktu dan zona operasional klinik Anda.</p>
                 </div>
               </div>

               <div className="max-w-md space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zona Waktu (Timezone)</label>
                    <div className="relative">
                      <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <select 
                        value={localSettings.timezone} 
                        onChange={(e) => setLocalSettings({...localSettings, timezone: e.target.value})}
                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none appearance-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                      >
                        {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'Cloud' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/30"><Cloud size={48} /></div>
                <div>
                  <h3 className="text-2xl font-black mb-1">Cloud Synchronization</h3>
                  <p className="text-sm text-blue-100 font-medium leading-relaxed max-w-md">Data Anda akan tersimpan secara terpusat agar staf dapat bekerja dari laptop atau ponsel secara bersamaan.</p>
                </div>
              </div>

              <div className="space-y-8 max-w-lg">
                <div className="flex items-center justify-between p-6 border-2 border-slate-50 rounded-[2rem] bg-slate-50/30">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase">Status Sinkronisasi</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Aktifkan untuk berbagi database cloud.</p>
                  </div>
                  <button 
                    onClick={() => setLocalSettings({...localSettings, isCloudEnabled: !localSettings.isCloudEnabled})} 
                    className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${localSettings.isCloudEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${localSettings.isCloudEnabled ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Klinik ID (Relay Identity)</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Laptop size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        value={localSettings.klinikId} 
                        onChange={(e) => setLocalSettings({...localSettings, klinikId: e.target.value})} 
                        className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xl font-black text-blue-600 tracking-[0.2em] text-center outline-none focus:border-blue-400" 
                        placeholder="KL-XXXXXX" 
                      />
                    </div>
                    <button 
                      onClick={registerNewCloudId} 
                      disabled={isGenerating} 
                      className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-100"
                    >
                      {isGenerating ? 'MENDAFTAR...' : 'GENERATE ID'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Data' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <section className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Pencadangan & Pemulihan</h3>
                  <p className="text-sm text-slate-500 font-medium">Amankan data klinik Anda dengan mencadangkannya secara berkala.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                    onClick={handleBackup}
                    className="p-8 border-2 border-dashed border-blue-200 rounded-3xl bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400 transition-all text-center group"
                   >
                     <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform"><DownloadCloud size={24} /></div>
                     <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Backup Database</h4>
                     <p className="text-[10px] text-slate-400 font-bold mt-1">Unduh seluruh data sebagai file JSON.</p>
                   </button>

                   <label className="p-8 border-2 border-dashed border-emerald-200 rounded-3xl bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-400 transition-all text-center group cursor-pointer">
                     <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
                     <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform"><UploadCloud size={24} /></div>
                     <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Restore Database</h4>
                     <p className="text-[10px] text-slate-400 font-bold mt-1">Unggah file backup untuk memulihkan data.</p>
                   </label>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 space-y-6">
                 <div>
                    <h3 className="text-lg font-black text-rose-600">Danger Zone</h3>
                    <p className="text-sm text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan. Mohon berhati-hati.</p>
                 </div>
                 <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white text-rose-600 rounded-2xl shadow-sm flex items-center justify-center"><Trash2 size={28}/></div>
                      <div>
                        <h4 className="font-black text-rose-800 uppercase tracking-widest text-xs">Hapus Seluruh Data Klinik</h4>
                        <p className="text-[10px] text-rose-400 font-bold mt-1">Menghapus LocalStorage dan memutus Cloud Relay.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsResetModalOpen(true)}
                      className="px-8 py-4 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all"
                    >
                      RESET PABRIK
                    </button>
                 </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6 no-print">
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-blue-200 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />} 
          SIMPAN SEMUA PERUBAHAN
        </button>
      </div>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-50"><AlertCircle size={40} /></div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">Hapus Semua Data?</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Seluruh data pasien, rekam medis, dan transaksi akan hilang secara permanen dari perangkat ini.</p>
                </div>
                
                <div className="space-y-3 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ketik <span className="text-rose-600">"hapus semua data"</span> untuk konfirmasi</p>
                  <input 
                    type="text" 
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-bold text-rose-600 outline-none focus:border-rose-300 transition-all" 
                    placeholder="..."
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleFactoryReset}
                    className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
                  >
                    HAPUS SEKARANG
                  </button>
                  <button 
                    onClick={() => { setIsResetModalOpen(false); setResetConfirmText(''); }}
                    className="w-full py-5 bg-slate-100 text-slate-400 font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                  >
                    BATALKAN
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

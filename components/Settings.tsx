
import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, Laptop, Globe, Save, 
  Camera, Check, AlertCircle, Phone, Clock, ShieldCheck, 
  Database, Zap, Key, CreditCard, Trash2, Upload, FileSpreadsheet, Download, RefreshCcw, Cloud, Copy
} from 'lucide-react';
import { 
  ClinicSettings, Patient, Doctor, Medicine, InventoryItem, 
  Transaction, AppUser, MedicalEntry 
} from '../types';

interface SettingsProps {
  clinicSettings: ClinicSettings;
  onUpdateClinicSettings: (settings: ClinicSettings) => void;
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  doctors: Doctor[];
  setDoctors: (doctors: Doctor[]) => void;
  medicines: Medicine[];
  setMedicines: (medicines: Medicine[]) => void;
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  users: AppUser[];
  setUsers: (users: AppUser[]) => void;
  medicalRecords: MedicalEntry[];
  setMedicalRecords: (records: MedicalEntry[]) => void;
}

type SettingsTab = 'Umum' | 'Cloud' | 'Keamanan' | 'Integrasi';

const Settings: React.FC<SettingsProps> = ({ 
  clinicSettings, onUpdateClinicSettings, patients, doctors, medicines, inventory, transactions, users, medicalRecords
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Umum');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSettings, setLocalSettings] = useState<ClinicSettings>({ ...clinicSettings });
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Fungsi baru untuk mendaftarkan ID resmi ke npoint.io
  const generateOfficialKlinikId = async () => {
    setIsGenerating(true);
    try {
      // Data inisialisasi untuk membuat bin baru di npoint
      const initData = { 
        clinicSettings: { ...localSettings, isCloudEnabled: true }, 
        users, patients, doctors, medicines, inventory, transactions, medicalRecords,
        status: "ACTIVE_INITIALIZED"
      };

      const response = await fetch('https://api.npoint.io/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initData)
      });

      if (!response.ok) throw new Error("Gagal generate ID");
      
      const result = await response.json();
      // npoint mengembalikan ID unik dalam field 'id'
      if (result && result.id) {
        setLocalSettings({ ...localSettings, klinikId: result.id, isCloudEnabled: true });
        alert(`Berhasil membuat ID Cloud: ${result.id}. Simpan perubahan untuk mengaktifkan.`);
      }
    } catch (error) {
      alert("Gagal membuat ID Cloud. Periksa koneksi internet Anda.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
          <p className="text-slate-500">Konfigurasi sinkronisasi dan identitas klinik</p>
        </div>
        {showSuccess && <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-bounce">Perubahan Disimpan!</div>}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-4 space-y-1">
          {[
            { id: 'Umum', icon: Laptop, label: 'Identitas Klinik' },
            { id: 'Cloud', icon: Cloud, label: 'Cloud Sync' },
            { id: 'Keamanan', icon: Shield, label: 'Keamanan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'Umum' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Klinik</label>
                  <input type="text" value={localSettings.name} onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Resmi</label>
                  <input type="email" value={localSettings.email} onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Lengkap</label>
                <textarea rows={3} value={localSettings.address} onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" />
              </div>
            </div>
          )}

          {activeTab === 'Cloud' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-100">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                   <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                     <Cloud size={40} className="text-white" />
                   </div>
                   <div className="text-center md:text-left">
                     <h3 className="text-2xl font-black mb-2">Cloud Sinkronisasi</h3>
                     <p className="text-sm text-blue-100 max-w-md">Aktifkan sinkronisasi untuk menggunakan data yang sama di banyak perangkat secara real-time.</p>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between p-6 border border-slate-100 rounded-3xl bg-slate-50/30">
                   <div>
                     <h4 className="font-bold text-slate-800">Status Sinkronisasi</h4>
                     <p className="text-xs text-slate-400 mt-1">Nyalakan fitur untuk mulai berbagi data antar perangkat.</p>
                   </div>
                   <button 
                    onClick={() => setLocalSettings({...localSettings, isCloudEnabled: !localSettings.isCloudEnabled})}
                    className={`w-14 h-7 rounded-full relative transition-all ${localSettings.isCloudEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings.isCloudEnabled ? 'right-1' : 'left-1'}`}></div>
                   </button>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik ID Cloud</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={localSettings.klinikId}
                        onChange={(e) => setLocalSettings({...localSettings, klinikId: e.target.value})}
                        className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-blue-600 tracking-widest outline-none focus:border-blue-400 text-center"
                        placeholder="KL-XXXXXX"
                      />
                      <button 
                        onClick={generateOfficialKlinikId}
                        disabled={isGenerating}
                        className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase hover:bg-black transition-all disabled:opacity-50"
                      >
                        {isGenerating ? 'Loading...' : 'Daftar ID Baru'}
                      </button>
                    </div>
                    <p className="text-[10px] text-orange-500 font-bold italic flex items-center gap-2">
                      <AlertCircle size={14}/> Catat ID ini dan gunakan di halaman login perangkat lain.
                    </p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Keamanan' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Shield size={18} className="text-blue-500" /> Keamanan Database</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Protokol Sync</span>
                    <span className="text-emerald-600 font-black">HTTPS (TLS 1.3)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />} 
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
};

export default Settings;

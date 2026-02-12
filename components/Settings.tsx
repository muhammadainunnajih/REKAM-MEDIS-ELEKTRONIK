
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Laptop, Globe, Save, RefreshCcw, Cloud, Copy, AlertCircle } from 'lucide-react';
import { ClinicSettings, Patient, Doctor, Medicine, InventoryItem, Transaction, AppUser, MedicalEntry } from '../types';

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
  setPatients: (p: Patient[]) => void; 
  setDoctors: (d: Doctor[]) => void; 
  setMedicines: (m: Medicine[]) => void; 
  setInventory: (i: InventoryItem[]) => void; 
  setTransactions: (t: Transaction[]) => void; 
  setUsers: (u: AppUser[]) => void; 
  setMedicalRecords: (mr: MedicalEntry[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ clinicSettings, onUpdateClinicSettings, patients, doctors, medicines, inventory, transactions, users, medicalRecords, setUsers }) => {
  const [activeTab, setActiveTab] = useState<'Umum' | 'Cloud'>('Umum');
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

  const registerNewCloudId = async () => {
    setIsGenerating(true);
    try {
      const dataToSync = { 
        clinicSettings: { ...localSettings, isCloudEnabled: true }, 
        users, patients, doctors, medicines, inventory, transactions, medicalRecords,
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
      alert("Gagal membuat ID Cloud. Periksa koneksi internet Anda atau coba lagi nanti.");
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1><p className="text-slate-500 text-xs font-medium">Konfigurasi Identitas dan Cloud Sync</p></div>
        {showSuccess && <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">Disimpan!</div>}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-4 space-y-1">
          <button onClick={() => setActiveTab('Umum')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Umum' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}><Laptop size={16} /> Identitas</button>
          <button onClick={() => setActiveTab('Cloud')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Cloud' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}><Cloud size={16} /> Cloud Sync</button>
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'Umum' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Klinik</label><input type="text" value={localSettings.name} onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label><input type="email" value={localSettings.email} onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400" /></div>
              </div>
            </div>
          )}

          {activeTab === 'Cloud' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="bg-blue-600 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><Cloud size={40} /></div>
                <div><h3 className="text-2xl font-black mb-1">Sinkronisasi Antar Perangkat</h3><p className="text-sm text-blue-100 font-medium leading-relaxed">Aktifkan Cloud untuk menyinkronkan data antar laptop atau HP staf secara real-time.</p></div>
              </div>

              <div className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl bg-slate-50/30">
                  <div><h4 className="font-bold text-slate-800 text-sm">Status Cloud</h4><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Gunakan database cloud untuk berbagi data.</p></div>
                  <button onClick={() => setLocalSettings({...localSettings, isCloudEnabled: !localSettings.isCloudEnabled})} className={`w-12 h-6 rounded-full relative transition-all ${localSettings.isCloudEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.isCloudEnabled ? 'right-1' : 'left-1'}`}></div></button>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik ID (ID Koneksi)</label>
                  <div className="flex gap-2">
                    <input type="text" value={localSettings.klinikId} onChange={(e) => setLocalSettings({...localSettings, klinikId: e.target.value})} className="flex-1 px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-black text-blue-600 tracking-widest text-center" placeholder="Generate ID Baru..." />
                    <button onClick={registerNewCloudId} disabled={isGenerating} className="bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">{isGenerating ? 'Mendaftar...' : 'Generate ID'}</button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">Salin ID ini ke halaman Login di perangkat lain untuk menghubungkannya.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 active:scale-95 transition-all text-sm uppercase tracking-widest">{isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />} Simpan Pengaturan</button>
      </div>
    </div>
  );
};

export default Settings;

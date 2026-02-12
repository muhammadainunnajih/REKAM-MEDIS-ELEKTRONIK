
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Laptop, Globe, Save, RefreshCcw, Cloud, Copy, Camera, Check, AlertCircle } from 'lucide-react';
import { ClinicSettings, Patient, Doctor, Medicine, InventoryItem, Transaction, AppUser, MedicalEntry } from '../types';

interface SettingsProps {
  clinicSettings: ClinicSettings;
  onUpdateClinicSettings: (settings: ClinicSettings) => void;
  patients: Patient[]; doctors: Doctor[]; medicines: Medicine[]; inventory: InventoryItem[]; transactions: Transaction[]; users: AppUser[]; medicalRecords: MedicalEntry[];
  setPatients: any; setDoctors: any; setMedicines: any; setInventory: any; setTransactions: any; setUsers: any; setMedicalRecords: any;
}

const Settings: React.FC<SettingsProps> = ({ clinicSettings, onUpdateClinicSettings, patients, doctors, medicines, inventory, transactions, users, medicalRecords }) => {
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
      // Kita coba buat BIN baru di npoint
      const response = await fetch('https://api.npoint.io/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clinicSettings: { ...localSettings, isCloudEnabled: true }, 
          users, patients, doctors, medicines, inventory, transactions, medicalRecords,
          initDate: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("CORS or Network Error");
      const result = await response.json();
      
      if (result && result.id) {
        const newSettings = { ...localSettings, klinikId: result.id, isCloudEnabled: true };
        setLocalSettings(newSettings);
        onUpdateClinicSettings(newSettings);
        alert(`BERHASIL! ID Cloud: ${result.id}`);
      }
    } catch (error) {
      // Fallback: Jika gagal buat bin otomatis, minta user buat bin kosong di npoint.io
      const manualId = prompt("Gagal buat ID otomatis (masalah koneksi/CORS).\nSilakan buat bin di npoint.io lalu masukkan ID-nya di sini:");
      if (manualId) {
        setLocalSettings({...localSettings, klinikId: manualId, isCloudEnabled: true});
      }
    } finally { setIsGenerating(false); }
  };

  const qrUrl = localSettings.klinikId ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${localSettings.klinikId}` : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1><p className="text-slate-500">Konfigurasi Identitas dan Cloud Sync</p></div>
        {showSuccess && <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">Disimpan!</div>}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-4 space-y-1">
          <button onClick={() => setActiveTab('Umum')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'Umum' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}><Laptop size={18} /> Identitas Klinik</button>
          <button onClick={() => setActiveTab('Cloud')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'Cloud' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}><Cloud size={18} /> Cloud Sync (QR Code)</button>
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'Umum' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Klinik</label><input type="text" value={localSettings.name} onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label><input type="email" value={localSettings.email} onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              </div>
            </div>
          )}

          {activeTab === 'Cloud' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="bg-blue-600 p-6 rounded-3xl text-white flex items-center gap-6 shadow-xl shadow-blue-100">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><Cloud size={32} /></div>
                <div><h3 className="text-xl font-black mb-1">Hubungkan Perangkat Baru</h3><p className="text-xs text-blue-100">Scan QR Code ini dari HP atau Laptop staf lainnya untuk terhubung.</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50/30">
                     <div><h4 className="font-bold text-slate-800 text-sm">Status Cloud</h4><p className="text-[10px] text-slate-400 mt-0.5">Nyalakan untuk sinkronisasi otomatis.</p></div>
                     <button onClick={() => setLocalSettings({...localSettings, isCloudEnabled: !localSettings.isCloudEnabled})} className={`w-12 h-6 rounded-full relative transition-all ${localSettings.isCloudEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.isCloudEnabled ? 'right-1' : 'left-1'}`}></div></button>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik ID Aktif</label>
                     <div className="flex gap-2">
                       <input type="text" value={localSettings.klinikId} onChange={(e) => setLocalSettings({...localSettings, klinikId: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-black text-blue-600 tracking-widest text-center" placeholder="KL-XXXXXX" />
                       <button onClick={registerNewCloudId} disabled={isGenerating} className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold text-[10px] uppercase transition-all disabled:opacity-50">{isGenerating ? '...' : 'DAFTAR ID'}</button>
                     </div>
                   </div>
                 </div>

                 {qrUrl && (
                   <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 flex flex-col items-center gap-4 text-center">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">SCAN QR CODE INI</p>
                     <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"><img src={qrUrl} alt="QR Code" className="w-40 h-40" /></div>
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-4">Buka sistem di HP/Laptop lain, klik "Hubungkan Klinik ID Baru" lalu Scan QR ini.</p>
                   </div>
                 )}
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

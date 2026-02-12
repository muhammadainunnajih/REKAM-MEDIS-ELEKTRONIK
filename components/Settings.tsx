
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Laptop, Globe, Save, RefreshCcw, Cloud, Copy, Camera, Check, AlertCircle, Download, FileUp, Database } from 'lucide-react';
import { ClinicSettings, Patient, Doctor, Medicine, InventoryItem, Transaction, AppUser, MedicalEntry } from '../types';

interface SettingsProps {
  clinicSettings: ClinicSettings;
  onUpdateClinicSettings: (settings: ClinicSettings) => void;
  patients: Patient[]; doctors: Doctor[]; medicines: Medicine[]; inventory: InventoryItem[]; transactions: Transaction[]; users: AppUser[]; medicalRecords: MedicalEntry[];
  setPatients: any; setDoctors: any; setMedicines: any; setInventory: any; setTransactions: any; setUsers: any; setMedicalRecords: any;
}

const Settings: React.FC<SettingsProps> = ({ clinicSettings, onUpdateClinicSettings, patients, doctors, medicines, inventory, transactions, users, medicalRecords }) => {
  const [activeTab, setActiveTab] = useState<'Umum' | 'Cloud' | 'Backup'>('Umum');
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

      // Gunakan PUT ke ID yang sudah ada jika ada, atau POST jika baru
      const method = localSettings.klinikId ? 'PUT' : 'POST';
      const url = localSettings.klinikId 
        ? `https://api.npoint.io/${localSettings.klinikId}` 
        : 'https://api.npoint.io/';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync)
      });

      if (!response.ok) throw new Error("Gagal kirim data");
      const result = await response.json();
      
      const newId = localSettings.klinikId || result.id;
      if (newId) {
        const newSettings = { ...localSettings, klinikId: newId, isCloudEnabled: true };
        setLocalSettings(newSettings);
        onUpdateClinicSettings(newSettings);
        alert(`SUKSES! Klinik ID: ${newId}\nData sudah terunggah ke Cloud.`);
      }
    } catch (error) {
      const manualId = prompt("Cloud Otomatis Gagal (Masalah Koneksi).\nMasukkan ID Manual jika Anda punya, atau gunakan fitur EKSPOR CADANGAN di tab sebelah:");
      if (manualId) {
        setLocalSettings({...localSettings, klinikId: manualId, isCloudEnabled: true});
      }
    } finally { setIsGenerating(false); }
  };

  const handleExportData = () => {
    const data = { clinicSettings, users, patients, doctors, medicines, inventory, transactions, medicalRecords };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EMR_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const qrUrl = localSettings.klinikId ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${localSettings.klinikId}` : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1><p className="text-slate-500 text-xs font-medium">Konfigurasi Identitas dan Multi-Perangkat</p></div>
        {showSuccess && <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">Disimpan!</div>}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-4 space-y-1">
          <button onClick={() => setActiveTab('Umum')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Umum' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}><Laptop size={16} /> Identitas</button>
          <button onClick={() => setActiveTab('Cloud')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Cloud' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}><Cloud size={16} /> Cloud Sync</button>
          <button onClick={() => setActiveTab('Backup')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Backup' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}><Database size={16} /> Backup & Restore</button>
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
                <div><h3 className="text-2xl font-black mb-1">Hubungkan Perangkat Baru</h3><p className="text-sm text-blue-100 font-medium leading-relaxed">Scan QR Code ini dari HP atau Laptop staf lainnya untuk menyalin seluruh data akun dan pasien.</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl bg-slate-50/30">
                     <div><h4 className="font-bold text-slate-800 text-sm">Status Sinkronisasi</h4><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Nyalakan sinkronisasi real-time.</p></div>
                     <button onClick={() => setLocalSettings({...localSettings, isCloudEnabled: !localSettings.isCloudEnabled})} className={`w-12 h-6 rounded-full relative transition-all ${localSettings.isCloudEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.isCloudEnabled ? 'right-1' : 'left-1'}`}></div></button>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik ID Aktif</label>
                     <div className="flex gap-2">
                       <input type="text" value={localSettings.klinikId} onChange={(e) => setLocalSettings({...localSettings, klinikId: e.target.value})} className="flex-1 px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-black text-blue-600 tracking-widest text-center" placeholder="KL-XXXXXX" />
                       <button onClick={registerNewCloudId} disabled={isGenerating} className="bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">{isGenerating ? <RefreshCcw className="animate-spin"/> : 'UPDATE CLOUD'}</button>
                     </div>
                   </div>
                 </div>

                 {qrUrl && (
                   <div className="bg-white p-8 rounded-[2rem] border-2 border-blue-50 flex flex-col items-center gap-4 text-center shadow-sm">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">PINDAI UNTUK HUBUNGKAN</p>
                     <div className="p-4 bg-white border-4 border-blue-600 rounded-3xl"><img src={qrUrl} alt="QR Code" className="w-40 h-40" /></div>
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-4 uppercase tracking-tighter">Buka Sistem di HP lain > Klik "Sinkronisasi Cloud" > Scan QR ini.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'Backup' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex items-center gap-6 shadow-xl">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center"><Download size={32} /></div>
                <div><h3 className="text-xl font-black">Ekspor/Impor File Cadangan</h3><p className="text-xs text-slate-400 font-medium">Metode cadangan jika sinkronisasi cloud tidak tersedia.</p></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl space-y-4 text-center group hover:border-blue-400 transition-all">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto"><Download size={24} /></div>
                  <div><h4 className="font-black text-slate-800 text-sm uppercase">Ekspor Data (.json)</h4><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Unduh seluruh database ke file.</p></div>
                  <button onClick={handleExportData} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">Download File Cadangan</button>
                </div>

                <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl space-y-4 text-center group hover:border-emerald-400 transition-all">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto"><FileUp size={24} /></div>
                  <div><h4 className="font-black text-slate-800 text-sm uppercase">Impor Data (.json)</h4><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Timpa data lokal dengan file cadangan.</p></div>
                  <p className="text-[9px] text-rose-500 font-bold leading-tight uppercase">Peringatan: Seluruh data lokal akan digantikan oleh isi file ini.</p>
                  <button onClick={() => alert("Gunakan tombol 'Impor File' di halaman Login untuk melakukan restorasi penuh.")} className="w-full py-3 bg-slate-100 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cara Impor Data</button>
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

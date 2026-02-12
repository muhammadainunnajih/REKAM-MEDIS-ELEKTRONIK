
import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, Laptop, Globe, Save, 
  Camera, Check, AlertCircle, Phone, Clock, ShieldCheck, 
  Database, Zap, Key, CreditCard, Trash2, Upload, FileSpreadsheet, Download, RefreshCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
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

type SettingsTab = 'Umum' | 'Notifikasi' | 'Keamanan' | 'Integrasi';

const Settings: React.FC<SettingsProps> = ({ 
  clinicSettings, 
  onUpdateClinicSettings,
  patients, setPatients,
  doctors, setDoctors,
  medicines, setMedicines,
  inventory, setInventory,
  transactions, setTransactions,
  users, setUsers,
  medicalRecords, setMedicalRecords
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Umum');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessingBackup, setIsProcessingBackup] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Local state for the form
  const [localSettings, setLocalSettings] = useState<ClinicSettings>({ ...clinicSettings });

  useEffect(() => {
    setLocalSettings({ ...clinicSettings });
  }, [clinicSettings]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    whatsappAlerts: true,
    inventoryAlerts: true,
    dailyReports: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: '60',
    ipRestricted: false,
    autoBackup: true
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    bpjsActive: false,
    paymentGateway: 'Midtrans',
    apiStatus: 'Terhubung'
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateClinicSettings(localSettings);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalSettings(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- EXCEL BACKUP LOGIC ---
  const handleExportExcel = () => {
    setIsProcessingBackup(true);
    setBackupStatus('idle');

    setTimeout(() => {
      try {
        const wb = XLSX.utils.book_new();

        // 1. Patients
        const wsPatients = XLSX.utils.json_to_sheet(patients);
        XLSX.utils.book_append_sheet(wb, wsPatients, "Pasien");

        // 2. Medical Records
        const wsRecords = XLSX.utils.json_to_sheet(medicalRecords);
        XLSX.utils.book_append_sheet(wb, wsRecords, "Rekam_Medis");

        // 3. Doctors
        const wsDoctors = XLSX.utils.json_to_sheet(doctors);
        XLSX.utils.book_append_sheet(wb, wsDoctors, "Dokter");

        // 4. Medicines
        const wsMedicines = XLSX.utils.json_to_sheet(medicines);
        XLSX.utils.book_append_sheet(wb, wsMedicines, "Obat");

        // 5. Inventory
        const wsInventory = XLSX.utils.json_to_sheet(inventory);
        XLSX.utils.book_append_sheet(wb, wsInventory, "Inventaris");

        // 6. Transactions
        // Flatten nested items for better Excel readability
        const flattenedTransactions = transactions.map(t => ({
          ...t,
          items: JSON.stringify(t.items) // Convert items array to string for CSV/Excel compatibility
        }));
        const wsTransactions = XLSX.utils.json_to_sheet(flattenedTransactions);
        XLSX.utils.book_append_sheet(wb, wsTransactions, "Transaksi");

        // 7. Users
        const wsUsers = XLSX.utils.json_to_sheet(users);
        XLSX.utils.book_append_sheet(wb, wsUsers, "Users");

        // 8. Clinic Settings
        const wsClinic = XLSX.utils.json_to_sheet([clinicSettings]);
        XLSX.utils.book_append_sheet(wb, wsClinic, "Identitas_Klinik");

        XLSX.writeFile(wb, `Backup_Klinik_${new Date().toISOString().split('T')[0]}.xlsx`);
        setBackupStatus('success');
      } catch (error) {
        console.error("Export failed:", error);
        setBackupStatus('error');
      } finally {
        setIsProcessingBackup(false);
      }
    }, 500);
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Peringatan: Mengimpor data akan mengganti semua data yang ada saat ini. Lanjutkan?")) {
      e.target.value = '';
      return;
    }

    setIsProcessingBackup(true);
    setBackupStatus('idle');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Helper to get sheet data
        const getSheetData = (name: string) => {
          const ws = wb.Sheets[name];
          return ws ? XLSX.utils.sheet_to_json(ws) : null;
        };

        const importedPatients = getSheetData("Pasien");
        if (importedPatients) setPatients(importedPatients as Patient[]);

        const importedRecords = getSheetData("Rekam_Medis");
        if (importedRecords) setMedicalRecords(importedRecords as MedicalEntry[]);

        const importedDoctors = getSheetData("Dokter");
        if (importedDoctors) setDoctors(importedDoctors as Doctor[]);

        const importedMedicines = getSheetData("Obat");
        if (importedMedicines) setMedicines(importedMedicines as Medicine[]);

        const importedInventory = getSheetData("Inventaris");
        if (importedInventory) setInventory(importedInventory as InventoryItem[]);

        const importedTransactions = getSheetData("Transaksi");
        if (importedTransactions) {
          const processedTrx = (importedTransactions as any[]).map(t => ({
            ...t,
            items: typeof t.items === 'string' ? JSON.parse(t.items) : t.items
          }));
          setTransactions(processedTrx);
        }

        const importedUsers = getSheetData("Users");
        if (importedUsers) setUsers(importedUsers as AppUser[]);

        const importedClinic = getSheetData("Identitas_Klinik");
        if (importedClinic && importedClinic.length > 0) {
          onUpdateClinicSettings(importedClinic[0] as ClinicSettings);
        }

        setBackupStatus('success');
      } catch (error) {
        console.error("Import failed:", error);
        setBackupStatus('error');
      } finally {
        setIsProcessingBackup(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const navItems = [
    { id: 'Umum' as SettingsTab, icon: Laptop, label: 'Umum' },
    { id: 'Notifikasi' as SettingsTab, icon: Bell, label: 'Notifikasi' },
    { id: 'Keamanan' as SettingsTab, icon: Shield, label: 'Keamanan' },
    { id: 'Integrasi' as SettingsTab, icon: Globe, label: 'Integrasi' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
          <p className="text-slate-500">Konfigurasi sistem dan preferensi operasional klinik</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 animate-in slide-in-from-right-4">
            <Check size={16} /> <span className="text-xs font-bold uppercase tracking-tight">Identitas Klinik Diperbarui!</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'Umum' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div 
                      onClick={handleLogoUploadClick}
                      className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all overflow-hidden"
                    >
                      {localSettings.logo ? (
                        <>
                          <img src={localSettings.logo} alt="Logo Klinik" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                            <Upload size={18} />
                            <span className="text-[10px] font-bold mt-1">Ubah Logo</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-300 group-hover:text-blue-400 transition-colors">
                          <Camera size={28} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
                        </div>
                      )}
                    </div>
                    {localSettings.logo && (
                      <button 
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                        title="Hapus Logo"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Identitas Visual</h4>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      Logo akan tampil di Sidebar, Laporan PDF, dan Struk Pembayaran Kasir.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Instansi</label>
                    <input 
                      type="text" 
                      value={localSettings.name}
                      onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Official</label>
                    <input 
                      type="email" 
                      value={localSettings.email}
                      onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telepon / WhatsApp</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={localSettings.phone}
                        onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zona Waktu</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        value={localSettings.timezone}
                        onChange={(e) => setLocalSettings({...localSettings, timezone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none bg-white appearance-none"
                      >
                        <option value="Asia/Jakarta">WIB (Jakarta)</option>
                        <option value="Asia/Makassar">WITA (Makassar)</option>
                        <option value="Asia/Jayapura">WIT (Jayapura)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Operasional</label>
                  <textarea 
                    rows={3} 
                    value={localSettings.address}
                    onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-all"
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Notifikasi' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-4 items-start">
                <AlertCircle size={20} className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-600 leading-relaxed font-medium">
                  Pengaturan ini menentukan bagaimana sistem akan memberi tahu staf mengenai aktivitas klinik penting.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'emailAlerts', label: 'Email Notifikasi', desc: 'Kirim notifikasi pendaftaran pasien baru ke email administrator.' },
                  { key: 'whatsappAlerts', label: 'WhatsApp Reminder', desc: 'Kirim pengingat otomatis ke nomor pasien (perlu integrasi pihak ke-3).' },
                  { key: 'inventoryAlerts', label: 'Peringatan Stok', desc: 'Beri tahu staf jika stok obat atau alkes berada di bawah ambang batas.' },
                  { key: 'dailyReports', label: 'Laporan Harian Otomatis', desc: 'Kirim ringkasan transaksi harian setiap jam 23:59.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotificationSettings({...notificationSettings, [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]})}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${notificationSettings[item.key as keyof typeof notificationSettings] ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Keamanan' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Security Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-400 mt-1">Gunakan kode verifikasi setiap kali login.</p>
                  </div>
                  <button 
                    onClick={() => setSecuritySettings({...securitySettings, twoFactor: !securitySettings.twoFactor})}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                      securitySettings.twoFactor ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {securitySettings.twoFactor ? 'AKTIF' : 'AKTIFKAN SEKARANG'}
                  </button>
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Database size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Auto Backup Data</h4>
                    <p className="text-xs text-slate-400 mt-1">Cadangkan rekam medis secara berkala ke cloud.</p>
                  </div>
                  <button 
                    onClick={() => setSecuritySettings({...securitySettings, autoBackup: !securitySettings.autoBackup})}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                      securitySettings.autoBackup ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {securitySettings.autoBackup ? 'BACKUP AKTIF' : 'AKTIFKAN BACKUP'}
                  </button>
                </div>
              </div>

              {/* Excel Backup/Restore Section */}
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Ekspor & Impor Excel</h4>
                    <p className="text-xs text-slate-500">Backup seluruh database klinik ke file Excel atau restore dari file backup.</p>
                  </div>
                </div>

                {backupStatus === 'success' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Check size={18} />
                    <span className="text-xs font-bold uppercase tracking-tight">Operasi Berhasil! Data telah diproses.</span>
                  </div>
                )}

                {backupStatus === 'error' && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in shake">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-tight">Terjadi kesalahan saat memproses file Excel.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleExportExcel}
                    disabled={isProcessingBackup}
                    className="flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Download size={20} className="text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">Ekspor Semua Data</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Download .xlsx</p>
                    </div>
                  </button>

                  <button 
                    onClick={handleImportClick}
                    disabled={isProcessingBackup}
                    className="flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCcw size={20} className={`text-emerald-600 ${isProcessingBackup ? 'animate-spin' : ''}`} />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">Restore dari Backup</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Upload .xlsx</p>
                    </div>
                  </button>
                  <input 
                    type="file" 
                    ref={importFileRef} 
                    onChange={handleImportExcel} 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                  />
                </div>

                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                  <div className="flex gap-3">
                    <AlertCircle size={18} className="text-orange-500 flex-shrink-0" />
                    <p className="text-xs text-orange-700 font-medium leading-relaxed italic">
                      "Penting: Lakukan backup secara berkala untuk menjaga keamanan data rekam medis pasien Anda. Simpan file backup di tempat yang aman."
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-[10px] text-slate-400">Kebijakan Sesi</h4>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-sm font-bold text-slate-600">Durasi Timeout Sesi (Menit)</span>
                  <input 
                    type="number" 
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                    className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-center font-bold outline-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Integrasi' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Zap size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">BPJS Kesehatan (P-Care)</h4>
                      <p className="text-xs text-slate-400">Integrasikan rujukan dan klaim dengan BPJS.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIntegrationSettings({...integrationSettings, bpjsActive: !integrationSettings.bpjsActive})}
                    className={`px-6 py-2 rounded-xl text-xs font-black border transition-all ${
                      integrationSettings.bpjsActive ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {integrationSettings.bpjsActive ? 'TERHUBUNG' : 'HUBUNGKAN'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                      <CreditCard size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Midtrans Payment Gateway</h4>
                      <p className="text-xs text-slate-400">Terima pembayaran QRIS, Virtual Account, dan Kartu.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">Live Mode</span>
                    <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Key size={18} /></button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Key size={16} className="text-blue-400" /> API Secret Key
                </h4>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-800 px-4 py-3 rounded-xl font-mono text-xs text-blue-300 break-all border border-slate-700 select-all">
                    ks_live_902384102938401923840912384
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-xs font-bold transition-all">COPY</button>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 italic font-medium">Gunakan key ini untuk integrasi dengan sistem eksternal lab atau radiologi.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 shadow-xl shadow-blue-100 active:scale-95 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              MENYIMPAN...
            </>
          ) : (
            <>
              <Save size={18} /> SIMPAN SEMUA PERUBAHAN
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;

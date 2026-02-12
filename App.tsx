
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, Patient, Stats, MedicalEntry, Doctor, Medicine, Transaction, QueueItem, InventoryItem, AppUser, ClinicSettings } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import DoctorList from './components/DoctorList';
import Pharmacy from './components/Pharmacy';
import Cashier from './components/Cashier';
import Schedule from './components/Schedule';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import Login from './components/Login';

// BroadcastChannel for cross-tab sync (same device)
const syncChannel = new BroadcastChannel('emr_sync_channel');

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'offline' | 'online' | 'syncing' | 'error'>('offline');
  
  const isInitialMount = useRef(true);

  // --- STATE DATA ---
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(() => {
    const saved = localStorage.getItem('clinicSettings');
    return saved ? JSON.parse(saved) : {
      name: 'Klinik Sehat Utama',
      logo: null,
      email: 'kontak@kliniksehat.com',
      phone: '021-5550123',
      address: 'Jl. Kesehatan No. 123, Jakarta Selatan',
      timezone: 'Asia/Jakarta',
      klinikId: '',
      isCloudEnabled: false
    };
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [
      { id: 'u1', name: 'Nizar Amrullah', username: 'nizaramr', password: 'password123', role: 'Perawat', email: 'nizar@klinik.com', lastActive: '2 menit lalu', status: 'Aktif' },
      { id: 'u2', name: 'Admin Utama', username: 'admin', password: 'adminpassword', role: 'Administrator', email: 'admin@klinik.com', lastActive: 'Aktif', status: 'Aktif' },
    ];
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalEntry[]>([]);

  // --- LOAD INITIAL DATA ---
  useEffect(() => {
    const sPatients = localStorage.getItem('patients');
    if (sPatients) setPatients(JSON.parse(sPatients));
    const sDoctors = localStorage.getItem('doctors');
    if (sDoctors) setDoctors(JSON.parse(sDoctors));
    const sMedicines = localStorage.getItem('medicines');
    if (sMedicines) setMedicines(JSON.parse(sMedicines));
    const sInv = localStorage.getItem('inventory');
    if (sInv) setInventory(JSON.parse(sInv));
    const sTrx = localStorage.getItem('transactions');
    if (sTrx) setTransactions(JSON.parse(sTrx));
    const sQueue = localStorage.getItem('queue');
    if (sQueue) setQueue(JSON.parse(sQueue));
    const sRecords = localStorage.getItem('medicalRecords');
    if (sRecords) setMedicalRecords(JSON.parse(sRecords));
  }, []);

  // --- CLOUD SYNC LOGIC ---
  const pushToCloud = useCallback(async () => {
    if (!clinicSettings.isCloudEnabled || !clinicSettings.klinikId) return;
    
    setCloudStatus('syncing');
    const fullData = {
      clinicSettings,
      users,
      patients,
      doctors,
      medicines,
      inventory,
      transactions,
      queue,
      medicalRecords,
      lastUpdated: new Date().toISOString(),
      updatedBy: currentUser?.name || 'System'
    };

    try {
      // Menggunakan npoint sebagai relay gratis untuk demo sinkronisasi
      // Catatan: Untuk produksi disarankan menggunakan Supabase/Firebase
      await fetch(`https://api.npoint.io/${clinicSettings.klinikId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
      setCloudStatus('online');
    } catch (error) {
      console.error("Cloud Push Error:", error);
      setCloudStatus('error');
    }
  }, [clinicSettings, users, patients, doctors, medicines, inventory, transactions, queue, medicalRecords, currentUser]);

  const pullFromCloud = useCallback(async (manual = false) => {
    if (!clinicSettings.isCloudEnabled || !clinicSettings.klinikId) return;
    
    if (manual) setCloudStatus('syncing');
    
    try {
      const response = await fetch(`https://api.npoint.io/${clinicSettings.klinikId}`);
      if (!response.ok) throw new Error("Fetch failed");
      
      const remoteData = await response.json();
      
      // Hanya update jika data remote lebih baru atau dipicu manual
      if (remoteData && remoteData.clinicSettings) {
        setClinicSettings(remoteData.clinicSettings);
        setUsers(remoteData.users);
        setPatients(remoteData.patients);
        setDoctors(remoteData.doctors);
        setMedicines(remoteData.medicines);
        setInventory(remoteData.inventory);
        setTransactions(remoteData.transactions);
        setQueue(remoteData.queue);
        setMedicalRecords(remoteData.medicalRecords);
        setCloudStatus('online');
      }
    } catch (error) {
      console.error("Cloud Pull Error:", error);
      setCloudStatus('error');
    }
  }, [clinicSettings.isCloudEnabled, clinicSettings.klinikId]);

  // Sync on mount and visibility change
  useEffect(() => {
    if (clinicSettings.isCloudEnabled) {
      pullFromCloud();
      const interval = setInterval(() => pullFromCloud(), 30000); // Auto pull setiap 30 detik
      return () => clearInterval(interval);
    }
  }, [clinicSettings.isCloudEnabled, pullFromCloud]);

  // --- PERSISTENCE & BROADCAST ---
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('doctors', JSON.stringify(doctors));
    localStorage.setItem('medicines', JSON.stringify(medicines));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('queue', JSON.stringify(queue));
    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
    
    syncChannel.postMessage('DATA_UPDATED');
    
    // Auto-push ke cloud setiap ada perubahan jika fitur aktif
    if (clinicSettings.isCloudEnabled) {
      const timeout = setTimeout(() => pushToCloud(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [clinicSettings, users, patients, doctors, medicines, inventory, transactions, queue, medicalRecords, pushToCloud]);

  // --- HANDLERS ---
  const handleUpdatePatient = (updatedPatient: Patient) => setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  const handleDeletePatient = (id: string) => { setPatients(prev => prev.filter(p => p.id !== id)); setMedicalRecords(prev => prev.filter(mr => mr.patientId !== id)); };
  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    setQueue(prev => [...prev, {
      id: `q-${Date.now()}`,
      no: `A-${patients.length + 1}`.padStart(4, '0'),
      patientId: newPatient.id,
      patientName: newPatient.name,
      poli: 'Umum',
      status: 'Menunggu',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleAddMedicalRecord = (record: MedicalEntry) => {
    setMedicalRecords(prev => [{ ...record, isProcessed: false }, ...prev]);
    setPatients(prev => prev.map(p => p.id === record.patientId ? { ...p, lastVisit: record.date } : p));
    
    const patient = patients.find(p => p.id === record.patientId);
    if (patient) {
      setTransactions(prev => [{
        id: `TRX-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        date: record.date,
        items: [{ name: 'Konsultasi Dokter', price: 50000, quantity: 1 }],
        total: 50000,
        status: 'Menunggu'
      }, ...prev]);
      setQueue(prev => prev.map(q => q.patientId === record.patientId && q.status === 'Diperiksa' ? { ...q, status: 'Selesai' } : q));
    }
  };

  const handleLogin = (user: AppUser) => { setIsAuthenticated(true); setCurrentUser(user); pullFromCloud(); };
  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(null); };

  const stats: Stats = {
    totalPatients: patients.length,
    totalMedicalRecords: medicalRecords.length,
    patientsToday: queue.filter(q => q.status !== 'Selesai').length
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} users={users} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeView={currentView} 
        onViewChange={setCurrentView} 
        clinicName={clinicSettings.name}
        clinicLogo={clinicSettings.logo}
        userRole={currentUser?.role || 'Perawat'}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onLogout={handleLogout} 
          currentUser={currentUser} 
          cloudStatus={cloudStatus}
          onSync={pullFromCloud}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {currentView === ViewType.DASHBOARD && <Dashboard stats={stats} latestPatients={patients.slice(0, 5)} onViewAll={() => setCurrentView(ViewType.DATA_PASIEN)} onAddPatient={() => setCurrentView(ViewType.DATA_PASIEN)} clinicName={clinicSettings.name} />}
          {currentView === ViewType.DATA_PASIEN && <PatientList patients={patients} medicalRecords={medicalRecords} onUpdate={handleUpdatePatient} onDelete={handleDeletePatient} onAdd={handleAddPatient} onAddMedicalRecord={handleAddMedicalRecord} onUpdateMedicalRecord={(r) => setMedicalRecords(prev => prev.map(m => m.id === r.id ? r : m))} onDeleteMedicalRecord={(id) => setMedicalRecords(prev => prev.filter(m => m.id !== id))} />}
          {currentView === ViewType.DATA_DOKTER && <DoctorList doctors={doctors} onAdd={(d) => setDoctors(prev => [...prev, d])} onUpdate={(d) => setDoctors(prev => prev.map(doc => doc.id === d.id ? d : doc))} onDelete={(id) => setDoctors(prev => prev.filter(d => d.id !== id))} />}
          {currentView === ViewType.APOTEK && <Pharmacy medicines={medicines} onAdd={(m) => setMedicines(prev => [m, ...prev])} onUpdate={(m) => setMedicines(prev => prev.map(med => med.id === m.id ? m : med))} onDelete={(id) => setMedicines(prev => prev.filter(m => m.id !== id))} medicalRecords={medicalRecords} queue={queue} patients={patients} onProcessPrescription={(rid, mid, qty) => { setMedicalRecords(prev => prev.map(mr => mr.id === rid ? {...mr, isProcessed: true} : mr)); setMedicines(prev => prev.map(m => m.id === mid ? {...m, stock: Math.max(0, m.stock - qty)} : m)); }} />}
          {currentView === ViewType.KASIR && <Cashier transactions={transactions} onCompletePayment={(id, method) => setTransactions(prev => prev.map(t => t.id === id ? {...t, status: 'Lunas', paymentMethod: method} : t))} onAddTransaction={(t) => setTransactions(prev => [t, ...prev])} onUpdateTransaction={(t) => setTransactions(prev => prev.map(trx => trx.id === t.id ? t : trx))} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} patients={patients} />}
          {currentView === ViewType.JADWAL && <Schedule queue={queue} onUpdateStatus={(id, s) => setQueue(prev => prev.map(q => q.id === id ? {...q, status: s} : q))} onCallPatient={(id) => setQueue(prev => prev.map(q => q.id === id ? {...q, status: 'Diperiksa'} : q))} />}
          {currentView === ViewType.INVENTARIS && <Inventory items={inventory} onAdd={(i) => setInventory(prev => [...prev, i])} onUpdate={(i) => setInventory(prev => prev.map(inv => inv.id === i.id ? i : inv))} onDelete={(id) => setInventory(prev => prev.filter(i => i.id !== id))} />}
          {currentView === ViewType.LAPORAN && <Reports patients={patients} records={medicalRecords} transactions={transactions} queue={queue} medicines={medicines} inventory={inventory} />}
          {currentView === ViewType.USER_MGMT && <UserManagement users={users} onAdd={(u) => setUsers(prev => [u, ...prev])} onUpdate={(u) => setUsers(prev => prev.map(usr => usr.id === u.id ? u : usr))} onDelete={(id) => setUsers(prev => prev.filter(u => u.id !== id))} />}
          {currentView === ViewType.PENGATURAN && <Settings clinicSettings={clinicSettings} onUpdateClinicSettings={setClinicSettings} patients={patients} setPatients={setPatients} doctors={doctors} setDoctors={setDoctors} medicines={medicines} setMedicines={setMedicines} inventory={inventory} setInventory={setInventory} transactions={transactions} setTransactions={setTransactions} users={users} setUsers={setUsers} medicalRecords={medicalRecords} setMedicalRecords={setMedicalRecords} />}
        </main>
      </div>
    </div>
  );
};

export default App;

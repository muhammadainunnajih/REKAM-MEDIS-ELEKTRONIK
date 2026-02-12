
import React, { useState, useEffect, useCallback } from 'react';
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

// BroadcastChannel for cross-tab sync
const syncChannel = new BroadcastChannel('emr_sync_channel');

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core Data States
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(() => {
    const saved = localStorage.getItem('clinicSettings');
    return saved ? JSON.parse(saved) : {
      name: 'Klinik Sehat Utama',
      logo: null,
      email: 'kontak@kliniksehat.com',
      phone: '021-5550123',
      address: 'Jl. Kesehatan No. 123, Jakarta Selatan',
      timezone: 'Asia/Jakarta'
    };
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [
      { id: 'u1', name: 'Nizar Amrullah', username: 'nizaramr', password: 'password123', role: 'Perawat', email: 'nizar@klinik.com', lastActive: '2 menit lalu', status: 'Aktif' },
      { id: 'u2', name: 'Admin Utama', username: 'admin', password: 'adminpassword', role: 'Administrator', email: 'admin@klinik.com', lastActive: 'Aktif', status: 'Aktif' },
      { id: 'u3', name: 'dr. Andi Wijaya', username: 'drandi', password: 'docpassword', role: 'Dokter', email: 'andi@klinik.com', lastActive: '1 jam lalu', status: 'Aktif' },
    ];
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('patients');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Nizar', rmNumber: 'RM1754813370126', birthDate: '1995-05-12', gender: 'Laki-laki', lastVisit: '10/8/2025', type: 'Umum' },
      { id: '2', name: 'Dimas', rmNumber: 'RM1754885737056', birthDate: '1992-11-20', gender: 'Laki-laki', lastVisit: '11/8/2025', type: 'BPJS', bpjsClass: 'Kelas 1' },
      { id: '3', name: 'Ainun Najih', rmNumber: 'RM1762774071291', birthDate: '1988-02-15', gender: 'Perempuan', lastVisit: '10/11/2025', type: 'BPJS', bpjsClass: 'Kelas 3' },
    ];
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('doctors');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'dr. Andi Wijaya', specialization: 'Poli Umum', status: 'Tersedia', patientsToday: 12 },
      { id: '2', name: 'dr. Sarah Pratama', specialization: 'Poli Gigi', status: 'Sibuk', patientsToday: 5 },
    ];
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('medicines');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Paracetamol 500mg', stock: 1240, price: 5000, category: 'Tablet', type: 'Tablet' },
    ];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [
      { id: 'inv1', name: 'Kapas Gulung 500g', stock: 45, unit: 'Roll', category: 'Alat Medis', minStock: 10 },
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem('queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalEntry[]>(() => {
    const saved = localStorage.getItem('medicalRecords');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Persistence Logic ---
  const saveAllToStorage = useCallback(() => {
    setIsSyncing(true);
    localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('doctors', JSON.stringify(doctors));
    localStorage.setItem('medicines', JSON.stringify(medicines));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('queue', JSON.stringify(queue));
    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
    
    // Notify other tabs
    syncChannel.postMessage('DATA_UPDATED');
    
    setTimeout(() => setIsSyncing(false), 500);
  }, [clinicSettings, users, patients, doctors, medicines, inventory, transactions, queue, medicalRecords]);

  // Load data from Storage on external update (e.g., other tabs)
  const reloadFromStorage = useCallback(() => {
    const sSettings = localStorage.getItem('clinicSettings');
    if (sSettings) setClinicSettings(JSON.parse(sSettings));
    
    const sUsers = localStorage.getItem('users');
    if (sUsers) setUsers(JSON.parse(sUsers));
    
    const sPatients = localStorage.getItem('patients');
    if (sPatients) setPatients(JSON.parse(sPatients));
    
    const sDoctors = localStorage.getItem('doctors');
    if (sDoctors) setDoctors(JSON.parse(sDoctors));
    
    const sMedicines = localStorage.getItem('medicines');
    if (sMedicines) setMedicines(JSON.parse(sMedicines));
    
    const sInventory = localStorage.getItem('inventory');
    if (sInventory) setInventory(JSON.parse(sInventory));
    
    const sTransactions = localStorage.getItem('transactions');
    if (sTransactions) setTransactions(JSON.parse(sTransactions));
    
    const sQueue = localStorage.getItem('queue');
    if (sQueue) setQueue(JSON.parse(sQueue));
    
    const sRecords = localStorage.getItem('medicalRecords');
    if (sRecords) setMedicalRecords(JSON.parse(sRecords));
  }, []);

  // Listen for sync messages from other tabs
  useEffect(() => {
    const handleSync = (event: MessageEvent) => {
      if (event.data === 'DATA_UPDATED') {
        reloadFromStorage();
      }
    };
    syncChannel.addEventListener('message', handleSync);
    return () => syncChannel.removeEventListener('message', handleSync);
  }, [reloadFromStorage]);

  // Save to storage whenever any key data changes
  useEffect(() => {
    saveAllToStorage();
  }, [saveAllToStorage]);

  // Stats derivation
  const stats: Stats = {
    totalPatients: patients.length,
    totalMedicalRecords: medicalRecords.length,
    patientsToday: queue.length
  };

  // --- Handlers ---
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    setMedicalRecords(prev => prev.filter(mr => mr.patientId !== id));
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    const newQueue: QueueItem = {
      id: `q-${Date.now()}`,
      no: `A-${patients.length + 1}`.padStart(4, '0'),
      patientId: newPatient.id,
      patientName: newPatient.name,
      poli: 'Umum',
      status: 'Menunggu',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setQueue(prev => [...prev, newQueue]);
  };

  const handleAddMedicalRecord = (record: MedicalEntry) => {
    setMedicalRecords(prev => [{ ...record, isProcessed: false }, ...prev]);
    setPatients(prev => prev.map(p => 
      p.id === record.patientId ? { ...p, lastVisit: record.date } : p
    ));
    
    const patient = patients.find(p => p.id === record.patientId);
    if (patient) {
      const newTrx: Transaction = {
        id: `TRX-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        date: record.date,
        items: [{ name: 'Konsultasi Dokter', price: 50000, quantity: 1 }],
        total: 50000,
        status: 'Menunggu'
      };
      setTransactions(prev => [newTrx, ...prev]);

      setQueue(prev => {
        const updatedQueue = prev.map(q => {
          if (q.patientId === record.patientId && q.status === 'Diperiksa') {
            return { ...q, status: 'Selesai' as const };
          }
          return q;
        });
        const finishedPoli = prev.find(q => q.patientId === record.patientId)?.poli;
        const nextWaiting = updatedQueue.find(q => q.status === 'Menunggu' && q.poli === finishedPoli);
        if (nextWaiting) {
          return updatedQueue.map(q => q.id === nextWaiting.id ? { ...q, status: 'Diperiksa' as const } : q);
        }
        return updatedQueue;
      });
    }
  };

  const handleUpdateMedicalRecord = (updatedRecord: MedicalEntry) => {
    setMedicalRecords(prev => prev.map(mr => mr.id === updatedRecord.id ? updatedRecord : mr));
  };

  const handleDeleteMedicalRecord = (id: string) => {
    setMedicalRecords(prev => prev.filter(mr => mr.id !== id));
  };

  const handleAddDoctor = (doctor: Doctor) => {
    setDoctors(prev => [...prev, doctor]);
  };

  const handleUpdateDoctor = (doctor: Doctor) => {
    setDoctors(prev => prev.map(d => d.id === doctor.id ? doctor : d));
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  const handleAddMedicine = (medicine: Medicine) => {
    setMedicines(prev => [medicine, ...prev]);
  };

  const handleUpdateMedicine = (medicine: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === medicine.id ? medicine : m));
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleAddInventory = (item: InventoryItem) => {
    setInventory(prev => [item, ...prev]);
  };

  const handleUpdateInventory = (item: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const handleDeleteInventory = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const handleProcessPrescription = (recordId: string, medicineId: string, quantity: number) => {
    setMedicalRecords(prev => prev.map(mr => 
      mr.id === recordId ? { ...mr, isProcessed: true } : mr
    ));

    const medicine = medicines.find(m => m.id === medicineId);
    const record = medicalRecords.find(mr => mr.id === recordId);
    
    if (medicine && record) {
      setTransactions(prev => {
        const patientTrxIndex = prev.findIndex(t => t.patientId === record.patientId && t.status === 'Menunggu');
        
        if (patientTrxIndex !== -1) {
          const updatedTrx = { ...prev[patientTrxIndex] };
          updatedTrx.items = [...updatedTrx.items, { name: medicine.name, price: medicine.price, quantity }];
          updatedTrx.total = updatedTrx.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const newTransactions = [...prev];
          newTransactions[patientTrxIndex] = updatedTrx;
          return newTransactions;
        }
        return prev;
      });

      setMedicines(prev => prev.map(m => 
        m.id === medicineId ? { ...m, stock: Math.max(0, m.stock - quantity) } : m
      ));
    }
  };

  const handleCompletePayment = (transactionId: string, method: 'Tunai' | 'Debit' | 'QRIS') => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, status: 'Lunas', paymentMethod: method } : t
    ));
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleUpdateTransaction = (updatedTrx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTrx.id ? updatedTrx : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateQueueStatus = (id: string, status: QueueItem['status']) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const handleCallPatient = (id: string) => {
    setQueue(prev => prev.map(q => {
      if (q.id === id) return { ...q, status: 'Diperiksa' };
      if (q.status === 'Diperiksa') return { ...q, status: 'Selesai' };
      return q;
    }));
  };

  const handleAddUser = (user: AppUser) => {
    setUsers(prev => [user, ...prev]);
  };

  const handleUpdateUser = (user: AppUser) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleLogin = (user: AppUser) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setCurrentView(ViewType.DASHBOARD);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const renderView = () => {
    const isRestricted = (currentView === ViewType.USER_MGMT || currentView === ViewType.PENGATURAN) && currentUser?.role !== 'Administrator';
    
    if (isRestricted) {
      return <Dashboard 
        stats={stats} 
        latestPatients={patients.slice(0, 5)} 
        onViewAll={() => setCurrentView(ViewType.DATA_PASIEN)} 
        onAddPatient={() => setCurrentView(ViewType.DATA_PASIEN)} 
        clinicName={clinicSettings.name}
      />;
    }

    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard 
          stats={stats} 
          latestPatients={patients.slice(0, 5)} 
          onViewAll={() => setCurrentView(ViewType.DATA_PASIEN)} 
          onAddPatient={() => setCurrentView(ViewType.DATA_PASIEN)} 
          clinicName={clinicSettings.name}
        />;
      case ViewType.DATA_PASIEN:
        return <PatientList 
          patients={patients} 
          medicalRecords={medicalRecords}
          onUpdate={handleUpdatePatient} 
          onDelete={handleDeletePatient}
          onAdd={handleAddPatient}
          onAddMedicalRecord={handleAddMedicalRecord}
          onUpdateMedicalRecord={handleUpdateMedicalRecord}
          onDeleteMedicalRecord={handleDeleteMedicalRecord}
        />;
      case ViewType.DATA_DOKTER:
        return <DoctorList 
          doctors={doctors}
          onAdd={handleAddDoctor}
          onUpdate={handleUpdateDoctor}
          onDelete={handleDeleteDoctor}
        />;
      case ViewType.APOTEK:
        return <Pharmacy 
          medicines={medicines}
          onAdd={handleAddMedicine}
          onUpdate={handleUpdateMedicine}
          onDelete={handleDeleteMedicine}
          medicalRecords={medicalRecords}
          queue={queue}
          patients={patients}
          onProcessPrescription={handleProcessPrescription}
        />;
      case ViewType.KASIR:
        return <Cashier 
          transactions={transactions}
          onCompletePayment={handleCompletePayment}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          patients={patients}
        />;
      case ViewType.JADWAL:
        return <Schedule 
          queue={queue} 
          onUpdateStatus={handleUpdateQueueStatus}
          onCallPatient={handleCallPatient}
        />;
      case ViewType.INVENTARIS:
        return <Inventory 
          items={inventory}
          onAdd={handleAddInventory}
          onUpdate={handleUpdateInventory}
          onDelete={handleDeleteInventory}
        />;
      case ViewType.LAPORAN:
        return <Reports 
          patients={patients}
          records={medicalRecords}
          transactions={transactions}
          queue={queue}
          medicines={medicines}
          inventory={inventory}
        />;
      case ViewType.USER_MGMT:
        return <UserManagement 
          users={users}
          onAdd={handleAddUser}
          onUpdate={handleUpdateUser}
          onDelete={handleDeleteUser}
        />;
      case ViewType.PENGATURAN:
        return <Settings 
          clinicSettings={clinicSettings}
          onUpdateClinicSettings={setClinicSettings}
          patients={patients}
          setPatients={setPatients}
          doctors={doctors}
          setDoctors={setDoctors}
          medicines={medicines}
          setMedicines={setMedicines}
          inventory={inventory}
          setInventory={setInventory}
          transactions={transactions}
          setTransactions={setTransactions}
          users={users}
          setUsers={setUsers}
          medicalRecords={medicalRecords}
          setMedicalRecords={setMedicalRecords}
        />;
      default:
        return <Dashboard 
          stats={stats} 
          latestPatients={patients.slice(0, 5)} 
          onViewAll={() => setCurrentView(ViewType.DATA_PASIEN)} 
          onAddPatient={() => setCurrentView(ViewType.DATA_PASIEN)} 
          clinicName={clinicSettings.name}
        />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} users={users} />;
  }

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
        <Header onLogout={handleLogout} currentUser={currentUser} isSyncing={isSyncing} />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;

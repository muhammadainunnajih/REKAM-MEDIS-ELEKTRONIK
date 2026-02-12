
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Wallet, Search, CheckCircle, CreditCard, Receipt, 
  User, X, Printer, Plus, ChevronRight, Calculator,
  Smartphone, Banknote, History, Clock, Edit2, Trash2, AlertTriangle,
  Download, FileText, Zap, UserCheck, ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Transaction, Patient, TransactionItem } from '../types';

interface CashierProps {
  transactions: Transaction[];
  onCompletePayment: (id: string, method: 'Tunai' | 'Debit' | 'QRIS') => void;
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  patients: Patient[];
}

type PrintFormat = 'standard' | 'thermal';

const Cashier: React.FC<CashierProps> = ({ 
  transactions, 
  onCompletePayment, 
  onAddTransaction, 
  onUpdateTransaction,
  onDeleteTransaction,
  patients 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Debit' | 'QRIS'>('Tunai');
  const [printFormat, setPrintFormat] = useState<PrintFormat>('standard');

  // Searchable Patient States
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    patientId: '',
    items: [{ name: 'Biaya Admin', price: 10000, quantity: 1 }],
    status: 'Menunggu' as 'Menunggu' | 'Lunas',
    date: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [trxToDelete, setTrxToDelete] = useState<Transaction | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery) return patients.slice(0, 5);
    return patients.filter(p => 
      p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) || 
      p.rmNumber.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );
  }, [patients, patientSearchQuery]);

  const selectedPatientData = useMemo(() => {
    return patients.find(p => p.id === formData.patientId);
  }, [patients, formData.patientId]);

  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Lunas')
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const pendingCount = useMemo(() => {
    return transactions.filter(t => t.status === 'Menunggu').length;
  }, [transactions]);

  const openPaymentModal = (trx: Transaction) => {
    setSelectedTrx(trx);
    setPaymentMethod('Tunai');
    setIsPaymentModalOpen(true);
  };

  const openReceiptModal = (trx: Transaction) => {
    setSelectedTrx(trx);
    setPrintFormat('standard');
    setIsReceiptModalOpen(true);
  };

  const openFormModal = (mode: 'add' | 'edit', trx: Transaction | null = null) => {
    setFormMode(mode);
    setPatientSearchQuery('');
    if (mode === 'edit' && trx) {
      setFormData({
        id: trx.id,
        patientId: trx.patientId,
        items: [...trx.items],
        status: trx.status,
        date: trx.date
      });
    } else {
      setFormData({
        id: '',
        patientId: '',
        items: [{ name: 'Biaya Admin', price: 10000, quantity: 1 }],
        status: 'Menunggu',
        date: new Date().toLocaleDateString('id-ID')
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSelectPatient = (patient: Patient) => {
    setFormData({ ...formData, patientId: patient.id });
    setPatientSearchQuery('');
    setIsPatientDropdownOpen(false);
  };

  const handleProcessPayment = () => {
    if (selectedTrx) {
      onCompletePayment(selectedTrx.id, paymentMethod);
      setIsPaymentModalOpen(false);
    }
  };

  const handleAddNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: 0, quantity: 1 }]
    }));
  };

  const handleUpdateItem = (index: number, field: keyof TransactionItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveTrx = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) {
      alert("Silakan pilih pasien terlebih dahulu.");
      return;
    }

    const total = formData.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    if (formMode === 'add') {
      const newTrx: Transaction = {
        id: `TRX-MANUAL-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        date: new Date().toLocaleDateString('id-ID'),
        items: formData.items,
        total,
        status: 'Menunggu'
      };
      onAddTransaction(newTrx);
    } else {
      const updatedTrx: Transaction = {
        id: formData.id,
        patientId: patient.id,
        patientName: patient.name,
        date: formData.date,
        items: formData.items,
        total,
        status: formData.status
      };
      onUpdateTransaction(updatedTrx);
    }
    
    setIsFormModalOpen(false);
  };

  const confirmDelete = (trx: Transaction) => {
    setTrxToDelete(trx);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (trxToDelete) {
      onDeleteTransaction(trxToDelete.id);
      setIsDeleteModalOpen(false);
      setTrxToDelete(null);
    }
  };

  const handlePrint = (format: PrintFormat) => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = () => {
    if (!selectedTrx) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(18); doc.setTextColor(30, 64, 175);
      doc.text('KLINIK SEHAT', centerX, 15, { align: 'center' });
      doc.setFontSize(8); doc.setTextColor(100, 116, 139);
      doc.text('Jl. Kesehatan No. 123, Jakarta Selatan', centerX, 20, { align: 'center' });
      doc.text('Telp: (021) 555-0123', centerX, 24, { align: 'center' });
      doc.setDrawColor(226, 232, 240); doc.line(10, 30, 138, 30);
      doc.setFontSize(10); doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'bold');
      doc.text('STRUK PEMBAYARAN', centerX, 38, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(`No. Transaksi: ${selectedTrx.id}`, 15, 48);
      doc.text(`Tanggal: ${selectedTrx.date}`, 15, 53);
      doc.text(`Pasien: ${selectedTrx.patientName}`, 15, 58);
      doc.line(10, 68, 138, 68);
      let currentY = 75; doc.setFont('helvetica', 'bold');
      doc.text('Item Layanan', 15, currentY); doc.text('Subtotal', 135, currentY, { align: 'right' });
      doc.setFont('helvetica', 'normal'); currentY += 8;
      selectedTrx.items.forEach(item => {
        doc.text(`${item.name} x${item.quantity}`, 15, currentY);
        doc.text(`Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`, 135, currentY, { align: 'right' });
        currentY += 6;
      });
      doc.line(10, currentY + 2, 138, currentY + 2);
      currentY += 10; doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('TOTAL AKHIR', 15, currentY); doc.text(`Rp ${selectedTrx.total.toLocaleString('id-ID')}`, 135, currentY, { align: 'right' });
      doc.save(`Struk_${selectedTrx.id}.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
      alert('Gagal membuat PDF.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kasir</h1>
          <p className="text-slate-500">Proses pembayaran dan tagihan pasien</p>
        </div>
        <button 
          onClick={() => openFormModal('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} /> Transaksi Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-100/50">
          <div className="flex justify-between items-start mb-4">
            <Wallet size={24} className="opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Kas Terkumpul</span>
          </div>
          <p className="text-xs opacity-70 mb-1">Total Pendapatan Lunas</p>
          <h3 className="text-3xl font-black">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaksi Selesai</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={16}/></div>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{transactions.filter(t => t.status === 'Lunas').length}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menunggu Pembayaran</p>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock size={16}/></div>
          </div>
          <h3 className="text-2xl font-black text-orange-600">{pendingCount}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-slate-400"/> Riwayat Transaksi
          </h2>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari pasien atau ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-400 outline-none transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Pasien</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Total Tagihan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(trx => (
                  <tr key={trx.id} className="text-sm hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{trx.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{trx.patientName}</div>
                      <div className="text-[10px] text-slate-400">ID: {trx.patientId}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{trx.date}</td>
                    <td className="px-6 py-4 font-black text-slate-800">
                      Rp {trx.total.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                        trx.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700 animate-pulse'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {trx.status === 'Menunggu' ? (
                          <button 
                            onClick={() => openPaymentModal(trx)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            Bayar Tagihan
                          </button>
                        ) : (
                          <button 
                            onClick={() => openReceiptModal(trx)}
                            className="flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-xs"
                          >
                            <Receipt size={14} /> Struk
                          </button>
                        )}
                        <button 
                          onClick={() => openFormModal('edit', trx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(trx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-medium">Data transaksi tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Add/Edit) with SEARCHABLE PATIENT */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{formMode === 'add' ? 'Buat Transaksi Baru' : 'Edit Transaksi'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveTrx} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 relative" ref={patientDropdownRef}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cari Pasien</label>
                  
                  {selectedPatientData && formMode === 'edit' ? (
                     <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">{selectedPatientData.name.charAt(0)}</div>
                           <div>
                              <p className="text-sm font-bold text-slate-800 leading-none">{selectedPatientData.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{selectedPatientData.rmNumber}</p>
                           </div>
                        </div>
                        <UserCheck size={16} className="text-emerald-500" />
                     </div>
                  ) : selectedPatientData && formMode === 'add' ? (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">{selectedPatientData.name.charAt(0)}</div>
                           <div>
                              <p className="text-sm font-bold text-slate-800 leading-none">{selectedPatientData.name}</p>
                              <p className="text-[10px] text-blue-500 font-bold">{selectedPatientData.rmNumber}</p>
                           </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, patientId: ''})}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Ketik nama atau No. RM..."
                        value={patientSearchQuery}
                        onChange={(e) => {
                          setPatientSearchQuery(e.target.value);
                          setIsPatientDropdownOpen(true);
                        }}
                        onFocus={() => setIsPatientDropdownOpen(true)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                      />
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      
                      {isPatientDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                           {filteredPatients.length > 0 ? (
                             filteredPatients.map((p) => (
                               <button
                                 key={p.id}
                                 type="button"
                                 onClick={() => handleSelectPatient(p)}
                                 className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                               >
                                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-xs">{p.name.charAt(0)}</div>
                                  <div className="text-left">
                                     <p className="text-sm font-bold text-slate-800 leading-none">{p.name}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{p.rmNumber} • {p.gender}</p>
                                  </div>
                               </button>
                             ))
                           ) : (
                             <div className="p-8 text-center">
                                <User size={24} className="mx-auto text-slate-100 mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase">Pasien tidak ditemukan</p>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pembayaran</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Transaksi</label>
                  <button 
                    type="button" 
                    onClick={handleAddNewItem}
                    className="text-blue-600 text-[10px] font-black flex items-center gap-1 hover:underline uppercase tracking-tighter"
                  >
                    <Plus size={14}/> Tambah Item Layanan
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {formData.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-end group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Nama Layanan</label>
                        <input 
                          type="text" required placeholder="Contoh: Konsultasi Dokter"
                          value={item.name}
                          onChange={e => handleUpdateItem(i, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold bg-white focus:border-blue-400 outline-none"
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center block">Qty</label>
                        <input 
                          type="number" required min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-center bg-white outline-none focus:border-blue-400"
                        />
                      </div>
                      <div className="w-32 space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Harga</label>
                        <input 
                          type="number" required min="0"
                          value={item.price}
                          onChange={e => handleUpdateItem(i, 'price', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold bg-white outline-none focus:border-blue-400"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(i)}
                        className={`p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all ${formData.items.length === 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Tagihan</p>
                  <p className="text-3xl font-black text-slate-800">
                    Rp {formData.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Batal</button>
                  <button type="submit" className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-3 text-xs uppercase tracking-widest transition-all hover:bg-blue-700 active:scale-95">
                    {formMode === 'add' ? 'Buat Tagihan' : 'Simpan Data'} <Calculator size={18}/>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && trxToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Transaksi?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Data tagihan untuk <strong>{trxToDelete.patientName}</strong> akan dihapus permanen.</p>
              <div className="flex flex-col gap-3">
                <button onClick={executeDelete} className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-100">Hapus Sekarang</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest">Batalkan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Proses Pembayaran */}
      {isPaymentModalOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><CreditCard size={20}/><h3 className="font-bold">Pembayaran Tagihan</h3></div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-white/60 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Atas Nama:</p>
                <h4 className="font-black text-slate-800 text-lg leading-tight">{selectedTrx.patientName}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{selectedTrx.id} • {selectedTrx.date}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedTrx.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">{item.name} <span className="text-[9px] font-black opacity-50 uppercase">x{item.quantity}</span></span>
                      <span className="font-black text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl font-black text-blue-600">Rp {selectedTrx.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode Pembayaran:</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setPaymentMethod('Tunai')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'Tunai' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}><Banknote size={24} /><span className="text-[10px] font-black uppercase">TUNAI</span></button>
                  <button onClick={() => setPaymentMethod('Debit')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'Debit' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}><CreditCard size={24} /><span className="text-[10px] font-black uppercase">DEBIT</span></button>
                  <button onClick={() => setPaymentMethod('QRIS')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'QRIS' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}><Smartphone size={24} /><span className="text-[10px] font-black uppercase">QRIS</span></button>
                </div>
              </div>

              <button onClick={handleProcessPayment} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] text-xs uppercase tracking-[0.1em]">Konfirmasi Pembayaran <CheckCircle size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Struk */}
      {isReceiptModalOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 no-print">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-600 text-white rounded-xl"><Printer size={20}/></div>
                 <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Pratinjau Struk</h3>
               </div>
               <button onClick={() => setIsReceiptModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50 flex justify-center items-start">
                <div 
                  className={`bg-white shadow-xl transition-all duration-300 ${printFormat === 'thermal' ? 'print-thermal' : 'print-standard w-[400px]'}`}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">KLINIK SEHAT</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Jl. Kesehatan No. 123, Jakarta Selatan</p>
                    <div className="border-b border-dashed border-slate-200 my-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bukti Pembayaran</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-bold">No. TRX</span><span className="font-black text-slate-800">{selectedTrx.id}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-bold">Pasien</span><span className="font-black text-slate-800">{selectedTrx.patientName}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-bold">Waktu</span><span className="font-black text-slate-800">{selectedTrx.date}</span></div>
                    <div className="border-b border-dashed border-slate-200 my-4"></div>
                    <div className="space-y-3">
                      {selectedTrx.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span className="text-slate-600 font-medium">{item.name} x{item.quantity}</span>
                          <span className="font-black text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-b border-dashed border-slate-200 my-4"></div>
                    <div className="flex justify-between items-center font-black text-slate-800">
                      <span className="text-xs uppercase tracking-widest">TOTAL</span>
                      <span className="text-xl">Rp {selectedTrx.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 uppercase font-black tracking-widest"><span>Metode</span><span>{selectedTrx.paymentMethod || 'Tunai'}</span></div>
                  </div>
                  
                  <div className="text-center mb-8 border-t border-slate-50 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Terima Kasih</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase italic">Sistem EMR Terpadu</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 bg-white border-l border-slate-100 p-8 space-y-8 no-print">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Format Cetak</h4>
                   <div className="grid grid-cols-1 gap-3">
                     <button onClick={() => setPrintFormat('standard')} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${printFormat === 'standard' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Printer size={20} /><div className="text-left"><p className="text-sm font-bold">A5 / Standard</p></div></button>
                     <button onClick={() => setPrintFormat('thermal')} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${printFormat === 'thermal' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Zap size={20} /><div className="text-left"><p className="text-sm font-bold">Thermal POS</p></div></button>
                     <button onClick={handleDownloadPDF} className="flex items-center gap-3 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"><Download size={20} /><div className="text-left"><p className="text-sm font-bold">Download PDF</p></div></button>
                   </div>
                </div>
                <button onClick={() => handlePrint(printFormat)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 text-xs uppercase tracking-widest"><Printer size={20} /> CETAK SEKARANG</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashier;

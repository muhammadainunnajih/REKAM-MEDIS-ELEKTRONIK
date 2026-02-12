
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Download, Calendar, 
  Wallet, PieChart, Package, AlertCircle, ArrowUpRight,
  Filter, CheckCircle2, ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Patient, MedicalEntry, Transaction, QueueItem, Medicine, InventoryItem } from '../types';

interface ReportsProps {
  patients: Patient[];
  records: MedicalEntry[];
  transactions: Transaction[];
  queue: QueueItem[];
  medicines: Medicine[];
  inventory: InventoryItem[];
}

const Reports: React.FC<ReportsProps> = ({ 
  patients, records, transactions, queue, medicines, inventory 
}) => {
  const [period, setPeriod] = useState<'Hari' | 'Minggu' | 'Bulan'>('Bulan');
  const [isExporting, setIsExporting] = useState(false);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsPeriodMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const financialStats = useMemo(() => {
    const lunas = transactions.filter(t => t.status === 'Lunas');
    const totalRevenue = lunas.reduce((sum, t) => sum + t.total, 0);
    const avgTrx = lunas.length > 0 ? totalRevenue / lunas.length : 0;
    return { totalRevenue, avgTrx, count: lunas.length };
  }, [transactions]);

  const poliDistribution = useMemo(() => {
    const total = queue.length;
    if (total === 0) return [];
    
    const dist = queue.reduce((acc: any, q) => {
      acc[q.poli] = (acc[q.poli] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dist).map(([label, count]: [string, any]) => ({
      label,
      count,
      percent: Math.round((count / total) * 100)
    })).sort((a, b) => b.percent - a.percent);
  }, [queue]);

  const lowStockAlerts = useMemo(() => {
    const medicineAlerts = medicines.filter(m => m.stock < 50).map(m => ({ name: m.name, stock: m.stock, type: 'Obat' }));
    const inventoryAlerts = inventory.filter(i => i.stock <= i.minStock).map(i => ({ name: i.name, stock: i.stock, type: 'Alat' }));
    return [...medicineAlerts, ...inventoryAlerts];
  }, [medicines, inventory]);

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString('id-ID');
        const fileDate = new Date().toISOString().split('T')[0];

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 64, 175); 
        doc.text('KLINIK SEHAT', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); 
        doc.text('Jl. Kesehatan No. 123, Jakarta Selatan | Telp: (021) 555-0123', 105, 27, { align: 'center' });
        doc.text(`Laporan Operasional Klinik - Periode: ${period}`, 105, 32, { align: 'center' });
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240); 
        doc.line(20, 38, 190, 38);

        // Section: Ringkasan Finansial
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59); 
        doc.text('1. Ringkasan Finansial', 20, 50);
        
        doc.setFontSize(10);
        doc.text(`- Total Pendapatan Bersih: Rp ${financialStats.totalRevenue.toLocaleString('id-ID')}`, 25, 60);
        doc.text(`- Rata-rata Nilai Transaksi: Rp ${Math.round(financialStats.avgTrx).toLocaleString('id-ID')}`, 25, 67);
        doc.text(`- Total Transaksi Lunas: ${financialStats.count} TRX`, 25, 74);

        // Section: Statistik Operasional
        doc.setFontSize(14);
        doc.text('2. Statistik Operasional', 20, 88);
        
        doc.setFontSize(10);
        doc.text(`- Total Pasien Terdaftar: ${patients.length} Pasien`, 25, 98);
        doc.text(`- Kunjungan Pasien Hari Ini: ${queue.length} Pasien`, 25, 105);
        doc.text(`- Total Rekam Medis Tersimpan: ${records.length} Record`, 25, 112);

        // Section: Distribusi Poli
        doc.setFontSize(14);
        doc.text('3. Distribusi Layanan Poli', 20, 126);
        
        let currentY = 136;
        doc.setFontSize(10);
        doc.setFillColor(248, 250, 252); 
        doc.rect(20, currentY - 5, 170, 8, 'F');
        doc.text('Poli Layanan', 25, currentY);
        doc.text('Jumlah Pasien', 80, currentY);
        doc.text('Persentase', 130, currentY);
        
        currentY += 10;
        poliDistribution.forEach((p) => {
          doc.text(p.label, 25, currentY);
          doc.text(`${p.count} Pasien`, 80, currentY);
          doc.text(`${p.percent}%`, 130, currentY);
          currentY += 8;
        });

        // Section: Peringatan Stok
        if (lowStockAlerts.length > 0) {
          doc.setFontSize(14);
          doc.setTextColor(190, 18, 60); 
          doc.text('4. Peringatan Stok Kritis!', 20, currentY + 10);
          
          currentY += 20;
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          lowStockAlerts.slice(0, 10).forEach((alert) => {
            doc.text(`[${alert.type}] ${alert.name} - Sisa Stok: ${alert.stock}`, 25, currentY);
            currentY += 6;
          });
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); 
        doc.text(`Dicetak secara otomatis oleh Sistem EMR Klinik Sehat pada: ${timestamp}`, 105, 285, { align: 'center' });

        doc.save(`Laporan_Klinik_Sehat_${fileDate}.pdf`);
        
      } catch (error) {
        console.error('Gagal membuat PDF:', error);
        alert('Gagal mengekspor laporan. Silakan coba lagi.');
      } finally {
        setIsExporting(false);
      }
    }, 1000);
  };

  const selectPeriod = (p: 'Hari' | 'Minggu' | 'Bulan') => {
    setPeriod(p);
    setIsPeriodMenuOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan & Statistik</h1>
          <p className="text-slate-500">Visualisasi data operasional klinik secara real-time</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-xs font-black transition-all shadow-sm ${
                isPeriodMenuOpen ? 'border-blue-400 ring-2 ring-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar size={14} className={isPeriodMenuOpen ? 'text-blue-500' : 'text-slate-400'} />
              Periode: {period} 
              <ChevronDown size={14} className={`transition-transform duration-200 ${isPeriodMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isPeriodMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl p-1 z-20 w-32 animate-in zoom-in-95 duration-150 origin-top-right">
                {(['Hari', 'Minggu', 'Bulan'] as const).map((p) => (
                  <button 
                    key={p} 
                    onClick={() => selectPeriod(p)}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                      period === p ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            id="export-btn"
            disabled={isExporting}
            onClick={handleExport}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isExporting ? (
              <span className="animate-pulse">Mengekspor...</span>
            ) : (
              <>
                <Download size={14} /> Ekspor PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pendapatan Bersih</p>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-2xl font-black text-slate-800">Rp {financialStats.totalRevenue.toLocaleString('id-ID')}</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpRight size={16}/></div>
          </div>
          <p className="text-[10px] text-emerald-500 font-bold">Terverifikasi: {financialStats.count} TRX</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rata-rata Transaksi</p>
          <h3 className="text-2xl font-black text-slate-800 mb-1">Rp {Math.round(financialStats.avgTrx).toLocaleString('id-ID')}</h3>
          <p className="text-[10px] text-slate-400 font-bold">Per Pasien Lunas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Pasien</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800">{patients.length}</h3>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Kunjungan Baru</p>
          <h3 className="text-2xl font-black text-blue-600">+{queue.length}</h3>
          <p className="text-[10px] text-slate-400 font-bold">Hari Ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" /> Tren Kunjungan Pasien
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-slate-400">PASIEN</span></div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-slate-50"></div>)}
            </div>
            {[45, 70, 35, 90, 50, 100, 65, 80, 40, 95, 110, 85].map((h, i) => (
              <div key={i} className="flex-1 group relative z-10">
                <div 
                  style={{height: `${h}%`}} 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-500 cursor-pointer relative shadow-lg shadow-blue-100"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold">
                    {Math.round(h * 1.5)} Pasien
                  </div>
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-black uppercase whitespace-nowrap">
                   {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-8">
            <PieChart size={18} className="text-emerald-500" /> Distribusi Poli
          </h3>
          <div className="flex-1 space-y-6">
            {poliDistribution.length > 0 ? poliDistribution.map((p, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">{p.label}</span>
                  <span className="text-slate-800">{p.percent}% ({p.count})</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    style={{width: `${p.percent}%`}} 
                    className={`h-full transition-all duration-1000 ${
                      p.label === 'Umum' ? 'bg-blue-500' : 
                      p.label === 'Gigi' ? 'bg-emerald-500' : 
                      p.label === 'Anak' ? 'bg-orange-500' : 'bg-indigo-500'
                    }`}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-300 italic text-sm">Belum ada data antrian hari ini.</div>
            )}
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic text-center">
              "Poli Umum tetap menjadi layanan paling dominan bulan ini dengan pertumbuhan 12%."
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-6 text-sm">
            <Package size={16} className="text-orange-500" /> Stok Paling Dibutuhkan
          </h3>
          <div className="space-y-3">
             {medicines.slice(0, 4).sort((a, b) => a.stock - b.stock).map(m => (
               <div key={m.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.stock < 100 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                      <AlertCircle size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{m.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{m.category}</p>
                    </div>
                 </div>
                 <span className={`text-xs font-black ${m.stock < 100 ? 'text-rose-600' : 'text-slate-800'}`}>{m.stock}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-rose-500" /> Alert Stok Kritis
              </h3>
              <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-3 py-1 rounded-full">{lowStockAlerts.length} BARANG</span>
           </div>
           <div className="flex-1 overflow-y-auto max-h-60 divide-y divide-slate-50">
              {lowStockAlerts.length > 0 ? lowStockAlerts.map((alert, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                      <Package size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{alert.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{alert.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-black text-rose-600">Sisa: {alert.stock}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Segera Re-stock</p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-slate-300">
                   <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500/20" />
                   <p className="text-xs font-bold uppercase">Seluruh stok dalam kondisi aman.</p>
                </div>
              )}
           </div>
           <div className="p-4 bg-white border-t border-slate-50 text-center">
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Lihat Inventaris Selengkapnya</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

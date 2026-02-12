
import React, { useState, useMemo } from 'react';
import { Package, AlertTriangle, Plus, Search, Filter, Edit2, Trash2, X, Save, Boxes, Info } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryProps {
  items: InventoryItem[];
  onAdd: (item: InventoryItem) => void;
  onUpdate: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(items.map(i => i.category)))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           i.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Semua' || i.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  const lowStockCount = useMemo(() => {
    return items.filter(i => i.stock <= i.minStock).length;
  }, [items]);

  const openModal = (mode: 'add' | 'edit', item: InventoryItem | null = null) => {
    setModalMode(mode);
    setSelectedItem(item || {
      id: `inv-${Date.now()}`,
      name: '',
      stock: 0,
      unit: 'Pcs',
      category: 'Alat Medis',
      minStock: 5
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (modalMode === 'add') onAdd(selectedItem);
    else onUpdate(selectedItem);
    setIsModalOpen(false);
  };

  const confirmDelete = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventaris</h1>
          <p className="text-slate-500">Manajemen stok alat kesehatan dan bahan habis pakai</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} /> Tambah Barang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Boxes size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Barang</p>
            <h3 className="text-2xl font-black text-slate-800">{items.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle size={24}/>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stok Menipis</p>
            <h3 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{lowStockCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Info size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kategori</p>
            <h3 className="text-2xl font-black text-slate-800">{categories.length - 1}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari barang..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400 w-full md:w-64" 
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl outline-none border border-slate-100"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Stok Saat Ini</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="text-sm hover:bg-slate-50/50 group transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4 text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-lg">
                        <span className={isLow ? 'text-rose-600' : 'text-slate-800'}>{item.stock}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          isLow ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isLow ? 'Hampir Habis' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openModal('edit', item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-medium">Data inventaris tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{modalMode === 'add' ? 'Tambah Barang Inventaris' : 'Edit Data Barang'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Barang</label>
                <input 
                  type="text" required
                  value={selectedItem.name}
                  onChange={e => setSelectedItem({...selectedItem, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                  <input 
                    type="text" required
                    value={selectedItem.category}
                    onChange={e => setSelectedItem({...selectedItem, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Satuan</label>
                  <input 
                    type="text" required placeholder="Pcs, Box, Roll, dll"
                    value={selectedItem.unit}
                    onChange={e => setSelectedItem({...selectedItem, unit: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Stok Saat Ini</label>
                  <input 
                    type="number" required min="0"
                    value={selectedItem.stock}
                    onChange={e => setSelectedItem({...selectedItem, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ambang Batas Minim (Alert)</label>
                  <input 
                    type="number" required min="1"
                    value={selectedItem.minStock}
                    onChange={e => setSelectedItem({...selectedItem, minStock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" 
                  />
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500">Batal</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2">
                  <Save size={18}/> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Barang?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">Apakah Anda yakin menghapus <strong>{itemToDelete.name}</strong>? Data stok tidak dapat dikembalikan.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95">Ya, Hapus Sekarang</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Batalkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

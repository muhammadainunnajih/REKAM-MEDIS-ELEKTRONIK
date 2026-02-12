
import React, { useState, useMemo } from 'react';
import { 
  UserCog, Plus, Shield, Mail, Key, X, Save, 
  Trash2, Edit2, AlertTriangle, UserCheck, UserMinus, Search, Lock, User
} from 'lucide-react';
import { AppUser, UserRole } from '../types';

interface UserManagementProps {
  users: AppUser[];
  onAdd: (user: AppUser) => void;
  onUpdate: (user: AppUser) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const roles: UserRole[] = ['Administrator', 'Dokter', 'Perawat', 'Apoteker', 'Kasir'];

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const openModal = (mode: 'add' | 'edit', user: AppUser | null = null) => {
    setModalMode(mode);
    setSelectedUser(user || {
      id: `user-${Date.now()}`,
      name: '',
      username: '',
      password: '',
      role: 'Perawat',
      email: '',
      lastActive: '-',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (modalMode === 'add') onAdd(selectedUser);
    else onUpdate(selectedUser);
    setIsModalOpen(false);
  };

  const confirmDelete = (user: AppUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1>
          <p className="text-slate-500">Kelola hak akses dan akun staf klinik</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari user atau username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => openModal('add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={20} /> Tambah User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => openModal('edit', user)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit User"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => confirmDelete(user)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                title="Hapus User"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100">
                <UserCog size={28} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 leading-tight">{user.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    user.role === 'Administrator' ? 'bg-indigo-100 text-indigo-700' : 
                    user.role === 'Dokter' ? 'bg-emerald-100 text-emerald-700' : 
                    user.role === 'Apoteker' ? 'bg-orange-100 text-orange-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-500 border-t border-slate-50 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><User size={14} className="text-slate-400"/></div>
                  <span className="font-bold text-slate-700">@{user.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-50 rounded-lg"><Mail size={14} className="text-slate-400"/></div>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-50 rounded-lg"><Key size={14} className="text-slate-400"/></div>
                <span className="font-medium">Hak Akses: {user.role === 'Administrator' ? 'Penuh' : 'Terbatas'}</span>
              </div>
              <div className="pt-3 flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">Login Terakhir</p>
                <p className="text-[10px] font-black text-slate-600">{user.lastActive}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <UserCog size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">User tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit User */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{modalMode === 'add' ? 'Tambah User Baru' : 'Edit Profil User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                  <input 
                    type="text" required
                    value={selectedUser.name}
                    onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" 
                    placeholder="Nama lengkap staf"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Email</label>
                  <input 
                    type="email" required
                    value={selectedUser.email}
                    onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none" 
                    placeholder="email@klinik.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1"><User size={10}/> Username</label>
                  <input 
                    type="text" required
                    value={selectedUser.username}
                    onChange={e => setSelectedUser({...selectedUser, username: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none bg-blue-50/20" 
                    placeholder="username_login"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1"><Lock size={10}/> Password</label>
                  <input 
                    type="password" required={modalMode === 'add'}
                    value={selectedUser.password || ''}
                    onChange={e => setSelectedUser({...selectedUser, password: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none bg-blue-50/20" 
                    placeholder={modalMode === 'edit' ? 'Isi untuk ganti password' : 'Password login'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Peran / Role</label>
                  <select 
                    value={selectedUser.role}
                    onChange={e => setSelectedUser({...selectedUser, role: e.target.value as UserRole})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status Akun</label>
                  <select 
                    value={selectedUser.status}
                    onChange={e => setSelectedUser({...selectedUser, status: e.target.value as 'Aktif' | 'Nonaktif'})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500">Batal</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2">
                  <Save size={18}/> {modalMode === 'add' ? 'Simpan Akun' : 'Perbarui Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus User */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Akun User?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong>{userToDelete.name}</strong>? Akses staf ke sistem akan segera dihentikan.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95"
              >
                Ya, Hapus Sekarang
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

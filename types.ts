
export interface Patient {
  id: string;
  name: string;
  rmNumber: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  lastVisit: string;
  type: 'Umum' | 'BPJS';
  bpjsClass?: 'Kelas 1' | 'Kelas 2' | 'Kelas 3';
}

export interface MedicalEntry {
  id: string;
  patientId: string;
  date: string;
  doctorName: string;
  subjective: string; // Keluhan utama
  objective: string;  // Pemeriksaan fisik/tanda vital
  assessment: string; // Diagnosa
  plan: string;       // Terapi/Resep/Tindak lanjut
  isProcessed?: boolean; // Status penyiapan obat di apotek
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: 'Tersedia' | 'Sibuk' | 'Tidak Aktif';
  patientsToday: number;
}

export interface Medicine {
  id: string;
  name: string;
  type: string;
  stock: number;
  price: number;
  category: 'Tablet' | 'Sirup' | 'Antibiotik' | 'Suplemen' | 'Lainnya';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  category: string;
  minStock: number;
}

export interface TransactionItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: TransactionItem[];
  total: number;
  status: 'Menunggu' | 'Lunas';
  paymentMethod?: 'Tunai' | 'Debit' | 'QRIS';
}

export interface QueueItem {
  id: string;
  no: string;
  patientId: string;
  patientName: string;
  poli: 'Umum' | 'Gigi' | 'Anak' | 'Kandungan';
  status: 'Menunggu' | 'Diperiksa' | 'Selesai' | 'Batal';
  time: string;
}

export interface Stats {
  totalPatients: number;
  totalMedicalRecords: number;
  patientsToday: number;
}

export type UserRole = 'Administrator' | 'Dokter' | 'Perawat' | 'Apoteker' | 'Kasir';

export interface AppUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  email: string;
  lastActive: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface ClinicSettings {
  name: string;
  logo: string | null;
  email: string;
  phone: string;
  address: string;
  timezone: string;
}

export enum ViewType {
  DASHBOARD = 'Dashboard',
  DATA_PASIEN = 'Data Pasien',
  DATA_DOKTER = 'Data Dokter',
  APOTEK = 'Apotek',
  KASIR = 'Kasir',
  JADWAL = 'Jadwal & Antrian',
  INVENTARIS = 'Inventaris',
  LAPORAN = 'Laporan',
  USER_MGMT = 'Manajemen User',
  PENGATURAN = 'Pengaturan'
}

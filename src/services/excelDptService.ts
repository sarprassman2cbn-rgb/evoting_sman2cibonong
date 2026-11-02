import * as XLSX from 'xlsx';
import { Voter } from '../types/voting.ts';

export interface ParsedDptRow {
  identitas: string;
  nama: string;
  role: 'siswa' | 'guru';
  kelas_atau_jabatan: string;
}

/**
 * Downloads a professionally formatted Excel (.xlsx) template for DPT
 * with sample data and an instructions worksheet.
 */
export const downloadDptExcelTemplate = () => {
  const wb = XLSX.utils.book_new();

  // 1. Data Sheet
  const sampleData = [
    {
      'NIS_atau_NIP': '2425101',
      'Nama_Lengkap': 'Ahmad Fauzan Pratama',
      'Peran': 'siswa',
      'Kelas_atau_Jabatan': 'X-E1'
    },
    {
      'NIS_atau_NIP': '2425102',
      'Nama_Lengkap': 'Bella Safitri',
      'Peran': 'siswa',
      'Kelas_atau_Jabatan': 'X-E2'
    },
    {
      'NIS_atau_NIP': '2324201',
      'Nama_Lengkap': 'Dimas Aditya Saputra',
      'Peran': 'siswa',
      'Kelas_atau_Jabatan': 'XI-MIPA 1'
    },
    {
      'NIS_atau_NIP': '2324202',
      'Nama_Lengkap': 'Fathia Nur Sabrina',
      'Peran': 'siswa',
      'Kelas_atau_Jabatan': 'XI-IPS 2'
    },
    {
      'NIS_atau_NIP': '2223301',
      'Nama_Lengkap': 'Gita Maharani',
      'Peran': 'siswa',
      'Kelas_atau_Jabatan': 'XII-MIPA 1'
    },
    {
      'NIS_atau_NIP': '198001012005011002',
      'Nama_Lengkap': 'Budi Santoso, S.Pd.',
      'Peran': 'guru',
      'Kelas_atau_Jabatan': 'Guru Matematika'
    },
    {
      'NIS_atau_NIP': '197508122005012003',
      'Nama_Lengkap': 'Dra. Siti Rahmah, M.Pd.',
      'Peran': 'guru',
      'Kelas_atau_Jabatan': 'Guru Bahasa Indonesia'
    }
  ];

  const wsData = XLSX.utils.json_to_sheet(sampleData, {
    header: ['NIS_atau_NIP', 'Nama_Lengkap', 'Peran', 'Kelas_atau_Jabatan']
  });

  // Set column widths
  wsData['!cols'] = [
    { wch: 22 }, // NIS_atau_NIP
    { wch: 32 }, // Nama_Lengkap
    { wch: 12 }, // Peran
    { wch: 25 }  // Kelas_atau_Jabatan
  ];

  // 2. Petunjuk Pengisian Sheet
  const petunjukData = [
    {
      'NO': 1,
      'KOLOM': 'NIS_atau_NIP',
      'KETERANGAN': 'Nomor Induk Siswa (NIS) untuk siswa, atau NIP/NUPTK untuk guru. Harus unik (tidak boleh duplikat). Format angka/teks.',
      'CONTOH': '2425101 atau 198001012005011002'
    },
    {
      'NO': 2,
      'KOLOM': 'Nama_Lengkap',
      'KETERANGAN': 'Nama lengkap pemilih sesuai buku induk atau Dapodik sekolah beserta gelar (jika ada).',
      'CONTOH': 'Ahmad Fauzan Pratama'
    },
    {
      'NO': 3,
      'KOLOM': 'Peran',
      'KETERANGAN': 'Wajib diisi "siswa" atau "guru" (huruf kecil atau besar diperbolehkan).',
      'CONTOH': 'siswa / guru'
    },
    {
      'NO': 4,
      'KOLOM': 'Kelas_atau_Jabatan',
      'KETERANGAN': 'Rombel kelas siswa (misal: X-E1, XI-MIPA 1, XII) atau mata pelajaran/tugas guru.',
      'CONTOH': 'X-E1 / Guru Matematika'
    },
    {
      'NO': 5,
      'KOLOM': 'Token Pemilih',
      'KETERANGAN': 'TIDAK PERLU DIISI. Sistem OSISVote akan otomatis meng-generate 6 karakter PIN Token acak untuk setiap pemilih setelah file diunggah.',
      'CONTOH': 'Otomatis oleh sistem'
    }
  ];

  const wsPetunjuk = XLSX.utils.json_to_sheet(petunjukData);
  wsPetunjuk['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 65 },
    { wch: 30 }
  ];

  // Append sheets
  XLSX.utils.book_append_sheet(wb, wsData, 'DPT_PEMILIH');
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'PETUNJUK_PENGISIAN');

  // Trigger file download
  XLSX.writeFile(wb, 'template_dpt_pemilih_smanda.xlsx');
};

/**
 * Parses an Excel (.xlsx, .xls) or CSV file and extracts voter records
 */
export const parseExcelDptFile = async (file: File): Promise<ParsedDptRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Prefer 'DPT_PEMILIH' sheet if present, otherwise first sheet
  const targetSheetName = workbook.SheetNames.includes('DPT_PEMILIH')
    ? 'DPT_PEMILIH'
    : workbook.SheetNames[0];

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error('Lembar kerja (sheet) tidak ditemukan dalam file Excel');
  }

  // Convert to array of arrays
  const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    raw: false,
    defval: ''
  });

  if (!rawRows || rawRows.length < 2) {
    throw new Error('File Excel tidak memiliki baris data');
  }

  // Detect header indices
  const headerRow = rawRows[0].map(h => String(h || '').trim().toLowerCase().replace(/[\s_-]+/g, ''));
  
  let identitasIdx = headerRow.findIndex(h => h.includes('identitas') || h.includes('nis') || h.includes('nip'));
  let namaIdx = headerRow.findIndex(h => h.includes('nama'));
  let roleIdx = headerRow.findIndex(h => h.includes('role') || h.includes('peran') || h.includes('status'));
  let kelasIdx = headerRow.findIndex(h => h.includes('kelas') || h.includes('jabatan') || h.includes('rombel'));

  // Default fallback if headers weren't named standardly
  if (identitasIdx === -1) identitasIdx = 0;
  if (namaIdx === -1) namaIdx = 1;
  if (roleIdx === -1) roleIdx = 2;
  if (kelasIdx === -1) kelasIdx = 3;

  const parsedList: ParsedDptRow[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const identitas = String(row[identitasIdx] || '').trim();
    const nama = String(row[namaIdx] || '').trim();
    if (!identitas || !nama) continue;

    // Skip repeat headers or instructions
    if (identitas.toLowerCase().includes('nis') || identitas.toLowerCase().includes('identitas')) continue;

    const roleRaw = String(row[roleIdx] || '').trim().toLowerCase();
    const role: 'siswa' | 'guru' = roleRaw.includes('guru') ? 'guru' : 'siswa';

    const kelas = String(row[kelasIdx] || '').trim() || (role === 'guru' ? 'Dewan Guru' : 'Kelas Umum');

    parsedList.push({
      identitas,
      nama,
      role,
      kelas_atau_jabatan: kelas
    });
  }

  return parsedList;
};

/**
 * Exports current voters to Excel (.xlsx) with formatting
 */
export const exportDptToExcel = (voters: Voter[], filenamePrefix = 'DPT_SMAN2_CIBINONG') => {
  const wb = XLSX.utils.book_new();

  // All Voters (excluding admin)
  const regularVoters = voters.filter(v => v.role !== 'admin');

  const formattedData = regularVoters.map((v, idx) => ({
    'No': idx + 1,
    'NIS_atau_NIP': v.identitas,
    'Nama_Pemilih': v.nama,
    'Kategori': v.role.toUpperCase(),
    'Kelas_atau_Jabatan': v.kelas_atau_jabatan,
    'PIN_Token': v.token,
    'Status_Memilih': v.is_voted ? 'SUDAH' : 'BELUM',
    'Waktu_Memilih': v.voted_at || '-'
  }));

  const wsAll = XLSX.utils.json_to_sheet(formattedData);
  wsAll['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 32 },
    { wch: 12 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 22 }
  ];

  XLSX.utils.book_append_sheet(wb, wsAll, 'SEMUA_PEMILIH');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`);
};

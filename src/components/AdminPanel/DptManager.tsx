import React, { useState, useRef } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { Voter } from '../../types/voting.ts';
import { TokenDistributionModal } from './TokenDistributionModal.tsx';
import { 
  downloadDptExcelTemplate, 
  parseExcelDptFile, 
  exportDptToExcel, 
  ParsedDptRow 
} from '../../services/excelDptService.ts';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  RefreshCw, 
  Printer, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Download,
  FileDown,
  Upload,
  AlertCircle,
  FileCheck,
  ChevronDown
} from 'lucide-react';

export const DptManager: React.FC = () => {
  const { 
    voters, 
    addVoter, 
    deleteVoter, 
    batchImportVoters, 
    regenerateToken, 
    regenerateAllUnvotedTokens 
  } = useVoting();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'siswa' | 'guru' | 'unvoted' | 'voted'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // New Voter Form state
  const [newIdentitas, setNewIdentitas] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newRole, setNewRole] = useState<'siswa' | 'guru'>('siswa');
  const [newKelas, setNewKelas] = useState('');
  const [addError, setAddError] = useState('');

  // Excel / CSV Import State
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const [importText, setImportText] = useState('');
  const [importResultMsg, setImportResultMsg] = useState('');
  const [parsedPreviewList, setParsedPreviewList] = useState<ParsedDptRow[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Voters
  const filtered = voters.filter(v => {
    // Hide default super admin from regular DPT table for clarity
    if (v.role === 'admin') return false;

    const matchesSearch = v.nama.toLowerCase().includes(search.toLowerCase()) || 
                          v.identitas.toLowerCase().includes(search.toLowerCase()) ||
                          v.kelas_atau_jabatan.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'siswa') return v.role === 'siswa';
    if (roleFilter === 'guru') return v.role === 'guru';
    if (roleFilter === 'unvoted') return !v.is_voted;
    if (roleFilter === 'voted') return v.is_voted;
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 1500);
  };

  const toggleReveal = (id: string) => {
    setRevealedTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newIdentitas.trim() || !newNama.trim() || !newKelas.trim()) {
      setAddError('Semua kolom wajib diisi');
      return;
    }

    if (voters.some(v => v.identitas.toLowerCase() === newIdentitas.trim().toLowerCase())) {
      setAddError('NIS/NIP sudah terdaftar dalam DPT');
      return;
    }

    await addVoter({
      identitas: newIdentitas.trim(),
      nama: newNama.trim(),
      role: newRole,
      kelas_atau_jabatan: newKelas.trim(),
      token: ''
    });

    setNewIdentitas('');
    setNewNama('');
    setNewKelas('');
    setShowAddModal(false);
  };

  const handleDownloadExcelTemplate = () => {
    downloadDptExcelTemplate();
  };

  const handleExportExcel = () => {
    exportDptToExcel(voters);
    setShowExportMenu(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsingFile(true);
    setImportResultMsg('');

    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        setImportText(text);
        const lines = text.split('\n');
        const rows: ParsedDptRow[] = [];
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line.startsWith('#') || line.toLowerCase().startsWith('identitas') || line.toLowerCase().startsWith('nis')) continue;
          const parts = line.split(/[,;\t]/);
          if (parts.length >= 2) {
            const identitas = parts[0]?.replace(/^"|"$/g, '').trim();
            const nama = parts[1]?.replace(/^"|"$/g, '').trim();
            const roleStr = (parts[2] || '').replace(/^"|"$/g, '').trim().toLowerCase();
            const kelas = (parts[3] || '').replace(/^"|"$/g, '').trim() || (roleStr === 'guru' ? 'Dewan Guru' : 'Kelas Umum');
            const role: 'siswa' | 'guru' = roleStr.includes('guru') ? 'guru' : 'siswa';
            if (identitas && nama) {
              rows.push({ identitas, nama, role, kelas_atau_jabatan: kelas });
            }
          }
        }
        setParsedPreviewList(rows);
      } else {
        // Excel (.xlsx / .xls)
        const parsed = await parseExcelDptFile(file);
        setParsedPreviewList(parsed);
      }
    } catch (err: any) {
      setImportResultMsg(`Gagal membaca file: ${err?.message || 'Pastikan file Excel berformat .xlsx atau .xls'}`);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportResultMsg('');

    let listToImport: ParsedDptRow[] = [];

    if (importMode === 'file' && parsedPreviewList.length > 0) {
      listToImport = parsedPreviewList;
    } else if (importText.trim()) {
      const lines = importText.split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.toLowerCase().startsWith('identitas') || line.toLowerCase().startsWith('nis')) continue;

        const parts = line.split(/[,;\t]/);
        if (parts.length >= 2) {
          const identitas = parts[0]?.replace(/^"|"$/g, '').trim();
          const nama = parts[1]?.replace(/^"|"$/g, '').trim();
          const roleStr = (parts[2] || '').replace(/^"|"$/g, '').trim().toLowerCase();
          const kelas = (parts[3] || '').replace(/^"|"$/g, '').trim() || (roleStr === 'guru' ? 'Dewan Guru' : 'Kelas Umum');
          const role: 'siswa' | 'guru' = roleStr.includes('guru') ? 'guru' : 'siswa';

          if (identitas && nama) {
            listToImport.push({ identitas, nama, role, kelas_atau_jabatan: kelas });
          }
        }
      }
    }

    if (listToImport.length === 0) {
      setImportResultMsg('Format data tidak terbaca. Pastikan memilih file Excel yang valid atau mengisi teks CSV.');
      return;
    }

    const count = await batchImportVoters(listToImport);
    setImportResultMsg(`Berhasil menambahkan ${count} pemilih baru ke DPT!`);
    setTimeout(() => {
      setShowImportModal(false);
      setImportText('');
      setParsedPreviewList([]);
      setUploadedFileName('');
      setImportResultMsg('');
    }, 1400);
  };

  const handleRegenerateAll = async () => {
    if (confirm('Yakin ingin men-generate ulang semua token untuk pemilih yang BELUM mencoblos? Token lama pemilih tersebut tidak akan berlaku lagi.')) {
      setIsRefreshingAll(true);
      await regenerateAllUnvotedTokens();
      setIsRefreshingAll(false);
    }
  };

  // Export DPT as CSV
  const handleExportCsv = () => {
    setShowExportMenu(false);
    const headers = ['Identitas', 'Nama', 'Role', 'Kelas_atau_Jabatan', 'Token', 'Sudah_Memilih', 'Waktu_Memilih'];
    const rows = voters.filter(v => v.role !== 'admin').map(v => [
      `"${v.identitas}"`,
      `"${v.nama}"`,
      `"${v.role}"`,
      `"${v.kelas_atau_jabatan}"`,
      `"${v.token}"`,
      v.is_voted ? 'YA' : 'BELUM',
      v.voted_at || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DPT_SMAN2_CIBINONG_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download CSV Template for importing voters
  const handleDownloadTemplateCsv = () => {
    const headers = ['identitas', 'nama', 'role', 'kelas_atau_jabatan'];
    const sampleRows = [
      ['2425101', 'Ahmad Fauzan Pratama', 'siswa', 'X-E1'],
      ['2425102', 'Bella Safitri', 'siswa', 'X-E2'],
      ['2324201', 'Dimas Aditya Saputra', 'siswa', 'XI-MIPA 1'],
      ['2324202', 'Fathia Nur Sabrina', 'siswa', 'XI-IPS 2'],
      ['2223301', 'Gita Maharani', 'siswa', 'XII-MIPA 1'],
      ['198001012005011002', 'Budi Santoso, S.Pd.', 'guru', 'Guru Matematika'],
      ['197508122005012003', 'Dra. Siti Rahmah, M.Pd.', 'guru', 'Guru Bahasa Indonesia']
    ];

    const csvRows = [
      headers.join(','),
      ...sampleRows.map(row => row.map(val => `"${val}"`).join(','))
    ];

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_dpt_pemilih_osis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Manajemen DPT
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-slate-500">
              Total: {voters.filter(v => v.role !== 'admin').length} Pemilih Terdaftar
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Daftar Pemilih Tetap (DPT) & Generator Token
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Download Excel Template Button */}
          <button
            onClick={handleDownloadExcelTemplate}
            className="py-2 px-3 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Download file template Excel (.xlsx) dengan 2 lembar kerja dan panduan pengisian"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Template Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleDownloadTemplateCsv}
            className="py-2 px-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Download file template CSV teks murni"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => setShowDistributionModal(true)}
            className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Kartu & WA</span>
          </button>

          <button
            onClick={() => {
              setParsedPreviewList([]);
              setUploadedFileName('');
              setImportText('');
              setImportResultMsg('');
              setShowImportModal(true);
            }}
            className="py-2 px-3 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-3 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-blue-600" />
            <span>Tambah</span>
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="py-2 px-3 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ekspor Data DPT"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>Ekspor DPT</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 text-xs">
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Format Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <FileDown className="h-4 w-4 text-amber-600" />
                  <span>Format CSV (.csv)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIS, NIP, atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'all' 
                ? 'bg-blue-700 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Semua ({voters.filter(v => v.role !== 'admin').length})
          </button>
          <button
            onClick={() => setRoleFilter('siswa')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'siswa' 
                ? 'bg-blue-700 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Siswa ({voters.filter(v => v.role === 'siswa').length})
          </button>
          <button
            onClick={() => setRoleFilter('guru')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'guru' 
                ? 'bg-blue-700 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Guru ({voters.filter(v => v.role === 'guru').length})
          </button>
          <button
            onClick={() => setRoleFilter('unvoted')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'unvoted' 
                ? 'bg-amber-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Belum Memilih ({voters.filter(v => v.role !== 'admin' && !v.is_voted).length})
          </button>
          <button
            onClick={() => setRoleFilter('voted')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'voted' 
                ? 'bg-emerald-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Sudah Memilih ({voters.filter(v => v.role !== 'admin' && v.is_voted).length})
          </button>

          <button
            onClick={handleRegenerateAll}
            disabled={isRefreshingAll}
            className="ml-auto px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            title="Generate token acak baru untuk semua yang belum memilih"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingAll ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh Semua Token</span>
          </button>
        </div>
      </div>

      {/* DPT Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3 w-12 text-center font-mono-numbers">No</th>
                <th className="px-4 py-3">Identitas (NIS/NIP)</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Kelas / Jabatan</th>
                <th className="px-4 py-3">Token PIN (6 Digit)</th>
                <th className="px-4 py-3 text-center">Status Suara</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Tidak ada data pemilih yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((voter, idx) => {
                  const isRevealed = revealedTokens[voter.id];
                  return (
                    <tr key={voter.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-center font-mono-numbers text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-mono-numbers font-bold text-slate-900 dark:text-white">
                        {voter.identitas}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {voter.nama}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {voter.kelas_atau_jabatan}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 font-mono-numbers bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          <span className="font-extrabold text-blue-700 dark:text-blue-400 tracking-wider">
                            {isRevealed ? voter.token : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(voter.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                          >
                            {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(voter.id, voter.token)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                            title="Salin Token"
                          >
                            {copiedTokenId === voter.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {voter.is_voted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Sudah Memilih</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Clock className="h-3 w-3" />
                            <span>Belum Hadir</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => regenerateToken(voter.id)}
                            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer"
                            title="Regenerate Token Baru"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus ${voter.nama} dari DPT?`)) {
                                deleteVoter(voter.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            title="Hapus Pemilih"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Pemilih Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm p-1 cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Tambah Pemilih Baru
            </h3>

            {addError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Pemilih
                </label>
                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => setNewRole('siswa')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md ${newRole === 'siswa' ? 'bg-white shadow dark:bg-slate-700 text-blue-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('guru')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md ${newRole === 'guru' ? 'bg-white shadow dark:bg-slate-700 text-blue-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    Guru
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {newRole === 'siswa' ? 'Nomor Induk Siswa (NIS)' : 'NIP / NUPTK'}
                </label>
                <input
                  type="text"
                  required
                  value={newIdentitas}
                  onChange={(e) => setNewIdentitas(e.target.value)}
                  placeholder={newRole === 'siswa' ? '2425109' : '198501012010011005'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Rian Anggara Putra"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kelas / Jabatan
                </label>
                <input
                  type="text"
                  required
                  value={newKelas}
                  onChange={(e) => setNewKelas(e.target.value)}
                  placeholder={newRole === 'siswa' ? 'X-E3 atau XI-MIPA 1' : 'Guru Biologi'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Simpan Pemilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Import CSV / Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Massal DPT dari Excel / CSV
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Unggah file spreadsheet Dapodik atau buku induk sekolah untuk mendaftarkan siswa dan guru sekaligus.
            </p>

            {/* Template Download Section */}
            <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-blue-600" />
                <span>Unduh Template Format Data Pemilih:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Excel Template Card */}
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="p-3 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      <span>Template Excel (.xlsx)</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      Disarankan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Format resmi Microsoft Excel dengan 2 lembar kerja & petunjuk pengisian kolom.
                  </p>
                </button>

                {/* CSV Template Card */}
                <button
                  type="button"
                  onClick={handleDownloadTemplateCsv}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileDown className="h-4 w-4 text-amber-600" />
                      <span>Template CSV (.csv)</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Teks Murni
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Format comma-separated values untuk diimpor lewat teks langsung.
                  </p>
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-4">
              <button
                type="button"
                onClick={() => setImportMode('file')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  importMode === 'file'
                    ? 'bg-white shadow text-blue-900 dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File Excel / CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('text')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  importMode === 'text'
                    ? 'bg-white shadow text-blue-900 dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Tempel Manual (CSV Text)</span>
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              {importMode === 'file' ? (
                <div className="space-y-3">
                  {/* File Upload Drag/Drop Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50/20 transition-all cursor-pointer group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      {isParsingFile ? (
                        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                      ) : (
                        <FileSpreadsheet className="h-6 w-6" />
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {uploadedFileName ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono-numbers">
                          File Terpilih: {uploadedFileName}
                        </span>
                      ) : (
                        <span>Klik untuk Memilih File Excel (.xlsx, .xls) atau CSV</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sistem akan otomatis mengekstrak kolom NIS/NIP, Nama, Peran, dan Kelas.
                    </p>
                  </div>

                  {/* Parsed Preview Table */}
                  {parsedPreviewList.length > 0 && (
                    <div className="space-y-2 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3 bg-emerald-50/30 dark:bg-emerald-950/20 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>
                            {parsedPreviewList.length} Pemilih Terbaca: {parsedPreviewList.filter(p => p.role === 'siswa').length} Siswa · {parsedPreviewList.filter(p => p.role === 'guru').length} Guru
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Pratinjau 5 Data Pertama
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold">
                            <tr>
                              <th className="py-1.5 px-2.5">NIS / NIP</th>
                              <th className="py-1.5 px-2.5">Nama Pemilih</th>
                              <th className="py-1.5 px-2.5">Peran</th>
                              <th className="py-1.5 px-2.5">Kelas / Jabatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {parsedPreviewList.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <td className="py-1.5 px-2.5 font-mono-numbers font-semibold text-slate-900 dark:text-white">
                                  {row.identitas}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-800 dark:text-slate-200">
                                  {row.nama}
                                </td>
                                <td className="py-1.5 px-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    row.role === 'guru'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  }`}>
                                    {row.role}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-600 dark:text-slate-400">
                                  {row.kelas_atau_jabatan}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedPreviewList.length > 5 && (
                        <p className="text-[10px] text-slate-500 text-right">
                          ... dan {parsedPreviewList.length - 5} baris lainnya akan diproses saat import.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-mono-numbers text-slate-600 dark:text-slate-300">
                    <span className="font-bold block mb-0.5 text-slate-800 dark:text-slate-200">Format Baris:</span>
                    identitas, nama, role, kelas_atau_jabatan<br />
                    <span className="text-slate-400">Contoh: 2425110, Ahmad Fauzan, siswa, X-E1</span>
                  </div>

                  <div>
                    <textarea
                      rows={6}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Tempel baris teks CSV atau copy-paste dari Excel disini..."
                      className="w-full p-3 text-xs font-mono-numbers bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              {importResultMsg && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  importResultMsg.includes('Berhasil')
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                }`}>
                  {importResultMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={importMode === 'file' ? parsedPreviewList.length === 0 : !importText.trim()}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>
                    {importMode === 'file' && parsedPreviewList.length > 0
                      ? `Proses Import ${parsedPreviewList.length} Pemilih`
                      : 'Proses Import Massal'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribution Modal */}
      {showDistributionModal && (
        <TokenDistributionModal onClose={() => setShowDistributionModal(false)} />
      )}
    </div>
  );
};

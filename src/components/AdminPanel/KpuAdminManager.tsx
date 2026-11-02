import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { Voter } from '../../types/voting.ts';
import { 
  ShieldCheck, 
  UserPlus, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  KeyRound, 
  AlertCircle, 
  Edit3, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const KpuAdminManager: React.FC = () => {
  const { 
    voters, 
    addVoter, 
    deleteVoter, 
    regenerateToken, 
    currentVoter 
  } = useVoting();

  const [showAddModal, setShowAddModal] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // New Admin Form State
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('Divisi Teknis & IT');
  const [customToken, setCustomToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter all voters with role === 'admin'
  const adminList = voters.filter(v => v.role === 'admin');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 1500);
  };

  const toggleReveal = (id: string) => {
    setRevealedTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername || !nama.trim() || !jabatan.trim()) {
      setErrorMsg('Semua kolom wajib diisi dengan benar');
      return;
    }

    if (voters.some(v => v.identitas.toLowerCase() === cleanUsername)) {
      setErrorMsg(`Username '${cleanUsername}' sudah digunakan. Pilih username lain.`);
      return;
    }

    await addVoter({
      identitas: cleanUsername,
      nama: nama.trim(),
      role: 'admin',
      kelas_atau_jabatan: jabatan.trim(),
      token: customToken.trim().toUpperCase() || ''
    });

    setSuccessMsg(`Admin KPU '${nama}' (${cleanUsername}) berhasil ditambahkan!`);
    setUsername('');
    setNama('');
    setCustomToken('');
    setTimeout(() => {
      setShowAddModal(false);
      setSuccessMsg('');
    }, 1200);
  };

  const handleDeleteAdmin = async (admin: Voter) => {
    if (adminList.length <= 1) {
      alert('Tidak dapat menghapus admin terakhir. Sistem membutuhkan minimal satu akun administrator aktif.');
      return;
    }

    if (admin.id === currentVoter?.id) {
      if (!confirm('PERINGATAN: Anda sedang menghapus akun yang sedang Anda gunakan saat ini. Anda akan langsung dikeluarkan dari sesi setelah akun dihapus. Lanjutkan?')) {
        return;
      }
    } else {
      if (!confirm(`Yakin ingin mencabut hak akses admin untuk ${admin.nama} (${admin.identitas})?`)) {
        return;
      }
    }

    await deleteVoter(admin.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Otoritas & Akses Panitia
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {adminList.length} Petugas Terdaftar
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Manajemen Administrator KPU Sekolah
          </h2>
          <p className="text-xs text-slate-500">
            Kelola hak akses panitia pemilihan OSIS, dewan guru pembina, dan staf teknis bilik suara.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Admin KPU Baru</span>
        </button>
      </div>

      {/* Grid of Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminList.map((admin) => {
          const isRevealed = revealedTokens[admin.id];
          const isCurrentSession = admin.id === currentVoter?.id;

          return (
            <div
              key={admin.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                isCurrentSession
                  ? 'bg-blue-50/40 border-blue-300 dark:bg-blue-950/20 dark:border-blue-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 flex items-center justify-center font-extrabold text-sm shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isCurrentSession && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                        Sesi Anda
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase">
                      Admin KPU
                    </span>
                  </div>
                </div>

                {/* Name & Title */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {admin.nama}
                </h3>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                  {admin.kelas_atau_jabatan}
                </p>

                {/* Username */}
                <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] uppercase font-bold">Username Login:</span>
                    <span className="font-mono-numbers font-bold text-slate-900 dark:text-white">
                      {admin.identitas}
                    </span>
                  </div>

                  {/* Token Box */}
                  <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold">PIN Token:</span>
                    <div className="flex items-center gap-1.5 font-mono-numbers">
                      <strong className="text-blue-700 dark:text-blue-400 font-extrabold tracking-wider">
                        {isRevealed ? admin.token : '••••••'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => toggleReveal(admin.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                        title={isRevealed ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(admin.id, admin.token)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                        title="Salin PIN Token"
                      >
                        {copiedTokenId === admin.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => regenerateToken(admin.id)}
                  className="py-1.5 px-2.5 text-xs font-semibold text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-white rounded flex items-center gap-1 transition-colors cursor-pointer"
                  title="Generate Token Acak Baru"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh PIN</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteAdmin(admin)}
                  disabled={adminList.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Hapus Hak Akses Admin"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Tambah Admin KPU Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Tambah Administrator KPU Baru
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Akun admin memiliki wewenang membuka/menutup pemilu, mengelola DPT, dan mencetak Berita Acara.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username Panitia (Untuk Login)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Contoh: kpu_teknis atau admin_rahmat"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono-numbers"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Hanya huruf kecil, angka, atau garis bawah</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Petugas
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Rahmat Hidayat, S.Pd."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan / Divisi KPU
                </label>
                <select
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="Ketua KPU OSIS">Ketua KPU OSIS</option>
                  <option value="Sekretaris KPU OSIS">Sekretaris KPU OSIS</option>
                  <option value="Divisi Teknis & IT">Divisi Teknis & IT</option>
                  <option value="Divisi Logistik & Bilik Suara">Divisi Logistik & Bilik Suara</option>
                  <option value="Divisi Pendaftaran & DPT">Divisi Pendaftaran & DPT</option>
                  <option value="Pembina OSIS">Pembina OSIS</option>
                  <option value="Pengawas Pemilu Sekolah">Pengawas Pemilu Sekolah</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    PIN Token Rahasia (Opsional)
                  </label>
                  <span className="text-[10px] text-slate-400">Kosongkan untuk otomatis 6 digit acak</span>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value.toUpperCase())}
                  placeholder="Contoh: KPU778 (Bila ingin custom)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono-numbers uppercase tracking-wider font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  Simpan Admin KPU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

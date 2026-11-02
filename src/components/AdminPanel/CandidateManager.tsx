import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { Candidate } from '../../types/voting.ts';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, Award, Video } from 'lucide-react';

export const CandidateManager: React.FC = () => {
  const { candidates, saveCandidate, deleteCandidate } = useVoting();
  const [editingCandidate, setEditingCandidate] = useState<Partial<Candidate> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [nomorUrut, setNomorUrut] = useState(1);
  const [namaKetua, setNamaKetua] = useState('');
  const [namaWakil, setNamaWakil] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [visi, setVisi] = useState('');
  const [misiText, setMisiText] = useState('');
  const [prokerText, setProkerText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const openAddModal = () => {
    setEditingCandidate(null);
    setNomorUrut(candidates.length + 1);
    setNamaKetua('');
    setNamaWakil('');
    setFotoUrl('/src/assets/images/paslon1_portrait_1793591739789.jpg');
    setVisi('');
    setMisiText('');
    setProkerText('');
    setVideoUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (cand: Candidate) => {
    setEditingCandidate(cand);
    setNomorUrut(cand.nomor_urut);
    setNamaKetua(cand.nama_ketua);
    setNamaWakil(cand.nama_wakil);
    setFotoUrl(cand.foto_url);
    setVisi(cand.visi);
    setMisiText(cand.misi.join('\n'));
    setProkerText(cand.program_kerja.join('\n'));
    setVideoUrl(cand.video_url || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const misiList = misiText
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const prokerList = prokerText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    await saveCandidate({
      id: editingCandidate?.id,
      nomor_urut: Number(nomorUrut),
      nama_ketua: namaKetua.trim(),
      nama_wakil: namaWakil.trim(),
      foto_url: fotoUrl.trim() || '/src/assets/images/paslon1_portrait_1793591739789.jpg',
      visi: visi.trim(),
      misi: misiList.length > 0 ? misiList : ['Menjalankan amanah OSIS secara bertanggung jawab'],
      program_kerja: prokerList.length > 0 ? prokerList : ['Program kerja kolaborasi siswa'],
      video_url: videoUrl.trim()
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            Manajemen Paslon
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Daftar Pasangan Calon Ketua & Wakil Ketua OSIS
          </h2>
          <p className="text-xs text-slate-500">
            Kelola nomor urut, foto resmi, visi, misi, dan program kerja unggulan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Paslon Baru</span>
        </button>
      </div>

      {/* Candidates List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
              <img
                src={cand.foto_url}
                alt={cand.nama_ketua}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-blue-900 text-white font-extrabold text-sm w-9 h-9 rounded-xl flex items-center justify-center shadow">
                0{cand.nomor_urut}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                  Paslon No. 0{cand.nomor_urut}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {cand.nama_ketua}
                </h3>
                <p className="text-xs text-slate-500">
                  Wakil: <strong className="text-slate-800 dark:text-slate-200">{cand.nama_wakil}</strong>
                </p>

                <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                  &ldquo;{cand.visi}&rdquo;
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  <span className="font-bold">{cand.misi.length} Misi</span> · <span className="font-bold">{cand.program_kerja.length} Program Unggulan</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(cand)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus Paslon No. ${cand.nomor_urut}?`)) {
                      deleteCandidate(cand.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Paslon"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl my-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm p-1 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingCandidate ? `Edit Paslon No. 0${nomorUrut}` : 'Tambah Pasangan Calon Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Urut
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={nomorUrut}
                    onChange={(e) => setNomorUrut(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono-numbers text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Calon Ketua
                  </label>
                  <input
                    type="text"
                    required
                    value={namaKetua}
                    onChange={(e) => setNamaKetua(e.target.value)}
                    placeholder="Nama lengkap ketua"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Calon Wakil
                  </label>
                  <input
                    type="text"
                    required
                    value={namaWakil}
                    onChange={(e) => setNamaWakil(e.target.value)}
                    placeholder="Nama lengkap wakil"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Photo selection / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Resmi Paslon (URL atau Preset)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    placeholder="Masukkan URL foto..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                {/* Presets */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500">Pilih Preset SMAN 2:</span>
                  <button
                    type="button"
                    onClick={() => setFotoUrl('/src/assets/images/paslon1_portrait_1793591739789.jpg')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Paslon 1 (Navy Blazer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoUrl('/src/assets/images/paslon2_portrait_1793591740886.jpg')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Paslon 2 (Batik)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoUrl('/src/assets/images/paslon3_portrait_1793591740831.jpg')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Paslon 3 (Modern)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Visi Kepemimpinan
                </label>
                <textarea
                  rows={2}
                  required
                  value={visi}
                  onChange={(e) => setVisi(e.target.value)}
                  placeholder="Visi utama paslon..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Misi (1 baris per butir misi)
                  </label>
                  <span className="text-[10px] text-slate-400">Tekan Enter untuk baris baru</span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={misiText}
                  onChange={(e) => setMisiText(e.target.value)}
                  placeholder="Misi 1&#10;Misi 2&#10;Misi 3"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono-numbers"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Program Kerja Unggulan (1 baris per program)
                  </label>
                  <span className="text-[10px] text-slate-400">Tekan Enter untuk baris baru</span>
                </div>
                <textarea
                  rows={3}
                  value={prokerText}
                  onChange={(e) => setProkerText(e.target.value)}
                  placeholder="Program 1&#10;Program 2&#10;Program 3"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono-numbers"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Simpan Paslon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

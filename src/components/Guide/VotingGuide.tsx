import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  HelpCircle, 
  ClipboardList, 
  Calendar, 
  Printer, 
  FileSpreadsheet, 
  Vote, 
  BarChart3, 
  FileText, 
  ArrowRight,
  Sparkles,
  Server,
  Wifi
} from 'lucide-react';

export const VotingGuide: React.FC = () => {
  const [activeGuideTab, setActiveGuideTab] = useState<'voter' | 'committee'>('committee');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3">
          <ShieldCheck className="h-4 w-4" />
          <span>Panduan Resmi E-Voting SMANDA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Pusat Panduan & SOP Pelaksanaan Pemilu
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Panduan langkah operasional bagi Panitia KPU Sekolah serta tata cara pemungutan suara digital berstandar LUBER JURDIL.
        </p>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 max-w-md mx-auto mt-6">
          <button
            onClick={() => setActiveGuideTab('committee')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeGuideTab === 'committee'
                ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>SOP Langkah Panitia KPU</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('voter')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeGuideTab === 'voter'
                ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Vote className="h-3.5 w-3.5" />
            <span>Tata Cara Pemilih (Siswa & Guru)</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: SOP LANGKAH PANITIA KPU ===================== */}
      {activeGuideTab === 'committee' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Quick Summary Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Roadmap KPU SMAN 2 Cibinong</span>
            </div>
            <h2 className="text-xl font-extrabold">
              3 Fase Utama Pelaksanaan E-Voting OSIS
            </h2>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Ikuti alur terstruktur dari tahap persiapan data master DPT, pelaksanaan pemungutan suara pada Hari-H, hingga rapat pleno pencetakan Berita Acara (BAST).
            </p>
          </div>

          {/* FASE 1: PRA-PEMILIHAN */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Fase 1: Persiapan (H-7 s/d H-1)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Konfigurasi Data DPT & Distribusi Kartu Suara
                </h3>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    1. Daftarkan Petugas & Administrator KPU
                  </strong>
                  Buka tab <strong>Panel KPU → Petugas & Admin KPU</strong>. Tambahkan akun panitia (Ketua KPU, Sekretaris, Divisi IT/Bilik Suara, Pembina OSIS, Pengawas) dan bagikan username serta PIN token rahasianya.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    2. Siapkan & Impor DPT Pemilih (Excel / CSV)
                  </strong>
                  Buka tab <strong>Panel KPU → Manajemen DPT</strong>. Klik tombol <strong>&ldquo;Template Excel (.xlsx)&rdquo;</strong> untuk mengunduh format spreadsheet resmi (2 lembar kerja + petunjuk NIS/NIP), isi data siswa dan guru, lalu unggah langsung melalui tombol <strong>&ldquo;Import Excel / CSV&rdquo;</strong> dengan pratinjau otomatis.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <Printer className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    3. Cetak Kartu Pemilih PDF (Format A4)
                  </strong>
                  Buka <strong>&ldquo;Cetak Kartu & WA&rdquo;</strong>. Sistem otomatis menata 8 kartu ber-QR Code per lembar A4. Klik <strong>&ldquo;Download PDF (A4)&rdquo;</strong> untuk mencetak kartu fisik dengan batas potong, atau salin teks broadcast untuk dibagikan via grup WhatsApp kelas.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <Wifi className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    4. Uji Coba Kesiapan Lab & Jaringan Sekolah
                  </strong>
                  Pastikan komputer laboratorium atau hotspot WiFi sekolah dapat membuka tautan aplikasi. Aplikasi berbasis web responsif ringan dan tidak membebani kuota data.
                </div>
              </div>
            </div>
          </div>

          {/* FASE 2: HARI PEMILIHAN */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Fase 2: Pelaksanaan (Hari-H Pemungutan Suara)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Masa Pencoblosan & Pengawasan Bilik Suara
                </h3>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <Vote className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    1. Buka Sesi Pemilihan Tepat Waktu
                  </strong>
                  Di <strong>Panel KPU → Kontrol Sesi</strong>, klik tombol hijau <strong>&ldquo;Buka Masa Pencoblosan&rdquo;</strong> pada jam yang ditentukan (misal pukul 07.30 WIB). Bilik suara akan otomatis aktif untuk seluruh pemilih.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    2. Kunci Tampilan Hasil Suara (Live Count) ke Publik
                  </strong>
                  Aktifkan tombol <strong>&ldquo;Kunci untuk Pemilih&rdquo;</strong> agar perolehan suara sementara hanya bisa dilihat oleh panitia, sehingga tidak menggiring opini pemilih lain yang belum mencoblos.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <BarChart3 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    3. Pantau Arus Suara & Buka Meja Bantuan (Helpdesk)
                  </strong>
                  Gunakan <strong>Grafik Tren Waktu</strong> untuk melihat jam-jam puncak kedatangan pemilih. Jika ada siswa yang kehilangan kartu token, panitia dapat men-generate token baru melalui tabel DPT (hanya untuk akun yang belum mencoblos).
                </div>
              </div>
            </div>
          </div>

          {/* FASE 3: PASCA-PEMILIHAN */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Fase 3: Pleno & Penutupan (Pasca-Pemilihan)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Penetapan Paslon Terpilih & Cetak Berita Acara
                </h3>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <Lock className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    1. Tutup Masa Pencoblosan
                  </strong>
                  Klik <strong>&ldquo;Tutup Masa Pencoblosan&rdquo;</strong> tepat pada batas waktu penutupan (misal pukul 14.00 WIB). Seluruh akses masuk pemilih akan langsung dibekukan.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    2. Cetak Berita Acara Rekapitulasi (BAST)
                  </strong>
                  Buka tab <strong>Hasil Suara</strong>, lalu klik <strong>&ldquo;Cetak Berita Acara (BAST)&rdquo;</strong>. Dokumen resmi ber-Kop Surat SMAN 2 Cibinong akan terisi otomatis dengan perolehan suara seluruh paslon, persentase kehadiran, dan ketetapan paslon pemenang.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    3. Penandatanganan Saksi & Pengarsipan Data
                  </strong>
                  Cetak Berita Acara di kertas A4 dan mintakan tanda tangan basah kepada Ketua KPU, Pembina OSIS, Kepala Sekolah, dan Saksi masing-masing Paslon. Unduh juga backup DPT final via tombol <strong>&ldquo;Ekspor DPT&rdquo;</strong> untuk arsip sekolah.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: PANDUAN PEMILIH (SISWA & GURU) ===================== */}
      {activeGuideTab === 'voter' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 4 Steps Walkthrough */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-extrabold text-base flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Dapatkan Kartu Pemilih & Token
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Panitia KPU membagikan Kartu Pemilih fisik atau pesan WhatsApp berisi <strong>NIS/NIP</strong> dan <strong>Token Rahasia 6-digit</strong> unik Anda. Rahasiakan token ini dari siapapun.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-extrabold text-base flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Buka Bilik Suara & Masuk
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Buka website OSISVote melalui browser smartphone atau komputer sekolah. Masukkan identitas serta Token rahasia, atau scan QR Code pada kartu tanda pemilih Anda.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-extrabold text-base flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pilih Paslon & Konfirmasi
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pelajari visi-misi calon, lalu klik tombol <strong>&ldquo;Coblos Paslon&rdquo;</strong>. Akan muncul pop-up konfirmasi untuk memastikan Anda tidak salah sentuh.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold text-base flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Simpan Tanda Terima Digital Ink
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Setelah suara masuk, sistem mencetak Tanda Terima Suara Digital dengan stempel resmi. Akun Anda otomatis terkunci sehingga tidak bisa memilih dua kali.
                </p>
              </div>
            </div>
          </div>

          {/* Security Architecture Explainer */}
          <div className="p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Bagaimana Kerahasiaan Suara Dijamin? (Anonymity By Design)
              </h3>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
              <p>
                Sistem OSISVote SMAN 2 Cibinong memisahkan data identitas pemilih dengan kotak suara digital:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li>Tabel Pemilih hanya mencatat bahwa Anda <strong>telah menggunakan hak suara</strong> (is_voted: true).</li>
                <li>Kotak Suara Digital hanya mencatat <strong>ID Paslon dan Waktu</strong> tanpa menyimpan nama, NIS, atau NIP Anda.</li>
                <li>Panitia, guru, bahkan administrator sistem tidak dapat melacak paslon mana yang Anda pilih. Suara Anda 100% rahasia mutlak!</li>
              </ul>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" />
              <span>Pertanyaan Umum (FAQ)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  Bagaimana jika kartu atau token pemilih saya hilang?
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Segera lapor ke Panitia KPU di meja registrasi. Panitia dapat men-generate token baru melalui panel DPT jika akun Anda tercatat belum memilih.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  Apakah bisa mengubah pilihan setelah menekan tombol konfirmasi?
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Tidak bisa. Demi menjamin asas pemilu yang jujur dan adil, pilihan yang telah dicoblos langsung masuk ke kotak suara tertutup dan tidak dapat diubah kembali.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  Kapan hasil akhir penghitungan suara diumumkan?
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Setelah masa pemungutan suara resmi ditutup oleh Ketua KPU, grafik perolehan suara akan dibuka dan Berita Acara Rekapitulasi (BAST) resmi akan dicetak dan ditandatangani.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

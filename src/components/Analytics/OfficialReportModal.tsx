import React from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { Printer, X, Download } from 'lucide-react';

interface OfficialReportModalProps {
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({ onClose }) => {
  const { settings, candidates, getVoteSummary, getParticipationStats } = useVoting();
  const summary = getVoteSummary();
  const stats = getParticipationStats();

  // Find winner
  const sortedSummary = [...summary].sort((a, b) => b.totalVotes - a.totalVotes);
  const winner = sortedSummary[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10 my-4 text-slate-900 border border-slate-200 print:border-none print:shadow-none print:p-0 print:max-h-none print:m-0">
        
        {/* Floating Modal Control (Hidden on print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold">
              Dokumen Resmi KPU SMANDA
            </span>
            <span className="text-xs text-slate-500">Format Siap Cetak (A4 Standard)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Berita Acara</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-sm cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* --- OFFICIAL PRINTABLE DOCUMENT CONTENT --- */}
        <div className="print-page font-serif leading-relaxed text-black">
          {/* KOP SURAT RESMI */}
          <div className="border-b-4 border-double border-black pb-3 text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-1">
              <img
                src={settings.school_badge_url}
                alt="Logo SMAN 2 Cibinong"
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="text-xs tracking-wider uppercase font-semibold text-slate-700">
                  PEMERINTAH DAERAH PROVINSI JAWA BARAT
                </p>
                <p className="text-xs tracking-wider uppercase font-semibold text-slate-700">
                  DINAS PENDIDIKAN CABANG DINAS WILAYAH I
                </p>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  {settings.school_name.toUpperCase()}
                </h1>
                <p className="text-[11px] text-slate-600 italic">
                  Jalan Karadenan No. 2, Cibinong, Kab. Bogor, Jawa Barat 16913 · Telp. (021) 8752401
                </p>
              </div>
            </div>
          </div>

          {/* JUDUL BERITA ACARA */}
          <div className="text-center my-5">
            <h2 className="text-base sm:text-lg font-black uppercase underline decoration-2">
              BERITA ACARA HASIL PEMILIHAN KETUA DAN WAKIL KETUA OSIS
            </h2>
            <p className="text-xs font-mono-numbers mt-0.5">
              NOMOR: 421.3/KPU-OSIS/SMAN2CBN/XI/2026
            </p>
          </div>

          {/* PEMBUKA */}
          <div className="text-xs text-justify space-y-2 mb-4 leading-relaxed font-sans">
            <p>
              Pada hari ini, <strong>{settings.election_date}</strong>, telah dilaksanakan pemungutan dan penghitungan suara dalam rangka <strong>Pemilihan Ketua dan Wakil Ketua OSIS {settings.school_name} {settings.academic_year}</strong> secara digital (E-Voting) yang berasaskan Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER JURDIL).
            </p>
            <p>
              Berdasarkan hasil rekapitulasi data dari Kotak Suara Digital yang diawasi oleh Panitia Pemilihan (KPU Sekolah), Pembina OSIS, dan Saksi dari masing-masing Pasangan Calon, diperoleh hasil sebagai berikut:
            </p>
          </div>

          {/* I. DATA PEMILIH & TINGKAT PARTISIPASI */}
          <div className="mb-4 font-sans text-xs">
            <h3 className="font-bold uppercase text-[11px] mb-1.5 text-slate-900">
              I. DATA PEMILIH DAN TINGKAT KEHADIRAN (PARTISIPASI)
            </h3>
            <table className="w-full border-collapse border border-black text-left text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black px-2 py-1 font-bold">Kategori Pemilih</th>
                  <th className="border border-black px-2 py-1 font-bold text-center font-mono-numbers">DPT Terdaftar</th>
                  <th className="border border-black px-2 py-1 font-bold text-center font-mono-numbers">Suara Masuk</th>
                  <th className="border border-black px-2 py-1 font-bold text-center font-mono-numbers">Persentase</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 font-medium">Siswa (Kelas X, XI, XII)</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.studentTurnout.total} pemilih</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.studentTurnout.voted} suara</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.studentTurnout.percent}%</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 font-medium">Guru & Tenaga Kependidikan</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.teacherTurnout.total} pemilih</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.teacherTurnout.voted} suara</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.teacherTurnout.percent}%</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="border border-black px-2 py-1">TOTAL KESELURUHAN</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.totalDpt} pemilih</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.totalVoted} suara</td>
                  <td className="border border-black px-2 py-1 text-center font-mono-numbers">{stats.turnoutPercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* II. HASIL PEROLEHAN SUARA PASLON */}
          <div className="mb-5 font-sans text-xs">
            <h3 className="font-bold uppercase text-[11px] mb-1.5 text-slate-900">
              II. PEROLEHAN SUARA PASANGAN CALON
            </h3>
            <table className="w-full border-collapse border border-black text-left text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black px-2 py-1 font-bold text-center w-12">No.</th>
                  <th className="border border-black px-2 py-1 font-bold">Nama Pasangan Calon (Ketua & Wakil)</th>
                  <th className="border border-black px-2 py-1 font-bold text-center w-28 font-mono-numbers">Perolehan Suara</th>
                  <th className="border border-black px-2 py-1 font-bold text-center w-24 font-mono-numbers">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((cand) => (
                  <tr key={cand.candidateId}>
                    <td className="border border-black px-2 py-1 text-center font-mono-numbers font-bold">0{cand.candidateNumber}</td>
                    <td className="border border-black px-2 py-1 font-medium">{cand.candidateName}</td>
                    <td className="border border-black px-2 py-1 text-center font-mono-numbers font-bold">{cand.totalVotes} suara</td>
                    <td className="border border-black px-2 py-1 text-center font-mono-numbers font-bold">{cand.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* III. PENETAPAN PASLON TERPILIH */}
          {winner && (
            <div className="p-3 border border-black bg-slate-50 font-sans text-xs mb-6">
              <h4 className="font-bold uppercase text-[11px] mb-1">
                III. KETETAPAN PASANGAN CALON TERPILIH
              </h4>
              <p className="leading-relaxed">
                Menetapkan Pasangan Calon Nomor Urut <strong>0{winner.candidateNumber} ({winner.candidateName})</strong> dengan perolehan suara terbanyak sejumlah <strong>{winner.totalVotes} suara ({winner.percentage}%)</strong> sebagai <strong>Ketua dan Wakil Ketua OSIS {settings.school_name} {settings.academic_year}</strong> terpilih.
              </p>
            </div>
          )}

          {/* PENUTUP & TANDA TANGAN */}
          <div className="text-xs font-sans space-y-6 pt-2">
            <p className="text-justify">
              Demikian Berita Acara ini dibuat dan ditandatangani oleh Panitia Pemilihan (KPU Sekolah), Pembina OSIS, serta para Saksi untuk dipergunakan sebagaimana mestinya.
            </p>

            <div className="grid grid-cols-2 gap-8 text-center pt-2">
              <div>
                <p className="text-slate-600">Mengetahui,</p>
                <p className="font-bold">Pembina OSIS SMANDA</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{settings.osis_advisor}</p>
                <p className="text-[10px] text-slate-500 font-mono-numbers">NIP. 197804152006041009</p>
              </div>

              <div>
                <p className="text-slate-600">Cibinong, {settings.election_date}</p>
                <p className="font-bold">Ketua KPU OSIS SMANDA</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{settings.kpu_chairperson}</p>
                <p className="text-[10px] text-slate-500 font-mono-numbers">NIP. 196805191994121001</p>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-400">
              <p className="text-center font-bold text-[11px] mb-4">Saksi-Saksi Pasangan Calon:</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-slate-500">Saksi Paslon 01</p>
                  <div className="h-10"></div>
                  <p className="font-bold text-xs underline">( .................................... )</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Saksi Paslon 02</p>
                  <div className="h-10"></div>
                  <p className="font-bold text-xs underline">( .................................... )</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Saksi Paslon 03</p>
                  <div className="h-10"></div>
                  <p className="font-bold text-xs underline">( .................................... )</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

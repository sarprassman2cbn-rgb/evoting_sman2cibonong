import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useVoting } from '../../context/VotingContext.tsx';
import { Voter } from '../../types/voting.ts';
import { 
  downloadVoterCardsPdf, 
  getVoterCardsPdfBlobUrl 
} from '../../services/voterCardPdfService.ts';
import { 
  Printer, 
  Copy, 
  Check, 
  MessageSquare, 
  Grid, 
  X, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Eye, 
  Loader2 
} from 'lucide-react';

interface TokenDistributionModalProps {
  onClose: () => void;
}

export const TokenDistributionModal: React.FC<TokenDistributionModalProps> = ({ onClose }) => {
  const { voters, settings } = useVoting();
  const [activeMode, setActiveMode] = useState<'cards' | 'whatsapp'>('cards');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<'all' | 'siswa' | 'guru'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [copiedVoterId, setCopiedVoterId] = useState<string | null>(null);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Eligible voters (non-admin)
  const eligibleVoters = voters.filter(v => v.role !== 'admin');

  // Unique classes for filter
  const classes = Array.from(new Set(eligibleVoters.map(v => v.kelas_atau_jabatan))).sort();

  // Filtered list
  const filteredVoters = eligibleVoters.filter(v => {
    const matchesClass = selectedClass === 'all' || v.kelas_atau_jabatan === selectedClass;
    const matchesRole = selectedRole === 'all' || v.role === selectedRole;
    const matchesSearch = v.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.identitas.includes(searchQuery);
    return matchesClass && matchesRole && matchesSearch;
  });

  // Generate preview QR codes for on-screen grid
  useEffect(() => {
    async function makeQrs() {
      const qrs: Record<string, string> = {};
      for (const voter of filteredVoters.slice(0, 32)) {
        try {
          const loginPayload = `${window.location.origin}?nis=${voter.identitas}&token=${voter.token}`;
          const url = await QRCode.toDataURL(loginPayload, { margin: 1, width: 96 });
          qrs[voter.id] = url;
        } catch {
          // fallback
        }
      }
      setQrCodes(qrs);
    }
    makeQrs();
  }, [selectedClass, selectedRole, searchQuery]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  // jsPDF Download Handler
  const handleDownloadPdf = async () => {
    if (filteredVoters.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfProgress({ current: 0, total: filteredVoters.length });

    try {
      const classSuffix = selectedClass !== 'all' ? `_${selectedClass.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const roleSuffix = selectedRole !== 'all' ? `_${selectedRole}` : '';
      const fileName = `KARTU_PEMILIH_OSIS_${settings.school_name.replace(/\s+/g, '_')}${classSuffix}${roleSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`;

      await downloadVoterCardsPdf(
        filteredVoters,
        settings,
        fileName,
        (current, total) => setPdfProgress({ current, total })
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  // jsPDF Preview Handler
  const handlePreviewPdf = async () => {
    if (filteredVoters.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfProgress({ current: 0, total: filteredVoters.length });

    try {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      const blobUrl = await getVoterCardsPdfBlobUrl(
        filteredVoters,
        settings,
        (current, total) => setPdfProgress({ current, total })
      );
      setPdfPreviewUrl(blobUrl);
    } catch (err) {
      console.error('Error previewing PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  const copyWhatsAppText = (voter: Voter) => {
    const text = `*KARTU PEMILIH E-VOTING OSIS SMAN 2 CIBINONG*\n` +
      `Tahun Ajaran: ${settings.academic_year}\n\n` +
      `Halo *${voter.nama}* (${voter.kelas_atau_jabatan}), gunakan hak suaramu untuk memilih Ketua & Wakil Ketua OSIS!\n\n` +
      `Kredensial Login Anda:\n` +
      `• Identitas (${voter.role === 'siswa' ? 'NIS' : 'NIP'}): *${voter.identitas}*\n` +
      `• Token Rahasia: *${voter.token}*\n\n` +
      `Tautan Bilik Suara:\n${window.location.origin}\n\n` +
      `_Satu Akun, Satu Suara. Rahasiakan token ini! (LUBER JURDIL)_`;

    navigator.clipboard.writeText(text);
    setCopiedVoterId(voter.id);
    setTimeout(() => setCopiedVoterId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 my-4 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 print:p-0 print:border-none print:shadow-none print:max-h-none print:m-0">
        
        {/* Floating Controls */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                Layanan Cetak PDF jsPDF
              </span>
              <span className="text-xs text-slate-500 font-mono-numbers">
                {filteredVoters.length} Kartu Terpilih ({Math.ceil(filteredVoters.length / 8)} Lembar A4)
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Generator Kartu Pemilih PDF (Format A4)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setActiveMode('cards')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'cards' 
                    ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white' 
                    : 'text-slate-500'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Kartu PDF A4</span>
              </button>
              <button
                onClick={() => setActiveMode('whatsapp')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'whatsapp' 
                    ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white' 
                    : 'text-slate-500'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Format WA</span>
              </button>
            </div>

            {/* Direct jsPDF Download Button */}
            {activeMode === 'cards' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf || filteredVoters.length === 0}
                  className="py-1.5 px-3.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Unduh file dokumen PDF A4 siap print ke percetakan / printer sekolah"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>
                    {isGeneratingPdf && pdfProgress 
                      ? `${Math.round((pdfProgress.current / pdfProgress.total) * 100)}%` 
                      : 'Download PDF (A4)'}
                  </span>
                </button>

                <button
                  onClick={handlePreviewPdf}
                  disabled={isGeneratingPdf || filteredVoters.length === 0}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Pratinjau Dokumen PDF di Browser"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="py-1.5 px-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Print Langsung via Dialog Browser"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg text-sm cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="no-print flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIS/NIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="all">Semua Peran</option>
              <option value="siswa">Hanya Siswa</option>
              <option value="guru">Hanya Guru & Staf</option>
            </select>

            {/* Class Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                <option value="all">Semua Kelas ({eligibleVoters.length})</option>
                {classes.map(c => (
                  <option key={c} value={c}>
                    {c} ({eligibleVoters.filter(v => v.kelas_atau_jabatan === c).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Progress Bar when Generating PDF */}
        {isGeneratingPdf && pdfProgress && (
          <div className="no-print mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span>Sedang Merender Kartu Suara jsPDF (Resolusi Tinggi)...</span>
              <span className="font-mono-numbers">{pdfProgress.current} / {pdfProgress.total} Kartu</span>
            </div>
            <div className="h-2 w-full bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-700 transition-all duration-200 rounded-full"
                style={{ width: `${(pdfProgress.current / pdfProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* PDF Modal Preview if active */}
        {pdfPreviewUrl && (
          <div className="no-print mb-6 p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Pratinjau Dokumen PDF A4 (jsPDF Output)</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Buka di Tab Baru ↗
                </a>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewUrl(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 p-1"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
            <iframe
              src={pdfPreviewUrl}
              title="Pratinjau Kartu Pemilih PDF"
              className="w-full h-96 rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
            />
          </div>
        )}

        {/* --- VIEW 1: PRINT-READY A4 VOTER CARDS (ON SCREEN & PRINT) --- */}
        {activeMode === 'cards' && (
          <div>
            <div className="no-print flex items-center justify-between text-xs text-slate-500 mb-4">
              <span className="italic">
                * Tata letak presisi A4 (8 kartu/halaman) terintegrasi dengan kode QR login otomatis dan token PIN 6 karakter.
              </span>
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                Tip: Gunakan tombol &quot;Download PDF (A4)&quot; untuk hasil cetak paling tajam.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              {filteredVoters.map((voter) => (
                <div
                  key={voter.id}
                  className="relative p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex flex-col justify-between print:border-black print:text-black print:bg-white print:p-3 print:rounded-none"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 print:border-black pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={settings.school_badge_url}
                        alt="Logo"
                        className="w-7 h-7 object-contain rounded"
                      />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-tight text-blue-900 print:text-black leading-tight">
                          KARTU TANDA PEMILIH OSIS
                        </div>
                        <div className="text-[9px] text-slate-500 print:text-slate-700 font-semibold">
                          {settings.school_name}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-blue-800 dark:text-blue-300 print:text-black px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 print:bg-transparent">
                      {voter.role === 'guru' ? 'GURU / STAF' : 'SISWA'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex items-center justify-between gap-3 my-1">
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 print:text-slate-600 block leading-tight">Nama Pemilih:</span>
                        <div className="font-bold text-sm truncate max-w-[170px] leading-tight">
                          {voter.nama}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono-numbers">
                        <span>{voter.role === 'guru' ? 'NIP' : 'NIS'}: <strong>{voter.identitas}</strong></span>
                        <span>·</span>
                        <span>{voter.kelas_atau_jabatan}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="shrink-0 text-center">
                      {qrCodes[voter.id] ? (
                        <img
                          src={qrCodes[voter.id]}
                          alt="QR Login"
                          className="w-16 h-16 rounded border border-slate-200 print:border-black p-0.5"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded border flex items-center justify-center text-[10px] text-slate-400">
                          QR
                        </div>
                      )}
                      <span className="text-[8px] text-slate-400 block mt-0.5">Scan Login</span>
                    </div>
                  </div>

                  {/* Secret Token Box */}
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 print:border-black flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 print:bg-slate-100 p-2 rounded-lg">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 print:text-black uppercase block leading-tight">
                        Token Rahasia (PIN):
                      </span>
                      <span className="text-base font-extrabold font-mono-numbers tracking-widest text-blue-700 print:text-black">
                        {voter.token}
                      </span>
                    </div>
                    <div className="text-right text-[9px] text-slate-400 print:text-slate-600 italic">
                      Gunting Disini ✂
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 2: BROADCAST WHATSAPP GENERATOR --- */}
        {activeMode === 'whatsapp' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 italic">
              Salin pesan broadcast atau kirim langsung ke WhatsApp siswa / wali kelas untuk memudahkan akses daring dari smartphone.
            </p>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredVoters.map((voter) => (
                <div key={voter.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {voter.nama}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers">
                        ({voter.identitas} · {voter.kelas_atau_jabatan})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono-numbers mt-0.5">
                      Token: <strong className="text-blue-700 dark:text-blue-400 tracking-wider">{voter.token}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyWhatsAppText(voter)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        copiedVoterId === voter.id
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-700'
                      }`}
                    >
                      {copiedVoterId === voter.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin Teks WA</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `*KARTU PEMILIH E-VOTING OSIS SMAN 2 CIBINONG*\nHalo *${voter.nama}*, gunakan hak pilihmu!\nNIS: *${voter.identitas}*\nToken: *${voter.token}*\nLink: ${window.location.origin}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Kirim WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

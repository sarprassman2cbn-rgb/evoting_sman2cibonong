import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { 
  Play, 
  Square, 
  Lock, 
  Unlock, 
  Settings, 
  Activity, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  User
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { 
    settings, 
    toggleElectionStatus, 
    toggleLiveCountStatus, 
    updateSettings, 
    auditLogs, 
    resetToDefaultData 
  } = useVoting();

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [schoolName, setSchoolName] = useState(settings.school_name);
  const [tagline, setTagline] = useState(settings.school_tagline);
  const [academicYear, setAcademicYear] = useState(settings.academic_year);
  const [electionDate, setElectionDate] = useState(settings.election_date);
  const [kpuChair, setKpuChair] = useState(settings.kpu_chairperson);
  const [osisAdvisor, setOsisAdvisor] = useState(settings.osis_advisor);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      school_name: schoolName,
      school_tagline: tagline,
      academic_year: academicYear,
      election_date: electionDate,
      kpu_chairperson: kpuChair,
      osis_advisor: osisAdvisor,
    });
    setIsEditingSettings(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = async () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin me-reset seluruh database ke data bawaan simulasi SMAN 2 Cibinong? Suara yang sudah masuk akan dikembalikan ke data awal.')) {
      await resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: ELECTION SESSION CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.status_pemilu ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status Pemilihan: {settings.status_pemilu ? 'SEDANG DIBUKA' : 'DITUTUP'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Pusat Kontrol Pemilihan KPU Sekolah
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              {settings.status_pemilu 
                ? 'Seluruh siswa dan guru dapat melakukan login dan memberikan hak suara di bilik suara digital.' 
                : 'Bilik suara dikunci. Pemilih tidak dapat melakukan pencoblosan hingga panitia membuka kembali sesi.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {settings.status_pemilu ? (
              <button
                onClick={() => toggleElectionStatus(false)}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Square className="h-4 w-4" />
                <span>Tutup Masa Pencoblosan</span>
              </button>
            ) : (
              <button
                onClick={() => toggleElectionStatus(true)}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Buka Masa Pencoblosan</span>
              </button>
            )}

            <button
              onClick={() => toggleLiveCountStatus(!settings.status_live_count)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border ${
                settings.status_live_count
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
              }`}
            >
              {settings.status_live_count ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Kunci Live Count</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Buka Live Count ke Publik</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: SCHOOL PROFILE & ELECTION METADATA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Profil Sekolah & Pengaturan Pemilihan</span>
            </h3>
            <p className="text-xs text-slate-500">Konfigurasi nama sekolah dan penandatangan Berita Acara resmi.</p>
          </div>
          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{isEditingSettings ? 'Tutup Form' : 'Ubah Profil'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Pengaturan sekolah berhasil diperbarui!</span>
          </div>
        )}

        {isEditingSettings ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motto / Tagline Sekolah
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Periode / Tahun Ajaran
                </label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hari & Tanggal Pelaksanaan
                </label>
                <input
                  type="text"
                  required
                  value={electionDate}
                  onChange={(e) => setElectionDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Ketua KPU OSIS
                </label>
                <input
                  type="text"
                  required
                  value={kpuChair}
                  onChange={(e) => setKpuChair(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pembina OSIS
                </label>
                <input
                  type="text"
                  required
                  value={osisAdvisor}
                  onChange={(e) => setOsisAdvisor(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingSettings(false)}
                className="py-1.5 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Nama Sekolah:</span>
              <strong className="text-slate-800 dark:text-slate-200">{settings.school_name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Tahun Ajaran:</span>
              <strong className="text-slate-800 dark:text-slate-200">{settings.academic_year}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Ketua KPU OSIS:</span>
              <strong className="text-slate-800 dark:text-slate-200">{settings.kpu_chairperson}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Pembina OSIS:</span>
              <strong className="text-slate-800 dark:text-slate-200">{settings.osis_advisor}</strong>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: REAL-TIME AUDIT LOGS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Log Audit & Integritas Sistem
            </h3>
          </div>
          <span className="text-[11px] font-mono-numbers text-slate-400">
            Terbaru {auditLogs.length} aktivitas
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-slate-500 font-medium">{log.actor}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {log.details}
                </p>
              </div>

              <span className="text-[10px] font-mono-numbers text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: MASTER DATA RESET */}
      <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-red-900 dark:text-red-300">
            Reset Data Master Simulasi
          </h4>
          <p className="text-[11px] text-red-700 dark:text-red-400">
            Kembalikan seluruh kandidat, pemilih DPT, dan pengaturan ke data awal simulasi SMAN 2 Cibinong.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset ke Data Awal</span>
        </button>
      </div>
    </div>
  );
};

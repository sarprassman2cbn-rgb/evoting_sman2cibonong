import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { OfficialReportModal } from './OfficialReportModal.tsx';
import { VotingTrendChart } from './VotingTrendChart.tsx';
import { 
  BarChart2, 
  PieChart, 
  Users, 
  FileText, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  TrendingUp, 
  GraduationCap, 
  UserCheck 
} from 'lucide-react';

export const LiveCountResults: React.FC = () => {
  const { 
    settings, 
    candidates, 
    votes, 
    currentVoter, 
    toggleLiveCountStatus, 
    getVoteSummary, 
    getParticipationStats 
  } = useVoting();

  const [showOfficialReport, setShowOfficialReport] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');

  const summary = getVoteSummary();
  const stats = getParticipationStats();
  const isAdmin = currentVoter?.role === 'admin';

  // If live count is LOCKED and user is not admin
  if (!settings.status_live_count && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Hasil Suara Sementara Dikunci
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          Untuk menjaga objektivitas dan kondusivitas pemilihan, Panitia KPU {settings.school_name} mengunci tampilan perolehan suara sementara. Hasil resmi akan dibuka serentak setelah masa pemungutan suara berakhir.
        </p>
      </div>
    );
  }

  // Palette for candidates
  const candidateColors = ['#1E3A8A', '#D97706', '#059669', '#7C3AED', '#DB2777'];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Top Banner & Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Rekapitulasi Suara Real-Time
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {votes.length} Suara Masuk
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Hasil Pemilihan Ketua OSIS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {settings.school_name} — {settings.academic_year}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={() => toggleLiveCountStatus(!settings.status_live_count)}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                settings.status_live_count
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {settings.status_live_count ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Kunci untuk Pemilih</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Buka Akses Publik</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowOfficialReport(true)}
            className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Cetak Berita Acara (BAST)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total DPT Pemilih
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono-numbers mt-1">
            {stats.totalDpt}
          </div>
          <span className="text-[11px] text-slate-400">Siswa & Guru Terdaftar</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Suara Masuk
          </span>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-mono-numbers mt-1">
            {stats.totalVoted}
          </div>
          <span className="text-[11px] text-slate-400">Kotak Suara Sah</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Partisipasi Pemilih
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono-numbers mt-1">
            {stats.turnoutPercent}%
          </div>
          <span className="text-[11px] text-slate-400">Tingkat Kehadiran</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Belum Memilih
          </span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono-numbers mt-1">
            {stats.totalDpt - stats.totalVoted}
          </div>
          <span className="text-[11px] text-slate-400">Sisa Hak Suara</span>
        </div>
      </div>

      {/* Main Charts & Breakdown Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Perolehan Suara Pasangan Calon
                </h3>
                <p className="text-xs text-slate-500">Perbandingan perolehan dan persentase</p>
              </div>

              {/* Chart Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    chartType === 'bar' ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'
                  }`}
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>Grafik Batang</span>
                </button>
                <button
                  onClick={() => setChartType('donut')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    chartType === 'donut' ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'
                  }`}
                >
                  <PieChart className="h-3.5 w-3.5" />
                  <span>Donat</span>
                </button>
              </div>
            </div>

            {/* BAR CHART VIEW */}
            {chartType === 'bar' && (
              <div className="space-y-5 my-4">
                {summary.map((item, idx) => {
                  const candidateInfo = candidates.find(c => c.id === item.candidateId);
                  const barColor = candidateColors[idx % candidateColors.length];

                  return (
                    <div key={item.candidateId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            Paslon 0{item.candidateNumber}
                          </span>
                          <span className="text-slate-500 truncate max-w-[200px] sm:max-w-[300px]">
                            {item.candidateName}
                          </span>
                        </div>
                        <div className="font-mono-numbers font-extrabold text-slate-900 dark:text-white">
                          {item.totalVotes} suara ({item.percentage}%)
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.max(item.percentage, 2)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DONUT CHART VIEW */}
            {chartType === 'donut' && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 my-6">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="16"
                  />
                  {/* Slices calculation */}
                  {(() => {
                    let cumulative = 0;
                    const circumference = 2 * Math.PI * 40; // ~251.32

                    return summary.map((item, idx) => {
                      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((cumulative / 100) * circumference);
                      cumulative += item.percentage;
                      const sliceColor = candidateColors[idx % candidateColors.length];

                      return (
                        <circle
                          key={item.candidateId}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={sliceColor}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Donut Legend */}
                <div className="space-y-3">
                  {summary.map((item, idx) => (
                    <div key={item.candidateId} className="flex items-center gap-2.5 text-xs">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0"
                        style={{ backgroundColor: candidateColors[idx % candidateColors.length] }}
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Paslon 0{item.candidateNumber}
                        </span>
                        <div className="text-[11px] font-mono-numbers text-slate-500">
                          {item.totalVotes} suara ({item.percentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Sistem Pemilu Terenkripsi SMAN 2 Cibinong</span>
            <span className="font-mono-numbers">Status: LUBER JURDIL</span>
          </div>
        </div>

        {/* Right Column: Turnout Demographics (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Partisipasi per Kategori
            </h3>
            <p className="text-xs text-slate-500 mb-6">Tingkat kehadiran siswa vs guru</p>

            <div className="space-y-5">
              {/* Siswa */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <span>Pemilih Siswa</span>
                  </div>
                  <span className="font-mono-numbers font-bold text-blue-700 dark:text-blue-400">
                    {stats.studentTurnout.percent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${stats.studentTurnout.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono-numbers text-slate-500 mt-2">
                  <span>{stats.studentTurnout.voted} hadir</span>
                  <span>Total {stats.studentTurnout.total} DPT</span>
                </div>
              </div>

              {/* Guru */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>Pemilih Guru & Staf</span>
                  </div>
                  <span className="font-mono-numbers font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.teacherTurnout.percent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${stats.teacherTurnout.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono-numbers text-slate-500 mt-2">
                  <span>{stats.teacherTurnout.voted} hadir</span>
                  <span>Total {stats.teacherTurnout.total} DPT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowOfficialReport(true)}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Buka Dokumen Berita Acara</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voting Activity Over Time Trend Chart */}
      <VotingTrendChart votes={votes} />

      {/* Official Report Modal */}
      {showOfficialReport && (
        <OfficialReportModal onClose={() => setShowOfficialReport(false)} />
      )}
    </div>
  );
};

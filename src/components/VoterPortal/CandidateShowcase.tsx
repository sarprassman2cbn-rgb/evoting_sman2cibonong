import React, { useState } from 'react';
import { Candidate } from '../../types/voting.ts';
import { useVoting } from '../../context/VotingContext.tsx';
import { Check, Eye, Video, Award, Target, ListChecks, CheckCircle2 } from 'lucide-react';

interface CandidateShowcaseProps {
  onSelectCandidate?: (candidate: Candidate) => void;
  onOpenLoginModal: () => void;
}

export const CandidateShowcase: React.FC<CandidateShowcaseProps> = ({
  onSelectCandidate,
  onOpenLoginModal,
}) => {
  const { candidates, currentVoter, settings } = useVoting();
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);

  const handleVoteClick = (candidate: Candidate) => {
    if (!currentVoter) {
      onOpenLoginModal();
      return;
    }
    if (onSelectCandidate) {
      onSelectCandidate(candidate);
    }
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pasangan Calon Ketua & Wakil Ketua OSIS
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Kenali visi, misi, dan program kerja unggulan calon pemimpin SMANDA untuk masa bakti {settings.academic_year}.
        </p>
      </div>

      {/* Grid of Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
          >
            {/* Candidate Header / Photo Area */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={cand.foto_url}
                alt={`Paslon ${cand.nomor_urut} - ${cand.nama_ketua}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="%23e2e8f0"><text x="50%" y="50%" font-size="16" text-anchor="middle" fill="%2364748b" font-family="sans-serif">Foto Paslon 0' + cand.nomor_urut + '</text></svg>';
                }}
              />
              {/* Number Badge */}
              <div className="absolute top-3 left-3 bg-blue-900 text-white font-extrabold text-base w-10 h-10 rounded-xl flex items-center justify-center shadow-md border-2 border-white/80 dark:border-slate-900/80">
                0{cand.nomor_urut}
              </div>

              {/* Tag / Category indicator */}
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide">
                Kandidat Resmi
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Paslon No. Urut 0{cand.nomor_urut}
                </span>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {cand.nama_ketua}
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                  Wakil: <span className="font-semibold text-slate-800 dark:text-slate-200">{cand.nama_wakil}</span>
                </p>

                {/* Visi preview */}
                <div className="mb-4 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Visi Utama:</span>
                  &ldquo;{cand.visi}&rdquo;
                </div>

                {/* Misi Highlights (2 items) */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Fokus Program:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {cand.misi.slice(0, 2).map((m, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailCandidate(cand)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Visi & Misi</span>
                </button>

                {settings.status_pemilu && (!currentVoter || !currentVoter.is_voted) && (
                  <button
                    type="button"
                    onClick={() => handleVoteClick(cand)}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Coblos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Full Detail Modal */}
      {detailCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setDetailCandidate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1 cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-5">
              <div className="relative">
                <img
                  src={detailCandidate.foto_url}
                  alt={detailCandidate.nama_ketua}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-700"
                />
                <span className="absolute -top-2 -left-2 w-7 h-7 rounded-lg bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center shadow">
                  0{detailCandidate.nomor_urut}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Pasangan Calon No. Urut 0{detailCandidate.nomor_urut}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {detailCandidate.nama_ketua}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Calon Wakil: <strong className="text-slate-900 dark:text-white">{detailCandidate.nama_wakil}</strong>
                </p>
              </div>
            </div>

            {/* Detail Tabs / Sections */}
            <div className="space-y-6">
              {/* Visi */}
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Visi Kepemimpinan:</span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-sm leading-relaxed text-slate-800 dark:text-slate-200 italic">
                  &ldquo;{detailCandidate.visi}&rdquo;
                </div>
              </div>

              {/* Misi */}
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <ListChecks className="h-4 w-4 text-blue-600" />
                  <span>Misi & Arah Strategis:</span>
                </div>
                <ul className="space-y-2">
                  {detailCandidate.misi.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Program Kerja */}
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span>Program Kerja Unggulan:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {detailCandidate.program_kerja.map((prog, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span>{prog}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailCandidate(null)}
                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Tutup
              </button>

              {settings.status_pemilu && (!currentVoter || !currentVoter.is_voted) && (
                <button
                  type="button"
                  onClick={() => {
                    const chosen = detailCandidate;
                    setDetailCandidate(null);
                    handleVoteClick(chosen);
                  }}
                  className="py-2.5 px-5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Coblos Paslon No. 0{detailCandidate.nomor_urut}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

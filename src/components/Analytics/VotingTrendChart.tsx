import React, { useState, useMemo } from 'react';
import { AnonymousVote } from '../../types/voting.ts';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Calendar, 
  Activity, 
  Users, 
  Filter,
  BarChart,
  LineChart
} from 'lucide-react';

interface VotingTrendChartProps {
  votes: AnonymousVote[];
}

interface TimeBucket {
  key: string;
  label: string;
  count: number;
  studentCount: number;
  teacherCount: number;
  cumulative: number;
}

export const VotingTrendChart: React.FC<VotingTrendChartProps> = ({ votes }) => {
  const [granularity, setGranularity] = useState<'hourly' | 'fifteen' | 'cumulative'>('hourly');
  const [roleFilter, setRoleFilter] = useState<'all' | 'siswa' | 'guru'>('all');
  const [hoveredBucket, setHoveredBucket] = useState<TimeBucket | null>(null);

  // Filter votes by selected role
  const filteredVotes = useMemo(() => {
    if (roleFilter === 'all') return votes;
    return votes.filter(v => v.voter_role === roleFilter);
  }, [votes, roleFilter]);

  // Process votes into chronological time buckets
  const { buckets, peakBucket, latestVoteTime } = useMemo(() => {
    if (filteredVotes.length === 0) {
      return { buckets: [], peakBucket: null, latestVoteTime: null };
    }

    // Sort votes chronologically
    const sorted = [...filteredVotes].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const latest = sorted[sorted.length - 1];
    const latestTime = new Date(latest.created_at);

    // Standard school election hours (07:00 to 15:00)
    const standardHours = [7, 8, 9, 10, 11, 12, 13, 14, 15];
    
    // Also include any hours from actual votes if outside standard range
    sorted.forEach(v => {
      const h = new Date(v.created_at).getHours();
      if (!standardHours.includes(h)) {
        standardHours.push(h);
      }
    });
    standardHours.sort((a, b) => a - b);

    const bucketMap: Record<string, { label: string; count: number; studentCount: number; teacherCount: number }> = {};

    if (granularity === 'fifteen') {
      // 15-minute slots around recorded vote times
      sorted.forEach(v => {
        const d = new Date(v.created_at);
        const h = d.getHours();
        const m = Math.floor(d.getMinutes() / 15) * 15;
        const key = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const endM = m + 15;
        const endH = endM === 60 ? h + 1 : h;
        const endFormattedM = endM === 60 ? 0 : endM;
        const label = `${key}-${String(endH).padStart(2, '0')}:${String(endFormattedM).padStart(2, '0')}`;

        if (!bucketMap[key]) {
          bucketMap[key] = { label, count: 0, studentCount: 0, teacherCount: 0 };
        }
        bucketMap[key].count++;
        if (v.voter_role === 'siswa') bucketMap[key].studentCount++;
        if (v.voter_role === 'guru') bucketMap[key].teacherCount++;
      });
    } else {
      // Hourly slots (default)
      standardHours.forEach(h => {
        const key = `${String(h).padStart(2, '0')}:00`;
        const label = `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`;
        bucketMap[key] = { label, count: 0, studentCount: 0, teacherCount: 0 };
      });

      sorted.forEach(v => {
        const d = new Date(v.created_at);
        const h = d.getHours();
        const key = `${String(h).padStart(2, '0')}:00`;
        if (!bucketMap[key]) {
          bucketMap[key] = {
            label: `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`,
            count: 0,
            studentCount: 0,
            teacherCount: 0
          };
        }
        bucketMap[key].count++;
        if (v.voter_role === 'siswa') bucketMap[key].studentCount++;
        if (v.voter_role === 'guru') bucketMap[key].teacherCount++;
      });
    }

    // Convert map to sorted array and compute cumulative totals
    const sortedKeys = Object.keys(bucketMap).sort();
    let runningTotal = 0;
    const computedBuckets: TimeBucket[] = sortedKeys.map(key => {
      const item = bucketMap[key];
      runningTotal += item.count;
      return {
        key,
        label: item.label,
        count: item.count,
        studentCount: item.studentCount,
        teacherCount: item.teacherCount,
        cumulative: runningTotal
      };
    });

    // Find peak slot
    let peak: TimeBucket | null = null;
    computedBuckets.forEach(b => {
      if (!peak || b.count > peak.count) {
        peak = b;
      }
    });

    return {
      buckets: computedBuckets,
      peakBucket: peak && (peak as TimeBucket).count > 0 ? (peak as TimeBucket) : null,
      latestVoteTime: latestTime
    };
  }, [filteredVotes, granularity]);

  // SVG Chart Dimensions & Math
  const width = 800;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    if (buckets.length === 0) return 10;
    if (granularity === 'cumulative') {
      const highest = Math.max(...buckets.map(b => b.cumulative), 1);
      return Math.ceil(highest * 1.15);
    }
    const highest = Math.max(...buckets.map(b => b.count), 1);
    return Math.max(highest + 1, 5);
  }, [buckets, granularity]);

  // Generate SVG Path coordinates for Area and Line
  const points = useMemo(() => {
    if (buckets.length === 0) return [];
    const step = chartWidth / Math.max(buckets.length - 1, 1);
    return buckets.map((b, idx) => {
      const val = granularity === 'cumulative' ? b.cumulative : b.count;
      const x = paddingLeft + (buckets.length === 1 ? chartWidth / 2 : idx * step);
      const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
      return { x, y, bucket: b };
    });
  }, [buckets, granularity, maxVal, chartWidth, chartHeight]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
    }
    return points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth cubic bezier
      const prev = points[idx - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpX2 = cpX1;
      return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length <= 1 || !linePath) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, points, chartHeight]);

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Aktivitas Bilik Suara
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono-numbers">
              <Activity className="h-3.5 w-3.5" />
              <span>{filteredVotes.length} Surat Suara Dianalisis</span>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Tren Waktu Pemungutan Suara
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau lonjakan arus pemilih yang memberikan hak suara dari jam ke jam.
          </p>
        </div>

        {/* View Mode & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setRoleFilter('siswa')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleFilter === 'siswa'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Siswa
            </button>
            <button
              onClick={() => setRoleFilter('guru')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleFilter === 'guru'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Guru
            </button>
          </div>

          {/* Granularity Switcher */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setGranularity('hourly')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                granularity === 'hourly'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <BarChart className="h-3 w-3" />
              <span>Per Jam</span>
            </button>
            <button
              onClick={() => setGranularity('fifteen')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                granularity === 'fifteen'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>15 Menit</span>
            </button>
            <button
              onClick={() => setGranularity('cumulative')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                granularity === 'cumulative'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <LineChart className="h-3 w-3" />
              <span>Kumulatif</span>
            </button>
          </div>
        </div>
      </div>

      {/* Insight Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Peak Slot Indicator */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 block">
              Jam Puncak Arus Masuk:
            </span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              {peakBucket ? peakBucket.label : 'Belum Ada Suara'}
            </div>
            {peakBucket && (
              <span className="text-[11px] font-mono-numbers text-blue-700 dark:text-blue-400 font-semibold">
                {peakBucket.count} surat suara tercatat
              </span>
            )}
          </div>
        </div>

        {/* Total Cast in Selection */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
              Laju Pemilihan:
            </span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono-numbers">
              {filteredVotes.length > 0 
                ? `${(filteredVotes.length / Math.max(buckets.filter(b => b.count > 0).length, 1)).toFixed(1)} suara / interval` 
                : '0 suara'}
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Arus pemilih terpantau stabil
            </span>
          </div>
        </div>

        {/* Latest Activity */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Pencoblosan Terakhir:
            </span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono-numbers">
              {latestVoteTime 
                ? `Pukul ${latestVoteTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                : '-'}
            </div>
            <span className="text-[11px] text-slate-500">
              Sistem mencatat waktu secara anonim
            </span>
          </div>
        </div>
      </div>

      {/* Visual SVG Trend Chart Canvas */}
      <div className="relative pt-2">
        {filteredVotes.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Belum ada suara yang masuk untuk kategori ini.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-56 select-none overflow-visible"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Labels */}
              {yTicks.map((tickVal, idx) => {
                const tickY = paddingTop + chartHeight - (tickVal / maxVal) * chartHeight;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={tickY}
                      x2={width - paddingRight}
                      y2={tickY}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray={tickVal === 0 ? undefined : '3,3'}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={tickY + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono-numbers"
                    >
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* Background vertical bar volume guides (Hourly or 15min) */}
              {granularity !== 'cumulative' && points.map((pt, idx) => {
                const barWidth = Math.min(Math.max((chartWidth / buckets.length) * 0.45, 12), 28);
                const barHeight = chartHeight - (pt.y - paddingTop);
                const isHovered = hoveredBucket?.key === pt.bucket.key;

                return (
                  <g key={idx} className="transition-opacity">
                    <rect
                      x={pt.x - barWidth / 2}
                      y={pt.y}
                      width={barWidth}
                      height={Math.max(barHeight, 0)}
                      rx={3}
                      fill="url(#barGradient)"
                      opacity={isHovered ? 1 : 0.75}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredBucket(pt.bucket)}
                      onMouseLeave={() => setHoveredBucket(null)}
                    />
                    {pt.bucket.count > 0 && (
                      <text
                        x={pt.x}
                        y={pt.y - 5}
                        textAnchor="middle"
                        className="text-[9px] font-extrabold fill-blue-700 dark:fill-blue-400 font-mono-numbers"
                      >
                        {pt.bucket.count}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Area fill for trend curve */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#trendGradient)"
                  className="transition-all duration-300"
                />
              )}

              {/* Line path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#1D4ED8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Data points & hit areas */}
              {points.map((pt, idx) => {
                const isHovered = hoveredBucket?.key === pt.bucket.key;
                const isPeak = peakBucket?.key === pt.bucket.key && pt.bucket.count > 0;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredBucket(pt.bucket)}
                    onMouseLeave={() => setHoveredBucket(null)}
                  >
                    {/* Circle marker */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : isPeak ? 4.5 : 3.5}
                      fill={isPeak ? '#F59E0B' : '#1D4ED8'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />

                    {/* Invisible hit area for smooth hover */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={16}
                      fill="transparent"
                    />

                    {/* X-axis tick & label */}
                    <text
                      x={pt.x}
                      y={height - 12}
                      textAnchor="middle"
                      className={`text-[9px] font-mono-numbers transition-colors ${
                        isHovered 
                          ? 'fill-blue-700 font-bold' 
                          : 'fill-slate-400 dark:fill-slate-500'
                      }`}
                    >
                      {pt.bucket.key}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Hovered Tooltip Card */}
        {hoveredBucket && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 shadow-xl max-w-xs mx-auto text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
              <span className="font-extrabold text-blue-400 font-mono-numbers">
                {hoveredBucket.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                WIB
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Suara Masuk:</span>
                <strong className="text-base text-white font-mono-numbers">
                  {hoveredBucket.count}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Total Kumulatif:</span>
                <strong className="text-base text-emerald-400 font-mono-numbers">
                  {hoveredBucket.cumulative}
                </strong>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-300">
              <span>Siswa: <strong className="font-mono-numbers">{hoveredBucket.studentCount}</strong></span>
              <span>Guru: <strong className="font-mono-numbers">{hoveredBucket.teacherCount}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>Waktu server disinkronkan secara otomatis (UTC+7 WIB).</span>
        </span>
        <span className="italic">
          * Menghitung frekuensi suara masuk tanpa mengaitkan identitas pemilih (Asas Rahasia).
        </span>
      </div>
    </div>
  );
};

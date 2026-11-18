import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { BESCOM_FEEDERS, formatDuration } from '../engine/dbscan';
import { TRANSLATIONS } from '../i18n/translations';
import type {
  FaultIncident,
  Language,
  OutageReport,
  PriorityWeights,
  ReportChannel,
} from '../types/lumenops';
import AnimatedNumber from './AnimatedNumber';

interface AnalyticsViewProps {
  lang: Language;
  weights: PriorityWeights;
  onChangeWeights: (next: PriorityWeights) => void;
  onResetWeights: () => void;
  incidents: FaultIncident[];
  reports: OutageReport[];
}

export default function AnalyticsView({
  lang,
  weights,
  onChangeWeights,
  onResetWeights,
  incidents,
  reports,
}: AnalyticsViewProps) {
  const t = TRANSLATIONS[lang].analytics;
  const tGlobal = TRANSLATIONS[lang];

  const channelCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.channel] = (acc[r.channel] ?? 0) + 1;
    return acc;
  }, {});

  const orderedChannels: ReportChannel[] = [
    'Mobile App',
    'Helpline 1912',
    'Social Media',
    'Web Portal',
    'CSV Import',
  ];

  const reportCountsByFeeder = reports.reduce<Record<string, number>>((counts, report) => {
    counts[report.feederId] = (counts[report.feederId] ?? 0) + 1;
    return counts;
  }, {});
  const sortedHotspots = BESCOM_FEEDERS.map((feeder) => ({
    ...feeder,
    complaintCount: reportCountsByFeeder[feeder.feederId] ?? 0,
  }))
    .sort((a, b) => b.complaintCount - a.complaintCount)
    .slice(0, 8);
  const maxComplaints = Math.max(...sortedHotspots.map((f) => f.complaintCount), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="space-y-2 max-w-2xl">
        <p className="text-xs font-semibold text-amber-600">{t.kicker}</p>
        <h1
          className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
          style={{ textWrap: 'balance' }}
        >
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900">{t.tuningTitle}</h2>
              <button
                type="button"
                onClick={onResetWeights}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.resetDefaults}</span>
              </button>
            </div>

            <div className="rounded-lg bg-[#08152B] text-amber-400 px-4 py-3 font-mono text-xs leading-relaxed">
              Priority = w1 × Consumers + w2 × Duration(m) + w3 × CriticalLoad
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="an-w1">w1 · Consumers Affected Weight</label>
                  <span className="font-mono tabular-nums text-slate-900">
                    {weights.w1Consumers.toFixed(1)}
                  </span>
                </div>
                <input
                  id="an-w1"
                  type="range"
                  min={0.5}
                  max={4.0}
                  step={0.1}
                  value={weights.w1Consumers}
                  onChange={(e) =>
                    onChangeWeights({ ...weights, w1Consumers: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="an-w2">w2 · Outage Duration Weight</label>
                  <span className="font-mono tabular-nums text-slate-900">
                    {weights.w2Duration.toFixed(2)}
                  </span>
                </div>
                <input
                  id="an-w2"
                  type="range"
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  value={weights.w2Duration}
                  onChange={(e) =>
                    onChangeWeights({ ...weights, w2Duration: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="an-w3">w3 · Critical Load Bonus</label>
                  <span className="font-mono tabular-nums text-slate-900">
                    {weights.w3CriticalLoad}
                  </span>
                </div>
                <input
                  id="an-w3"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={weights.w3CriticalLoad}
                  onChange={(e) =>
                    onChangeWeights({ ...weights, w3CriticalLoad: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="an-eps">DBSCAN Spatial Radius (eps)</label>
                  <span className="font-mono tabular-nums text-slate-900">
                    {weights.epsMeters} m
                  </span>
                </div>
                <input
                  id="an-eps"
                  type="range"
                  min={150}
                  max={2500}
                  step={50}
                  value={weights.epsMeters}
                  onChange={(e) =>
                    onChangeWeights({ ...weights, epsMeters: Number(e.target.value) })
                  }
                  className="w-full accent-[#08152B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="an-minpts">DBSCAN Min Reports per Cluster</label>
                  <span className="font-mono tabular-nums text-slate-900">{weights.minPts}</span>
                </div>
                <input
                  id="an-minpts"
                  type="range"
                  min={2}
                  max={6}
                  step={1}
                  value={weights.minPts}
                  onChange={(e) =>
                    onChangeWeights({ ...weights, minPts: Number(e.target.value) })
                  }
                  className="w-full accent-[#08152B] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">{t.breakdownTitle}</h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {reports.length} reports → {incidents.length} clusters
            </span>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left border-collapse min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Incident</th>
                  <th className="py-2.5 px-3 text-right">Reports</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                  <th className="py-2.5 px-3">Critical Load</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc) => {
                  const feederMeta = BESCOM_FEEDERS.find((f) => f.feederId === inc.feederId);
                  const displayArea = lang === 'kn' && feederMeta ? feederMeta.areaKn : inc.area;
                  const tierColor =
                    inc.priority === 'HIGH'
                      ? 'text-red-700'
                      : inc.priority === 'MEDIUM'
                        ? 'text-amber-700'
                        : 'text-emerald-700';

                  return (
                    <motion.tr key={inc.id} layout transition={{ duration: 0.2 }}>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-900">Incident {inc.label}</p>
                        <p className="text-xs text-slate-500">
                          {displayArea} · <span className="font-mono">{inc.feederId}</span>
                        </p>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                        {inc.reportCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                        {formatDuration(inc.durationMinutes)}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-700">{inc.criticalLoad}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        <AnimatedNumber value={inc.score.totalScore} decimals={1} />
                      </td>
                      <td className={`py-2.5 px-3 font-mono text-xs font-bold ${tierColor}`}>
                        {tGlobal.priorityLabels[inc.priority]}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">{t.channelTitle}</h2>
            <p className="text-xs text-slate-500">
              Share of raw reports ingested across BESCOM citizen touchpoints
            </p>
          </div>

          <div className="space-y-3.5">
            {orderedChannels.map((ch) => {
              const count = channelCounts[ch] ?? 0;
              const pct = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
              return (
                <div key={ch} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{ch}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: pct / 100 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{ originX: 0 }}
                      className="h-full w-full bg-[#08152B] rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">{t.hotspotsTitle}</h2>
            <p className="text-xs text-slate-500">
              Complaint reports by feeder across all 24 monitored BESCOM locations
            </p>
          </div>

          <div className="space-y-3.5">
            {sortedHotspots.map((feeder) => {
              const widthPct = Math.round((feeder.complaintCount / maxComplaints) * 100);
              return (
                <div key={feeder.feederId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-slate-800 truncate">
                      {lang === 'kn' ? feeder.areaKn : feeder.area}{' '}
                      <span className="font-mono text-slate-500">({feeder.feederId})</span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-amber-700 shrink-0">
                      {feeder.complaintCount} reports
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: widthPct / 100 }}
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      style={{ originX: 0 }}
                      className="h-full w-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ClipboardList,
  CopyPlus,
  Download,
  Layers,
  Lock,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  RotateCcw,
  Search,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  ALL_CIRCLES,
  BESCOM_CREWS,
  BESCOM_FEEDERS,
  CRITICAL_SITES,
  exportIncidentsToCsv,
  formatDuration,
} from '../engine/dbscan';
import { TRANSLATIONS } from '../i18n/translations';
import type {
  AdminUser,
  AuditLogEntry,
  BescomCircle,
  FaultCause,
  FaultIncident,
  IncidentStatus,
  Language,
  OutageReport,
  PriorityLevel,
  SmsAlert,
} from '../types/lumenops';
import AnimatedNumber from './AnimatedNumber';
import GridTwin3D from './GridTwin3D';
import OutageMap from './OutageMap';

interface OperationsViewProps {
  lang: Language;
  adminUser: AdminUser | null;
  onRequireAdminLogin: () => void;
  incidents: FaultIncident[];
  reports: OutageReport[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  onAssignCrew: (incidentId: string, crewId: string, eta: string) => void;
  onMarkRestored: (incidentId: string) => void;
  onEscalateIncident: (incidentId: string) => void;
  onSetFaultCause: (incidentId: string, cause: FaultCause) => void;
  onSimulateDuplicates: (feederId: string) => void;
  onResetDemo: () => void;
  onOpenCitizenPortal: () => void;
  smsAlerts: SmsAlert[];
  auditLog: AuditLogEntry[];
}

const FAULT_CAUSES: FaultCause[] = [
  'Under Investigation',
  'DTR Fuse Blown',
  '11kV Cable Fault',
  'Tree Branch on Line',
  'RMU Breaker Trip',
  'Substation Overload',
];

export default function OperationsView({
  lang,
  adminUser,
  onRequireAdminLogin,
  incidents,
  reports,
  selectedIncidentId,
  onSelectIncident,
  onAssignCrew,
  onMarkRestored,
  onEscalateIncident,
  onSetFaultCause,
  onSimulateDuplicates,
  onResetDemo,
  onOpenCitizenPortal,
  smsAlerts,
  auditLog,
}: OperationsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [circleFilter, setCircleFilter] = useState<'ALL' | BescomCircle>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | PriorityLevel>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IncidentStatus>('ALL');
  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d');
  const [showRawReports, setShowRawReports] = useState(false);
  const [showCriticalSites, setShowCriticalSites] = useState(true);
  const [showAllFeeders, setShowAllFeeders] = useState(true);
  const [selectedCrewId, setSelectedCrewId] = useState(BESCOM_CREWS[0].id);
  const [selectedEta, setSelectedEta] = useState('35 mins');

  const t = TRANSLATIONS[lang].operations;
  const tGlobal = TRANSLATIONS[lang];

  const activeIncidents = incidents.filter((i) => i.status !== 'Restored');
  const criticalCount = activeIncidents.filter((i) => i.criticalLoad !== 'None').length;
  const crewsDeployed = activeIncidents.filter((i) => i.status === 'Crew assigned').length;
  const dedupRatio =
    reports.length > 0 && incidents.length > 0
      ? Math.round(((reports.length - incidents.length) / reports.length) * 100)
      : 0;

  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (circleFilter !== 'ALL' && inc.circle !== circleFilter) return false;
      if (priorityFilter !== 'ALL' && inc.priority !== priorityFilter) return false;
      if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
      if (!q) return true;
      const feederMeta = BESCOM_FEEDERS.find((f) => f.feederId === inc.feederId);
      return (
        inc.area.toLowerCase().includes(q) ||
        (feederMeta?.areaKn ?? '').toLowerCase().includes(q) ||
        inc.feederId.toLowerCase().includes(q) ||
        `incident ${inc.label}`.toLowerCase().includes(q) ||
        inc.reports.some((r) => r.rrNumber.toLowerCase().includes(q))
      );
    });
  }, [incidents, circleFilter, priorityFilter, statusFilter, searchQuery]);

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) ?? filteredIncidents[0] ?? incidents[0];

  const getLocalizedArea = (feederId: string, fallbackArea: string) => {
    if (lang !== 'kn') return fallbackArea;
    return BESCOM_FEEDERS.find((f) => f.feederId === feederId)?.areaKn ?? fallbackArea;
  };

  const handleProtectedDispatch = (incidentId: string) => {
    if (!adminUser) {
      onRequireAdminLogin();
      return;
    }
    onAssignCrew(incidentId, selectedCrewId, selectedEta);
  };

  const handleProtectedRestore = (incidentId: string) => {
    if (!adminUser) {
      onRequireAdminLogin();
      return;
    }
    onMarkRestored(incidentId);
  };

  const handleProtectedEscalate = (incidentId: string) => {
    if (!adminUser) {
      onRequireAdminLogin();
      return;
    }
    onEscalateIncident(incidentId);
  };

  const handleExportCsv = () => {
    const csv = exportIncidentsToCsv(incidents);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bescom-priority-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const channelBreakdown = useMemo(() => {
    if (!selectedIncident) return {};
    return selectedIncident.reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.channel] = (acc[r.channel] ?? 0) + 1;
      return acc;
    }, {});
  }, [selectedIncident]);

  return (
    <div className="space-y-6">
      {/* Operational Command Banner */}
      <section className="bg-[#08152B] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium text-amber-400">{t.kicker}</p>
              <h1
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white"
                style={{ textWrap: 'balance' }}
              >
                {t.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{t.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenCitizenPortal}
                className="min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.logOutageCta}
              </button>
            </div>
          </div>

          {/* 4-Column Operational KPI Strip */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-3d-lift-dark rounded-lg p-2 -m-2">
              <p className="text-xs text-slate-400">{t.kpiActiveIncidents}</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold tabular-nums text-white">
                <AnimatedNumber value={activeIncidents.length} />
              </p>
              <p className="mt-0.5 text-xs text-slate-400 tabular-nums">
                {t.kpiMergedFrom}: <AnimatedNumber value={reports.length} />
              </p>
            </div>
            <div className="card-3d-lift-dark rounded-lg p-2 -m-2">
              <p className="text-xs text-slate-400">{t.kpiDedupReduction}</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold tabular-nums text-amber-400">
                <AnimatedNumber value={dedupRatio} suffix="%" />
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{t.kpiDedupSub}</p>
            </div>
            <div className="card-3d-lift-dark rounded-lg p-2 -m-2">
              <p className="text-xs text-slate-400">{t.kpiCriticalFeeders}</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold tabular-nums text-white">
                <AnimatedNumber value={criticalCount} />
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{t.kpiCriticalSub}</p>
            </div>
            <div className="card-3d-lift-dark rounded-lg p-2 -m-2">
              <p className="text-xs text-slate-400">{t.kpiCrewsDeployed}</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold tabular-nums text-emerald-400">
                <AnimatedNumber value={crewsDeployed} />
              </p>
              <p className="mt-0.5 text-xs text-slate-400 tabular-nums">
                {crewsDeployed} / {BESCOM_CREWS.length} · {t.kpiCrewsSub}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Command Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                  className="w-full min-h-[40px] pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                />
              </div>

              <select
                aria-label="Filter by BESCOM circle"
                value={circleFilter}
                onChange={(e) => setCircleFilter(e.target.value as 'ALL' | BescomCircle)}
                className="min-h-[40px] px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ALL">{t.allCircles}</option>
                {ALL_CIRCLES.map((c) => (
                  <option key={c} value={c}>
                    {tGlobal.circleLabels[c]}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by incident status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | IncidentStatus)}
                className="min-h-[40px] px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ALL">{t.allStatuses}</option>
                <option value="Reported">{t.awaitingDispatch}</option>
                <option value="Crew assigned">{t.crewAssigned}</option>
                <option value="Restored">{t.restored}</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPriorityFilter(tier)}
                    className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      priorityFilter === tier
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier === 'ALL' ? t.allPriorities : tier}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.exportCsv}</span>
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.reset}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map + Ranked Priority Queue Split */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Map + Selected Incident Inspector */}
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">{t.mapTitle}</h2>
                  <p className="text-xs text-slate-500">{t.mapSubtitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 3D Grid Twin | 2D GIS Map Mode Switcher */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setMapMode('3d')}
                      className={`relative min-h-[30px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        mapMode === '3d' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mapMode === '3d' && (
                        <motion.span
                          layoutId="ops-map-mode"
                          transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                          className="absolute inset-0 bg-[#08152B] rounded-md"
                        />
                      )}
                      <Box className="relative z-10 w-3.5 h-3.5" aria-hidden="true" />
                      <span className="relative z-10">{t.mapMode3d}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMode('2d')}
                      className={`relative min-h-[30px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        mapMode === '2d' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mapMode === '2d' && (
                        <motion.span
                          layoutId="ops-map-mode"
                          transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                          className="absolute inset-0 bg-[#08152B] rounded-md"
                        />
                      )}
                      <MapIcon className="relative z-10 w-3.5 h-3.5" aria-hidden="true" />
                      <span className="relative z-10">{t.mapMode2d}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAllFeeders((v) => !v)}
                    className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      showAllFeeders
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>24 Feeders</span>
                  </button>
                  {mapMode === '2d' && (
                    <button
                      type="button"
                      onClick={() => setShowRawReports((v) => !v)}
                      className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                        showRawReports
                          ? 'bg-[#08152B] text-white border-[#08152B]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {t.rawReportsBtn} ({reports.length})
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCriticalSites((v) => !v)}
                    className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      showCriticalSites
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {t.criticalSitesBtn} ({CRITICAL_SITES.length})
                    </span>
                  </button>
                </div>
              </div>

              {mapMode === '3d' ? (
                <GridTwin3D
                  lang={lang}
                  incidents={incidents}
                  criticalSites={CRITICAL_SITES}
                  showAllFeeders={showAllFeeders}
                  showCriticalSites={showCriticalSites}
                  selectedIncidentId={selectedIncident?.id ?? null}
                  onSelectIncident={onSelectIncident}
                />
              ) : (
                <OutageMap
                  lang={lang}
                  incidents={incidents}
                  reports={reports}
                  criticalSites={CRITICAL_SITES}
                  showRawReports={showRawReports}
                  showCriticalSites={showCriticalSites}
                  showAllFeeders={showAllFeeders}
                  selectedIncidentId={selectedIncident?.id ?? null}
                  onSelectIncident={onSelectIncident}
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-1">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" aria-hidden="true" />
                    HIGH
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true" />
                    MEDIUM
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
                    LOW
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" aria-hidden="true" />
                    BESCOM Feeder
                  </span>
                </div>
                <span className="font-mono text-slate-500">Bengaluru + Regional Circles</span>
              </div>
            </div>

            {/* Selected Incident Deep Inspector */}
            {selectedIncident && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      {t.inspectorTitle} · {selectedIncident.feederId} ·{' '}
                      {tGlobal.circleLabels[selectedIncident.circle]} ·{' '}
                      <span
                        className={
                          selectedIncident.slaStatus === 'SLA Breached'
                            ? 'text-red-700 font-semibold'
                            : 'text-emerald-700 font-semibold'
                        }
                      >
                        {selectedIncident.slaStatus} (Target {selectedIncident.slaTargetMinutes}m)
                      </span>
                    </p>
                    <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                      Incident {selectedIncident.label} —{' '}
                      {getLocalizedArea(selectedIncident.feederId, selectedIncident.area)}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500">{t.priorityScore}</p>
                    <p className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                      <AnimatedNumber value={selectedIncident.score.totalScore} decimals={1} />
                    </p>
                  </div>
                </div>

                {/* Duplicate Merge Audit Banner */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      {lang === 'kn'
                        ? `ನಕಲಿ ದೂರು ವಿಲೀನ: ${selectedIncident.reportCount} ನಾಗರಿಕ ದೂರುಗಳು 1 ಘಟನೆಯಾಗಿ ಸೇರಿವೆ`
                        : `Duplicate Merge: ${selectedIncident.reportCount} citizen reports merged into 1 fault incident`}
                    </p>
                    <p className="text-xs text-slate-600">
                      {Object.entries(channelBreakdown)
                        .map(([ch, cnt]) => `${ch}: ${cnt}`)
                        .join(' · ')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSimulateDuplicates(selectedIncident.feederId)}
                    className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-300/70 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <CopyPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {lang === 'kn' ? '+5 ನಕಲಿ ದೂರು ಪರೀಕ್ಷಿಸಿ' : 'Simulate +5 Duplicates'}
                    </span>
                  </button>
                </div>

                {/* Explainable Score Breakdown with Animated Factor Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card-3d-lift rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">{t.consumersAffected}</p>
                      <p className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900">
                        +<AnimatedNumber value={selectedIncident.score.consumerPoints} decimals={1} /> pts
                      </p>
                      <p className="text-xs text-slate-600 tabular-nums">
                        {selectedIncident.reportCount} merged reports
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{
                          scaleX: Math.min(1, selectedIncident.score.consumerPoints / 45),
                        }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ originX: 0 }}
                        className="h-full w-full bg-[#08152B] rounded-full"
                      />
                    </div>
                  </div>
                  <div className="card-3d-lift rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">{t.outageDuration}</p>
                      <p className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900">
                        +<AnimatedNumber value={selectedIncident.score.durationPoints} decimals={1} /> pts
                      </p>
                      <p className="text-xs text-slate-600 tabular-nums">
                        {formatDuration(selectedIncident.durationMinutes)}
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{
                          scaleX: Math.min(1, selectedIncident.score.durationPoints / 60),
                        }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ originX: 0 }}
                        className="h-full w-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="card-3d-lift rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">{t.criticalLoadWeight}</p>
                      <p className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900">
                        +<AnimatedNumber value={selectedIncident.score.criticalLoadPoints} decimals={1} /> pts
                      </p>
                      <p className="text-xs text-slate-600">{selectedIncident.criticalLoad}</p>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{
                          scaleX: Math.min(1, selectedIncident.score.criticalLoadPoints / 50),
                        }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ originX: 0 }}
                        className="h-full w-full bg-red-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin-Gated Root Cause, Escalation & Crew Assignment */}
                {selectedIncident.status !== 'Restored' && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    {!adminUser && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 text-xs text-amber-800">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Lock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          <span>{t.adminUnlockHint}</span>
                        </span>
                        <button
                          type="button"
                          onClick={onRequireAdminLogin}
                          className="font-semibold text-[#08152B] underline underline-offset-2 cursor-pointer"
                        >
                          {tGlobal.controlBar.adminLogin}
                        </button>
                      </div>
                    )}

                    {/* Root Cause & SLA Escalation Row */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex-1">
                        <label
                          htmlFor="inspector-cause"
                          className="block text-xs font-medium text-slate-600 mb-1"
                        >
                          {lang === 'kn' ? 'ದೋಷದ ಮೂಲ ಕಾರಣ (Root Cause)' : 'Field Root Cause Diagnosis'}
                        </label>
                        <select
                          id="inspector-cause"
                          value={selectedIncident.faultCause}
                          onChange={(e) => {
                            if (!adminUser) {
                              onRequireAdminLogin();
                              return;
                            }
                            onSetFaultCause(selectedIncident.id, e.target.value as FaultCause);
                          }}
                          className="w-full min-h-[38px] px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-900"
                        >
                          {FAULT_CAUSES.map((cause) => (
                            <option key={cause} value={cause}>
                              {cause}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProtectedEscalate(selectedIncident.id)}
                        disabled={selectedIncident.escalatedToEe}
                        className={`min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                          selectedIncident.escalatedToEe
                            ? 'bg-red-50 text-red-700 border-red-200 cursor-default'
                            : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {selectedIncident.escalatedToEe
                            ? 'Escalated to Exec. Engineer'
                            : 'Escalate to Exec. Engineer'}
                        </span>
                      </button>
                    </div>

                    {/* Crew Dispatch Row */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1">
                        <label
                          htmlFor="inspector-crew"
                          className="block text-xs font-medium text-slate-600 mb-1"
                        >
                          {t.dispatchCrewLabel}
                        </label>
                        <select
                          id="inspector-crew"
                          value={selectedCrewId}
                          onChange={(e) => setSelectedCrewId(e.target.value)}
                          className="w-full min-h-[40px] px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-900"
                        >
                          {BESCOM_CREWS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} — {c.division}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-32">
                        <label
                          htmlFor="inspector-eta"
                          className="block text-xs font-medium text-slate-600 mb-1"
                        >
                          {t.etaLabel}
                        </label>
                        <select
                          id="inspector-eta"
                          value={selectedEta}
                          onChange={(e) => setSelectedEta(e.target.value)}
                          className="w-full min-h-[40px] px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-900"
                        >
                          <option value="20 mins">20 mins</option>
                          <option value="35 mins">35 mins</option>
                          <option value="45 mins">45 mins</option>
                          <option value="60 mins">60 mins</option>
                          <option value="90 mins">90 mins</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleProtectedDispatch(selectedIncident.id)}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {!adminUser ? (
                            <Lock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                          ) : (
                            <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {selectedIncident.status === 'Crew assigned'
                              ? t.reassignCrew
                              : t.assignCrew}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProtectedRestore(selectedIncident.id)}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.markRestored}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Merged Individual Reports */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {t.mergedComplaints} ({selectedIncident.reportCount})
                    </span>
                  </div>
                  <div className="max-h-72 overflow-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="py-2 px-3 font-semibold">RR Number</th>
                          <th className="py-2 px-3 font-semibold">Channel</th>
                          <th className="py-2 px-3 font-semibold">Fault Type</th>
                          <th className="py-2 px-3 font-semibold text-right">Age</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedIncident.reports.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 px-3 font-mono text-slate-900">{r.rrNumber}</td>
                            <td className="py-2 px-3 text-slate-700">{r.channel}</td>
                            <td className="py-2 px-3 text-slate-700">{r.outageType}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                              {formatDuration(r.reportedAtMinutesAgo)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ranked Priority Queue + SMS Dispatch Log + Audit Log */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {t.priorityQueueTitle}
                </h2>
                <span className="text-xs text-slate-500 tabular-nums">
                  {filteredIncidents.length} / {incidents.length} {t.shownCount}
                </span>
              </div>

              {filteredIncidents.length === 0 ? (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-800">{t.noMatches}</p>
                  <p className="text-xs text-slate-500">{t.noMatchesHint}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                  {filteredIncidents.map((inc) => {
                    const isSelected = selectedIncident?.id === inc.id;
                    const priorityColor =
                      inc.status === 'Restored'
                        ? 'text-slate-600'
                        : inc.priority === 'HIGH'
                          ? 'text-red-700'
                          : inc.priority === 'MEDIUM'
                            ? 'text-amber-700'
                            : 'text-emerald-700';

                    return (
                      <motion.div
                        key={inc.id}
                        layout
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => onSelectIncident(inc.id)}
                        className={`card-3d-lift rounded-xl border p-4 space-y-3 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-50 border-[#08152B] ring-1 ring-[#08152B]'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-sm font-bold text-slate-900">
                                Incident {inc.label}
                              </span>
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                              <span className="font-mono text-xs text-slate-600">
                                {inc.feederId}
                              </span>
                              {inc.slaStatus === 'SLA Breached' && (
                                <span className="text-[11px] font-semibold text-red-700">
                                  · SLA Breached
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {getLocalizedArea(inc.feederId, inc.area)}{' '}
                              <span aria-hidden="true">·</span> {tGlobal.circleLabels[inc.circle]}
                            </p>
                          </div>
                          <span
                            className={`font-mono text-xs font-bold whitespace-nowrap ${priorityColor}`}
                          >
                            {inc.status === 'Restored'
                              ? tGlobal.statusLabels.Restored
                              : tGlobal.priorityLabels[inc.priority]}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 tabular-nums">
                          <span>{inc.reportCount} merged reports</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDuration(inc.durationMinutes)}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {inc.criticalLoad === 'None' ? 'Residential' : inc.criticalLoad}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-semibold text-slate-900">
                            Score {inc.score.totalScore.toFixed(1)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <span className="text-xs text-slate-600">
                            {inc.status === 'Restored'
                              ? t.supplyRestoredText
                              : inc.status === 'Crew assigned'
                                ? `${inc.assignedCrewName} · ETA ${inc.estimatedRestoration}`
                                : t.awaitingCrewText}
                          </span>

                          <div className="flex items-center gap-2">
                            {inc.status === 'Reported' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProtectedDispatch(inc.id);
                                }}
                                className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                              >
                                {!adminUser && (
                                  <Lock className="w-3 h-3 text-amber-400" aria-hidden="true" />
                                )}
                                <span>{t.assignCrew}</span>
                              </button>
                            )}
                            {inc.status !== 'Restored' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProtectedRestore(inc.id);
                                }}
                                className="min-h-[34px] px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                              >
                                {t.markRestored}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live SMS Dispatch Log */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    {t.smsStreamTitle}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 tabular-nums">
                  {smsAlerts.length} {t.smsSent}
                </span>
              </div>

              <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {smsAlerts.slice(0, 6).map((alert) => (
                  <li
                    key={alert.id}
                    className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-slate-500">
                      <span className="font-mono text-slate-800 font-medium">
                        {alert.recipient}
                      </span>
                      <span className="font-mono tabular-nums">
                        {alert.feederId} · {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{alert.message}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Control Room Audit Trail */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#08152B]" aria-hidden="true" />
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Control Room Dispatch Audit Log
                  </h3>
                </div>
                <span className="text-xs text-slate-500 tabular-nums">{auditLog.length} events</span>
              </div>

              <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {auditLog.slice(0, 6).map((entry) => (
                  <li
                    key={entry.id}
                    className="text-xs border-b border-slate-100 pb-2 last:border-none"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-800">{entry.actor}</span>
                      <span className="font-mono tabular-nums">
                        {entry.feederId} · {entry.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{entry.action}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

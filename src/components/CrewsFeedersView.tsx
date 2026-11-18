import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Lock,
  MessageSquare,
  Search,
  Truck,
  Upload,
  Zap,
} from 'lucide-react';
import {
  ALL_CIRCLES,
  BESCOM_CREWS,
  BESCOM_FEEDERS,
  SAMPLE_CSV_BATCH,
} from '../engine/dbscan';
import { TRANSLATIONS } from '../i18n/translations';
import type {
  AdminUser,
  BescomCircle,
  FaultIncident,
  Language,
  MaintenanceWindow,
  NewConnectionApplication,
  OutageReport,
} from '../types/lumenops';

interface CrewsFeedersViewProps {
  lang: Language;
  adminUser: AdminUser | null;
  onRequireAdminLogin: () => void;
  incidents: FaultIncident[];
  reports: OutageReport[];
  connectionApplications: NewConnectionApplication[];
  onAssignCrew: (incidentId: string, crewId: string, eta: string) => void;
  onAdvanceConnectionStatus: (applicationId: string) => void;
  onImportCsvText: (csvText: string) => void;
  onJumpToOperations: (incidentId: string) => void;
  maintenanceWindows: MaintenanceWindow[];
  onAddMaintenance: (payload: Omit<MaintenanceWindow, 'id' | 'status'>) => void;
  onCompleteMaintenance: (id: string) => void;
}

export default function CrewsFeedersView({
  lang,
  adminUser,
  onRequireAdminLogin,
  incidents,
  reports,
  connectionApplications,
  onAssignCrew,
  onAdvanceConnectionStatus,
  onImportCsvText,
  onJumpToOperations,
  maintenanceWindows,
  onAddMaintenance,
  onCompleteMaintenance,
}: CrewsFeedersViewProps) {
  const [csvDraft, setCsvDraft] = useState(SAMPLE_CSV_BATCH);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [dispatchTargets, setDispatchTargets] = useState<Record<string, string>>({});
  const [circleFilter, setCircleFilter] = useState<'ALL' | BescomCircle>('ALL');
  const [locationSearch, setLocationSearch] = useState('');

  // Planned maintenance form state
  const [mntFeederId, setMntFeederId] = useState('FDR-IND-04');
  const [mntDate, setMntDate] = useState('19 Nov 2026');
  const [mntTime, setMntTime] = useState('10:00 – 13:00');
  const [mntReason, setMntReason] = useState('11kV Transformer preventive maintenance & tree trimming');

  const t = TRANSLATIONS[lang].crews;
  const tGlobal = TRANSLATIONS[lang];
  const tConnection = tGlobal.citizen.newConnection;

  const activeIncidents = incidents.filter((i) => i.status !== 'Restored');
  const complaintRows = useMemo(() => {
    const incidentsByReportId = new Map<string, FaultIncident>();
    incidents.forEach((incident) => {
      incident.reports.forEach((report) => incidentsByReportId.set(report.id, incident));
    });
    return [...reports]
      .sort((a, b) => a.reportedAtMinutesAgo - b.reportedAtMinutesAgo)
      .map((report) => ({ report, incident: incidentsByReportId.get(report.id) }));
  }, [incidents, reports]);
  const reportCountsByFeeder = useMemo(
    () =>
      reports.reduce<Record<string, number>>((counts, report) => {
        counts[report.feederId] = (counts[report.feederId] ?? 0) + 1;
        return counts;
      }, {}),
    [reports]
  );

  const filteredFeeders = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    return BESCOM_FEEDERS.filter((f) => {
      if (circleFilter !== 'ALL' && f.circle !== circleFilter) return false;
      if (!q) return true;
      return (
        f.area.toLowerCase().includes(q) ||
        f.areaKn.toLowerCase().includes(q) ||
        f.feederId.toLowerCase().includes(q) ||
        f.substation.toLowerCase().includes(q)
      );
    });
  }, [circleFilter, locationSearch]);

  const handleProtectedCrewDispatch = (incidentId: string, crewId: string) => {
    if (!adminUser) {
      onRequireAdminLogin();
      return;
    }
    onAssignCrew(incidentId, crewId, '35 mins');
  };

  const handleAddMaintenanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!adminUser) {
      onRequireAdminLogin();
      return;
    }
    const feeder = BESCOM_FEEDERS.find((f) => f.feederId === mntFeederId) ?? BESCOM_FEEDERS[0];
    onAddMaintenance({
      feederId: feeder.feederId,
      area: feeder.area,
      date: mntDate.trim() || '19 Nov 2026',
      timeWindow: mntTime.trim() || '10:00 – 13:00',
      reason: mntReason.trim() || 'Scheduled feeder servicing',
    });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCsvDraft(reader.result);
        onImportCsvText(reader.result);
        setImportFeedback(`Ingested CSV file "${file.name}" into DBSCAN clustering pipeline.`);
        setTimeout(() => setImportFeedback(null), 4500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePasteImport = () => {
    if (!csvDraft.trim()) return;
    onImportCsvText(csvDraft);
    setImportFeedback('Parsed CSV rows and merged into live BESCOM priority queue.');
    setTimeout(() => setImportFeedback(null), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
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

      {!adminUser && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>{t.adminRequiredNotice}</span>
          </div>
          <button
            type="button"
            onClick={onRequireAdminLogin}
            className="min-h-[38px] px-4 py-1.5 text-xs font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            {tGlobal.controlBar.adminLogin}
          </button>
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#08152B]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              {t.complaintsTitle}
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 tabular-nums">
            {complaintRows.length} {t.complaintCount}
          </span>
        </div>

        {complaintRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">{t.noComplaints}</p>
          </div>
        ) : (
          <div className="max-h-[560px] overflow-y-auto space-y-3 pr-1">
            {complaintRows.map(({ report, incident }) => {
              const feederMeta = BESCOM_FEEDERS.find((f) => f.feederId === report.feederId);
              const displayArea =
                lang === 'kn' && feederMeta ? feederMeta.areaKn : report.area;
              return (
                <article
                  key={report.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {t.complaintRef}
                      </p>
                      <p className="font-mono text-sm font-bold text-slate-900">
                        {report.rrNumber}
                      </p>
                    </div>
                    {incident && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            incident.priority === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : incident.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {tGlobal.priorityLabels[incident.priority]}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {tGlobal.statusLabels[incident.status]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <p className="text-slate-700">
                      <span className="font-semibold">{t.complaintLocation}: </span>
                      {displayArea} <span className="font-mono text-slate-500">({report.feederId})</span>
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">{t.complaintDetails}: </span>
                      {report.outageType}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-semibold">{t.complaintSource}: </span>
                      {report.channel} · {report.reportedAtMinutesAgo} min ago
                    </p>
                    {incident && (
                      <p className="text-slate-600">
                        Incident {incident.label} · {incident.reportCount} {t.complaintCount}
                      </p>
                    )}
                  </div>

                  {report.description && (
                    <p className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
                      {report.description}
                    </p>
                  )}

                  {incident && (
                    <div className="flex justify-end border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => onJumpToOperations(incident.id)}
                        className="min-h-[34px] rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#08152B] hover:bg-slate-50 cursor-pointer"
                      >
                        {t.viewIncident}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#08152B]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              {tConnection.trackerTitle}
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 tabular-nums">
            {connectionApplications.length} {tConnection.applicationCount}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
          {connectionApplications.map((application) => {
            const feederMeta = BESCOM_FEEDERS.find(
              (feeder) => feeder.feederId === application.feederId
            );
            const displayArea =
              lang === 'kn' && feederMeta ? feederMeta.areaKn : application.area;
            const statusColor =
              application.status === 'Meter Sanctioned'
                ? 'text-emerald-700 bg-emerald-50'
                : application.status === 'Field Inspection'
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-slate-700 bg-slate-100';

            return (
              <article
                key={application.applicationId}
                className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-semibold text-slate-500">
                      {application.applicationId}
                    </p>
                    <h3 className="mt-0.5 truncate font-display text-sm font-bold text-slate-900">
                      {application.applicantName}
                    </h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColor}`}>
                    {application.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p>{displayArea} ({application.feederId}) · {application.pincode}</p>
                  <p>{application.category} · {application.loadKw} kW · {application.phase}</p>
                  <p>{application.phone} · {application.email}</p>
                  <p className="font-mono text-slate-800">
                    ₹{application.estimatedFee.toLocaleString('en-IN')} · {application.submittedAt}
                  </p>
                  {application.uploadedDocumentName && (
                    <p className="truncate text-slate-500">
                      {tConnection.proofUploadLabel}: {application.uploadedDocumentName}
                    </p>
                  )}
                </div>

                {application.status !== 'Meter Sanctioned' && (
                  <div className="flex justify-end border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!adminUser) {
                          onRequireAdminLogin();
                          return;
                        }
                        onAdvanceConnectionStatus(application.applicationId);
                      }}
                      className="min-h-[34px] inline-flex items-center gap-1.5 rounded-md bg-[#08152B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      {!adminUser && (
                        <Lock className="h-3 w-3 text-amber-400" aria-hidden="true" />
                      )}
                      {tConnection.advanceStatusBtn}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Field Crew Roster */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#08152B]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-slate-900">{t.rosterTitle}</h2>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">{BESCOM_CREWS.length} units</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {BESCOM_CREWS.map((crew) => {
            const assignedIncident = activeIncidents.find((i) => i.assignedCrewId === crew.id);
            const fallbackTarget = activeIncidents[0]?.id ?? '';
            const targetId = dispatchTargets[crew.id] ?? fallbackTarget;

            return (
              <div
                key={crew.id}
                className="card-3d-lift bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {crew.name}
                      </h3>
                      <p className="text-xs text-slate-500">{crew.division}</p>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold whitespace-nowrap ${
                        assignedIncident ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {assignedIncident ? t.deployed : t.standby}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <p>{crew.specialty}</p>
                    <p>
                      {crew.leadEngineer} <span aria-hidden="true">·</span>{' '}
                      <span className="font-mono">{crew.vehicle}</span>
                    </p>
                    <p className="font-mono text-slate-500">{crew.phone}</p>
                  </div>
                </div>

                {assignedIncident ? (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        Incident {assignedIncident.label} · {assignedIncident.feederId}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ETA {assignedIncident.estimatedRestoration}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onJumpToOperations(assignedIncident.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#08152B] bg-white border border-slate-200 hover:bg-slate-100 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t.inspect}
                    </button>
                  </div>
                ) : activeIncidents.length > 0 ? (
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      aria-label={`Assign ${crew.name} to incident`}
                      value={targetId}
                      onChange={(e) =>
                        setDispatchTargets((prev) => ({ ...prev, [crew.id]: e.target.value }))
                      }
                      className="flex-1 min-w-0 min-h-[38px] px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      {activeIncidents.map((inc) => (
                        <option key={inc.id} value={inc.id}>
                          Incident {inc.label} ({inc.feederId})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (targetId) handleProtectedCrewDispatch(targetId, crew.id);
                      }}
                      className="min-h-[38px] inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {!adminUser && <Lock className="w-3 h-3 text-amber-400" aria-hidden="true" />}
                      <span>{t.dispatch}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No active incidents awaiting dispatch.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Planned Maintenance & Scheduled Shutdowns */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Planned Feeder Maintenance &amp; Shutdown Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Published maintenance windows alert citizens before they file unnecessary fault complaints.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            {maintenanceWindows.map((mnt) => {
              const feederMeta = BESCOM_FEEDERS.find((f) => f.feederId === mnt.feederId);
              const displayArea = lang === 'kn' && feederMeta ? feederMeta.areaKn : mnt.area;
              return (
                <div
                  key={mnt.id}
                  className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">{mnt.feederId}</span>
                      <span aria-hidden="true" className="text-slate-400">
                        ·
                      </span>
                      <span className="font-semibold text-slate-800">{displayArea}</span>
                      <span aria-hidden="true" className="text-slate-400">
                        ·
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          mnt.status === 'Completed'
                            ? 'text-emerald-700'
                            : mnt.status === 'In Progress'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                        }`}
                      >
                        {mnt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{mnt.reason}</p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {mnt.date} · {mnt.timeWindow}
                    </p>
                  </div>

                  {mnt.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!adminUser) {
                          onRequireAdminLogin();
                          return;
                        }
                        onCompleteMaintenance(mnt.id);
                      }}
                      className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {!adminUser && <Lock className="w-3 h-3" aria-hidden="true" />}
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleAddMaintenanceSubmit}
            className="lg:col-span-5 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3"
          >
            <h3 className="font-display text-sm font-bold text-slate-900">
              Schedule Maintenance Shutdown (Admin)
            </h3>

            <div>
              <label htmlFor="mnt-feeder" className="block text-xs font-medium text-slate-600 mb-1">
                Target Feeder
              </label>
              <select
                id="mnt-feeder"
                value={mntFeederId}
                onChange={(e) => setMntFeederId(e.target.value)}
                className="w-full min-h-[38px] px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              >
                {BESCOM_FEEDERS.map((f) => (
                  <option key={f.feederId} value={f.feederId}>
                    {lang === 'kn' ? f.areaKn : f.area} ({f.feederId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="mnt-date" className="block text-xs font-medium text-slate-600 mb-1">
                  Date
                </label>
                <input
                  id="mnt-date"
                  type="text"
                  value={mntDate}
                  onChange={(e) => setMntDate(e.target.value)}
                  className="w-full min-h-[38px] px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="mnt-time" className="block text-xs font-medium text-slate-600 mb-1">
                  Time Window
                </label>
                <input
                  id="mnt-time"
                  type="text"
                  value={mntTime}
                  onChange={(e) => setMntTime(e.target.value)}
                  className="w-full min-h-[38px] px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mnt-reason" className="block text-xs font-medium text-slate-600 mb-1">
                Work Description
              </label>
              <input
                id="mnt-reason"
                type="text"
                value={mntReason}
                onChange={(e) => setMntReason(e.target.value)}
                className="w-full min-h-[38px] px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {!adminUser && <Lock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />}
              <span>Publish Maintenance Window</span>
            </button>
          </form>
        </div>
      </section>

      {/* All 24 Locations & 11kV Feeder Directory */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-slate-900">{t.feederDirTitle}</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Filter area or feeder..."
                aria-label="Filter locations or feeders"
                className="w-full sm:w-56 min-h-[38px] pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <select
              aria-label="Filter feeders by circle"
              value={circleFilter}
              onChange={(e) => setCircleFilter(e.target.value as 'ALL' | BescomCircle)}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="ALL">{tGlobal.operations.allCircles}</option>
              {ALL_CIRCLES.map((c) => (
                <option key={c} value={c}>
                  {tGlobal.circleLabels[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-left border-collapse min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-3">Feeder ID</th>
                <th className="py-2.5 px-3">Location &amp; Substation</th>
                <th className="py-2.5 px-3">Circle</th>
                <th className="py-2.5 px-3">Critical Asset</th>
                <th className="py-2.5 px-3 text-right">Consumers</th>
                <th className="py-2.5 px-3 text-right">{t.feederComplaintCount}</th>
                <th className="py-2.5 px-3">Live State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFeeders.map((feeder) => {
                const liveInc = incidents.find((i) => i.feederId === feeder.feederId);
                const stateText =
                  !liveInc || liveInc.status === 'Restored'
                    ? 'Nominal'
                    : liveInc.status === 'Crew assigned'
                      ? tGlobal.statusLabels['Crew assigned']
                      : tGlobal.statusLabels.Reported;
                const stateColor =
                  !liveInc || liveInc.status === 'Restored'
                    ? 'text-emerald-700'
                    : liveInc.status === 'Crew assigned'
                      ? 'text-amber-700'
                      : 'text-red-700';

                return (
                  <tr key={feeder.feederId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-900">
                      {feeder.feederId}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">
                        {lang === 'kn' ? feeder.areaKn : feeder.area}
                      </p>
                      <p className="text-xs text-slate-500">{feeder.substation}</p>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {tGlobal.circleLabels[feeder.circle]}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-700">
                      {feeder.criticalAssetName ?? 'Residential distribution'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {feeder.connectedConsumers.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {reportCountsByFeeder[feeder.feederId] ?? 0}
                    </td>
                    <td className={`py-3 px-3 font-mono text-xs font-bold ${stateColor}`}>
                      {stateText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Legacy CSV / API Bridge */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">{t.csvTitle}</h2>
            <p className="text-xs text-slate-600">{t.csvSub}</p>
          </div>
          <label className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer">
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.uploadCsvBtn}</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>

        <textarea
          aria-label="CSV outage batch input"
          rows={5}
          value={csvDraft}
          onChange={(e) => setCsvDraft(e.target.value)}
          className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePasteImport}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
            <span>{t.ingestCsvBtn}</span>
          </button>

          {importFeedback && (
            <p className="text-xs font-medium text-emerald-700">{importFeedback}</p>
          )}
        </div>
      </section>
    </div>
  );
}

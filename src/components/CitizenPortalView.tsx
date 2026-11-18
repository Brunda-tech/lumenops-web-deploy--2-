import { useMemo, useState, type FormEvent } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  CopyPlus,
  CreditCard,
  FilePlus2,
  MapPin,
  MessageSquare,
  Search,
  Send,
  Users,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ALL_CIRCLES, BESCOM_FEEDERS, formatDuration } from '../engine/dbscan';
import { TRANSLATIONS } from '../i18n/translations';
import type {
  AdminUser,
  BescomCircle,
  BillRecord,
  CitizenServiceTab,
  CriticalLoadType,
  FaultIncident,
  Language,
  MaintenanceWindow,
  NewConnectionApplication,
  OutageReport,
  OutageType,
  PaymentMethod,
  ReportChannel,
  SmsAlert,
} from '../types/lumenops';
import CitizenBillingTab from './CitizenBillingTab';
import CitizenNewConnectionTab from './CitizenNewConnectionTab';

interface CitizenPortalViewProps {
  lang: Language;
  adminUser: AdminUser | null;
  onRequireAdminLogin: () => void;
  incidents: FaultIncident[];
  reports: OutageReport[];
  activeConsumerFeeder: string | null;
  onSubmitConsumerReport: (payload: {
    area: string;
    feederId: string;
    lat: number;
    lng: number;
    channel: ReportChannel;
    outageType: OutageType;
    criticalLoad: CriticalLoadType;
    rrNumber: string;
    phone: string;
    description: string;
  }) => void;
  onSimulateDuplicates: (feederId: string) => void;
  smsAlerts: SmsAlert[];
  billsByRr: Record<string, BillRecord>;
  onPayBill: (bill: BillRecord, method: PaymentMethod) => BillRecord;
  connectionApps: NewConnectionApplication[];
  onSubmitConnectionApp: (
    payload: Omit<NewConnectionApplication, 'applicationId' | 'status' | 'submittedAt'>
  ) => NewConnectionApplication;
  onAdvanceConnectionStatus: (applicationId: string) => void;
  maintenanceWindows: MaintenanceWindow[];
}

export default function CitizenPortalView({
  lang,
  adminUser,
  onRequireAdminLogin,
  incidents,
  reports,
  activeConsumerFeeder,
  onSubmitConsumerReport,
  onSimulateDuplicates,
  smsAlerts,
  billsByRr,
  onPayBill,
  connectionApps,
  onSubmitConnectionApp,
  onAdvanceConnectionStatus,
  maintenanceWindows,
}: CitizenPortalViewProps) {
  const [activeTab, setActiveTab] = useState<CitizenServiceTab>('outage');
  const [circleFilter, setCircleFilter] = useState<'ALL' | BescomCircle>('ALL');
  const [selectedFeederId, setSelectedFeederId] = useState(BESCOM_FEEDERS[0].feederId);
  const [outageType, setOutageType] = useState<OutageType>('Complete Blackout');
  const [channel, setChannel] = useState<ReportChannel>('Web Portal');
  const [criticalLoad, setCriticalLoad] = useState<CriticalLoadType>(
    BESCOM_FEEDERS[0].defaultCriticalLoad
  );
  const [rrNumber, setRrNumber] = useState('BLR-E4-71904');
  const [phone, setPhone] = useState('+91 98450 42190');
  const [description, setDescription] = useState('Power interruption on main feeder lane.');
  const [lookupQuery, setLookupQuery] = useState('');
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const t = TRANSLATIONS[lang].citizen;
  const tGlobal = TRANSLATIONS[lang];

  const availableFeeders = useMemo(() => {
    if (circleFilter === 'ALL') return BESCOM_FEEDERS;
    return BESCOM_FEEDERS.filter((f) => f.circle === circleFilter);
  }, [circleFilter]);

  const selectedFeeder =
    BESCOM_FEEDERS.find((f) => f.feederId === selectedFeederId) ??
    availableFeeders[0] ??
    BESCOM_FEEDERS[0];

  const existingFeederIncident = incidents.find(
    (inc) => inc.feederId === selectedFeeder.feederId && inc.status !== 'Restored'
  );

  const activeFeederMaintenance = maintenanceWindows.find(
    (m) => m.feederId === selectedFeeder.feederId && m.status !== 'Completed'
  );

  const handleCircleChange = (nextCircle: 'ALL' | BescomCircle) => {
    setCircleFilter(nextCircle);
    const list =
      nextCircle === 'ALL'
        ? BESCOM_FEEDERS
        : BESCOM_FEEDERS.filter((f) => f.circle === nextCircle);
    if (list[0]) {
      setSelectedFeederId(list[0].feederId);
      setCriticalLoad(list[0].defaultCriticalLoad);
    }
  };

  const handleFeederChange = (feederId: string) => {
    setSelectedFeederId(feederId);
    const found = BESCOM_FEEDERS.find((f) => f.feederId === feederId);
    if (found) setCriticalLoad(found.defaultCriticalLoad);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const jitterLat = (Math.random() - 0.5) * 0.0024;
    const jitterLng = (Math.random() - 0.5) * 0.0024;

    const priorCount = existingFeederIncident?.reportCount ?? 0;

    onSubmitConsumerReport({
      area: selectedFeeder.area,
      feederId: selectedFeeder.feederId,
      lat: selectedFeeder.lat + jitterLat,
      lng: selectedFeeder.lng + jitterLng,
      channel,
      outageType,
      criticalLoad,
      rrNumber: rrNumber.trim() || 'BLR-E4-71904',
      phone: phone.trim() || '+91 98450 42190',
      description: description.trim() || 'Consumer outage report',
    });

    const displayArea = lang === 'kn' ? selectedFeeder.areaKn : selectedFeeder.area;
    setConfirmation(
      priorCount > 0
        ? lang === 'kn'
          ? `ನಿಮ್ಮ ದೂರು ${displayArea} ನಲ್ಲಿ ಈಗಾಗಲೇ ಸಕ್ರಿಯವಾಗಿರುವ ಘಟನೆಯೊಂದಿಗೆ ನಕಲಿ ದೂರಾಗಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ವಿಲೀನಗೊಂಡಿದೆ (ಒಟ್ಟು ${priorCount + 1} ದೂರುಗಳು).`
          : `Merged as a duplicate into existing fault cluster for ${displayArea} (now ${priorCount + 1} linked consumer reports — no duplicate ticket clutter).`
        : lang === 'kn'
          ? `${displayArea} (${selectedFeeder.feederId}) ಪ್ರದೇಶದ ದೂರು ದಾಖಲಾಗಿದೆ.`
          : `New fault incident logged for ${displayArea} (${selectedFeeder.feederId}).`
    );
    setTimeout(() => setConfirmation(null), 6000);
  };

  const trackedIncident = (() => {
    const q = lookupQuery.trim().toLowerCase();
    if (q) {
      return (
        incidents.find(
          (inc) =>
            inc.feederId.toLowerCase().includes(q) ||
            inc.area.toLowerCase().includes(q) ||
            inc.reports.some((r) => r.rrNumber.toLowerCase().includes(q))
        ) ?? null
      );
    }
    return (
      incidents.find((inc) => inc.feederId === (activeConsumerFeeder ?? selectedFeeder.feederId)) ??
      incidents[0] ??
      null
    );
  })();

  const trackedFeederMeta = trackedIncident
    ? BESCOM_FEEDERS.find((f) => f.feederId === trackedIncident.feederId)
    : undefined;
  const trackedAreaLabel =
    trackedIncident && lang === 'kn' && trackedFeederMeta
      ? trackedFeederMeta.areaKn
      : trackedIncident?.area;

  const statusStep =
    trackedIncident?.status === 'Restored'
      ? 4
      : trackedIncident?.status === 'Crew assigned'
        ? 3
        : trackedIncident
          ? 2
          : 1;

  const feederSmsAlerts = smsAlerts.filter(
    (s) => !trackedIncident || s.feederId === trackedIncident.feederId
  );
  const incidentByReportId = useMemo(
    () =>
      new Map(
        incidents.flatMap((incident) =>
          incident.reports.map((report) => [report.id, incident] as const)
        )
      ),
    [incidents]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
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

        {/* Citizen Service Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/75 rounded-xl w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('outage')}
            className={`relative flex-1 lg:flex-initial min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'outage' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeTab === 'outage' && (
              <motion.span
                layoutId="citizen-tab-bg"
                transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                className="absolute inset-0 bg-white rounded-lg shadow-xs"
              />
            )}
            <Zap className="relative z-10 w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span className="relative z-10">{t.tabOutage}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bill')}
            className={`relative flex-1 lg:flex-initial min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bill' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeTab === 'bill' && (
              <motion.span
                layoutId="citizen-tab-bg"
                transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                className="absolute inset-0 bg-white rounded-lg shadow-xs"
              />
            )}
            <CreditCard className="relative z-10 w-4 h-4 text-[#08152B] shrink-0" aria-hidden="true" />
            <span className="relative z-10">{t.tabBill}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            className={`relative flex-1 lg:flex-initial min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'connection' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeTab === 'connection' && (
              <motion.span
                layoutId="citizen-tab-bg"
                transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                className="absolute inset-0 bg-white rounded-lg shadow-xs"
              />
            )}
            <FilePlus2 className="relative z-10 w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span className="relative z-10">{t.tabConnection}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'bill' && (
          <motion.div
            key="bill"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <CitizenBillingTab lang={lang} billsByRr={billsByRr} onPayBill={onPayBill} />
          </motion.div>
        )}

        {activeTab === 'connection' && (
          <motion.div
            key="connection"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <CitizenNewConnectionTab
              lang={lang}
              adminUser={adminUser}
              onRequireAdminLogin={onRequireAdminLogin}
              applications={connectionApps}
              onSubmitApplication={onSubmitConnectionApp}
              onAdvanceApplicationStatus={onAdvanceConnectionStatus}
            />
          </motion.div>
        )}

        {activeTab === 'outage' && (
          <motion.div
            key="outage"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
          {/* Left: Report Outage Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
          >
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900">{t.submitTitle}</h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                24 Locations
              </span>
            </div>

            {/* Duplicate Detection Preview Alert */}
            {existingFeederIncident && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Users className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                  <span>
                    {lang === 'kn'
                      ? `ಈಗಾಗಲೇ ${existingFeederIncident.reportCount} ನಾಗರಿಕರು ಈ ಪ್ರದೇಶದಲ್ಲಿ ವರದಿ ಮಾಡಿದ್ದಾರೆ (ಘಟನೆ ${existingFeederIncident.label})`
                      : `${existingFeederIncident.reportCount} neighbors already reported an outage here (Incident ${existingFeederIncident.label})`}
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  {lang === 'kn'
                    ? 'ನಿಮ್ಮ ದೂರನ್ನು ಪ್ರತ್ಯೇಕ ಟಿಕೆಟ್ ಬದಲಿಗೆ ಅದೇ ಘಟನೆಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ವಿಲೀನಗೊಳಿಸಲಾಗುತ್ತದೆ.'
                    : 'Your report will automatically merge into this existing fault cluster so crews see the combined household impact without duplicate ticket delays.'}
                </p>
              </div>
            )}

            {/* Planned Maintenance Notice if scheduled on selected feeder */}
            {activeFeederMaintenance && (
              <div className="rounded-xl bg-slate-100 border border-slate-300 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CalendarClock className="w-4 h-4 text-[#08152B] shrink-0" aria-hidden="true" />
                  <span>
                    Planned Maintenance ({activeFeederMaintenance.status}) ·{' '}
                    {activeFeederMaintenance.date} ({activeFeederMaintenance.timeWindow})
                  </span>
                </div>
                <p className="text-xs text-slate-600">{activeFeederMaintenance.reason}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cp-circle"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {t.circleFilter}
                  </label>
                  <select
                    id="cp-circle"
                    value={circleFilter}
                    onChange={(e) => handleCircleChange(e.target.value as 'ALL' | BescomCircle)}
                    className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="ALL">{tGlobal.operations.allCircles}</option>
                    {ALL_CIRCLES.map((c) => (
                      <option key={c} value={c}>
                        {tGlobal.circleLabels[c]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cp-feeder"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {t.feederLabel}
                  </label>
                  <select
                    id="cp-feeder"
                    value={selectedFeeder.feederId}
                    onChange={(e) => handleFeederChange(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-500"
                  >
                    {availableFeeders.map((f) => (
                      <option key={f.feederId} value={f.feederId}>
                        {lang === 'kn' ? f.areaKn : f.area} ({f.feederId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cp-type"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {t.outageTypeLabel}
                  </label>
                  <select
                    id="cp-type"
                    value={outageType}
                    onChange={(e) => setOutageType(e.target.value as OutageType)}
                    className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Complete Blackout">Complete Blackout</option>
                    <option value="Voltage Fluctuation">Voltage Fluctuation</option>
                    <option value="Transformer Fault">Transformer Fault</option>
                    <option value="Line / Pole Damage">Line / Pole Damage</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cp-critical"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {t.criticalLabel}
                  </label>
                  <select
                    id="cp-critical"
                    value={criticalLoad}
                    onChange={(e) => setCriticalLoad(e.target.value as CriticalLoadType)}
                    className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="None">Residential / Commercial</option>
                    <option value="Hospital nearby">Hospital / Medical Facility</option>
                    <option value="Water pumping">BWSSB Water Pumping</option>
                    <option value="Public transit">Metro / Rail Transit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cp-rr"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {t.rrLabel}
                  </label>
                  <input
                    id="cp-rr"
                    type="text"
                    required
                    value={rrNumber}
                    onChange={(e) => setRrNumber(e.target.value)}
                    placeholder="e.g. BLR-E4-71904"
                    className="w-full min-h-[44px] px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cp-phone"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {t.phoneLabel}
                  </label>
                  <input
                    id="cp-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cp-channel"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t.channelLabel}
                </label>
                <select
                  id="cp-channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as ReportChannel)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Web Portal">Web Portal</option>
                  <option value="Mobile App">BESCOM Mobile App</option>
                  <option value="Helpline 1912">Helpline 1912</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cp-desc"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t.landmarkLabel}
                </label>
                <textarea
                  id="cp-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{t.submitBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSimulateDuplicates(selectedFeeder.feederId);
                  setConfirmation(
                    lang === 'kn'
                      ? `5 ನೆರೆಹೊರೆಯ ನಕಲಿ ದೂರುಗಳನ್ನು ${selectedFeeder.feederId} ಕ್ಕೆ ವಿಲೀನಗೊಳಿಸಲಾಗಿದೆ.`
                      : `Simulated 5 neighbors reporting on ${selectedFeeder.feederId} — all merged into 1 incident cluster.`
                  );
                  setTimeout(() => setConfirmation(null), 5000);
                }}
                className="min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <CopyPlus className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>{lang === 'kn' ? '+5 ನೆರೆಹೊರೆ ದೂರು ಪರೀಕ್ಷಿಸಿ' : 'Simulate +5 Neighbor Duplicates'}</span>
              </button>
            </div>

            {confirmation && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>{confirmation}</span>
              </div>
            )}
          </form>

          {/* Right: Live Ticket & Restoration Tracker */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-slate-900">{t.trackerTitle}</h2>
                <div className="relative w-full sm:w-64">
                  <Search
                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder={t.lookupPlaceholder}
                    aria-label={t.lookupPlaceholder}
                    className="w-full min-h-[38px] pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {!trackedIncident ? (
                <p className="text-sm text-slate-600 py-6 text-center">
                  No active incident matches that RR number or feeder ID.
                </p>
              ) : (
                <>
                  <div className="rounded-xl bg-[#08152B] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-amber-400 font-mono">
                        Incident {trackedIncident.label} · {trackedIncident.feederId}
                      </p>
                      <p className="font-display text-lg font-bold mt-0.5">{trackedAreaLabel}</p>
                      <p className="text-xs text-slate-300 mt-0.5 tabular-nums">
                        {trackedIncident.reportCount} merged citizen reports ·{' '}
                        {formatDuration(trackedIncident.durationMinutes)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-400">{t.estRestoration}</p>
                      <p className="font-display text-lg font-bold text-amber-400">
                        {trackedIncident.estimatedRestoration}
                      </p>
                    </div>
                  </div>

                  {/* 4-Stage Restoration Stepper */}
                  <ol className="space-y-4 pt-1">
                    {t.steps.map((item, idx) => {
                      const stepNum = idx + 1;
                      const active = statusStep >= stepNum;
                      return (
                        <li key={item.title} className="flex items-start gap-3.5">
                          <div className="flex flex-col items-center">
                            <span
                              className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center shrink-0 tabular-nums ${
                                active
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {stepNum}
                            </span>
                            {idx < 3 && (
                              <span
                                className={`w-0.5 h-6 mt-1 ${
                                  statusStep > stepNum ? 'bg-emerald-600' : 'bg-slate-200'
                                }`}
                              />
                            )}
                          </div>
                          <div className="pt-0.5">
                            <p
                              className={`text-sm font-semibold ${
                                active ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-600">{item.desc}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </div>

            <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {t.complaintHistoryTitle}
                </h3>
                <span className="text-xs tabular-nums text-slate-500">{reports.length}</span>
              </div>
              {reports.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
                  {t.complaintHistoryEmpty}
                </p>
              ) : (
                <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {reports.map((report) => {
                    const linkedIncident = incidentByReportId.get(report.id);
                    const feederMeta = BESCOM_FEEDERS.find(
                      (feeder) => feeder.feederId === report.feederId
                    );
                    const area =
                      lang === 'kn' && feederMeta ? feederMeta.areaKn : report.area;
                    const status =
                      linkedIncident?.status === 'Crew assigned'
                        ? tGlobal.operations.crewAssigned
                        : linkedIncident?.status === 'Restored'
                          ? tGlobal.operations.restored
                          : linkedIncident
                            ? tGlobal.operations.awaitingDispatch
                            : t.complaintStatusReported;

                    return (
                      <li
                        key={report.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0 space-y-1">
                            <p className="text-xs font-semibold text-slate-900">
                              {report.rrNumber} · {report.outageType}
                            </p>
                            <p className="text-xs text-slate-600">
                              {area} · {report.feederId}
                            </p>
                            <p className="break-words text-xs text-slate-500">
                              {report.description}
                            </p>
                          </div>
                          <div className="shrink-0 text-xs sm:text-right">
                            <p className="text-slate-500">{t.complaintStatus}</p>
                            <p className="font-semibold text-slate-800">{status}</p>
                            {linkedIncident && (
                              <p className="mt-0.5 font-mono text-slate-500">
                                {t.complaintIncident} {linkedIncident.label}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Consumer SMS Updates */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <h3 className="font-display text-sm font-bold text-slate-900">{t.smsTitle}</h3>
              </div>
              {feederSmsAlerts.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Submit a report or dispatch a crew in Operations to view live SMS notifications.
                </p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {feederSmsAlerts.slice(0, 5).map((alert) => (
                    <li
                      key={alert.id}
                      className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-mono text-slate-800">{alert.recipient}</span>
                        <span className="font-mono tabular-nums">{alert.timestamp}</span>
                      </div>
                      <p className="text-slate-700">{alert.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

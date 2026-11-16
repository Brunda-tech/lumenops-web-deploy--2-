import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import AdminLoginModal from './components/AdminLoginModal';
import AnalyticsView from './components/AnalyticsView';
import CitizenPortalView from './components/CitizenPortalView';
import ControlStrip from './components/ControlStrip';
import CrewsFeedersView from './components/CrewsFeedersView';
import Footer from './components/Footer';
import Header from './components/Header';
import OperationsView from './components/OperationsView';
import { createInitialConnectionApps, SAMPLE_BILL_RECORDS } from './engine/billing';
import {
  BESCOM_CREWS,
  createSeedMaintenanceWindows,
  createSeedReports,
  DEFAULT_WEIGHTS,
  generateDuplicateReportsForFeeder,
  generateMonsoonSurgeBatch,
  type IncidentOverride,
  parseCsvReports,
  runDbscanAndScore,
} from './engine/dbscan';
import type {
  AdminUser,
  AuditLogEntry,
  BillRecord,
  CriticalLoadType,
  FaultCause,
  Language,
  MaintenanceWindow,
  NewConnectionApplication,
  OutageReport,
  OutageType,
  PaymentMethod,
  PriorityWeights,
  ReportChannel,
  SmsAlert,
  WorkspaceView,
} from './types/lumenops';
import { getSavedAdminSession, loginAdmin, logoutAdmin } from './utils/auth';

function formatClockNow(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function App() {
  const [activeView, setActiveView] = useState<WorkspaceView>('operations');
  const [lang, setLang] = useState<Language>('en');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => getSavedAdminSession());
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [reports, setReports] = useState<OutageReport[]>(() => createSeedReports());
  const [weights, setWeights] = useState<PriorityWeights>(DEFAULT_WEIGHTS);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, IncidentOverride>>({});
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-FDR-IND-04');
  const [activeConsumerFeeder, setActiveConsumerFeeder] = useState<string | null>('FDR-IND-04');

  const [smsAlerts, setSmsAlerts] = useState<SmsAlert[]>([
    {
      id: 'SMS-INIT-1',
      timestamp: '09:14:22',
      recipient: '+91 98450 11000',
      incidentLabel: 'A',
      feederId: 'FDR-IND-04',
      message:
        'Rapid Response #14 dispatched to Indiranagar 100ft Rd (FDR-IND-04). Est. restoration: 45 mins.',
    },
  ]);

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    {
      id: 'AUD-INIT-1',
      timestamp: '09:14:22',
      actor: 'System Auto-Prioritizer',
      action: 'Auto-assigned Rapid Response #14 due to Manipal/CMH Hospital critical load.',
      feederId: 'FDR-IND-04',
    },
  ]);

  const [billsByRr, setBillsByRr] = useState<Record<string, BillRecord>>(() => {
    const initial: Record<string, BillRecord> = {};
    for (const b of SAMPLE_BILL_RECORDS) {
      initial[b.rrNumber] = b;
    }
    return initial;
  });

  const [connectionApps, setConnectionApps] = useState<NewConnectionApplication[]>(() =>
    createInitialConnectionApps()
  );

  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>(() =>
    createSeedMaintenanceWindows()
  );

  const incidents = useMemo(
    () => runDbscanAndScore(reports, weights, statusOverrides),
    [reports, weights, statusOverrides]
  );

  const pushSmsAlert = (
    recipient: string,
    incidentLabel: string,
    feederId: string,
    message: string
  ) => {
    setSmsAlerts((prev) => [
      {
        id: `SMS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: formatClockNow(),
        recipient,
        incidentLabel,
        feederId,
        message,
      },
      ...prev,
    ]);
  };

  const pushAudit = (actor: string, feederId: string, action: string) => {
    setAuditLog((prev) => [
      {
        id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: formatClockNow(),
        actor,
        feederId,
        action,
      },
      ...prev,
    ]);
  };

  const handleAdminLogin = async (email: string, password: string): Promise<boolean> => {
    const res = await loginAdmin(email, password);
    if (!res.ok) return false;
    setAdminUser(res.user);
    pushAudit(res.user.name, 'SYSTEM', 'Signed in to BESCOM Control Room Admin session.');
    return true;
  };

  const handleAdminLogout = async () => {
    if (adminUser) {
      pushAudit(adminUser.name, 'SYSTEM', 'Signed out of Control Room Admin session.');
    }
    await logoutAdmin();
    setAdminUser(null);
  };

  const handleSubmitConsumerReport = (payload: {
    area: string;
    feederId: string;
    lat: number;
    lng: number;
    channel: ReportChannel;
    outageType?: OutageType;
    criticalLoad: CriticalLoadType;
    rrNumber?: string;
    phone: string;
    description?: string;
  }) => {
    const newReport: OutageReport = {
      id: `RPT-LIVE-${Date.now()}`,
      rrNumber: payload.rrNumber ?? `BLR-LIVE-${Math.floor(10000 + Math.random() * 89999)}`,
      consumerName: 'Citizen Reporter',
      phone: payload.phone,
      area: payload.area,
      feederId: payload.feederId,
      lat: payload.lat,
      lng: payload.lng,
      channel: payload.channel,
      outageType: payload.outageType ?? 'Complete Blackout',
      reportedAtMinutesAgo: 15,
      criticalLoad: payload.criticalLoad,
      description: payload.description ?? `Reported via ${payload.channel}`,
    };

    const nextReports = [newReport, ...reports];
    setReports(nextReports);
    setActiveConsumerFeeder(payload.feederId);

    const updated = runDbscanAndScore(nextReports, weights, statusOverrides);
    const matched = updated.find((inc) => inc.feederId === payload.feederId) ?? updated[0];
    if (matched) {
      setSelectedIncidentId(matched.id);
      pushSmsAlert(
        payload.phone,
        matched.label,
        matched.feederId,
        `Outage registered (${newReport.rrNumber}) and merged into Incident ${matched.label} (${matched.reportCount} combined reports).`
      );
      pushAudit(
        'DBSCAN Engine',
        matched.feederId,
        `Merged citizen report ${newReport.rrNumber} (${payload.channel}) into Incident ${matched.label}.`
      );
    }
  };

  const handleSimulateDuplicates = (feederId: string) => {
    const duplicates = generateDuplicateReportsForFeeder(feederId, 5);
    const nextReports = [...duplicates, ...reports];
    setReports(nextReports);
    setActiveConsumerFeeder(feederId);

    const updated = runDbscanAndScore(nextReports, weights, statusOverrides);
    const matched = updated.find((inc) => inc.feederId === feederId);
    if (matched) {
      setSelectedIncidentId(matched.id);
      pushSmsAlert(
        'BESCOM Dedup Engine',
        matched.label,
        matched.feederId,
        `5 separate citizen complaints near ${matched.area} auto-merged into Incident ${matched.label} (Total: ${matched.reportCount} reports).`
      );
      pushAudit(
        'DBSCAN Dedup',
        matched.feederId,
        `Auto-merged 5 duplicate neighbor reports into Incident ${matched.label}.`
      );
    }
  };

  const handlePayBill = (bill: BillRecord, method: PaymentMethod): BillRecord => {
    const paidBill: BillRecord = {
      ...bill,
      status: 'Paid',
      paymentMethod: method,
      transactionId: `TXN-BES-${Math.floor(10000000 + Math.random() * 89999999)}`,
      paidAt: new Date().toLocaleString(),
    };
    setBillsByRr((prev) => ({
      ...prev,
      [paidBill.rrNumber]: paidBill,
    }));
    pushSmsAlert(
      paidBill.rrNumber,
      'BILL',
      paidBill.feederId,
      `Payment of INR ${paidBill.totalAmount} received via ${method} for RR ${paidBill.rrNumber}. Txn: ${paidBill.transactionId}.`
    );
    return paidBill;
  };

  const handleSubmitConnectionApp = (
    payload: Omit<NewConnectionApplication, 'applicationId' | 'status' | 'submittedAt'>
  ): NewConnectionApplication => {
    const newApp: NewConnectionApplication = {
      ...payload,
      applicationId: `BESCOM-NC-2026-${Math.floor(4200 + Math.random() * 5700)}`,
      status: 'Submitted',
      submittedAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setConnectionApps((prev) => [newApp, ...prev]);
    pushSmsAlert(
      payload.phone,
      'NEW',
      payload.feederId,
      `New connection request ${newApp.applicationId} (${payload.loadKw} kW ${payload.category}) received for ${payload.area}.`
    );
    return newApp;
  };

  const handleAdvanceConnectionStatus = (applicationId: string) => {
    if (!adminUser) {
      setLoginModalOpen(true);
      return;
    }
    setConnectionApps((prev) =>
      prev.map((app) => {
        if (app.applicationId !== applicationId) return app;
        const nextStatus =
          app.status === 'Submitted'
            ? 'Field Inspection'
            : app.status === 'Field Inspection'
              ? 'Meter Sanctioned'
              : 'Meter Sanctioned';
        pushSmsAlert(
          app.phone,
          'CONN',
          app.feederId,
          `[Admin: ${adminUser.name}] Application ${app.applicationId} updated to: ${nextStatus}.`
        );
        pushAudit(
          adminUser.name,
          app.feederId,
          `Advanced new connection ${app.applicationId} to ${nextStatus}.`
        );
        return { ...app, status: nextStatus };
      })
    );
  };

  const handleAssignCrew = (incidentId: string, crewId: string, eta: string) => {
    if (!adminUser) {
      setLoginModalOpen(true);
      return;
    }
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;
    const crew = BESCOM_CREWS.find((c) => c.id === crewId) ?? BESCOM_CREWS[0];

    setStatusOverrides((prev) => ({
      ...prev,
      [inc.feederId]: {
        ...prev[inc.feederId],
        status: 'Crew assigned',
        assignedCrewId: crew.id,
        assignedCrewName: crew.name,
        estimatedRestoration: eta,
      },
    }));

    const samplePhone = inc.reports[0]?.phone ?? '+91 98450 42190';
    pushSmsAlert(
      samplePhone,
      inc.label,
      inc.feederId,
      `[Admin: ${adminUser.name}] ${crew.name} (${crew.vehicle}) assigned to ${inc.area}. ETA: ${eta}.`
    );
    pushAudit(
      adminUser.name,
      inc.feederId,
      `Dispatched ${crew.name} to Incident ${inc.label} (ETA ${eta}).`
    );
  };

  const handleMarkRestored = (incidentId: string) => {
    if (!adminUser) {
      setLoginModalOpen(true);
      return;
    }
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    setStatusOverrides((prev) => ({
      ...prev,
      [inc.feederId]: {
        ...prev[inc.feederId],
        status: 'Restored',
        assignedCrewId: inc.assignedCrewId ?? 'CREW-14',
        assignedCrewName: inc.assignedCrewName ?? 'Rapid Response #14',
        estimatedRestoration: 'Supply restored',
      },
    }));

    const samplePhone = inc.reports[0]?.phone ?? '+91 98450 42190';
    pushSmsAlert(
      samplePhone,
      inc.label,
      inc.feederId,
      `[Admin: ${adminUser.name}] Power supply restored in ${inc.area} (${inc.feederId}).`
    );
    pushAudit(adminUser.name, inc.feederId, `Confirmed power restoration for Incident ${inc.label}.`);
  };

  const handleEscalateIncident = (incidentId: string) => {
    if (!adminUser) {
      setLoginModalOpen(true);
      return;
    }
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    setStatusOverrides((prev) => ({
      ...prev,
      [inc.feederId]: {
        ...prev[inc.feederId],
        status: prev[inc.feederId]?.status ?? inc.status,
        escalatedToEe: true,
      },
    }));

    pushAudit(
      adminUser.name,
      inc.feederId,
      `Escalated Incident ${inc.label} (${inc.slaStatus}) to Executive Engineer.`
    );
  };

  const handleSetFaultCause = (incidentId: string, cause: FaultCause) => {
    if (!adminUser) {
      setLoginModalOpen(true);
      return;
    }
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    setStatusOverrides((prev) => ({
      ...prev,
      [inc.feederId]: {
        ...prev[inc.feederId],
        status: prev[inc.feederId]?.status ?? inc.status,
        faultCause: cause,
      },
    }));

    pushAudit(adminUser.name, inc.feederId, `Updated root cause for Incident ${inc.label}: ${cause}.`);
  };

  const handleAddMaintenance = (payload: Omit<MaintenanceWindow, 'id' | 'status'>) => {
    if (!adminUser) {
      setLoginModalOpen(true);
      return;
    }
    const newWindow: MaintenanceWindow = {
      ...payload,
      id: `MNT-2026-${Math.floor(10 + Math.random() * 89)}`,
      status: 'Scheduled',
    };
    setMaintenanceWindows((prev) => [newWindow, ...prev]);
    pushAudit(
      adminUser.name,
      payload.feederId,
      `Published planned maintenance shutdown (${payload.date} ${payload.timeWindow}).`
    );
  };

  const handleCompleteMaintenance = (id: string) => {
    if (!adminUser) {
      setLoginModalOpen(true);
      return;
    }
    setMaintenanceWindows((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Completed' } : m))
    );
    pushAudit(adminUser.name, 'MAINT', `Marked planned maintenance ${id} completed.`);
  };

  const handleTriggerSurge = () => {
    const surgeBatch = generateMonsoonSurgeBatch();
    setReports((prev) => [...surgeBatch, ...prev]);
    setSelectedIncidentId('INC-FDR-WFD-19');
    pushSmsAlert(
      'BESCOM Automated Feed',
      'SURGE',
      'FDR-WFD-19',
      `Ingested ${surgeBatch.length} monsoon surge complaints across Whitefield, Jayanagar, Vijayanagar, and Devanahalli.`
    );
    pushAudit('System Simulator', 'MULTI', `Ingested ${surgeBatch.length} monsoon surge complaints.`);
  };

  const handleImportCsvText = (csvText: string) => {
    const imported = parseCsvReports(csvText);
    if (imported.length === 0) return;
    setReports((prev) => [...imported, ...prev]);
    pushSmsAlert(
      'BESCOM CSV Bridge',
      'CSV',
      imported[0].feederId,
      `Imported ${imported.length} outage records via CSV ingestion and re-ran DBSCAN clustering.`
    );
    pushAudit('CSV Bridge', imported[0].feederId, `Ingested ${imported.length} batch reports.`);
  };

  const handleResetDemo = () => {
    setReports(createSeedReports());
    setWeights(DEFAULT_WEIGHTS);
    setStatusOverrides({});
    setSelectedIncidentId('INC-FDR-IND-04');
    setActiveConsumerFeeder('FDR-IND-04');
    setMaintenanceWindows(createSeedMaintenanceWindows());
    setSmsAlerts([
      {
        id: `SMS-RESET-${Date.now()}`,
        timestamp: formatClockNow(),
        recipient: '+91 98450 11000',
        incidentLabel: 'A',
        feederId: 'FDR-IND-04',
        message:
          'Rapid Response #14 dispatched to Indiranagar 100ft Rd (FDR-IND-04). Est. restoration: 45 mins.',
      },
    ]);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-900">
        <Header
          activeView={activeView}
          lang={lang}
          onSelectView={setActiveView}
        />

        <ControlStrip
          lang={lang}
          onChangeLang={setLang}
          adminUser={adminUser}
          onOpenLogin={() => setLoginModalOpen(true)}
          onLogout={handleAdminLogout}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeView === 'operations' && (
                <OperationsView
                  lang={lang}
                  adminUser={adminUser}
                  onRequireAdminLogin={() => setLoginModalOpen(true)}
                  incidents={incidents}
                  reports={reports}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onAssignCrew={handleAssignCrew}
                  onMarkRestored={handleMarkRestored}
                  onEscalateIncident={handleEscalateIncident}
                  onSetFaultCause={handleSetFaultCause}
                  onSimulateDuplicates={handleSimulateDuplicates}
                  onTriggerSurge={handleTriggerSurge}
                  onResetDemo={handleResetDemo}
                  onOpenCitizenPortal={() => setActiveView('citizen')}
                  smsAlerts={smsAlerts}
                  auditLog={auditLog}
                />
              )}

              {activeView === 'citizen' && (
                <CitizenPortalView
                  lang={lang}
                  adminUser={adminUser}
                  onRequireAdminLogin={() => setLoginModalOpen(true)}
                  incidents={incidents}
                  activeConsumerFeeder={activeConsumerFeeder}
                  onSubmitConsumerReport={handleSubmitConsumerReport}
                  onSimulateDuplicates={handleSimulateDuplicates}
                  smsAlerts={smsAlerts}
                  billsByRr={billsByRr}
                  onPayBill={handlePayBill}
                  connectionApps={connectionApps}
                  onSubmitConnectionApp={handleSubmitConnectionApp}
                  onAdvanceConnectionStatus={handleAdvanceConnectionStatus}
                  maintenanceWindows={maintenanceWindows}
                />
              )}

              {activeView === 'crews' && (
                <CrewsFeedersView
                  lang={lang}
                  adminUser={adminUser}
                  onRequireAdminLogin={() => setLoginModalOpen(true)}
                  incidents={incidents}
                  onAssignCrew={handleAssignCrew}
                  onImportCsvText={handleImportCsvText}
                  onJumpToOperations={(id) => {
                    setSelectedIncidentId(id);
                    setActiveView('operations');
                  }}
                  maintenanceWindows={maintenanceWindows}
                  onAddMaintenance={handleAddMaintenance}
                  onCompleteMaintenance={handleCompleteMaintenance}
                />
              )}

              {activeView === 'analytics' && (
                <AnalyticsView
                  lang={lang}
                  weights={weights}
                  onChangeWeights={setWeights}
                  onResetWeights={() => setWeights(DEFAULT_WEIGHTS)}
                  incidents={incidents}
                  reports={reports}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </main>

        <Footer lang={lang} onSelectView={setActiveView} />

        <AdminLoginModal
          isOpen={loginModalOpen}
          lang={lang}
          onClose={() => setLoginModalOpen(false)}
          onLogin={handleAdminLogin}
        />
      </div>
    </MotionConfig>
  );
}

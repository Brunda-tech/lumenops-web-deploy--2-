import type { BescomCircle, IncidentStatus, Language, PriorityLevel } from '../types/lumenops';

export interface TranslationBundle {
  nav: {
    operations: string;
    citizen: string;
    crews: string;
    analytics: string;
  };
  controlBar: {
    coverage: string;
    languageLabel: string;
    adminLogin: string;
    adminSignedIn: string;
    signOut: string;
    adminRequiredBadge: string;
  };
  operations: {
    kicker: string;
    title: string;
    subtitle: string;
    logOutageCta: string;
    simulateSurge: string;
    kpiActiveIncidents: string;
    kpiMergedFrom: string;
    kpiDedupReduction: string;
    kpiDedupSub: string;
    kpiCriticalFeeders: string;
    kpiCriticalSub: string;
    kpiCrewsDeployed: string;
    kpiCrewsSub: string;
    searchPlaceholder: string;
    allCircles: string;
    allPriorities: string;
    allStatuses: string;
    awaitingDispatch: string;
    crewAssigned: string;
    restored: string;
    exportCsv: string;
    reset: string;
    mapTitle: string;
    mapSubtitle: string;
    mapMode3d: string;
    mapMode2d: string;
    rawReportsBtn: string;
    criticalSitesBtn: string;
    priorityQueueTitle: string;
    shownCount: string;
    noMatches: string;
    noMatchesHint: string;
    assignCrew: string;
    reassignCrew: string;
    markRestored: string;
    adminUnlockHint: string;
    awaitingCrewText: string;
    supplyRestoredText: string;
    smsStreamTitle: string;
    smsSent: string;
    inspectorTitle: string;
    priorityScore: string;
    consumersAffected: string;
    outageDuration: string;
    criticalLoadWeight: string;
    dispatchCrewLabel: string;
    etaLabel: string;
    mergedComplaints: string;
  };
  citizen: {
    kicker: string;
    title: string;
    subtitle: string;
    tabOutage: string;
    tabBill: string;
    tabConnection: string;
    submitTitle: string;
    circleFilter: string;
    feederLabel: string;
    outageTypeLabel: string;
    criticalLabel: string;
    rrLabel: string;
    phoneLabel: string;
    channelLabel: string;
    landmarkLabel: string;
    submitBtn: string;
    trackerTitle: string;
    lookupPlaceholder: string;
    estRestoration: string;
    smsTitle: string;
    steps: Array<{ title: string; desc: string }>;
    billing: {
      title: string;
      subtitle: string;
      rrInputLabel: string;
      rrPlaceholder: string;
      fetchBtn: string;
      sampleLabel: string;
      accountHolder: string;
      tariff: string;
      billingCycle: string;
      unitsConsumed: string;
      fixedCharges: string;
      energyCharges: string;
      totalDue: string;
      dueDate: string;
      paymentMethod: string;
      payNowBtn: string;
      paidBadge: string;
      receiptTitle: string;
      txnId: string;
      downloadReceipt: string;
      notFoundError: string;
    };
    newConnection: {
      title: string;
      subtitle: string;
      applicantName: string;
      phone: string;
      email: string;
      circle: string;
      feeder: string;
      address: string;
      pincode: string;
      category: string;
      loadKw: string;
      phase: string;
      proofDoc: string;
      estFeeLabel: string;
      submitAppBtn: string;
      trackerTitle: string;
      advanceStatusBtn: string;
      submittedSuccess: string;
    };
  };
  crews: {
    kicker: string;
    title: string;
    subtitle: string;
    rosterTitle: string;
    feederDirTitle: string;
    csvTitle: string;
    csvSub: string;
    ingestCsvBtn: string;
    uploadCsvBtn: string;
    adminRequiredNotice: string;
    deployed: string;
    standby: string;
    dispatch: string;
    inspect: string;
  };
  analytics: {
    kicker: string;
    title: string;
    subtitle: string;
    tuningTitle: string;
    resetDefaults: string;
    breakdownTitle: string;
    channelTitle: string;
    hotspotsTitle: string;
  };
  auth: {
    modalTitle: string;
    modalSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    loginBtn: string;
    cancelBtn: string;
    fillDemoBtn: string;
    demoHint: string;
    errorInvalid: string;
  };
  statusLabels: Record<IncidentStatus, string>;
  priorityLabels: Record<PriorityLevel, string>;
  circleLabels: Record<BescomCircle, string>;
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    nav: {
      operations: 'Operations',
      citizen: 'Citizen Portal',
      crews: 'Crews & Feeders',
      analytics: 'Analytics',
    },
    controlBar: {
      coverage: '24 BESCOM Feeders · Bengaluru & Regional Circles',
      languageLabel: 'Language',
      adminLogin: 'Admin Login',
      adminSignedIn: 'Admin Session',
      signOut: 'Sign Out',
      adminRequiredBadge: 'Admin auth required to dispatch crews',
    },
    operations: {
      kicker: 'BESCOM Distribution Network · Live Operations Command',
      title: 'Unified Outage Clustering & Crew Dispatch',
      subtitle:
        'Complaints from Helpline 1912, mobile app, web portal, social media, and CSV feeds are clustered across all BESCOM locations and ranked by impact.',
      logOutageCta: 'Log Citizen Outage',
      simulateSurge: 'Simulate Monsoon Surge (+18)',
      kpiActiveIncidents: 'Active Fault Incidents',
      kpiMergedFrom: 'Merged from raw reports',
      kpiDedupReduction: 'Duplicate Reduction',
      kpiDedupSub: 'DBSCAN spatial auto-merge',
      kpiCriticalFeeders: 'Critical Load Feeders',
      kpiCriticalSub: 'Hospitals, water & transit prioritized',
      kpiCrewsDeployed: 'Field Crews Dispatched',
      kpiCrewsSub: 'Rapid response units active',
      searchPlaceholder: 'Search location, feeder ID (FDR-IND-04), or RR number...',
      allCircles: 'All BESCOM Circles',
      allPriorities: 'All Priorities',
      allStatuses: 'All Statuses',
      awaitingDispatch: 'Awaiting Dispatch',
      crewAssigned: 'Crew Assigned',
      restored: 'Restored',
      exportCsv: 'Export CSV Queue',
      reset: 'Reset',
      mapTitle: 'Live Outage Spatial Command (All Locations)',
      mapSubtitle: 'Interactive 3D Digital Twin & OpenStreetMap · Tap any cluster to inspect or dispatch crew',
      mapMode3d: '3D Grid Twin',
      mapMode2d: '2D GIS Map',
      rawReportsBtn: 'Raw Reports',
      criticalSitesBtn: 'Critical Facilities',
      priorityQueueTitle: 'Ranked Priority Queue',
      shownCount: 'shown',
      noMatches: 'No matching outage incidents',
      noMatchesHint: 'Clear your search query or change the circle/priority filters.',
      assignCrew: 'Assign Crew',
      reassignCrew: 'Reassign Crew',
      markRestored: 'Mark Restored',
      adminUnlockHint: 'Admin login required to assign crew',
      awaitingCrewText: 'Awaiting crew assignment',
      supplyRestoredText: 'Supply restored',
      smsStreamTitle: 'SMS Gateway Notification Stream',
      smsSent: 'sent',
      inspectorTitle: 'Incident Inspector',
      priorityScore: 'Priority Score',
      consumersAffected: 'Consumers Affected',
      outageDuration: 'Outage Duration',
      criticalLoadWeight: 'Critical Load Weight',
      dispatchCrewLabel: 'Assign BESCOM Field Crew (Admin)',
      etaLabel: 'Restored ETA',
      mergedComplaints: 'Merged Citizen Complaints',
    },
    citizen: {
      kicker: 'BESCOM Citizen Self-Service Portal',
      title: 'Outage Reporting, Bill Payment & New Connections',
      subtitle:
        'Report power outages across 24 BESCOM locations, pay monthly electricity bills using your RR number, or apply for a new power connection.',
      tabOutage: 'Report & Track Outage',
      tabBill: 'Pay Bill (RR Number)',
      tabConnection: 'New Connection',
      submitTitle: 'Submit Outage Complaint',
      circleFilter: 'BESCOM Circle / Zone',
      feederLabel: 'Location & 11kV Feeder',
      outageTypeLabel: 'Outage Category',
      criticalLabel: 'Nearby Critical Infrastructure',
      rrLabel: 'Consumer RR Number',
      phoneLabel: 'Mobile Number (SMS Updates)',
      channelLabel: 'Intake Channel',
      landmarkLabel: 'Landmark or Observation',
      submitBtn: 'Submit Outage Report',
      trackerTitle: 'Live Restoration Tracker',
      lookupPlaceholder: 'Lookup RR # or Feeder ID...',
      estRestoration: 'Estimated Restoration',
      smsTitle: 'Your SMS & Push Alerts',
      steps: [
        { title: 'Complaint Logged', desc: 'Received with GPS coordinates and feeder mapping.' },
        { title: 'Merged into Fault Cluster', desc: 'Grouped automatically via DBSCAN clustering.' },
        { title: 'Field Crew En Route', desc: 'Dispatched by BESCOM Control Room Admin.' },
        { title: 'Supply Restored', desc: 'Feeder energized and confirmation SMS sent.' },
      ],
      billing: {
        title: 'Pay BESCOM Electricity Bill',
        subtitle: 'Enter your Consumer RR Number to fetch your current bill and pay securely.',
        rrInputLabel: 'Consumer RR Number',
        rrPlaceholder: 'e.g. BLR-E4-71904',
        fetchBtn: 'Fetch Bill',
        sampleLabel: 'Quick test RR numbers:',
        accountHolder: 'Account Holder',
        tariff: 'Tariff Category',
        billingCycle: 'Billing Period',
        unitsConsumed: 'Units Consumed',
        fixedCharges: 'Fixed Charges',
        energyCharges: 'Energy Charges',
        totalDue: 'Total Payable',
        dueDate: 'Due Date',
        paymentMethod: 'Select Payment Method',
        payNowBtn: 'Pay Bill Now',
        paidBadge: 'PAID',
        receiptTitle: 'BESCOM Payment Receipt',
        txnId: 'Transaction ID',
        downloadReceipt: 'Download Receipt (.TXT)',
        notFoundError: 'Enter a valid RR Number (at least 5 characters, e.g. BLR-E4-71904).',
      },
      newConnection: {
        title: 'Apply for New Electricity Connection',
        subtitle: 'Submit a new LT power supply application for residential, commercial, industrial, or EV charging loads.',
        applicantName: 'Applicant / Organization Name',
        phone: 'Mobile Number',
        email: 'Email Address',
        circle: 'BESCOM Circle',
        feeder: 'Nearest Subdivision / Feeder',
        address: 'Installation Premise Address',
        pincode: 'PIN Code',
        category: 'Tariff Category',
        loadKw: 'Sanctioned Load (kW)',
        phase: 'Supply Phase',
        proofDoc: 'Ownership / ID Proof Type',
        estFeeLabel: 'Estimated Registration & Meter Deposit',
        submitAppBtn: 'Submit New Connection Application',
        trackerTitle: 'New Connection Application Tracker',
        advanceStatusBtn: 'Advance Stage (Admin)',
        submittedSuccess: 'Application submitted successfully. Reference ID:',
      },
    },
    crews: {
      kicker: 'Field Operations · All BESCOM Feeders & Legacy CSV Bridge',
      title: 'BESCOM Field Crews, Location Directory & CSV Ingestion',
      subtitle:
        'Only authenticated BESCOM Control Room Admins can dispatch or reassign field crews across the 24 monitored feeders.',
      rosterTitle: 'Rapid Response Crew Roster',
      feederDirTitle: 'All BESCOM Locations & 11kV Feeders',
      csvTitle: 'Legacy Helpline & SCADA CSV Bridge',
      csvSub: 'Drop in CSV exports from call-center tools to merge into the live DBSCAN queue.',
      ingestCsvBtn: 'Ingest CSV Batch into DBSCAN',
      uploadCsvBtn: 'Upload .CSV File',
      adminRequiredNotice: 'Admin login required to dispatch crews from the roster.',
      deployed: 'DEPLOYED',
      standby: 'STANDBY',
      dispatch: 'Dispatch',
      inspect: 'Inspect',
    },
    analytics: {
      kicker: 'DBSCAN Clustering Calibration & Repeat-Outage Hotspots',
      title: 'Intelligence Engine Tuning & Grid Reliability Analytics',
      subtitle:
        'Calibrate spatial clustering radius and priority weights transparently, and spot repeat-outage hotspots across all BESCOM locations.',
      tuningTitle: 'Scoring & DBSCAN Parameters',
      resetDefaults: 'Reset Defaults',
      breakdownTitle: 'Explainable Priority Breakdown',
      channelTitle: 'Multi-Channel Complaint Intake',
      hotspotsTitle: '30-Day Repeat-Outage Feeder Hotspots',
    },
    auth: {
      modalTitle: 'BESCOM Control Room Admin Login',
      modalSubtitle:
        'Sign in with authorized dispatcher credentials to assign crews, update ETAs, and confirm restoration.',
      emailLabel: 'Operator ID / Email',
      passwordLabel: 'Password',
      loginBtn: 'Sign In as Admin',
      cancelBtn: 'Cancel',
      fillDemoBtn: 'Use Demo Admin Credentials',
      demoHint: 'Demo Admin: admin@bescom.gov.in / BESCOM@2026',
      errorInvalid: 'Invalid Operator ID or password. Use demo credentials or verify input.',
    },
    statusLabels: {
      Reported: 'Reported',
      'Crew assigned': 'Crew assigned',
      Restored: 'Restored',
    },
    priorityLabels: {
      HIGH: 'HIGH',
      MEDIUM: 'MEDIUM',
      LOW: 'LOW',
    },
    circleLabels: {
      'Bengaluru East': 'Bengaluru East',
      'Bengaluru South': 'Bengaluru South',
      'Bengaluru North': 'Bengaluru North',
      'Bengaluru West & Central': 'Bengaluru West & Central',
      'Regional Circles': 'Regional Circles',
    },
  },
  kn: {
    nav: {
      operations: 'ಕಾರ್ಯಾಚರಣೆ',
      citizen: 'ನಾಗರಿಕ ಪೋರ್ಟಲ್',
      crews: 'ಸಿಬ್ಬಂದಿ ಮತ್ತು ಫೀಡರ್',
      analytics: 'ವಿಶ್ಲೇಷಣೆ',
    },
    controlBar: {
      coverage: '24 ಬೆಸ್ಕಾಂ ಫೀಡರ್‌ಗಳು · ಬೆಂಗಳೂರು ಮತ್ತು ಪ್ರಾದೇಶಿಕ ವಲಯಗಳು',
      languageLabel: 'ಭಾಷೆ',
      adminLogin: 'ಅಡ್ಮಿನ್ ಲಾಗಿನ್',
      adminSignedIn: 'ಅಡ್ಮಿನ್ ಸಕ್ರಿಯ',
      signOut: 'ಲಾಗ್ ಔಟ್',
      adminRequiredBadge: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲು ಅಡ್ಮಿನ್ ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ',
    },
    operations: {
      kicker: 'ಬೆಸ್ಕಾಂ ವಿತರಣಾ ಜಾಲ · ನೇರ ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ',
      title: 'ಏಕೀಕೃತ ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ ಗುಂಪುಗೂಡಿಸುವಿಕೆ ಮತ್ತು ಸಿಬ್ಬಂದಿ ನಿಯೋಜನೆ',
      subtitle:
        'ಸಹಾಯವಾಣಿ 1912, ಮೊಬೈಲ್ ಆ್ಯಪ್, ವೆಬ್ ಪೋರ್ಟಲ್ ಮತ್ತು ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳ ದೂರುಗಳನ್ನು ಎಲ್ಲಾ ಬೆಸ್ಕಾಂ ಪ್ರದೇಶಗಳಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ವಿಂಗಡಿಸಿ ಆದ್ಯತೆ ನೀಡಲಾಗುತ್ತದೆ.',
      logOutageCta: 'ವ್ಯತ್ಯಯ ದೂರು ದಾಖಲಿಸಿ',
      simulateSurge: 'ಮಾನ್ಸೂನ್ ದೂರು ಪರೀಕ್ಷೆ (+18)',
      kpiActiveIncidents: 'ಸಕ್ರಿಯ ದೋಷ ಘಟನೆಗಳು',
      kpiMergedFrom: 'ಒಟ್ಟು ದೂರುಗಳಿಂದ ವಿಲೀನ',
      kpiDedupReduction: 'ನಕಲಿ ದೂರು ಕಡಿತ',
      kpiDedupSub: 'DBSCAN ಸ್ವಯಂಚಾಲಿತ ವಿಲೀನ',
      kpiCriticalFeeders: 'ತುರ್ತು ಲೋಡ್ ಫೀಡರ್‌ಗಳು',
      kpiCriticalSub: 'ಆಸ್ಪತ್ರೆ, ನೀರು ಮತ್ತು ಮೆಟ್ರೋ ಆದ್ಯತೆ',
      kpiCrewsDeployed: 'ನಿಯೋಜಿತ ತಂಡಗಳು',
      kpiCrewsSub: 'ಕ್ಷೇತ್ರ ತಂಡಗಳು ಕಾರ್ಯನಿರತ',
      searchPlaceholder: 'ಪ್ರದೇಶ, ಫೀಡರ್ ಸಂಖ್ಯೆ (FDR-IND-04), ಅಥವಾ RR ಸಂಖ್ಯೆ ಹುಡುಕಿ...',
      allCircles: 'ಎಲ್ಲಾ ಬೆಸ್ಕಾಂ ವಲಯಗಳು',
      allPriorities: 'ಎಲ್ಲಾ ಆದ್ಯತೆಗಳು',
      allStatuses: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
      awaitingDispatch: 'ನಿಯೋಜನೆಗೆ ಬಾಕಿ',
      crewAssigned: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲಾಗಿದೆ',
      restored: 'ಪುನಃಸ್ಥಾಪಿಸಲಾಗಿದೆ',
      exportCsv: 'CSV ರಫ್ತು ಮಾಡಿ',
      reset: 'ಮರುಹೊಂದಿಸಿ',
      mapTitle: 'ನೇರ ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ 3D ಮತ್ತು ನಕ್ಷೆ ಕೇಂದ್ರ',
      mapSubtitle: '3D ಡಿಜಿಟಲ್ ಟ್ವಿನ್ ಮತ್ತು OpenStreetMap · ಪರಿಶೀಲಿಸಲು ಕ್ಲಸ್ಟರ್ ಒತ್ತಿರಿ',
      mapMode3d: '3D ಗ್ರಿಡ್ ಟ್ವಿನ್',
      mapMode2d: '2D ನಕ್ಷೆ',
      rawReportsBtn: 'ಮೂಲ ದೂರುಗಳು',
      criticalSitesBtn: 'ತುರ್ತು ಕೇಂದ್ರಗಳು',
      priorityQueueTitle: 'ಆದ್ಯತೆಯ ಸರತಿ ಸಾಲು',
      shownCount: 'ತೋರಿಸಲಾಗಿದೆ',
      noMatches: 'ಹೊಂದಾಣಿಕೆಯ ದೋಷ ಘಟನೆಗಳಿಲ್ಲ',
      noMatchesHint: 'ಹುಡುಕಾಟ ಪದ ಅಥವಾ ವಲಯ ಫಿಲ್ಟರ್ ಬದಲಾಯಿಸಿ.',
      assignCrew: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಿ',
      reassignCrew: 'ಸಿಬ್ಬಂದಿ ಬದಲಾಯಿಸಿ',
      markRestored: 'ಪುನಃಸ್ಥಾಪಿತ ಎಂದು ಗುರುತಿಸಿ',
      adminUnlockHint: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲು ಅಡ್ಮಿನ್ ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ',
      awaitingCrewText: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜನೆಗೆ ಕಾಯಲಾಗುತ್ತಿದೆ',
      supplyRestoredText: 'ವಿದ್ಯುತ್ ಪೂರೈಕೆ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ',
      smsStreamTitle: 'SMS ಗೇಟ್‌ವೇ ಸಂದೇಶ ಲಾಗ್',
      smsSent: 'ಕಳುಹಿಸಲಾಗಿದೆ',
      inspectorTitle: 'ಘಟನೆ ಪರಿಶೀಲಕ',
      priorityScore: 'ಆದ್ಯತೆ ಅಂಕ',
      consumersAffected: 'ಬಾಧಿತ ಗ್ರಾಹಕರು',
      outageDuration: 'ವ್ಯತ್ಯಯ ಅವಧಿ',
      criticalLoadWeight: 'ತುರ್ತು ಲೋಡ್ ತೂಕ',
      dispatchCrewLabel: 'ಬೆಸ್ಕಾಂ ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಿ (ಅಡ್ಮಿನ್)',
      etaLabel: 'ಅಂದಾಜು ಪುನಃಸ್ಥಾಪನೆ ಸಮಯ',
      mergedComplaints: 'ವಿಲೀನಗೊಂಡ ನಾಗರಿಕ ದೂರುಗಳು',
    },
    citizen: {
      kicker: 'ಬೆಸ್ಕಾಂ ನಾಗರಿಕ ಸ್ವಯಂ-ಸೇವಾ ಪೋರ್ಟಲ್',
      title: 'ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ, ಬಿಲ್ ಪಾವತಿ ಮತ್ತು ಹೊಸ ಸಂಪರ್ಕ ಸೇವೆಗಳು',
      subtitle:
        '24 ಬೆಸ್ಕಾಂ ಪ್ರದೇಶಗಳಲ್ಲಿ ವ್ಯತ್ಯಯ ವರದಿ ಮಾಡಿ, ನಿಮ್ಮ RR ಸಂಖ್ಯೆಯ ಮೂಲಕ ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿಸಿ ಅಥವಾ ಹೊಸ ಸಂಪರ್ಕಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      tabOutage: 'ವ್ಯತ್ಯಯ ವರದಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್',
      tabBill: 'ಬಿಲ್ ಪಾವತಿ (RR ಸಂಖ್ಯೆ)',
      tabConnection: 'ಹೊಸ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ',
      submitTitle: 'ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ ದೂರು ಸಲ್ಲಿಸಿ',
      circleFilter: 'ಬೆಸ್ಕಾಂ ವಲಯ',
      feederLabel: 'ಪ್ರದೇಶ ಮತ್ತು 11kV ಫೀಡರ್',
      outageTypeLabel: 'ದೋಷದ ವಿಧ',
      criticalLabel: 'ಸಮೀಪದ ತುರ್ತು ಸೌಲಭ್ಯ',
      rrLabel: 'ಗ್ರಾಹಕ RR ಸಂಖ್ಯೆ',
      phoneLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (SMS ಮಾಹಿತಿಗಾಗಿ)',
      channelLabel: 'ದೂರು ಮಾಧ್ಯಮ',
      landmarkLabel: 'ಹೆಗ್ಗುರುತು ಅಥವಾ ವಿವರಣೆ',
      submitBtn: 'ದೂರು ಸಲ್ಲಿಸಿ',
      trackerTitle: 'ನೇರ ಪುನಃಸ್ಥಾಪನೆ ಟ್ರ್ಯಾಕರ್',
      lookupPlaceholder: 'RR ಸಂಖ್ಯೆ ಅಥವಾ ಫೀಡರ್ ಹುಡುಕಿ...',
      estRestoration: 'ಅಂದಾಜು ಪುನಃಸ್ಥಾಪನೆ',
      smsTitle: 'ನಿಮ್ಮ SMS ಎಚ್ಚರಿಕೆಗಳು',
      steps: [
        { title: 'ದೂರು ದಾಖಲಾಗಿದೆ', desc: 'GPS ಸ್ಥಳ ಮತ್ತು ಫೀಡರ್ ಮಾಹಿತಿಯೊಂದಿಗೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.' },
        { title: 'ದೋಷ ಗುಂಪಿಗೆ ವಿಲೀನ', desc: 'DBSCAN ಮೂಲಕ ಸಮೀಪದ ದೂರುಗಳೊಂದಿಗೆ ಸೇರಿಸಲಾಗಿದೆ.' },
        { title: 'ಸಿಬ್ಬಂದಿ ಸ್ಥಳಕ್ಕೆ ಹೊರಟಿದ್ದಾರೆ', desc: 'ಬೆಸ್ಕಾಂ ನಿಯಂತ್ರಣ ಕೊಠಡಿ ಅಡ್ಮಿನ್ ನಿಯೋಜಿಸಿದ್ದಾರೆ.' },
        { title: 'ವಿದ್ಯುತ್ ಪುನಃಸ್ಥಾಪಿಸಲಾಗಿದೆ', desc: 'ವಿದ್ಯುತ್ ಪೂರೈಕೆ ಪುನರಾರಂಭಗೊಂಡು SMS ಕಳುಹಿಸಲಾಗಿದೆ.' },
      ],
      billing: {
        title: 'ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿ',
        subtitle: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಬಿಲ್ ಪಡೆಯಲು ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ಪಾವತಿಸಲು ಗ್ರಾಹಕ RR ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.',
        rrInputLabel: 'ಗ್ರಾಹಕ RR ಸಂಖ್ಯೆ',
        rrPlaceholder: 'ಉದಾ: BLR-E4-71904',
        fetchBtn: 'ಬಿಲ್ ಪಡೆಯಿರಿ',
        sampleLabel: 'ತ್ವರಿತ ಪರೀಕ್ಷಾ RR ಸಂಖ್ಯೆಗಳು:',
        accountHolder: 'ಖಾತೆದಾರರ ಹೆಸರು',
        tariff: 'ದರ ವರ್ಗ',
        billingCycle: 'ಬಿಲ್ಲಿಂಗ್ ಅವಧಿ',
        unitsConsumed: 'ಬಳಸಿದ ಯೂನಿಟ್‌ಗಳು',
        fixedCharges: 'ಸ್ಥಿರ ಶುಲ್ಕ',
        energyCharges: 'ವಿದ್ಯುತ್ ಶುಲ್ಕ',
        totalDue: 'ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ',
        dueDate: 'ಕೊನೆಯ ದಿನಾಂಕ',
        paymentMethod: 'ಪಾವತಿ ವಿಧಾನ ಆಯ್ಕೆಮಾಡಿ',
        payNowBtn: 'ಈಗಲೇ ಬಿಲ್ ಪಾವತಿಸಿ',
        paidBadge: 'ಪಾವತಿಸಲಾಗಿದೆ (PAID)',
        receiptTitle: 'ಬೆಸ್ಕಾಂ ಪಾವತಿ ರಸೀದಿ',
        txnId: 'ವಹಿವಾಟು ಸಂಖ್ಯೆ',
        downloadReceipt: 'ರಸೀದಿ ಡೌನ್‌ಲೋಡ್ (.TXT)',
        notFoundError: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ RR ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 5 ಅಕ್ಷರಗಳು, ಉದಾ: BLR-E4-71904).',
      },
      newConnection: {
        title: 'ಹೊಸ ವಿದ್ಯುತ್ ಸಂಪರ್ಕಕ್ಕೆ ಅರ್ಜಿ',
        subtitle: 'ಗೃಹ, ವಾಣಿಜ್ಯ, ಕೈಗಾರಿಕಾ ಅಥವಾ EV ಚಾರ್ಜಿಂಗ್ ಸಂಪರ್ಕಕ್ಕಾಗಿ ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
        applicantName: 'ಅರ್ಜಿದಾರರ / ಸಂಸ್ಥೆಯ ಹೆಸರು',
        phone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
        email: 'ಇಮೇಲ್ ವಿಳಾಸ',
        circle: 'ಬೆಸ್ಕಾಂ ವಲಯ',
        feeder: 'ಸಮೀಪದ ಉಪವಿಭಾಗ / ಫೀಡರ್',
        address: 'ಸಂಪರ್ಕ ಬೇಕಾಗಿರುವ ವಿಳಾಸ',
        pincode: 'ಪಿನ್ ಕೋಡ್',
        category: 'ಸಂಪರ್ಕದ ವರ್ಗ',
        loadKw: 'ಅಗತ್ಯವಿರುವ ಲೋಡ್ (kW)',
        phase: 'ವಿದ್ಯುತ್ ಫೇಸ್',
        proofDoc: 'ಮಾಲೀಕತ್ವ / ಗುರುತಿನ ದಾಖಲೆ',
        estFeeLabel: 'ಅಂದಾಜು ನೋಂದಣಿ ಮತ್ತು ಮೀಟರ್ ಠೇವಣಿ',
        submitAppBtn: 'ಹೊಸ ಸಂಪರ್ಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
        trackerTitle: 'ಹೊಸ ಸಂಪರ್ಕ ಅರ್ಜಿ ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕರ್',
        advanceStatusBtn: 'ಹಂತ ಮುಂದುವರಿಸಿ (ಅಡ್ಮಿನ್)',
        submittedSuccess: 'ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ:',
      },
    },
    crews: {
      kicker: 'ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ · ಎಲ್ಲಾ ಬೆಸ್ಕಾಂ ಫೀಡರ್‌ಗಳು ಮತ್ತು CSV ಸೇತುವೆ',
      title: 'ಬೆಸ್ಕಾಂ ಕ್ಷೇತ್ರ ಸಿಬ್ಬಂದಿ, ಪ್ರದೇಶ ಪಟ್ಟಿ ಮತ್ತು CSV ಸೇರ್ಪಡೆ',
      subtitle:
        '24 ಫೀಡರ್‌ಗಳಾದ್ಯಂತ ಕ್ಷೇತ್ರ ಸಿಬ್ಬಂದಿಯನ್ನು ನಿಯೋಜಿಸಲು ಅಧಿಕೃತ ಬೆಸ್ಕಾಂ ಅಡ್ಮಿನ್ ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ.',
      rosterTitle: 'ತ್ವರಿತ ಸ್ಪಂದನೆ ಸಿಬ್ಬಂದಿ ಪಟ್ಟಿ',
      feederDirTitle: 'ಎಲ್ಲಾ ಬೆಸ್ಕಾಂ ಪ್ರದೇಶಗಳು ಮತ್ತು 11kV ಫೀಡರ್‌ಗಳು',
      csvTitle: 'ಸಹಾಯವಾಣಿ ಮತ್ತು SCADA CSV ಸೇತುವೆ',
      csvSub: 'ಹಳೆಯ ವ್ಯವಸ್ಥೆಗಳಿಂದ CSV ದತ್ತಾಂಶವನ್ನು DBSCAN ಸರತಿಗೆ ಸೇರಿಸಿ.',
      ingestCsvBtn: 'CSV ದತ್ತಾಂಶವನ್ನು DBSCAN ಗೆ ಸೇರಿಸಿ',
      uploadCsvBtn: '.CSV ಫೈಲ್ ಅಪ್‌ಲೋಡ್',
      adminRequiredNotice: 'ಪಟ್ಟಿಯಿಂದ ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲು ಅಡ್ಮಿನ್ ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ.',
      deployed: 'ನಿಯೋಜಿತ',
      standby: 'ಸಿದ್ಧವಾಗಿದೆ',
      dispatch: 'ನಿಯೋಜಿಸಿ',
      inspect: 'ಪರಿಶೀಲಿಸಿ',
    },
    analytics: {
      kicker: 'DBSCAN ಮಾಪನಾಂಕ ನಿರ್ಣಯ ಮತ್ತು ಮರುಕಳಿಸುವ ದೋಷ ಪ್ರದೇಶಗಳು',
      title: 'ಬುದ್ಧಿವಂತ ಎಂಜಿನ್ ಮತ್ತು ಗ್ರಿಡ್ ವಿಶ್ವಾಸಾರ್ಹತೆ ವಿಶ್ಲೇಷಣೆ',
      subtitle:
        'ಆದ್ಯತೆಯ ತೂಕಗಳು ಮತ್ತು DBSCAN ವ್ಯಾಪ್ತಿಯನ್ನು ಸರಿಹೊಂದಿಸಿ, ಪದೇ ಪದೇ ವ್ಯತ್ಯಯವಾಗುವ ಫೀಡರ್‌ಗಳನ್ನು ಗುರುತಿಸಿ.',
      tuningTitle: 'ಅಂಕ ಮತ್ತು DBSCAN ನಿಯತಾಂಕಗಳು',
      resetDefaults: 'ಡೀಫಾಲ್ಟ್ ಮರುಹೊಂದಿಸಿ',
      breakdownTitle: 'ವಿವರಣಾತ್ಮಕ ಆದ್ಯತೆ ಪಟ್ಟಿ',
      channelTitle: 'ಬಹು-ಮಾಧ್ಯಮ ದೂರು ಹಂಚಿಕೆ',
      hotspotsTitle: '30 ದಿನಗಳ ಮರುಕಳಿಸುವ ವ್ಯತ್ಯಯ ಫೀಡರ್‌ಗಳು',
    },
    auth: {
      modalTitle: 'ಬೆಸ್ಕಾಂ ನಿಯಂತ್ರಣ ಕೊಠಡಿ ಅಡ್ಮಿನ್ ಲಾಗಿನ್',
      modalSubtitle:
        'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲು, ಸಮಯ ನಿಗದಿಪಡಿಸಲು ಮತ್ತು ವಿದ್ಯುತ್ ಪುನಃಸ್ಥಾಪನೆ ದೃಢೀಕರಿಸಲು ಅಡ್ಮಿನ್ ಖಾತೆಗೆ ಲಾಗಿನ್ ಆಗಿ.',
      emailLabel: 'ಅಧಿಕಾರಿ ಐಡಿ / ಇಮೇಲ್',
      passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
      loginBtn: 'ಅಡ್ಮಿನ್ ಆಗಿ ಲಾಗಿನ್ ಆಗಿ',
      cancelBtn: 'ರದ್ದುಮಾಡಿ',
      fillDemoBtn: 'ಡೆಮೋ ಅಡ್ಮಿನ್ ವಿವರ ಭರ್ತಿ ಮಾಡಿ',
      demoHint: 'ಡೆಮೋ ಅಡ್ಮಿನ್: admin@bescom.gov.in / BESCOM@2026',
      errorInvalid: 'ತಪ್ಪಾದ ಅಧಿಕಾರಿ ಐಡಿ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.',
    },
    statusLabels: {
      Reported: 'ವರದಿಯಾಗಿದೆ',
      'Crew assigned': 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲಾಗಿದೆ',
      Restored: 'ಪುನಃಸ್ಥಾಪಿಸಲಾಗಿದೆ',
    },
    priorityLabels: {
      HIGH: 'ತೀವ್ರ (HIGH)',
      MEDIUM: 'ಮಧ್ಯಮ (MEDIUM)',
      LOW: 'ಕಡಿಮೆ (LOW)',
    },
    circleLabels: {
      'Bengaluru East': 'ಬೆಂಗಳೂರು ಪೂರ್ವ',
      'Bengaluru South': 'ಬೆಂಗಳೂರು ದಕ್ಷಿಣ',
      'Bengaluru North': 'ಬೆಂಗಳೂರು ಉತ್ತರ',
      'Bengaluru West & Central': 'ಬೆಂಗಳೂರು ಪಶ್ಚಿಮ ಮತ್ತು ಕೇಂದ್ರ',
      'Regional Circles': 'ಪ್ರಾದೇಶಿಕ ವಲಯಗಳು',
    },
  },
};

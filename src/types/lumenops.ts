export type Language = 'en' | 'kn';

export type WorkspaceView = 'operations' | 'citizen' | 'crews' | 'analytics';

export type CitizenServiceTab = 'outage' | 'bill' | 'connection';

export type BescomCircle =
  | 'Bengaluru East'
  | 'Bengaluru South'
  | 'Bengaluru North'
  | 'Bengaluru West & Central'
  | 'Regional Circles';

export type ReportChannel = 'Mobile App' | 'Helpline 1912' | 'Social Media' | 'Web Portal' | 'CSV Import';

export type OutageType =
  | 'Complete Blackout'
  | 'Voltage Fluctuation'
  | 'Transformer Fault'
  | 'Line / Pole Damage';

export type CriticalLoadType = 'None' | 'Hospital nearby' | 'Water pumping' | 'Public transit';

export type IncidentStatus = 'Reported' | 'Crew assigned' | 'Restored';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type FaultCause =
  | 'Under Investigation'
  | 'DTR Fuse Blown'
  | '11kV Cable Fault'
  | 'Tree Branch on Line'
  | 'RMU Breaker Trip'
  | 'Substation Overload';

export type SlaStatus = 'Within SLA' | 'SLA Breached';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  division: string;
}

export interface OutageReport {
  id: string;
  rrNumber: string;
  consumerName: string;
  phone: string;
  area: string;
  feederId: string;
  lat: number;
  lng: number;
  channel: ReportChannel;
  outageType: OutageType;
  reportedAtMinutesAgo: number;
  criticalLoad: CriticalLoadType;
  description: string;
}

export interface PriorityWeights {
  w1Consumers: number;
  w2Duration: number;
  w3CriticalLoad: number;
  epsMeters: number;
  minPts: number;
}

export interface IncidentScoreBreakdown {
  consumerPoints: number;
  durationPoints: number;
  criticalLoadPoints: number;
  totalScore: number;
}

export interface FaultIncident {
  id: string;
  label: string;
  area: string;
  feederId: string;
  circle: BescomCircle;
  lat: number;
  lng: number;
  radiusMeters: number;
  reports: OutageReport[];
  reportCount: number;
  durationMinutes: number;
  criticalLoad: CriticalLoadType;
  priority: PriorityLevel;
  score: IncidentScoreBreakdown;
  status: IncidentStatus;
  assignedCrewId?: string;
  assignedCrewName?: string;
  estimatedRestoration?: string;
  dominantOutageType: OutageType;
  slaTargetMinutes: number;
  slaStatus: SlaStatus;
  escalatedToEe: boolean;
  faultCause: FaultCause;
}

export interface SmsAlert {
  id: string;
  timestamp: string;
  recipient: string;
  incidentLabel: string;
  feederId: string;
  message: string;
}

export interface CrewUnit {
  id: string;
  name: string;
  division: string;
  circle: BescomCircle;
  specialty: string;
  vehicle: string;
  leadEngineer: string;
  phone: string;
}

export interface FeederMetadata {
  feederId: string;
  area: string;
  areaKn: string;
  circle: BescomCircle;
  substation: string;
  voltage: string;
  connectedConsumers: number;
  outagesLast30Days: number;
  lat: number;
  lng: number;
  defaultCriticalLoad: CriticalLoadType;
  criticalAssetName?: string;
}

export interface CriticalSite {
  id: string;
  name: string;
  type: CriticalLoadType;
  feederId: string;
  lat: number;
  lng: number;
}

export type PaymentMethod = 'UPI' | 'Net Banking' | 'Debit / Credit Card';

export interface BillRecord {
  rrNumber: string;
  consumerName: string;
  feederId: string;
  area: string;
  tariff: string;
  billingCycle: string;
  unitsConsumedKwh: number;
  fixedCharges: number;
  energyCharges: number;
  arrears: number;
  totalAmount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
  transactionId?: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
}

export type ConnectionCategory =
  | 'LT-2(a) Domestic'
  | 'LT-3 Commercial'
  | 'LT-5 Industrial'
  | 'EV Charging Point';

export type ConnectionStatus = 'Submitted' | 'Field Inspection' | 'Meter Sanctioned';

export interface NewConnectionApplication {
  applicationId: string;
  applicantName: string;
  phone: string;
  email: string;
  circle: BescomCircle;
  feederId: string;
  area: string;
  address: string;
  pincode: string;
  category: ConnectionCategory;
  loadKw: number;
  phase: 'Single Phase' | 'Three Phase';
  proofDocument: string;
  estimatedFee: number;
  status: ConnectionStatus;
  submittedAt: string;
}

export interface MaintenanceWindow {
  id: string;
  feederId: string;
  area: string;
  date: string;
  timeWindow: string;
  reason: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  feederId: string;
}

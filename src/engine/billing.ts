import type { BillRecord, ConnectionCategory, NewConnectionApplication } from '../types/lumenops';
import { BESCOM_FEEDERS } from './dbscan';

export const SAMPLE_BILL_RECORDS: BillRecord[] = [
  {
    rrNumber: 'BLR-E4-71904',
    consumerName: 'Ananya Deshpande',
    feederId: 'FDR-IND-04',
    area: 'Indiranagar 100ft Rd',
    tariff: 'LT-2(a) Domestic',
    billingCycle: 'Oct 2026 – Nov 2026',
    unitsConsumedKwh: 218,
    fixedCharges: 230,
    energyCharges: 1412,
    arrears: 0,
    totalAmount: 1642,
    dueDate: '25 Nov 2026',
    status: 'Unpaid',
  },
  {
    rrNumber: 'BLR-S2-82001',
    consumerName: 'Karthik Gowda',
    feederId: 'FDR-KRM-12',
    area: 'Koramangala 4th Block',
    tariff: 'LT-3 Commercial',
    billingCycle: 'Oct 2026 – Nov 2026',
    unitsConsumedKwh: 540,
    fixedCharges: 680,
    energyCharges: 4590,
    arrears: 0,
    totalAmount: 5270,
    dueDate: '24 Nov 2026',
    status: 'Unpaid',
  },
  {
    rrNumber: 'BLR-N1-93002',
    consumerName: 'Meenakshi Sundaram',
    feederId: 'FDR-MLM-07',
    area: 'Malleswaram 8th Cross',
    tariff: 'LT-2(a) Domestic',
    billingCycle: 'Oct 2026 – Nov 2026',
    unitsConsumedKwh: 145,
    fixedCharges: 185,
    energyCharges: 890,
    arrears: 0,
    totalAmount: 1075,
    dueDate: '26 Nov 2026',
    status: 'Unpaid',
  },
  {
    rrNumber: 'BLR-N4-96001',
    consumerName: 'Precision CNC Works',
    feederId: 'FDR-PNY-22',
    area: 'Peenya Industrial Stage 2',
    tariff: 'LT-5 Industrial',
    billingCycle: 'Oct 2026 – Nov 2026',
    unitsConsumedKwh: 1820,
    fixedCharges: 1450,
    energyCharges: 13650,
    arrears: 0,
    totalAmount: 15100,
    dueDate: '22 Nov 2026',
    status: 'Unpaid',
  },
];

// Deterministic bill lookup so any valid BESCOM RR Number entered by the user works immediately
export function lookupBillByRrNumber(
  rrInput: string,
  existingBills: Record<string, BillRecord>
): BillRecord | null {
  const normalized = rrInput.trim().toUpperCase();
  if (normalized.length < 5) return null;

  if (existingBills[normalized]) {
    return existingBills[normalized];
  }

  const preset = SAMPLE_BILL_RECORDS.find((b) => b.rrNumber === normalized);
  if (preset) return preset;

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) % 100000;
  }

  const feeder = BESCOM_FEEDERS[hash % BESCOM_FEEDERS.length];
  const units = 95 + (hash % 360);
  const fixedCharges = 185 + (hash % 3) * 65;
  const energyCharges = Math.round(units * 6.4);

  return {
    rrNumber: normalized,
    consumerName: `BESCOM Account Holder (${normalized.slice(-4)})`,
    feederId: feeder.feederId,
    area: feeder.area,
    tariff: units > 320 ? 'LT-3 Commercial' : 'LT-2(a) Domestic',
    billingCycle: 'Oct 2026 – Nov 2026',
    unitsConsumedKwh: units,
    fixedCharges,
    energyCharges,
    arrears: 0,
    totalAmount: fixedCharges + energyCharges,
    dueDate: '26 Nov 2026',
    status: 'Unpaid',
  };
}

export function estimateNewConnectionFee(
  category: ConnectionCategory,
  loadKw: number,
  phase: 'Single Phase' | 'Three Phase'
): number {
  const baseRegistration = 500;
  const meterCost = phase === 'Three Phase' ? 2800 : 1200;
  const ratePerKw =
    category === 'LT-5 Industrial'
      ? 1850
      : category === 'LT-3 Commercial'
        ? 1500
        : category === 'EV Charging Point'
          ? 1200
          : 950;
  return baseRegistration + meterCost + loadKw * ratePerKw;
}

export function createInitialConnectionApps(): NewConnectionApplication[] {
  return [
    {
      applicationId: 'BESCOM-NC-2026-4108',
      applicantName: 'Suresh Babu N',
      phone: '+91 98451 60211',
      email: 'suresh.babu@example.in',
      circle: 'Bengaluru East',
      feederId: 'FDR-WFD-19',
      area: 'Whitefield ITPL Main',
      address: '#42, 2nd Cross, Hoodi Main Road',
      pincode: '560048',
      category: 'LT-2(a) Domestic',
      loadKw: 3,
      phase: 'Single Phase',
      proofDocument: 'BBMP Khata & Sale Deed',
      estimatedFee: 4550,
      status: 'Field Inspection',
      submittedAt: '14 Nov 2026',
    },
    {
      applicationId: 'BESCOM-NC-2026-4119',
      applicantName: 'GreenVolt Mobility Hub',
      phone: '+91 99001 88412',
      email: 'ops@greenvolt.in',
      circle: 'Bengaluru South',
      feederId: 'FDR-HSR-15',
      area: 'HSR Layout Sector 2',
      address: 'Plot 19, 27th Main, HSR Sector 2',
      pincode: '560102',
      category: 'EV Charging Point',
      loadKw: 15,
      phase: 'Three Phase',
      proofDocument: 'Commercial Lease + Trade License',
      estimatedFee: 21300,
      status: 'Submitted',
      submittedAt: '16 Nov 2026',
    },
  ];
}

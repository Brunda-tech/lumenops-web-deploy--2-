import type {
  BescomCircle,
  CrewUnit,
  CriticalLoadType,
  CriticalSite,
  FaultIncident,
  FeederMetadata,
  IncidentStatus,
  OutageReport,
  OutageType,
  PriorityLevel,
  PriorityWeights,
  ReportChannel,
} from '../types/lumenops';

export const DEFAULT_WEIGHTS: PriorityWeights = {
  w1Consumers: 1.5,
  w2Duration: 0.4,
  w3CriticalLoad: 45,
  epsMeters: 900,
  minPts: 2,
};

export const ALL_CIRCLES: BescomCircle[] = [
  'Bengaluru East',
  'Bengaluru South',
  'Bengaluru North',
  'Bengaluru West & Central',
  'Regional Circles',
];

export const BESCOM_FEEDERS: FeederMetadata[] = [
  // Bengaluru East
  {
    feederId: 'FDR-IND-04',
    area: 'Indiranagar 100ft Rd',
    areaKn: 'ಇಂದಿರಾನಗರ 100 ಅಡಿ ರಸ್ತೆ',
    circle: 'Bengaluru East',
    substation: 'HAL 66/11kV MUSS',
    voltage: '11 kV',
    connectedConsumers: 3420,
    outagesLast30Days: 14,
    lat: 12.9784,
    lng: 77.6408,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'Manipal & CMH Medical Corridor',
  },
  {
    feederId: 'FDR-WFD-19',
    area: 'Whitefield ITPL Main',
    areaKn: 'ವೈಟ್‌ಫೀಲ್ಡ್ ITPL ಮುಖ್ಯ ರಸ್ತೆ',
    circle: 'Bengaluru East',
    substation: 'EPIP 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 4650,
    outagesLast30Days: 17,
    lat: 12.9855,
    lng: 77.7362,
    defaultCriticalLoad: 'Water pumping',
    criticalAssetName: 'BWSSB Hoodi Water Pumping Station',
  },
  {
    feederId: 'FDR-MTH-02',
    area: 'Marathahalli Bridge',
    areaKn: 'ಮಾರತ್ತಹಳ್ಳಿ ಸೇತುವೆ',
    circle: 'Bengaluru East',
    substation: 'Bellandur 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 3980,
    outagesLast30Days: 12,
    lat: 12.9591,
    lng: 77.6974,
    defaultCriticalLoad: 'None',
    criticalAssetName: 'Outer Ring Road Corridor',
  },
  {
    feederId: 'FDR-KRP-11',
    area: 'KR Puram Tin Factory',
    areaKn: 'ಕೆ.ಆರ್. ಪುರಂ ಟಿನ್ ಫ್ಯಾಕ್ಟರಿ',
    circle: 'Bengaluru East',
    substation: 'KR Puram 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 3610,
    outagesLast30Days: 13,
    lat: 13.0012,
    lng: 77.6749,
    defaultCriticalLoad: 'Public transit',
    criticalAssetName: 'KR Puram Metro & Rail Hub',
  },
  {
    feederId: 'FDR-HBL-06',
    area: 'Hebbal & Nagavara',
    areaKn: 'ಹೆಬ್ಬಾಳ ಮತ್ತು ನಾಗವಾರ',
    circle: 'Bengaluru East',
    substation: 'Hebbal 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 3250,
    outagesLast30Days: 8,
    lat: 13.0358,
    lng: 77.597,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'Baptist & Aster CMI Hospital Link',
  },

  // Bengaluru South
  {
    feederId: 'FDR-KRM-12',
    area: 'Koramangala 4th Block',
    areaKn: 'ಕೋರಮಂಗಲ 4ನೇ ಬ್ಲಾಕ್',
    circle: 'Bengaluru South',
    substation: 'Koramangala 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 2890,
    outagesLast30Days: 9,
    lat: 12.9352,
    lng: 77.6245,
    defaultCriticalLoad: 'None',
    criticalAssetName: 'St. John’s Junction Tie',
  },
  {
    feederId: 'FDR-JYN-09',
    area: 'Jayanagar 3rd Block',
    areaKn: 'ಜಯನಗರ 3ನೇ ಬ್ಲಾಕ್',
    circle: 'Bengaluru South',
    substation: 'Jayanagar 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 3110,
    outagesLast30Days: 7,
    lat: 12.9298,
    lng: 77.5838,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'Jayanagar General & Jayadeva Link',
  },
  {
    feederId: 'FDR-HSR-15',
    area: 'HSR Layout Sector 2',
    areaKn: 'ಎಚ್.ಎಸ್.ಆರ್. ಲೇಔಟ್ ಸೆಕ್ಟರ್ 2',
    circle: 'Bengaluru South',
    substation: 'HSR 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 4120,
    outagesLast30Days: 10,
    lat: 12.9116,
    lng: 77.6389,
    defaultCriticalLoad: 'Water pumping',
    criticalAssetName: 'Agara BWSSB Booster Station',
  },
  {
    feederId: 'FDR-BTM-08',
    area: 'BTM Layout 2nd Stage',
    areaKn: 'ಬಿ.ಟಿ.ಎಂ. ಲೇಔಟ್ 2ನೇ ಹಂತ',
    circle: 'Bengaluru South',
    substation: 'BTM 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 3540,
    outagesLast30Days: 8,
    lat: 12.9166,
    lng: 77.6101,
    defaultCriticalLoad: 'None',
    criticalAssetName: 'Udupi Garden Distribution Ring',
  },
  {
    feederId: 'FDR-BSK-14',
    area: 'Banashankari 2nd Stage',
    areaKn: 'ಬನಶಂಕರಿ 2ನೇ ಹಂತ',
    circle: 'Bengaluru South',
    substation: 'BSK 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 3320,
    outagesLast30Days: 6,
    lat: 12.9255,
    lng: 77.5648,
    defaultCriticalLoad: 'Public transit',
    criticalAssetName: 'Banashankari TTMC & Metro Station',
  },
  {
    feederId: 'FDR-ELC-08',
    area: 'Electronic City Phase 1',
    areaKn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ಹಂತ 1',
    circle: 'Bengaluru South',
    substation: 'E-City 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 5210,
    outagesLast30Days: 11,
    lat: 12.8452,
    lng: 77.6602,
    defaultCriticalLoad: 'Water pumping',
    criticalAssetName: 'E-City Industrial & Cauvery Booster',
  },

  // Bengaluru North
  {
    feederId: 'FDR-MLM-07',
    area: 'Malleswaram 8th Cross',
    areaKn: 'ಮಲ್ಲೇಶ್ವರಂ 8ನೇ ಕ್ರಾಸ್',
    circle: 'Bengaluru North',
    substation: 'Malleswaram 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 2150,
    outagesLast30Days: 5,
    lat: 13.0035,
    lng: 77.5643,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'KC General Hospital Feeder',
  },
  {
    feederId: 'FDR-YLK-03',
    area: 'Yelahanka New Town',
    areaKn: 'ಯಲಹಂಕ ನ್ಯೂ ಟೌನ್',
    circle: 'Bengaluru North',
    substation: 'Yelahanka 220kV',
    voltage: '11 kV',
    connectedConsumers: 2740,
    outagesLast30Days: 11,
    lat: 13.1007,
    lng: 77.5963,
    defaultCriticalLoad: 'Public transit',
    criticalAssetName: 'Yelahanka Rail & Bus Terminal',
  },
  {
    feederId: 'FDR-PNY-22',
    area: 'Peenya Industrial Stage 2',
    areaKn: 'ಪೀಣ್ಯ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ 2ನೇ ಹಂತ',
    circle: 'Bengaluru North',
    substation: 'Peenya 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 3890,
    outagesLast30Days: 15,
    lat: 13.0285,
    lng: 77.5197,
    defaultCriticalLoad: 'Water pumping',
    criticalAssetName: 'Peenya Industrial Effluent & Water Grid',
  },
  {
    feederId: 'FDR-RJN-10',
    area: 'Rajajinagar 1st Block',
    areaKn: 'ರಾಜಾಜಿನಗರ 1ನೇ ಬ್ಲಾಕ್',
    circle: 'Bengaluru North',
    substation: 'Rajajinagar 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 2940,
    outagesLast30Days: 4,
    lat: 12.9982,
    lng: 77.553,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'ESI & Suguna Hospital Corridor',
  },

  // Bengaluru West & Central
  {
    feederId: 'FDR-VJN-16',
    area: 'Vijayanagar Chord Road',
    areaKn: 'ವಿಜಯನಗರ ಕಾರ್ಡ್ ರಸ್ತೆ',
    circle: 'Bengaluru West & Central',
    substation: 'Vijayanagar 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 3180,
    outagesLast30Days: 7,
    lat: 12.9719,
    lng: 77.533,
    defaultCriticalLoad: 'Public transit',
    criticalAssetName: 'Vijayanagar Metro Traction Bus',
  },
  {
    feederId: 'FDR-KNG-13',
    area: 'Kengeri Satellite Town',
    areaKn: 'ಕೆಂಗೇರಿ ಉಪನಗರ',
    circle: 'Bengaluru West & Central',
    substation: 'Kengeri 66/11kV',
    voltage: '11 kV',
    connectedConsumers: 2630,
    outagesLast30Days: 9,
    lat: 12.9077,
    lng: 77.485,
    defaultCriticalLoad: 'None',
    criticalAssetName: 'Mysore Road Terminal Zone',
  },
  {
    feederId: 'FDR-SHV-01',
    area: 'Shivajinagar & MG Road',
    areaKn: 'ಶಿವಾಜಿನಗರ ಮತ್ತು ಎಂ.ಜಿ. ರಸ್ತೆ',
    circle: 'Bengaluru West & Central',
    substation: 'Vidhana Soudha UG 66kV',
    voltage: '11 kV',
    connectedConsumers: 2490,
    outagesLast30Days: 3,
    lat: 12.9789,
    lng: 77.6046,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'Bowring & Lady Curzon Hospital',
  },
  {
    feederId: 'FDR-MJC-05',
    area: 'Majestic & Chickpet',
    areaKn: 'ಮೆಜೆಸ್ಟಿಕ್ ಮತ್ತು ಚಿಕ್ಕಪೇಟೆ',
    circle: 'Bengaluru West & Central',
    substation: 'Kempegowda UG 66kV',
    voltage: '11 kV',
    connectedConsumers: 2810,
    outagesLast30Days: 4,
    lat: 12.9756,
    lng: 77.5724,
    defaultCriticalLoad: 'Public transit',
    criticalAssetName: 'Majestic Metro Interchange & City Railway',
  },

  // Regional BESCOM Circles
  {
    feederId: 'FDR-DEV-02',
    area: 'Devanahalli Town',
    areaKn: 'ದೇವನಹಳ್ಳಿ ಪಟ್ಟಣ',
    circle: 'Regional Circles',
    substation: 'Devanahalli 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 2180,
    outagesLast30Days: 8,
    lat: 13.2473,
    lng: 77.7131,
    defaultCriticalLoad: 'Public transit',
    criticalAssetName: 'KIA Airport Access Corridor',
  },
  {
    feederId: 'FDR-HSK-04',
    area: 'Hoskote Industrial',
    areaKn: 'ಹೊಸಕೋಟೆ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ',
    circle: 'Regional Circles',
    substation: 'Hoskote 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 2420,
    outagesLast30Days: 12,
    lat: 13.0706,
    lng: 77.7981,
    defaultCriticalLoad: 'Water pumping',
    criticalAssetName: 'Hoskote Municipal Water Supply',
  },
  {
    feederId: 'FDR-RMN-07',
    area: 'Ramanagara Town',
    areaKn: 'ರಾಮನಗರ ಪಟ್ಟಣ',
    circle: 'Regional Circles',
    substation: 'Ramanagara 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 2910,
    outagesLast30Days: 10,
    lat: 12.715,
    lng: 77.2813,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'Ramanagara District Hospital',
  },
  {
    feederId: 'FDR-TMK-11',
    area: 'Tumakuru MG Road',
    areaKn: 'ತುಮಕೂರು ಎಂ.ಜಿ. ರಸ್ತೆ',
    circle: 'Regional Circles',
    substation: 'Tumakuru 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 3640,
    outagesLast30Days: 9,
    lat: 13.3392,
    lng: 77.114,
    defaultCriticalLoad: 'Hospital nearby',
    criticalAssetName: 'Tumakuru District Medical Center',
  },
  {
    feederId: 'FDR-KLR-09',
    area: 'Kolar Gold Fields / Town',
    areaKn: 'ಕೋಲಾರ ಪಟ್ಟಣ',
    circle: 'Regional Circles',
    substation: 'Kolar 220/66kV',
    voltage: '11 kV',
    connectedConsumers: 2560,
    outagesLast30Days: 11,
    lat: 13.1362,
    lng: 78.1291,
    defaultCriticalLoad: 'Water pumping',
    criticalAssetName: 'Kolar District Pumping Station',
  },
];

export const CRITICAL_SITES: CriticalSite[] = [
  {
    id: 'CRIT-1',
    name: 'Manipal & CMH Medical Corridor',
    type: 'Hospital nearby',
    feederId: 'FDR-IND-04',
    lat: 12.9792,
    lng: 77.6419,
  },
  {
    id: 'CRIT-2',
    name: 'BWSSB Pumping Station Hoodi',
    type: 'Water pumping',
    feederId: 'FDR-WFD-19',
    lat: 12.9868,
    lng: 77.7345,
  },
  {
    id: 'CRIT-3',
    name: 'Jayanagar General Hospital',
    type: 'Hospital nearby',
    feederId: 'FDR-JYN-09',
    lat: 12.9286,
    lng: 77.5847,
  },
  {
    id: 'CRIT-4',
    name: 'Indiranagar Metro Traction Sub',
    type: 'Public transit',
    feederId: 'FDR-IND-04',
    lat: 12.9781,
    lng: 77.6384,
  },
  {
    id: 'CRIT-5',
    name: 'KC General Hospital Malleswaram',
    type: 'Hospital nearby',
    feederId: 'FDR-MLM-07',
    lat: 13.0019,
    lng: 77.5688,
  },
  {
    id: 'CRIT-6',
    name: 'Bowring & Lady Curzon Hospital',
    type: 'Hospital nearby',
    feederId: 'FDR-SHV-01',
    lat: 12.9821,
    lng: 77.6041,
  },
  {
    id: 'CRIT-7',
    name: 'Majestic Metro Interchange',
    type: 'Public transit',
    feederId: 'FDR-MJC-05',
    lat: 12.9759,
    lng: 77.5729,
  },
  {
    id: 'CRIT-8',
    name: 'Agara BWSSB Water Booster',
    type: 'Water pumping',
    feederId: 'FDR-HSR-15',
    lat: 12.9225,
    lng: 77.6411,
  },
];

export const BESCOM_CREWS: CrewUnit[] = [
  {
    id: 'CREW-14',
    name: 'Rapid Response #14',
    division: 'Indiranagar / East Division',
    circle: 'Bengaluru East',
    specialty: 'HT/LT Feeder & Underground Cable',
    vehicle: 'KA-01-G-4418',
    leadEngineer: 'R. Raghavendra',
    phone: '+91 94480 14014',
  },
  {
    id: 'CREW-08',
    name: 'Substation Squad #08',
    division: 'Koramangala / HSR South',
    circle: 'Bengaluru South',
    specialty: 'RMU & Distribution Transformer',
    vehicle: 'KA-01-G-3902',
    leadEngineer: 'S. Kavitha',
    phone: '+91 94480 08008',
  },
  {
    id: 'CREW-21',
    name: 'Emergency Line #21',
    division: 'Whitefield / KR Puram',
    circle: 'Bengaluru East',
    specialty: 'Overhead Line & Tree Clearance',
    vehicle: 'KA-01-G-5120',
    leadEngineer: 'M. Prakash',
    phone: '+91 94480 21021',
  },
  {
    id: 'CREW-05',
    name: 'North Rapid #05',
    division: 'Malleswaram / Peenya / Yelahanka',
    circle: 'Bengaluru North',
    specialty: 'Pole Fuse & Breaker Restoration',
    vehicle: 'KA-01-G-2874',
    leadEngineer: 'N. Ashwin',
    phone: '+91 94480 05005',
  },
  {
    id: 'CREW-03',
    name: 'Critical Load Taskforce #03',
    division: 'Central CBD & Hospitals',
    circle: 'Bengaluru West & Central',
    specialty: 'Hospital & BWSSB Priority Bypass',
    vehicle: 'KA-01-G-1003',
    leadEngineer: 'K. Deepika',
    phone: '+91 94480 03003',
  },
  {
    id: 'CREW-17',
    name: 'West Corridor #17',
    division: 'Vijayanagar / Kengeri',
    circle: 'Bengaluru West & Central',
    specialty: 'Metro Traction & Feeder Tie',
    vehicle: 'KA-01-G-6217',
    leadEngineer: 'B. Harish',
    phone: '+91 94480 17017',
  },
  {
    id: 'CREW-29',
    name: 'South E-City Squad #29',
    division: 'Electronic City / BTM / BSK',
    circle: 'Bengaluru South',
    specialty: 'IT Park & 66kV Substation Backup',
    vehicle: 'KA-01-G-7329',
    leadEngineer: 'P. Sumathi',
    phone: '+91 94480 29029',
  },
  {
    id: 'CREW-34',
    name: 'Regional Mobile Unit #34',
    division: 'Devanahalli / Hoskote / Ramanagara / Tumakuru / Kolar',
    circle: 'Regional Circles',
    specialty: 'Long-Distance 11kV Rural/Town Line',
    vehicle: 'KA-01-G-8834',
    leadEngineer: 'T. Mahesh',
    phone: '+91 94480 34034',
  },
];

function seededOffset(seed: number, maxDeg: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  const frac = x - Math.floor(x);
  return (frac * 2 - 1) * maxDeg;
}

export function createSeedReports(): OutageReport[] {
  const reports: OutageReport[] = [];
  const channels: ReportChannel[] = ['Mobile App', 'Helpline 1912', 'Social Media'];

  // Cluster A: 42 reports near Indiranagar (Hospital nearby, 3 hrs = 180 min)
  for (let i = 0; i < 42; i++) {
    reports.push({
      id: `RPT-A-${String(i + 1).padStart(3, '0')}`,
      rrNumber: `BLR-E4-${71000 + i}`,
      consumerName: `Consumer #${1040 + i}`,
      phone: `+91 98450 ${String(11000 + i).slice(-5)}`,
      area: 'Indiranagar 100ft Rd',
      feederId: 'FDR-IND-04',
      lat: 12.9784 + seededOffset(i + 1, 0.0042),
      lng: 77.6408 + seededOffset(i + 101, 0.0042),
      channel: channels[i % 3],
      outageType: i % 5 === 0 ? 'Transformer Fault' : 'Complete Blackout',
      reportedAtMinutesAgo: i === 0 ? 180 : Math.max(15, 180 - i * 3),
      criticalLoad: i % 4 === 0 ? 'Hospital nearby' : 'None',
      description: 'Three-phase supply outage along 100ft Road & CMH Junction',
    });
  }

  // Cluster B: 11 reports near Koramangala (Residential, 1 hr = 60 min)
  for (let i = 0; i < 11; i++) {
    reports.push({
      id: `RPT-B-${String(i + 1).padStart(3, '0')}`,
      rrNumber: `BLR-S2-${82000 + i}`,
      consumerName: `Consumer #${2080 + i}`,
      phone: `+91 98801 ${String(22000 + i).slice(-5)}`,
      area: 'Koramangala 4th Block',
      feederId: 'FDR-KRM-12',
      lat: 12.9352 + seededOffset(i + 301, 0.0032),
      lng: 77.6245 + seededOffset(i + 401, 0.0032),
      channel: channels[(i + 1) % 3],
      outageType: i % 3 === 0 ? 'Voltage Fluctuation' : 'Complete Blackout',
      reportedAtMinutesAgo: i === 0 ? 60 : Math.max(10, 60 - i * 4),
      criticalLoad: 'None',
      description: 'Phase drop after feeder trip near 4th Block BDA Complex',
    });
  }

  // Cluster C: 3 reports near Malleswaram (Residential, 20 min)
  for (let i = 0; i < 3; i++) {
    reports.push({
      id: `RPT-C-${String(i + 1).padStart(3, '0')}`,
      rrNumber: `BLR-N1-${93000 + i}`,
      consumerName: `Consumer #${3120 + i}`,
      phone: `+91 99002 ${String(33000 + i).slice(-5)}`,
      area: 'Malleswaram 8th Cross',
      feederId: 'FDR-MLM-07',
      lat: 13.0035 + seededOffset(i + 601, 0.0018),
      lng: 77.5643 + seededOffset(i + 701, 0.0018),
      channel: channels[(i + 2) % 3],
      outageType: 'Line / Pole Damage',
      reportedAtMinutesAgo: i === 0 ? 20 : 18 - i * 2,
      criticalLoad: 'None',
      description: 'Distribution transformer fuse blown on 8th Cross',
    });
  }

  // Cluster D: 5 reports near Peenya Industrial (Water pumping, 40 min)
  for (let i = 0; i < 5; i++) {
    reports.push({
      id: `RPT-D-${String(i + 1).padStart(3, '0')}`,
      rrNumber: `BLR-N4-${96000 + i}`,
      consumerName: `Industrial Unit #${401 + i}`,
      phone: `+91 97312 ${String(44000 + i).slice(-5)}`,
      area: 'Peenya Industrial Stage 2',
      feederId: 'FDR-PNY-22',
      lat: 13.0285 + seededOffset(i + 801, 0.0022),
      lng: 77.5197 + seededOffset(i + 901, 0.0022),
      channel: channels[i % 3],
      outageType: 'Voltage Fluctuation',
      reportedAtMinutesAgo: 40 - i * 4,
      criticalLoad: i === 0 ? 'Water pumping' : 'None',
      description: 'Industrial feeder voltage sag in Stage 2',
    });
  }

  return reports;
}

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CRITICAL_LOAD_RANK: Record<CriticalLoadType, number> = {
  None: 0,
  'Public transit': 0.7,
  'Water pumping': 0.85,
  'Hospital nearby': 1.0,
};

function pickDominantCriticalLoad(reports: OutageReport[]): CriticalLoadType {
  let best: CriticalLoadType = 'None';
  let bestRank = 0;
  for (const r of reports) {
    const rank = CRITICAL_LOAD_RANK[r.criticalLoad];
    if (rank > bestRank) {
      bestRank = rank;
      best = r.criticalLoad;
    }
  }
  return best;
}

function pickDominantOutageType(reports: OutageReport[]): OutageType {
  const counts = new Map<OutageType, number>();
  for (const r of reports) {
    counts.set(r.outageType, (counts.get(r.outageType) ?? 0) + 1);
  }
  let top: OutageType = reports[0]?.outageType ?? 'Complete Blackout';
  let max = 0;
  for (const [k, v] of counts.entries()) {
    if (v > max) {
      max = v;
      top = k;
    }
  }
  return top;
}

export interface IncidentOverride {
  status: IncidentStatus;
  assignedCrewId?: string;
  assignedCrewName?: string;
  estimatedRestoration?: string;
  escalatedToEe?: boolean;
  faultCause?: import('../types/lumenops').FaultCause;
}

export function runDbscanAndScore(
  reports: OutageReport[],
  weights: PriorityWeights,
  statusOverrides: Record<string, IncidentOverride> = {}
): FaultIncident[] {
  const n = reports.length;
  if (n === 0) return [];

  const labels = new Array<number>(n).fill(-1);
  let clusterId = 0;

  const regionQuery = (idx: number): number[] => {
    const neighbors: number[] = [];
    const target = reports[idx];
    for (let j = 0; j < n; j++) {
      if (haversineMeters(target.lat, target.lng, reports[j].lat, reports[j].lng) <= weights.epsMeters) {
        neighbors.push(j);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -1) continue;
    const neighbors = regionQuery(i);
    if (neighbors.length < weights.minPts) {
      labels[i] = -2;
      continue;
    }

    const currentCluster = clusterId++;
    labels[i] = currentCluster;
    const seeds = [...neighbors];

    for (let s = 0; s < seeds.length; s++) {
      const curr = seeds[s];
      if (labels[curr] === -2) {
        labels[curr] = currentCluster;
      }
      if (labels[curr] !== -1) continue;
      labels[curr] = currentCluster;
      const currNeighbors = regionQuery(curr);
      if (currNeighbors.length >= weights.minPts) {
        for (const nb of currNeighbors) {
          if (!seeds.includes(nb)) {
            seeds.push(nb);
          }
        }
      }
    }
  }

  const groups = new Map<string, OutageReport[]>();
  for (let i = 0; i < n; i++) {
    const key = labels[i] >= 0 ? `cluster-${labels[i]}` : `single-${reports[i].id}`;
    const list = groups.get(key) ?? [];
    list.push(reports[i]);
    groups.set(key, list);
  }

  const rawIncidents: FaultIncident[] = [];
  for (const [, clusterReports] of groups.entries()) {
    const lat = clusterReports.reduce((acc, r) => acc + r.lat, 0) / clusterReports.length;
    const lng = clusterReports.reduce((acc, r) => acc + r.lng, 0) / clusterReports.length;

    let maxDist = 180;
    for (const r of clusterReports) {
      const d = haversineMeters(lat, lng, r.lat, r.lng);
      if (d > maxDist) maxDist = d;
    }

    const reportCount = clusterReports.length;
    const durationMinutes = Math.max(...clusterReports.map((r) => r.reportedAtMinutesAgo), 5);
    const criticalLoad = pickDominantCriticalLoad(clusterReports);

    const consumerPoints = Number((weights.w1Consumers * reportCount).toFixed(1));
    const durationPoints = Number((weights.w2Duration * durationMinutes).toFixed(1));
    const criticalLoadPoints = Number(
      (weights.w3CriticalLoad * CRITICAL_LOAD_RANK[criticalLoad]).toFixed(1)
    );
    const totalScore = Number((consumerPoints + durationPoints + criticalLoadPoints).toFixed(1));

    let priority: PriorityLevel = 'LOW';
    if (totalScore >= 85 || criticalLoad === 'Hospital nearby') {
      priority = 'HIGH';
    } else if (totalScore >= 32) {
      priority = 'MEDIUM';
    }

    const primaryReport = clusterReports[0];
    const stableKey = primaryReport.feederId;
    const feederInfo = BESCOM_FEEDERS.find((f) => f.feederId === stableKey);
    const circle: BescomCircle = feederInfo?.circle ?? 'Bengaluru East';

    const override = statusOverrides[stableKey];
    const defaultStatus: IncidentStatus =
      priority === 'HIGH' && override === undefined ? 'Crew assigned' : 'Reported';
    const status = override?.status ?? defaultStatus;
    const assignedCrewId =
      override?.assignedCrewId ?? (status === 'Crew assigned' ? 'CREW-14' : undefined);
    const assignedCrewName =
      override?.assignedCrewName ??
      (status === 'Crew assigned' ? 'Rapid Response #14' : undefined);
    const estimatedRestoration =
      override?.estimatedRestoration ??
      (status === 'Restored'
        ? 'Supply restored'
        : status === 'Crew assigned'
          ? '45 mins'
          : 'Awaiting dispatch');

    const slaTargetMinutes = priority === 'HIGH' ? 90 : priority === 'MEDIUM' ? 120 : 180;
    const slaStatus =
      status !== 'Restored' && durationMinutes > slaTargetMinutes ? 'SLA Breached' : 'Within SLA';

    rawIncidents.push({
      id: `INC-${stableKey}`,
      label: '',
      area: primaryReport.area,
      feederId: primaryReport.feederId,
      circle,
      lat,
      lng,
      radiusMeters: Math.round(maxDist + 140),
      reports: clusterReports,
      reportCount,
      durationMinutes,
      criticalLoad,
      priority,
      score: {
        consumerPoints,
        durationPoints,
        criticalLoadPoints,
        totalScore,
      },
      status,
      assignedCrewId,
      assignedCrewName,
      estimatedRestoration,
      dominantOutageType: pickDominantOutageType(clusterReports),
      slaTargetMinutes,
      slaStatus,
      escalatedToEe: override?.escalatedToEe ?? false,
      faultCause: override?.faultCause ?? 'Under Investigation',
    });
  }

  rawIncidents.sort((a, b) => {
    if (a.status === 'Restored' && b.status !== 'Restored') return 1;
    if (a.status !== 'Restored' && b.status === 'Restored') return -1;
    return b.score.totalScore - a.score.totalScore;
  });

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return rawIncidents.map((inc, idx) => ({
    ...inc,
    label: idx < letters.length ? letters[idx] : `I${idx + 1}`,
  }));
}

export function generateDuplicateReportsForFeeder(
  feederId: string,
  count = 5
): OutageReport[] {
  const feeder = BESCOM_FEEDERS.find((f) => f.feederId === feederId) ?? BESCOM_FEEDERS[0];
  const channels: ReportChannel[] = ['Mobile App', 'Helpline 1912', 'Social Media', 'Web Portal'];
  const stamp = Date.now();
  const list: OutageReport[] = [];

  for (let i = 0; i < count; i++) {
    list.push({
      id: `DUP-${stamp}-${i}`,
      rrNumber: `BLR-DUP-${10000 + ((stamp + i) % 89999)}`,
      consumerName: `Neighbor Reporter #${i + 1}`,
      phone: `+91 98455 ${String(30000 + i + (stamp % 900)).slice(-5)}`,
      area: feeder.area,
      feederId: feeder.feederId,
      lat: feeder.lat + seededOffset(i + (stamp % 100), 0.0022),
      lng: feeder.lng + seededOffset(i + 50 + (stamp % 100), 0.0022),
      channel: channels[i % channels.length],
      outageType: 'Complete Blackout',
      reportedAtMinutesAgo: 8 + i * 2,
      criticalLoad: i === 0 ? feeder.defaultCriticalLoad : 'None',
      description: 'Neighbor reporting same feeder outage — auto-merged via DBSCAN',
    });
  }
  return list;
}

export function createSeedMaintenanceWindows(): import('../types/lumenops').MaintenanceWindow[] {
  return [
    {
      id: 'MNT-2026-01',
      feederId: 'FDR-RJN-10',
      area: 'Rajajinagar 1st Block',
      date: '16 Nov 2026',
      timeWindow: '10:00 – 13:30',
      reason: '11kV Ring Main Unit preventive servicing & tree branch clearance',
      status: 'In Progress',
    },
    {
      id: 'MNT-2026-02',
      feederId: 'FDR-BTM-08',
      area: 'BTM Layout 2nd Stage',
      date: '17 Nov 2026',
      timeWindow: '09:30 – 14:00',
      reason: 'DTR transformer oil filtration & LT cable upgrading',
      status: 'Scheduled',
    },
    {
      id: 'MNT-2026-03',
      feederId: 'FDR-HSR-15',
      area: 'HSR Layout Sector 2',
      date: '18 Nov 2026',
      timeWindow: '11:00 – 15:00',
      reason: '66/11kV Substation breaker relay calibration',
      status: 'Scheduled',
    },
  ];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return hrs === 1 ? '1 hr' : `${hrs} hrs`;
  return `${hrs}h ${rem}m`;
}

export function generateMonsoonSurgeBatch(): OutageReport[] {
  const surge: OutageReport[] = [];
  const stamp = Date.now();
  const targets = [
    { feeder: BESCOM_FEEDERS[1], count: 7, duration: 95, type: 'Transformer Fault' as OutageType }, // Whitefield
    { feeder: BESCOM_FEEDERS[6], count: 5, duration: 55, type: 'Complete Blackout' as OutageType }, // Jayanagar
    { feeder: BESCOM_FEEDERS[15], count: 3, duration: 40, type: 'Line / Pole Damage' as OutageType }, // Vijayanagar
    { feeder: BESCOM_FEEDERS[19], count: 3, duration: 35, type: 'Complete Blackout' as OutageType }, // Devanahalli
  ];

  const channels: ReportChannel[] = ['Helpline 1912', 'Mobile App', 'Social Media'];
  let idx = 0;
  for (const t of targets) {
    for (let i = 0; i < t.count; i++) {
      idx++;
      surge.push({
        id: `SURGE-${stamp}-${idx}`,
        rrNumber: `BLR-MG-${64000 + idx}`,
        consumerName: `Citizen #${5000 + idx}`,
        phone: `+91 99800 ${String(70000 + idx).slice(-5)}`,
        area: t.feeder.area,
        feederId: t.feeder.feederId,
        lat: t.feeder.lat + seededOffset(idx * 17, 0.0028),
        lng: t.feeder.lng + seededOffset(idx * 31, 0.0028),
        channel: channels[idx % 3],
        outageType: t.type,
        reportedAtMinutesAgo: t.duration - i * 3,
        criticalLoad: i % 2 === 0 ? t.feeder.defaultCriticalLoad : 'None',
        description: 'Storm-induced feeder trip reported during monsoon surge simulation',
      });
    }
  }
  return surge;
}

export function parseCsvReports(csvText: string): OutageReport[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const parsed: OutageReport[] = [];
  const startIdx = lines[0].toLowerCase().includes('area') ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < 5) continue;
    const [area, feederId, latStr, lngStr, durationStr, criticalRaw, channelRaw] = cols;
    const lat = Number.parseFloat(latStr);
    const lng = Number.parseFloat(lngStr);
    const duration = Number.parseInt(durationStr, 10);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    let criticalLoad: CriticalLoadType = 'None';
    if (criticalRaw?.toLowerCase().includes('hospital')) criticalLoad = 'Hospital nearby';
    else if (criticalRaw?.toLowerCase().includes('water')) criticalLoad = 'Water pumping';
    else if (criticalRaw?.toLowerCase().includes('transit')) criticalLoad = 'Public transit';

    const channel: ReportChannel =
      channelRaw === 'Helpline 1912' || channelRaw === 'Social Media' || channelRaw === 'Mobile App'
        ? channelRaw
        : 'CSV Import';

    parsed.push({
      id: `CSV-${Date.now()}-${i}`,
      rrNumber: `BLR-CSV-${40000 + i}`,
      consumerName: `Imported Account #${4000 + i}`,
      phone: `+91 97410 ${String(50000 + i).slice(-5)}`,
      area: area || 'Bengaluru Central',
      feederId: feederId || 'FDR-CSV-01',
      lat,
      lng,
      channel,
      outageType: 'Complete Blackout',
      reportedAtMinutesAgo: Number.isNaN(duration) ? 25 : duration,
      criticalLoad,
      description: 'Ingested via BESCOM CSV bridge',
    });
  }
  return parsed;
}

export function exportIncidentsToCsv(incidents: FaultIncident[]): string {
  const header =
    'Incident,Circle,Area,Feeder_ID,Priority,Score,Reports_Merged,Duration_Min,Critical_Load,Status,Assigned_Crew,ETA';
  const rows = incidents.map((inc) =>
    [
      `Incident ${inc.label}`,
      `"${inc.circle}"`,
      `"${inc.area}"`,
      inc.feederId,
      inc.priority,
      inc.score.totalScore.toFixed(1),
      inc.reportCount,
      inc.durationMinutes,
      `"${inc.criticalLoad}"`,
      inc.status,
      `"${inc.assignedCrewName ?? 'Unassigned'}"`,
      `"${inc.estimatedRestoration ?? 'Pending'}"`,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export const SAMPLE_CSV_BATCH = `area,feeder_id,lat,lng,duration_minutes,critical_load,channel
Whitefield ITPL Main,FDR-WFD-19,12.9855,77.7362,95,Water pumping,Helpline 1912
Whitefield ITPL Main,FDR-WFD-19,12.9862,77.7371,90,Water pumping,Mobile App
Whitefield ITPL Main,FDR-WFD-19,12.9849,77.7354,82,Water pumping,Mobile App
Jayanagar 3rd Block,FDR-JYN-09,12.9298,77.5838,45,Hospital nearby,Helpline 1912
Jayanagar 3rd Block,FDR-JYN-09,12.9304,77.5844,40,Hospital nearby,Mobile App
Tumakuru MG Road,FDR-TMK-11,13.3392,77.1140,65,Hospital nearby,Helpline 1912
Tumakuru MG Road,FDR-TMK-11,13.3398,77.1146,55,Hospital nearby,Mobile App`;

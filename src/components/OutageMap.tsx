import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BESCOM_FEEDERS, formatDuration } from '../engine/dbscan';
import type { CriticalSite, FaultIncident, Language, OutageReport } from '../types/lumenops';

interface OutageMapProps {
  lang: Language;
  incidents: FaultIncident[];
  reports: OutageReport[];
  criticalSites: CriticalSite[];
  showRawReports: boolean;
  showCriticalSites: boolean;
  showAllFeeders: boolean;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

const PRIORITY_COLORS = {
  HIGH: { stroke: '#DC2626', fill: '#EF4444' },
  MEDIUM: { stroke: '#D97706', fill: '#F59E0B' },
  LOW: { stroke: '#16A34A', fill: '#22C55E' },
};

export default function OutageMap({
  lang,
  incidents,
  reports,
  criticalSites,
  showRawReports,
  showCriticalSites,
  showAllFeeders,
  selectedIncidentId,
  onSelectIncident,
}: OutageMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [12.9716, 77.615],
      zoom: 11,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (showAllFeeders) {
      for (const feeder of BESCOM_FEEDERS) {
        const displayArea = lang === 'kn' ? feeder.areaKn : feeder.area;
        L.circleMarker([feeder.lat, feeder.lng], {
          radius: 5,
          color: '#08152B',
          weight: 1.5,
          fillColor: '#94A3B8',
          fillOpacity: 0.75,
        })
          .bindPopup(
            `<div style="font-family: DM Sans, Noto Sans Kannada, sans-serif; font-size: 12px;">
              <strong style="color:#0F172A;">${displayArea}</strong><br/>
              <span style="color:#475569;">${feeder.feederId} · ${feeder.circle}</span><br/>
              <span style="color:#64748B;">${feeder.substation} (${feeder.connectedConsumers.toLocaleString()} consumers)</span>
            </div>`
          )
          .addTo(group);
      }
    }

    if (showRawReports) {
      for (const r of reports) {
        L.circleMarker([r.lat, r.lng], {
          radius: 3.8,
          color: '#08152B',
          weight: 1,
          fillColor: '#2563EB',
          fillOpacity: 0.78,
        })
          .bindTooltip(`${r.area} · ${r.channel} · ${r.rrNumber}`, { direction: 'top' })
          .addTo(group);
      }
    }

    if (showCriticalSites) {
      for (const site of criticalSites) {
        const markerHtml = `
          <div style="
            width: 22px;
            height: 22px;
            border-radius: 6px;
            background: #08152B;
            color: #FBBF24;
            border: 1.5px solid #FBBF24;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Outfit, sans-serif;
            font-weight: 700;
            font-size: 11px;
            box-shadow: 0 2px 6px rgba(8, 21, 43, 0.35);
          ">+</div>
        `;
        const siteIcon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker([site.lat, site.lng], { icon: siteIcon })
          .bindPopup(
            `<div style="font-family: DM Sans, sans-serif; font-size: 12px;">
              <strong style="color:#0F172A;">${site.name}</strong><br/>
              <span style="color:#475569;">${site.type} · ${site.feederId}</span>
            </div>`
          )
          .addTo(group);
      }
    }

    for (const inc of incidents) {
      const feederMeta = BESCOM_FEEDERS.find((f) => f.feederId === inc.feederId);
      const displayArea =
        lang === 'kn' && feederMeta ? feederMeta.areaKn : inc.area;
      const palette =
        inc.status === 'Restored'
          ? { stroke: '#475569', fill: '#64748B' }
          : PRIORITY_COLORS[inc.priority];
      const isSelected = inc.id === selectedIncidentId;

      L.circle([inc.lat, inc.lng], {
        radius: Math.max(inc.radiusMeters, 340),
        color: palette.stroke,
        weight: isSelected ? 2.5 : 1.5,
        opacity: isSelected ? 0.9 : 0.6,
        fillColor: palette.fill,
        fillOpacity: inc.status === 'Restored' ? 0.12 : 0.2,
      }).addTo(group);

      const badgeHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background: ${palette.stroke};
          color: #ffffff;
          border: 2.5px solid #ffffff;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Outfit, sans-serif;
          font-weight: 700;
          font-size: 13px;
          transform: ${isSelected ? 'scale(1.16)' : 'scale(1)'};
        ">${inc.label}</div>
      `;

      const icon = L.divIcon({
        html: badgeHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inc.lat, inc.lng], { icon });
      marker.on('click', () => onSelectIncident(inc.id));
      marker.bindPopup(`
        <div style="min-width: 210px; font-family: DM Sans, Noto Sans Kannada, sans-serif;">
          <div style="font-weight: 700; font-size: 14px; color: #0F172A;">
            Incident ${inc.label} — ${inc.status === 'Restored' ? 'RESTORED' : inc.priority}
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">
            ${displayArea} · ${inc.feederId}
          </div>
          <div style="font-size: 12px; color: #0F172A; margin-top: 8px; line-height: 1.55;">
            Merged complaints: <strong>${inc.reportCount}</strong><br/>
            Duration: <strong>${formatDuration(inc.durationMinutes)}</strong><br/>
            Fault type: <strong>${inc.dominantOutageType}</strong><br/>
            Critical load: <strong>${inc.criticalLoad}</strong><br/>
            Crew: <strong>${inc.assignedCrewName ?? 'Unassigned'}</strong>
          </div>
        </div>
      `);
      marker.addTo(group);
    }
  }, [
    lang,
    incidents,
    reports,
    criticalSites,
    showRawReports,
    showCriticalSites,
    showAllFeeders,
    selectedIncidentId,
    onSelectIncident,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIncidentId) return;
    const selected = incidents.find((i) => i.id === selectedIncidentId);
    if (selected) {
      map.panTo([selected.lat, selected.lng], { animate: true });
    }
  }, [selectedIncidentId, incidents]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[340px] sm:h-[420px] lg:h-[460px] rounded-xl overflow-hidden border border-slate-200"
      aria-label="BESCOM live outage map across all Bengaluru and regional feeders"
    />
  );
}

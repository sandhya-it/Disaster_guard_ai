import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Compass,
  Maximize2,
  Minimize2,
  Crosshair,
  AlertTriangle,
  Flame,
  Radio,
  Eye,
  Info,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { DisasterZone } from '../types';

interface DisasterZonesNewsMapProps {
  height?: string;
  isEmbedded?: boolean;
  onBack?: () => void;
}

export const DisasterZonesNewsMap: React.FC<DisasterZonesNewsMapProps> = ({
  height = 'calc(100vh - 8rem)',
  isEmbedded = false,
  onBack,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const {
    userLocation,
    userAddress,
    disasterZones,
    safetyAnalysis,
    requestCurrentLocation,
  } = useDisaster();

  const [selectedZone, setSelectedZone] = useState<DisasterZone | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize News Disaster Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Tile Layer - Dark weather news style
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current && !isEmbedded) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render High-Contrast Broadcast News Styled Disaster Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const group = layersGroupRef.current;
    group.clearLayers();

    // Broadcast Color Matrix
    const getZoneColorTheme = (zone: DisasterZone) => {
      switch (zone.dangerLevel) {
        case 'CRITICAL':
          return {
            color: '#dc2626', // Crimson Red
            fillColor: '#ef4444',
            fillOpacity: 0.35,
            borderWeight: 3,
            badge: 'EXTREME SEVERITY - RED ALERT',
            badgeBg: 'bg-red-600',
            textColor: 'text-red-400',
            newsTag: 'ZONE-A: MANDATORY EVACUATION',
          };
        case 'DANGER':
          return {
            color: '#ea580c', // Bright Amber Orange
            fillColor: '#f97316',
            fillOpacity: 0.28,
            borderWeight: 2.5,
            badge: 'HIGH HAZARD - ORANGE WARNING',
            badgeBg: 'bg-orange-500',
            textColor: 'text-orange-400',
            newsTag: 'ZONE-B: FLASH INUNDATION CORRIDOR',
          };
        case 'WARNING':
          return {
            color: '#ca8a04', // Warning Yellow
            fillColor: '#eab308',
            fillOpacity: 0.22,
            borderWeight: 2,
            badge: 'ELEVATED RISK - YELLOW ADVISORY',
            badgeBg: 'bg-yellow-500',
            textColor: 'text-yellow-400',
            newsTag: 'ZONE-C: RUNOFF PERIPHERY',
          };
        default:
          return {
            color: '#059669', // Emerald Safe
            fillColor: '#10b981',
            fillOpacity: 0.15,
            borderWeight: 2,
            badge: 'SAFE BUFFER - GREEN ZONE',
            badgeBg: 'bg-emerald-600',
            textColor: 'text-emerald-400',
            newsTag: 'SECURED HIGH-GROUND',
          };
      }
    };

    // Render Each News Hazard Zone with weather-radar styling
    disasterZones.forEach((zone) => {
      if (filterSeverity !== 'ALL' && zone.dangerLevel !== filterSeverity) return;

      const theme = getZoneColorTheme(zone);
      const radiusMeters = zone.radiusKm * 1000;

      // Outer radar pulse circle
      const outerRadar = L.circle([zone.center.lat, zone.center.lng], {
        radius: radiusMeters * 1.08,
        color: theme.color,
        weight: 1,
        dashArray: '4, 8',
        opacity: 0.5,
        fill: false,
      });

      // Main Zone boundary
      const circle = L.circle([zone.center.lat, zone.center.lng], {
        radius: radiusMeters,
        color: theme.color,
        weight: theme.borderWeight,
        opacity: 0.9,
        fillColor: theme.fillColor,
        fillOpacity: theme.fillOpacity,
      });

      // Zone Center Beacon Marker
      const centerMarkerIcon = L.divIcon({
        className: 'news-zone-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #090d16;
            color: white;
            border: 2px solid ${theme.color};
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 15px rgba(0,0,0,0.6);
          ">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${theme.color};"></span>
            ${zone.name.split(' ')[0].toUpperCase()} [${zone.dangerLevel}]
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      const centerMarker = L.marker([zone.center.lat, zone.center.lng], {
        icon: centerMarkerIcon,
      });

      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 220px; padding: 4px;">
          <div style="background: ${theme.color}; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 800; font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; display: inline-block;">
            ${theme.badge}
          </div>
          <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">${zone.name}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">${zone.description}</p>
          <div style="display: grid; grid-cols: 2; gap: 4px; background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 11px; color: #334155;">
            <div>Hazard: <b>${zone.type}</b></div>
            <div>Radius: <b>${zone.radiusKm} km</b></div>
            <div>Population: <b>${zone.affectedPopulation?.toLocaleString() || '12,000+'}</b></div>
            <div>Severity: <b>${zone.severity}</b></div>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      centerMarker.bindPopup(popupHtml);

      circle.on('click', () => setSelectedZone(zone));
      centerMarker.on('click', () => setSelectedZone(zone));

      group.addLayer(outerRadar);
      group.addLayer(circle);
      group.addLayer(centerMarker);
    });

    // Add User Location indicator
    const userMarkerIcon = L.divIcon({
      className: 'news-user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 2px solid #ffffff; box-shadow: 0 0 10px #3b82f6;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userMarkerIcon });
    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 11px;">
        <b style="color: #2563eb;">YOUR POSITION</b><br/>
        ${userAddress}
      </div>
    `);
    group.addLayer(userMarker);
  }, [disasterZones, filterSeverity, userLocation, userAddress]);

  const handleCenterUser = () => {
    requestCurrentLocation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13, { animate: true });
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#090d16] ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top News Broadcast Header Banner */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-[#090d16]/95 hover:bg-slate-800 border border-white/15 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-bold text-white shadow-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>← Dashboard</span>
          </button>
        )}

        <div className="bg-[#090d16]/95 border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-3 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></div>
          <div>
            <div className="text-[9px] uppercase font-mono-tech tracking-widest text-red-400 font-bold">
              NEWS BROADCAST HAZARD MATRIX
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Disaster Area Severity Overlay</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-white/10 text-slate-300 rounded font-mono-tech">
                {disasterZones.length} SECTORS
              </span>
            </div>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1 bg-[#090d16]/90 border border-white/10 backdrop-blur-md p-1 rounded-xl shadow-lg">
          {(['ALL', 'CRITICAL', 'DANGER', 'WARNING'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all ${
                filterSeverity === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : sev === 'DANGER'
                    ? 'bg-orange-500 text-white'
                    : sev === 'WARNING'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Controls (Right) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleCenterUser}
          title="Center on My Location"
          className="p-2.5 rounded-xl bg-[#090d16]/90 hover:bg-slate-800 text-blue-400 border border-white/10 shadow-xl transition-all"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen News Map'}
          className="p-2.5 rounded-xl bg-[#090d16]/90 hover:bg-slate-800 text-slate-200 border border-white/10 shadow-xl transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom News Color Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto">
        <div className="bg-[#090d16]/95 border border-white/10 backdrop-blur-md p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              News Color Code:
            </span>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600 border border-red-400 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
              <span className="font-bold text-red-300">Red Alert (Critical Flood &gt;2.5m)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
              <span className="font-bold text-orange-300">Orange Hazard (Severe Waterlogging)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
              <span className="font-bold text-yellow-300">Yellow Advisory (High Runoff)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></span>
              <span className="text-slate-300 font-medium">You (Citizen GPS)</span>
            </div>
          </div>

          {/* Quick Zone Stat */}
          <div className="text-[11px] font-mono-tech text-slate-400 hidden md:block">
            ACTIVE CASUALTY HAZARDS: <span className="text-red-400 font-bold">{disasterZones.length} ZONES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

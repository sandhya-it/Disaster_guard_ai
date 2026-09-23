import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Compass,
  Maximize2,
  Minimize2,
  Navigation,
  Shield,
  LifeBuoy,
  Flame,
  Activity,
  Crosshair,
  Truck,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { GeoPoint, Shelter, DisasterZone, EmergencyServiceFacility, RescueTeam } from '../types';

interface LiveDisasterMapProps {
  isEmbedded?: boolean;
  height?: string;
  onShelterSelect?: (shelter: Shelter) => void;
  showTeamsDefault?: boolean;
}

export const LiveDisasterMap: React.FC<LiveDisasterMapProps> = ({
  isEmbedded = false,
  height = 'calc(100vh - 8rem)',
  onShelterSelect,
  showTeamsDefault = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const {
    userLocation,
    userAddress,
    safetyAnalysis,
    disasterZones,
    shelters,
    emergencyServices,
    reliefResources,
    rescueTeams,
    activeEvacuationRoute,
    recommendedShelter,
    setUserCustomLocation,
    requestCurrentLocation,
    startNavigationToShelter,
    simulationState,
  } = useDisaster();

  // Layer Visibility Toggles - Keep Map Minimal: Boat/Patrol units hidden by default so citizens see only Evacuation Route and Safe Shelters
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showEmergencyServices, setShowEmergencyServices] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showRescueTeams, setShowRescueTeams] = useState(showTeamsDefault);
  const [showEvacuationRoute, setShowEvacuationRoute] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: false,
      });

      // Dark Matter CartoDB Basemap for high-contrast command center look
      const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd',
      });

      // Fallback standard OpenStreetMap
      const osmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      });

      darkTiles.addTo(map);

      // Custom Zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Click on map to test safety at any coordinate
      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickedPoint: GeoPoint = {
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
        };
        setUserCustomLocation(clickedPoint);
      });

      const layerGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map instance mounted
    };
  }, []);

  // Update map center when user location moves significantly
  const prevLocRef = useRef<GeoPoint>(userLocation);
  useEffect(() => {
    if (mapInstanceRef.current) {
      const dist = Math.abs(prevLocRef.current.lat - userLocation.lat) + Math.abs(prevLocRef.current.lng - userLocation.lng);
      if (dist > 0.05) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
        prevLocRef.current = userLocation;
      }
    }
  }, [userLocation]);

  // Render all active layers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const group = layersGroupRef.current;
    group.clearLayers();

    // 1. HAZARD / DISASTER ZONES
    if (showHazardZones && disasterZones) {
      disasterZones.forEach((zone) => {
        const radiusMeters = zone.radiusKm * 1000;
        let color = '#ef4444'; // Red (Critical)
        let fillColor = '#ef4444';
        let fillOpacity = 0.22;

        if (zone.dangerLevel === 'DANGER') {
          color = '#f97316';
          fillColor = '#f97316';
          fillOpacity = 0.18;
        } else if (zone.dangerLevel === 'WARNING') {
          color = '#eab308';
          fillColor = '#eab308';
          fillOpacity = 0.14;
        } else if (zone.dangerLevel === 'SAFE') {
          color = '#10b981';
          fillColor = '#10b981';
          fillOpacity = 0.12;
        }

        const circle = L.circle([zone.center.lat, zone.center.lng], {
          radius: radiusMeters,
          color,
          weight: 2,
          opacity: 0.85,
          fillColor,
          fillOpacity,
          dashArray: zone.dangerLevel === 'WARNING' ? '6, 6' : undefined,
        });

        circle.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-weight: 800; font-size: 13px; color: ${color};">${zone.dangerLevel} HAZARD ZONE</span>
              <span style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${zone.type}</span>
            </div>
            <p style="font-weight: 700; font-size: 12px; margin-bottom: 4px; color: #fff;">${zone.name}</p>
            <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px;">${zone.description}</p>
            <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
              Radius: <b>${zone.radiusKm} km</b> • Affected Pop: <b>${zone.affectedPopulation?.toLocaleString() || 'N/A'}</b>
            </div>
          </div>
        `);

        group.addLayer(circle);
      });
    }

    // 2. SHELTERS (Green / Amber / Red status icons)
    if (showShelters && shelters) {
      shelters.forEach((shelter) => {
        const isSafe = shelter.safetyScore >= 80;
        const isNearCap = shelter.status === 'NEAR_CAPACITY';
        const isFull = shelter.status === 'FULL' || shelter.status === 'CLOSED';

        const statusColor = isFull ? '#ef4444' : isNearCap ? '#f59e0b' : '#10b981';
        const occupancyPercent = Math.round((shelter.currentOccupancy / (shelter.maxCapacity || 1)) * 100);

        const shelterIcon = L.divIcon({
          className: 'custom-shelter-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: #0f172a;
              border: 2px solid ${statusColor};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 10px ${statusColor}66;
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              🏠
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([shelter.location.lat, shelter.location.lng], { icon: shelterIcon });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 700; font-size: 12px; color: ${statusColor};">STATUS: ${shelter.status}</span>
              <span style="font-size: 11px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">Safety ${shelter.safetyScore}%</span>
            </div>
            <h4 style="font-weight: 800; font-size: 13px; color: #fff; margin-bottom: 4px;">${shelter.name}</h4>
            <p style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">${shelter.address}</p>
            
            <div style="margin-bottom: 8px; background: rgba(15, 23, 42, 0.8); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>Occupancy:</span>
                <b>${shelter.currentOccupancy} / ${shelter.maxCapacity} (${occupancyPercent}%)</b>
              </div>
              <div style="width: 100%; height: 5px; background: #334155; border-radius: 3px; overflow: hidden;">
                <div style="width: ${occupancyPercent}%; height: 100%; background: ${statusColor};"></div>
              </div>
              <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                Available Beds: <b>${shelter.availableCapacity}</b>
              </div>
            </div>

            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">
              Provisions: ${shelter.resources.water ? '💧 Water ' : ''}${shelter.resources.food ? '🍱 Food ' : ''}${shelter.resources.medical ? '💊 Med' : ''}
            </div>

            <button id="popup-route-btn-${shelter.id}" style="
              width: 100%;
              padding: 6px;
              background: linear-gradient(135deg, #06b6d4, #2563eb);
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 700;
              font-size: 11px;
              cursor: pointer;
            ">
              🧭 GET SAFE EVACUATION ROUTE
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-route-btn-${shelter.id}`);
          if (btn) {
            btn.onclick = () => {
              startNavigationToShelter(shelter);
              marker.closePopup();
            };
          }
        });

        group.addLayer(marker);
      });
    }

    // 3. EMERGENCY SERVICES (Hospitals, Police, Fire, Ambulance)
    if (showEmergencyServices && emergencyServices) {
      emergencyServices.forEach((svc) => {
        let iconSymbol = '✚';
        let borderColor = '#ef4444';
        let bgColor = '#1e1b4b';

        if (svc.type === 'POLICE') {
          iconSymbol = '👮';
          borderColor = '#3b82f6';
          bgColor = '#0f172a';
        } else if (svc.type === 'FIRE') {
          iconSymbol = '🚒';
          borderColor = '#f97316';
          bgColor = '#29140a';
        } else if (svc.type === 'AMBULANCE') {
          iconSymbol = '🚑';
          borderColor = '#10b981';
          bgColor = '#06281e';
        } else {
          iconSymbol = '✚';
          borderColor = '#ef4444';
          bgColor = '#280c12';
        }

        const svcIcon = L.divIcon({
          className: 'custom-svc-marker',
          html: `
            <div style="
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background: ${bgColor};
              border: 2px solid ${borderColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 0 8px ${borderColor}88;
            ">
              ${iconSymbol}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([svc.location.lat, svc.location.lng], { icon: svcIcon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px;">
            <span style="font-size: 10px; font-weight: 700; color: ${borderColor};">${svc.type} FACILITY</span>
            <h4 style="font-weight: 800; font-size: 12px; color: #fff; margin: 2px 0 4px 0;">${svc.name}</h4>
            <p style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${svc.address}</p>
            <p style="font-size: 11px; color: #38bdf8;">Status: <b>${svc.status}</b></p>
            <p style="font-size: 11px; color: #e2e8f0; margin-top: 4px;">Phone: <b>${svc.phone}</b></p>
          </div>
        `);

        group.addLayer(marker);
      });
    }

    // 4. RESCUE TEAMS (Active units)
    if (showRescueTeams && rescueTeams) {
      rescueTeams.forEach((team) => {
        const teamIcon = L.divIcon({
          className: 'custom-rescue-team-marker',
          html: `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: #3b0764;
              border: 2px solid #c084fc;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
              box-shadow: 0 0 12px rgba(192, 132, 252, 0.6);
            ">
              <span style="position: absolute; top: -6px; right: -6px; width: 10px; height: 10px; border-radius: 50%; background: #a855f7; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              🚤
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([team.currentLocation.lat, team.currentLocation.lng], { icon: teamIcon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 190px;">
            <span style="font-size: 10px; font-weight: 700; color: #c084fc;">RESCUE TASKFORCE</span>
            <h4 style="font-weight: 800; font-size: 13px; color: #fff; margin: 2px 0;">${team.name}</h4>
            <p style="font-size: 11px; color: #e2e8f0;">Vehicle: <b>${team.vehicleType}</b></p>
            <p style="font-size: 11px; color: #a855f7; margin-top: 4px;">Status: <b>${team.status}</b></p>
            ${team.currentTaskDescription ? `<p style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Mission: ${team.currentTaskDescription}</p>` : ''}
          </div>
        `);

        group.addLayer(marker);

        // If team has route path
        if (team.routePath && team.routePath.length > 1) {
          const latLngs = team.routePath.map((pt) => [pt.lat, pt.lng] as [number, number]);
          const pathLine = L.polyline(latLngs, {
            color: '#c084fc',
            weight: 3,
            dashArray: '5, 8',
            opacity: 0.8,
          });
          group.addLayer(pathLine);
        }
      });
    }

    // 5. EVACUATION ROUTE (Clean, Ultra-Visible Evacuation Path to Safety)
    if (showEvacuationRoute && activeEvacuationRoute && activeEvacuationRoute.waypoints.length > 1) {
      const latLngs = activeEvacuationRoute.waypoints.map((pt) => [pt.lat, pt.lng] as [number, number]);

      // Soft ambient blue-cyan guidance glow
      const glowLine = L.polyline(latLngs, {
        color: '#2563eb',
        weight: 12,
        opacity: 0.3,
      });

      // Sharp directional guidance route
      const routeLine = L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 5,
        opacity: 1,
        dashArray: '10, 8',
      });

      group.addLayer(glowLine);
      group.addLayer(routeLine);

      // Safe shelter destination beacon pin
      const destPoint = latLngs[latLngs.length - 1];
      const destIcon = L.divIcon({
        className: 'dest-shelter-pin',
        html: `
          <div style="
            background: #10b981;
            color: #0f172a;
            border: 2px solid #ffffff;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
            box-shadow: 0 0 16px rgba(16, 185, 129, 0.8);
          ">
            ✓
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const destMarker = L.marker(destPoint, { icon: destIcon });
      destMarker.bindPopup(`<b>Destination Safe Shelter:</b><br/>${activeEvacuationRoute.destinationShelter.name}`);
      group.addLayer(destMarker);
    }

    // 6. USER LOCATION PULSING MARKER (Blue beacon)
    const userMarkerIcon = L.divIcon({
      className: 'user-pulsing-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(56, 189, 248, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 14px #38bdf8;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userMarkerIcon,
      zIndexOffset: 1000,
    });

    userMarker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 200px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8;">YOU ARE HERE</span>
          <span style="font-size: 10px; background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 3px;">LIVE GPS</span>
        </div>
        <p style="font-weight: 700; font-size: 12px; color: #fff; margin-bottom: 4px;">${userAddress}</p>
        <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px;">
          Danger Level: <b style="color: ${safetyAnalysis.dangerLevel === 'CRITICAL' ? '#ef4444' : safetyAnalysis.dangerLevel === 'DANGER' ? '#f97316' : '#10b981'};">${safetyAnalysis.dangerLevel}</b> (Risk Score: <b>${safetyAnalysis.riskScore}/100</b>)
        </div>
        <p style="font-size: 10px; color: #94a3b8;">Click anywhere on the map to relocate or inspect hazard zones.</p>
      </div>
    `);

    group.addLayer(userMarker);
  }, [
    userLocation,
    userAddress,
    safetyAnalysis,
    disasterZones,
    shelters,
    emergencyServices,
    reliefResources,
    rescueTeams,
    activeEvacuationRoute,
    showHazardZones,
    showShelters,
    showEmergencyServices,
    showResources,
    showRescueTeams,
    showEvacuationRoute,
    startNavigationToShelter,
  ]);

  const handleLocateMe = () => {
    requestCurrentLocation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    }
  };

  const handleCenterEpicenter = () => {
    if (mapInstanceRef.current && simulationState.epicenter) {
      mapInstanceRef.current.setView([simulationState.epicenter.lat, simulationState.epicenter.lng], 13, {
        animate: true,
      });
    }
  };

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen bg-[#070d18]' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Map Floating Telemetry HUD */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-mono-tech border border-cyan-500/30 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-beacon"></span>
          <span className="text-white font-bold">LIVE DISASTER RADAR</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
          </span>
        </div>

        {activeEvacuationRoute && (
          <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs border border-emerald-500/40 text-emerald-300 font-semibold shadow-lg">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              ROUTE ACTIVE: {activeEvacuationRoute.destinationShelter.name} ({activeEvacuationRoute.distanceKm} km, ~
              {activeEvacuationRoute.estimatedMinutes}m)
            </span>
          </div>
        )}
      </div>

      {/* Right Control Bar */}
      <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 pointer-events-auto">
        <button
          onClick={handleLocateMe}
          title="Locate My Position"
          className="p-2.5 rounded-lg glass-panel hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-lg transition-all active:scale-95"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        <button
          onClick={handleCenterEpicenter}
          title="Center on Disaster Epicenter"
          className="p-2.5 rounded-lg glass-panel hover:bg-slate-800 text-amber-400 border border-amber-500/40 shadow-lg transition-all active:scale-95"
        >
          <Compass className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          title="Toggle Layers & Legend"
          className={`p-2.5 rounded-lg glass-panel text-slate-200 border border-slate-700 shadow-lg transition-all active:scale-95 ${
            isLegendOpen ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'hover:bg-slate-800'
          }`}
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          className="p-2.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-lg transition-all active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Layer Filter and Legend Drawer */}
      {isLegendOpen && (
        <div className="absolute bottom-6 left-3 z-10 w-72 max-h-[75vh] overflow-y-auto glass-panel p-3.5 rounded-xl border border-cyan-500/30 text-xs shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-display font-bold text-slate-100 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>MAP LAYERS & LEGEND</span>
            </span>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Layer Toggles */}
          <div className="space-y-1.5 mb-3 font-medium">
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
              <span className="flex items-center space-x-2 text-slate-200">
                <span className="w-3 h-3 rounded-full bg-red-500/60 border border-red-400"></span>
                <span>Hazard Danger Zones</span>
              </span>
              <input
                type="checkbox"
                checked={showHazardZones}
                onChange={(e) => setShowHazardZones(e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
              <span className="flex items-center space-x-2 text-slate-200">
                <span>🏠</span>
                <span>Safe Shelters ({shelters.length})</span>
              </span>
              <input
                type="checkbox"
                checked={showShelters}
                onChange={(e) => setShowShelters(e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
              <span className="flex items-center space-x-2 text-slate-200">
                <span>✚ / 👮 / 🚒</span>
                <span>Emergency Services</span>
              </span>
              <input
                type="checkbox"
                checked={showEmergencyServices}
                onChange={(e) => setShowEmergencyServices(e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
              <span className="flex items-center space-x-2 text-slate-200">
                <span>🚤</span>
                <span>Rescue Teams ({rescueTeams.length})</span>
              </span>
              <input
                type="checkbox"
                checked={showRescueTeams}
                onChange={(e) => setShowRescueTeams(e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
              <span className="flex items-center space-x-2 text-slate-200">
                <span className="w-3.5 h-1 bg-cyan-400 rounded"></span>
                <span>Safe Evacuation Route</span>
              </span>
              <input
                type="checkbox"
                checked={showEvacuationRoute}
                onChange={(e) => setShowEvacuationRoute(e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Legend Symbols */}
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Hazard Legend</div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-600"></span>
                <span>Critical Zone</span>
              </span>
              <span className="text-red-400 font-mono-tech">Evacuate Now</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-orange-500"></span>
                <span>Danger Zone</span>
              </span>
              <span className="text-orange-400 font-mono-tech">High Inundation</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500"></span>
                <span>Warning Area</span>
              </span>
              <span className="text-yellow-400 font-mono-tech">High Runoff</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white"></span>
                <span>Citizen Location</span>
              </span>
              <span className="text-cyan-300 font-mono-tech">Pulsing GPS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

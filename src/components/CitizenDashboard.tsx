import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  LifeBuoy,
  Radio,
  ExternalLink,
  Shield,
  Activity,
  Sliders,
  Flame,
  AlertTriangle,
  Box,
  Layers,
  HeartPulse,
  PhoneCall,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { GeoPoint, Shelter } from '../types';

interface CitizenDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ setActiveTab }) => {
  const {
    userLocation,
    userAddress,
    gpsAccuracyMeters,
    safetyAnalysis,
    recommendedShelter,
    shelters,
    disasterZones,
    alerts,
    requestCurrentLocation,
    setUserCustomLocation,
    startNavigationToShelter,
    setIsSOSModalOpen,
  } = useDisaster();

  const [customAddressInput, setCustomAddressInput] = useState('');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Preset location testing
  const presetLocations = [
    {
      name: 'Triplicane / Marina Beach (Inundated Red Zone)',
      coords: { lat: 13.0768, lng: 80.2742 },
      riskLabel: 'HIGH RISK',
      riskClass: 'text-red-400 border-red-500/40 bg-red-950/40',
    },
    {
      name: 'Anna Nagar West (High Ground Safe Zone)',
      coords: { lat: 13.085, lng: 80.21 },
      riskLabel: 'SAFE ZONE',
      riskClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    },
    {
      name: 'Egmore Marshalls Road (Runoff Alert)',
      coords: { lat: 13.083, lng: 80.252 },
      riskLabel: 'WARNING',
      riskClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    },
  ];

  const handleApplyCustomCoords = (coords: GeoPoint, name: string) => {
    setUserCustomLocation(coords, name);
    setIsLocationPickerOpen(false);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddressInput.trim()) return;

    const parts = customAddressInput.split(',');
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      const lat = Number(parts[0].trim());
      const lng = Number(parts[1].trim());
      setUserCustomLocation({ lat, lng }, `Coordinates (${lat}, ${lng})`);
    } else {
      setUserCustomLocation(
        { lat: 13.0827 + (Math.random() - 0.5) * 0.04, lng: 80.2707 + (Math.random() - 0.5) * 0.04 },
        customAddressInput
      );
    }
    setCustomAddressInput('');
    setIsLocationPickerOpen(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. App Section Navigation Hub (Map, EOC, News Map, Shelters, Simulation) */}
      <div className="p-4 rounded-2xl bg-[#0b121e]/90 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Disaster Management Command Sections
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono-tech">
            DIRECT ACCESS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Section: Live Hazard Map */}
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left group shadow-lg cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                Live Hazard Map
              </div>
              <div className="text-[10px] text-slate-400">
                Evacuation Routes & Radar
              </div>
            </div>
          </button>

          {/* Section: EOC Command Center */}
          <button
            onClick={() => setActiveTab('command-center')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-purple-500/30 hover:border-purple-400 transition-all text-left group shadow-lg cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-purple-300 transition-colors">
                EOC Command
              </div>
              <div className="text-[10px] text-slate-400">
                Incident Response HQ
              </div>
            </div>
          </button>

          {/* Section: News Disaster Color Map */}
          <button
            onClick={() => setActiveTab('news-map')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-red-500/30 hover:border-red-400 transition-all text-left group shadow-lg cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-red-300 transition-colors">
                News Disaster Map
              </div>
              <div className="text-[10px] text-slate-400">
                Weather Color Zones
              </div>
            </div>
          </button>

          {/* Section: Safe Shelters */}
          <button
            onClick={() => setActiveTab('shelters')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400 transition-all text-left group shadow-lg cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                Safe Shelters
              </div>
              <div className="text-[10px] text-slate-400">
                Available Capacity & Beds
              </div>
            </div>
          </button>

          {/* Section: Simulation Lab */}
          <button
            onClick={() => setActiveTab('simulation')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 transition-all text-left group shadow-lg cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                Simulation Lab
              </div>
              <div className="text-[10px] text-slate-400">
                Test Flood & Cyclone Scenarios
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Focused Clean Citizen Safety Dashboard (Map removed from here, accessible via the Command Sections above) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Safety Assessment, Evacuation Guidance, Warnings */}
        <div className="lg:col-span-7 space-y-5">
          {/* Designated Safe Haven Recommendation Card */}
          {recommendedShelter && (
            <div className="p-5 bg-[#0b121e]/90 border border-emerald-500/30 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Recommended Safe Shelter Haven
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono-tech font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  SAFE HIGH GROUND
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-base font-black text-white">{recommendedShelter.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{recommendedShelter.address}</p>
                  <div className="text-xs text-emerald-400 font-mono-tech mt-1.5 flex items-center gap-3">
                    <span>📍 {recommendedShelter.distanceKm} km away</span>
                    <span>🚶 ~{recommendedShelter.estimatedTravelTimeMin} min safe walk</span>
                    <span>🛏️ {recommendedShelter.availableBeds} beds open</span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => {
                      startNavigationToShelter(recommendedShelter);
                      setActiveTab('map');
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>GET ROUTE ON MAP</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('shelters')}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer text-center"
                  >
                    All Shelters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Active Hazard Advisories */}
          <div className="p-5 bg-[#0b121e]/90 border border-white/10 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Zone Warnings & Bulletins ({alerts.length})
              </span>
              <button
                onClick={() => setActiveTab('news-map')}
                className="text-[11px] text-red-400 hover:underline font-bold"
              >
                Inspect on Color Map →
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-950/30 border-red-500/30 text-red-200'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-blue-950/30 border-blue-500/30 text-blue-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{alert.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">{alert.message}</p>
                  </div>
                  <span className="text-[9px] font-mono-tech font-bold px-2 py-0.5 rounded bg-black/40 whitespace-nowrap">
                    {alert.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Location Detection, Emergency SOS, Direct Helplines */}
        <div className="lg:col-span-5 space-y-5">
          {/* Location Detection & Testing Card */}
          <div className="bg-[#0b121e]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-sm space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Your Position
              </span>
              <span className="text-[10px] text-slate-400 font-mono-tech">
                ±{gpsAccuracyMeters}m Accuracy
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold text-white leading-tight">
                {userAddress}
              </div>
              <div className="text-xs text-slate-400 font-mono-tech">
                {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                onClick={requestCurrentLocation}
                className="flex-1 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Update GPS</span>
              </button>
              <button
                onClick={() => setIsLocationPickerOpen(!isLocationPickerOpen)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isLocationPickerOpen ? 'Close Test' : 'Test Sectors'}
              </button>
            </div>

            {/* Test Sectors Drawer */}
            {isLocationPickerOpen && (
              <div className="p-3 rounded-xl bg-[#060a12] border border-white/10 space-y-2 mt-2">
                <form onSubmit={handleManualSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter area name..."
                    value={customAddressInput}
                    onChange={(e) => setCustomAddressInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 cursor-pointer"
                  >
                    Go
                  </button>
                </form>

                <div className="space-y-1 pt-1">
                  {presetLocations.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyCustomCoords(p.coords, p.name)}
                      className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs transition-all cursor-pointer"
                    >
                      <span className="text-slate-200 truncate max-w-[170px]">{p.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono-tech font-bold border ${p.riskClass}`}>
                        {p.riskLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Big High-Priority Emergency SOS Card */}
          <div className="p-6 bg-gradient-to-b from-red-950/40 via-red-900/20 to-[#0b121e]/90 border-2 border-red-500/40 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md">
            <span className="text-[10px] uppercase font-mono-tech tracking-widest text-red-400 font-bold mb-3">
              EMERGENCY SOS TRANSMISSION
            </span>
            <button
              onClick={() => setIsSOSModalOpen(true)}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-700 hover:from-red-400 hover:to-rose-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_35px_rgba(239,68,68,0.6)] border-4 border-red-400/50 active:scale-95 cursor-pointer transition-all"
            >
              SOS
            </button>
            <span className="mt-3 text-sm font-extrabold text-white">
              Broadcast Emergency Distress
            </span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[260px]">
              Sends your exact GPS location to emergency triage & nearest rescue team.
            </p>
          </div>

          {/* Quick 24/7 Helplines */}
          <div className="bg-[#0b121e]/90 border border-white/10 rounded-2xl p-5 space-y-2.5 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Emergency Helplines
              </span>
              <span className="text-[9px] text-emerald-400 font-mono-tech">
                TOLL-FREE 24/7
              </span>
            </div>

            <a
              href="tel:108"
              className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🚑</span>
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-white">Ambulance & Trauma</div>
                  <div className="text-[10px] text-slate-400">Dial 108</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono-tech font-bold">
                108
              </span>
            </a>

            <a
              href="tel:101"
              className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🚒</span>
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-white">Fire & Rescue Force</div>
                  <div className="text-[10px] text-slate-400">Dial 101</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-mono-tech font-bold">
                101
              </span>
            </a>

            <a
              href="tel:100"
              className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🚓</span>
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-white">Police Central Control</div>
                  <div className="text-[10px] text-slate-400">Dial 100</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-mono-tech font-bold">
                100
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

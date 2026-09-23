import React from 'react';
import {
  ShieldAlert,
  MapPin,
  LifeBuoy,
  Radio,
  ArrowRight,
  Zap,
  Activity,
  Box,
  Truck,
  HeartHandshake,
  AlertTriangle,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

interface HeroLandingProps {
  setActiveTab: (tab: string) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ setActiveTab }) => {
  const {
    requestCurrentLocation,
    findSafestPlace,
    setIsSOSModalOpen,
    safetyAnalysis,
    dashboardStats,
    simulationState,
  } = useDisaster();

  const handleCheckSafety = async () => {
    await requestCurrentLocation();
    setActiveTab('dashboard');
  };

  const handleOpenMap = () => {
    setActiveTab('map');
  };

  const handleSafestPlace = () => {
    findSafestPlace();
    setActiveTab('shelters');
  };

  return (
    <div className="relative min-h-[calc(100vh-6.5rem)] flex flex-col justify-between overflow-hidden bg-[#05070a]">
      {/* Background Subtle Radar & Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
      
      {/* Radar sweep glow circle */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-red-500/10 pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-red-500/15 animate-ping-slow"></div>
        <div className="absolute inset-16 rounded-full border border-white/5"></div>
        <div className="absolute inset-36 rounded-full border border-blue-500/10"></div>
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 origin-top-left bg-gradient-to-br from-red-500/5 to-transparent animate-radar rounded-tl-full"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 flex-1 flex flex-col justify-center">
        {/* Top Operational Status Pill */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono-tech backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">DISASTER DEFENSE NET READY</span>
            <span className="text-white/10">•</span>
            <span className="text-slate-400">AUTONOMOUS RISK ENGINE</span>
          </div>
        </div>

        {/* Headlines */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-400/40">
              <div className="w-5 h-5 border-2 border-white rotate-45"></div>
            </div>
            <h1 className="font-sans font-black text-4xl sm:text-6xl tracking-tighter text-white uppercase">
              DISASTERGUARD <span className="text-red-500">AI</span>
            </h1>
          </div>

          <p className="font-sans font-bold text-xl sm:text-2xl text-slate-200 tracking-tight">
            “Know the danger. Find safety. Get help.”
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real-time geospatial hazard intelligence linking citizens, emergency responders, safe shelters,
            and critical relief supplies during crisis events.
          </p>
        </div>

        {/* Primary Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            id="hero-check-safety-btn"
            onClick={handleCheckSafety}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wider active:scale-95 transition-all shadow-[0_4px_20px_rgba(220,38,38,0.4)] border border-red-400/40"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>CHECK MY SAFETY</span>
          </button>

          <button
            id="hero-open-map-btn"
            onClick={handleOpenMap}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wider active:scale-95 transition-all shadow-lg shadow-blue-600/30 border border-blue-400/40"
          >
            <MapPin className="w-5 h-5" />
            <span>OPEN LIVE MAP</span>
          </button>

          <button
            id="hero-sos-btn"
            onClick={() => setIsSOSModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 font-bold text-sm tracking-wider active:scale-95 transition-all border border-red-500/30"
          >
            <Radio className="w-5 h-5 text-red-400" />
            <span>EMERGENCY SOS</span>
          </button>
        </div>

        {/* Key Quick Telemetry Stats */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-sm">
            <span className="text-[10px] font-mono-tech text-slate-500 block uppercase font-bold">Active Incidents</span>
            <span className="text-xl font-black font-mono-tech text-amber-400">{dashboardStats.activeIncidents}</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-sm">
            <span className="text-[10px] font-mono-tech text-slate-500 block uppercase font-bold">People at Risk</span>
            <span className="text-xl font-black font-mono-tech text-red-400">{dashboardStats.peopleAtRisk.toLocaleString()}</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-sm">
            <span className="text-[10px] font-mono-tech text-slate-500 block uppercase font-bold">Safe Citizens</span>
            <span className="text-xl font-black font-mono-tech text-emerald-400">{dashboardStats.safeCitizens.toLocaleString()}</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-sm">
            <span className="text-[10px] font-mono-tech text-slate-500 block uppercase font-bold">Open Shelters</span>
            <span className="text-xl font-black font-mono-tech text-blue-400">{dashboardStats.openShelters}</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-sm">
            <span className="text-[10px] font-mono-tech text-slate-500 block uppercase font-bold">Rescue Units</span>
            <span className="text-xl font-black font-mono-tech text-purple-400">{dashboardStats.rescueTeamsActive} Active</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-sm">
            <span className="text-[10px] font-mono-tech text-slate-500 block uppercase font-bold">Telemetry</span>
            <span className="text-xs font-bold font-mono-tech text-emerald-400 flex items-center justify-center space-x-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE FEED</span>
            </span>
          </div>
        </div>

        {/* Interactive Response Flow Visual */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider">
                Autonomous Disaster Intelligence Lifecycle
              </span>
            </div>
            <span className="text-[9px] font-mono-tech text-slate-500 uppercase tracking-widest hidden sm:inline">
              REAL-TIME ADAPTIVE RESILIENCE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="w-6 h-6 mx-auto mb-1.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <p className="font-bold text-xs text-white">CITIZEN GPS</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Continuous position acquisition</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="w-6 h-6 mx-auto mb-1.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <p className="font-bold text-xs text-red-400">RISK DETECTION</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Dynamic 0-100 hazard score</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="w-6 h-6 mx-auto mb-1.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <p className="font-bold text-xs text-emerald-400">SAFE ROUTE</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Hazard bypass navigation</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="w-6 h-6 mx-auto mb-1.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <p className="font-bold text-xs text-blue-400">SHELTER MATCH</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Capacity & proximity ranking</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="w-6 h-6 mx-auto mb-1.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <p className="font-bold text-xs text-amber-400">RESOURCES</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Water, ration, medicine triage</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="w-6 h-6 mx-auto mb-1.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <p className="font-bold text-xs text-purple-400">RESCUE OPS</p>
              <p className="text-[9px] text-slate-400 mt-0.5">EOC emergency dispatch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice Footer Strip */}
      <div className="relative z-10 w-full bg-[#040811] border-t border-slate-800/80 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono-tech gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50 text-[10px] font-bold">
              DEMO DATA NOTICE
            </span>
            <span>Simulated disaster models active for demonstration & testing.</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('simulation')} className="text-cyan-400 hover:underline">
              Launch Simulation Lab →
            </button>
            <button onClick={() => setActiveTab('command-center')} className="text-purple-400 hover:underline">
              EOC Command Center →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  Box,
  Truck,
  HeartPulse,
  Radio,
  LifeBuoy,
  Flame,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Clock,
  Send,
  Navigation,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { LiveDisasterMap } from './LiveDisasterMap';

interface CommandCenterViewProps {
  setActiveTab: (tab: string) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({ setActiveTab }) => {
  const {
    dashboardStats,
    victims,
    shelters,
    rescueTeams,
    reliefResources,
    simulationState,
    assignRescueTeamToVictim,
    updateVictimStatus,
  } = useDisaster();

  const criticalVictims = victims.filter((v) => v.priority === 'CRITICAL' && v.status === 'WAITING');
  const availableRescueTeams = rescueTeams.filter((t) => t.status === 'STANDBY' || t.status === 'ACTIVE');

  // AI Operations Suggestions
  const aiTacticalRecommendations = [
    {
      id: 'rec-1',
      title: 'Deploy Boat Taskforce Alpha to Triplicane Pocket',
      reason: 'Water level rising +18cm/hr with 3 elderly victims trapped on ground floors.',
      urgency: 'HIGH',
      actionLabel: 'DISPATCH BOAT ALPHA',
      onAction: () => {
        if (criticalVictims.length > 0 && availableRescueTeams.length > 0) {
          assignRescueTeamToVictim(criticalVictims[0].id, availableRescueTeams[0].id);
        } else {
          alert('Taskforce Alpha dispatched to Triplicane sector.');
        }
      },
    },
    {
      id: 'rec-2',
      title: 'Divert Evacuees from Anna Nagar (85% Capacity) to Koyambedu Hub',
      reason: 'Anna Nagar is nearing critical capacity (68/80 beds filled).',
      urgency: 'MEDIUM',
      actionLabel: 'DIVERT TRAFFIC',
      onAction: () => alert('Rerouting broadcast dispatched to area citizens.'),
    },
    {
      id: 'rec-3',
      title: 'Mobilize 500 Water Rations & Trauma Kits to Egmore Relief Center',
      reason: 'Projected demand will exceed remaining buffer in next 2 hours.',
      urgency: 'MEDIUM',
      actionLabel: 'DISPATCH CONVOY',
      onAction: () => setActiveTab('resource-allocation'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/40 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-[#0a1224] to-slate-950">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-beacon"></span>
            <span className="font-bold">EOC LEVEL-1 CRISIS PROTOCOL ACTIVE</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">DISASTERGUARD AI COMMAND MATRIX</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
            Emergency Operations Command Center
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl mt-1">
            Unified multi-agency incident dashboard for civil defense, emergency services, NDMA teams, and relief
            logistics coordination.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-display font-bold text-xs tracking-wider border border-white/20 shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>← BACK TO DASHBOARD</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className="px-4 py-2.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-display font-bold text-xs tracking-wider shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>SIMULATION LAB</span>
          </button>

          <button
            onClick={() => setActiveTab('victims')}
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs tracking-wider shadow-lg shadow-red-900/40 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <HeartPulse className="w-4 h-4" />
            <span>TRIAGE ({criticalVictims.length})</span>
          </button>
        </div>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-950/20">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="text-[10px] font-mono-tech uppercase font-bold">Active Incidents</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black font-mono-tech text-white">{dashboardStats.activeIncidents}</span>
          <span className="text-[10px] text-red-300 block mt-0.5">High severity zones</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-orange-500/30 bg-orange-950/20">
          <div className="flex items-center justify-between text-orange-400 mb-1">
            <span className="text-[10px] font-mono-tech uppercase font-bold">People At Risk</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black font-mono-tech text-white">
            {dashboardStats.peopleAtRisk.toLocaleString()}
          </span>
          <span className="text-[10px] text-orange-300 block mt-0.5">In flood / danger zones</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[10px] font-mono-tech uppercase font-bold">Safe Evacuees</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black font-mono-tech text-white">
            {dashboardStats.safeCitizens.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-300 block mt-0.5">Moved to safe shelter</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-mono-tech uppercase font-bold">Open Shelters</span>
            <LifeBuoy className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black font-mono-tech text-white">{dashboardStats.openShelters}</span>
          <span className="text-[10px] text-cyan-300 block mt-0.5">
            {dashboardStats.availableBeds} beds available
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-purple-950/20">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-[10px] font-mono-tech uppercase font-bold">Rescue Units</span>
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black font-mono-tech text-white">{dashboardStats.rescueTeamsActive}</span>
          <span className="text-[10px] text-purple-300 block mt-0.5">Boats, helis & teams</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-blue-500/30 bg-blue-950/20">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[10px] font-mono-tech uppercase font-bold">Critical Victims</span>
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black font-mono-tech text-white">{criticalVictims.length}</span>
          <span className="text-[10px] text-rose-300 block mt-0.5">Pending rescue dispatch</span>
        </div>
      </div>

      {/* Main Grid: Operational Map & Tactical AI Operations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Operations Tactical Map (8 Cols) */}
        <div className="lg:col-span-8 rounded-xl overflow-hidden glass-panel border border-cyan-500/30 shadow-2xl flex flex-col">
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-beacon"></span>
              <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                Geospatial Tactical Operations Map
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono-tech text-slate-400">
              <span>ACTIVE LAYERS: ALL</span>
              <button
                onClick={() => setActiveTab('map')}
                className="text-cyan-400 hover:text-cyan-300 ml-2"
              >
                Expand View →
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[440px]">
            <LiveDisasterMap isEmbedded={true} height="440px" showTeamsDefault={true} />
          </div>
        </div>

        {/* AI Tactical Recommendations & Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* AI Decision Support */}
          <div className="p-5 rounded-xl glass-panel border border-purple-500/40 shadow-xl space-y-3 bg-purple-950/10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-purple-300">
                <Cpu className="w-4 h-4" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider">
                  AI Incident Commander Advisor
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded border border-purple-700">
                GEMINI TACTICAL
              </span>
            </div>

            <div className="space-y-2.5">
              {aiTacticalRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-slate-900/90 border border-purple-500/20 space-y-2"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-white">{rec.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-tech font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">{rec.reason}</p>
                  <button
                    onClick={rec.onAction}
                    className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded text-[10px] font-display font-bold tracking-wider shadow active:scale-95 transition-all flex items-center justify-center space-x-1"
                  >
                    <span>{rec.actionLabel}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Subsystem Access Buttons */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono-tech text-slate-400 uppercase font-bold block mb-2">
              Operations Subsystems:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('victims')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-left flex items-center space-x-2"
              >
                <HeartPulse className="w-4 h-4 text-red-400" />
                <span>Victim Triage</span>
              </button>

              <button
                onClick={() => setActiveTab('resource-allocation')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-left flex items-center space-x-2"
              >
                <Box className="w-4 h-4 text-amber-400" />
                <span>Resource Alloc</span>
              </button>

              <button
                onClick={() => setActiveTab('shelter-admin')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-left flex items-center space-x-2"
              >
                <LifeBuoy className="w-4 h-4 text-cyan-400" />
                <span>Shelters ({shelters.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('rescue-ops')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-left flex items-center space-x-2"
              >
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Rescue Units</span>
              </button>

              <button
                onClick={() => setActiveTab('volunteers')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-left flex items-center space-x-2"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Volunteers</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-left flex items-center space-x-2"
              >
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Analytics & Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Victim Queue Quick Preview */}
      <div className="p-5 rounded-xl glass-panel border border-red-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-red-500" />
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wide">
              Critical Emergency Victim Triage Stream ({criticalVictims.length} Pending Immediate Rescue)
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('victims')}
            className="text-xs text-red-400 hover:underline flex items-center space-x-1"
          >
            <span>Open Full Triage Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {victims.slice(0, 3).map((v) => (
            <div
              key={v.id}
              className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono-tech text-cyan-400 font-bold">{v.id}</span>
                    <h4 className="font-bold text-sm text-white">{v.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold ${
                      v.priority === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {v.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{v.description}</p>
                <div className="text-[11px] text-slate-400 font-mono-tech">
                  Location: <span className="text-slate-200">{v.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono-tech">{v.timeElapsed} ago</span>
                <button
                  onClick={() => {
                    if (availableRescueTeams.length > 0) {
                      assignRescueTeamToVictim(v.id, availableRescueTeams[0].id);
                    } else {
                      updateVictimStatus(v.id, 'DISPATCHED');
                    }
                  }}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                >
                  DISPATCH TEAM
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

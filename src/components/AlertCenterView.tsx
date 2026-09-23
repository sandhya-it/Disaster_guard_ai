import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Radio,
  CheckCircle,
  Clock,
  Filter,
  ArrowRight,
  BellRing,
  Info,
  MapPin,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

interface AlertCenterViewProps {
  setActiveTab: (tab: string) => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({ setActiveTab }) => {
  const { alerts, safetyAnalysis, recommendedShelter, startNavigationToShelter } = useDisaster();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getAlertBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-tech bg-red-600/80 text-white border border-red-400 animate-pulse">
            🚨 CRITICAL EVACUATION
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-tech bg-amber-500/80 text-black border border-amber-300">
            ⚠️ HAZARD WARNING
          </span>
        );
      case 'SAFETY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-tech bg-emerald-600/80 text-white border border-emerald-400">
            🛡️ SAFETY BULLETIN
          </span>
        );
      case 'RESOURCE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-tech bg-blue-600/80 text-white border border-blue-400">
            📦 SUPPLY NOTICE
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-tech bg-slate-700 text-slate-300">
            ℹ️ SYSTEM INFO
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <BellRing className="w-4 h-4" />
            <span>NATIONAL EMERGENCY BROADCAST NETWORK</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Location-Based Emergency Bulletins & Advisories
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Official disaster warnings, road inundation reports, flash flood surges, and relief depot notifications
            dispatched in real time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="font-mono-tech text-xs font-bold text-red-400">BROADCAST ACTIVE</span>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'CRITICAL', 'WARNING', 'SAFETY', 'RESOURCE'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterSeverity(s)}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              filterSeverity === s
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-xl glass-panel border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl transition-all ${
                isCritical
                  ? 'border-red-500/60 bg-red-950/20'
                  : isWarning
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  {getAlertBadge(alert.severity)}
                  <span className="text-[11px] font-mono-tech text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </span>
                  {alert.distanceKm && (
                    <span className="text-[11px] font-mono-tech text-cyan-400 flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{alert.distanceKm} km from you</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white">{alert.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{alert.message}</p>
              </div>

              {/* Action button if applicable */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                {isCritical && recommendedShelter && (
                  <button
                    onClick={() => {
                      startNavigationToShelter(recommendedShelter);
                      setActiveTab('map');
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all"
                  >
                    <span>VIEW SAFE EVACUATION PATH</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {alert.severity === 'RESOURCE' && (
                  <button
                    onClick={() => setActiveTab('resources')}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-display font-bold text-xs tracking-wider shadow-md"
                  >
                    <span>CHECK INVENTORY</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

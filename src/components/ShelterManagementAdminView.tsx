import React, { useState } from 'react';
import {
  LifeBuoy,
  Building,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Droplets,
  Utensils,
  Pill,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { Shelter } from '../types';

export const ShelterManagementAdminView: React.FC = () => {
  const { shelters, updateShelterOccupancy } = useDisaster();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredShelters = shelters.filter((s) => {
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    return true;
  });

  const handleAdjustOccupancy = (shelter: Shelter, delta: number) => {
    const newOccupancy = Math.max(0, Math.min(shelter.maxCapacity, shelter.currentOccupancy + delta));
    updateShelterOccupancy(shelter.id, newOccupancy);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <Building className="w-4 h-4" />
            <span>FACILITY COMMAND & OCCUPANCY MONITORING</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Shelter & Evacuation Camp Management
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Real-time occupancy control with automated status derivation:{' '}
            <b className="text-emerald-400">OPEN (&lt;80%)</b>, <b className="text-amber-400">NEAR CAPACITY (80-99%)</b>,{' '}
            <b className="text-red-400">FULL (100%)</b>, or <b className="text-slate-400">CLOSED</b>.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        <span className="text-slate-400">Filter By Status:</span>
        {['ALL', 'OPEN', 'NEAR_CAPACITY', 'FULL', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterStatus === status
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Shelter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShelters.map((s) => {
          const occupancyPercent = Math.round((s.currentOccupancy / s.maxCapacity) * 100);

          const statusColor =
            s.status === 'OPEN'
              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
              : s.status === 'NEAR_CAPACITY'
              ? 'text-amber-400 bg-amber-950/60 border-amber-800'
              : s.status === 'FULL'
              ? 'text-red-400 bg-red-950/60 border-red-800'
              : 'text-slate-400 bg-slate-900 border-slate-800';

          return (
            <div
              key={s.id}
              className="p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono-tech text-cyan-400 font-bold block">{s.id}</span>
                    <h3 className="font-bold text-base text-white">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.address}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono-tech border ${statusColor}`}>
                    {s.status}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono-tech text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupancy Load:</span>
                    <span className="text-white font-bold">
                      {s.currentOccupancy} / {s.maxCapacity} ({occupancyPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyPercent >= 100
                          ? 'bg-red-500'
                          : occupancyPercent >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Available: {s.availableCapacity} Beds</span>
                    <span>Safety Index: {s.safetyScore}%</span>
                  </div>
                </div>

                {/* Live Occupancy Modifier Controls */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase font-bold block">
                    Update Field Occupancy:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono-tech">
                    <button
                      onClick={() => handleAdjustOccupancy(s, -10)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-bold"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleAdjustOccupancy(s, -1)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-bold"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleAdjustOccupancy(s, 1)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-bold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleAdjustOccupancy(s, 10)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-bold"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Facilities & Provisions */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                  {s.resources.water && (
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      💧 Water
                    </span>
                  )}
                  {s.resources.food && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      🍱 Food
                    </span>
                  )}
                  {s.resources.medical && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      💊 Medical
                    </span>
                  )}
                  {s.wheelchairAccessible && (
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      ♿ Accessible
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono-tech">
                <span>Manager Phone: {s.contactPhone}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Truck,
  LifeBuoy,
  MapPin,
  Clock,
  CheckCircle,
  Radio,
  Navigation,
  Activity,
  BatteryCharging,
  Fuel,
  Compass,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

export const RescueOperationsView: React.FC = () => {
  const { rescueTeams, victims } = useDisaster();
  const [filterVehicle, setFilterVehicle] = useState<string>('ALL');

  const filteredTeams = rescueTeams.filter((t) => {
    if (filterVehicle !== 'ALL' && !t.vehicleType.toLowerCase().includes(filterVehicle.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <Truck className="w-4 h-4 text-purple-400" />
            <span>NDMA & SEARCH-AND-RESCUE TASKFORCE TRACKER</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Live Rescue Unit Telemetry & Mission Tracking
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Live monitoring of amphibious rescue boats, search helicopters, rapid response 4x4 trucks, and paramedic
            units deployed in hazardous sectors.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        <span className="text-slate-400">Filter Unit Type:</span>
        {['ALL', 'BOAT', 'AMPHIBIOUS', 'AMBULANCE', 'HELICOPTER', 'SWIFT'].map((veh) => (
          <button
            key={veh}
            onClick={() => setFilterVehicle(veh)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterVehicle === veh
                ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {veh}
          </button>
        ))}
      </div>

      {/* Rescue Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const isActive = team.status === 'EN_ROUTE' || team.status === 'ON_SCENE';

          return (
            <div
              key={team.id}
              className={`p-5 rounded-xl glass-panel border flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                isActive ? 'border-purple-500/60 bg-purple-950/20' : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono-tech text-purple-400 font-bold block">{team.id}</span>
                    <h3 className="font-bold text-base text-white">{team.name}</h3>
                    <span className="text-xs text-slate-300 font-mono-tech">{team.vehicleType}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono-tech font-bold border ${
                      team.status === 'STANDBY'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : team.status === 'EN_ROUTE'
                        ? 'bg-purple-950 text-purple-300 border-purple-800 animate-pulse'
                        : 'bg-blue-950 text-blue-300 border-blue-800'
                    }`}
                  >
                    {team.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs font-mono-tech">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unit Personnel:</span>
                    <span className="text-white font-bold">{team.membersCount} Specialists</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Position Coordinates:</span>
                    <span className="text-cyan-300">
                      {team.currentLocation.lat.toFixed(4)}°N, {team.currentLocation.lng.toFixed(4)}°E
                    </span>
                  </div>
                  {team.estimatedArrivalMinutes && (
                    <div className="flex justify-between text-purple-300 font-bold">
                      <span>Target Mission ETA:</span>
                      <span>~{team.estimatedArrivalMinutes} Minutes</span>
                    </div>
                  )}
                  {team.currentTaskDescription && (
                    <div className="pt-1 border-t border-slate-800/80 text-slate-200">
                      Mission: <span className="text-purple-200">{team.currentTaskDescription}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={`tel:${team.contactRadioChannel}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold border border-slate-700 flex items-center space-x-1"
                >
                  <Radio className="w-3 h-3" />
                  <span>Radio: {team.contactRadioChannel}</span>
                </a>

                <button
                  onClick={() => alert(`Direct task instructions transmitted to commander of ${team.name}.`)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Transmit Order
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

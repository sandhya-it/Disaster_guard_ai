import React, { useState } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Clock,
  UserCheck,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Baby,
  Activity,
  Send,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { Victim } from '../types';

export const VictimManagementView: React.FC = () => {
  const { victims, rescueTeams, assignRescueTeamToVictim, updateVictimStatus, reportVictimNeed } = useDisaster();

  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddVictimModalOpen, setIsAddVictimModalOpen] = useState(false);

  // New victim form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [emergencyType, setEmergencyType] = useState('TRAPPED_WATER');
  const [description, setDescription] = useState('');
  const [hasElderly, setHasElderly] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasMedical, setHasMedical] = useState(false);

  const filteredVictims = victims.filter((v) => {
    if (filterPriority !== 'ALL' && v.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase()) && !v.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateVictim = async (e: React.FormEvent) => {
    e.preventDefault();
    await reportVictimNeed({
      name,
      contactPhone: phone,
      address,
      peopleCount,
      emergencyType,
      description,
      hasElderly,
      hasChildren,
      hasMedicalNeed: hasMedical,
      isTrapped: true,
      currentLocation: { lat: 13.0827, lng: 80.2707 },
    });
    setIsAddVictimModalOpen(false);
    // Reset
    setName('');
    setPhone('');
    setAddress('');
    setDescription('');
  };

  const getPriorityBadge = (priority: Victim['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono-tech bg-red-950 text-red-300 border border-red-800 animate-pulse">
            🚨 CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono-tech bg-orange-950 text-orange-300 border border-orange-800">
            ⚠️ HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono-tech bg-amber-950 text-amber-300 border border-amber-800">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono-tech bg-slate-800 text-slate-300 border border-slate-700">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-red-950 text-red-400 border border-red-800">AWAITING RESCUE</span>;
      case 'ASSIGNED':
      case 'DISPATCHED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-purple-950 text-purple-300 border border-purple-800">TEAM EN ROUTE</span>;
      case 'TRIAGED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-amber-950 text-amber-300 border border-amber-800">TRIAGED</span>;
      case 'RESCUED':
      case 'IN_SHELTER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-emerald-950 text-emerald-300 border border-emerald-800">SAFE IN SHELTER</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <HeartPulse className="w-4 h-4 text-red-500" />
            <span>INCIDENT TRIAGE & EVACUATION QUEUE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Priority Victim Management & Rescue Dispatch
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Dynamic prioritization scoring accounting for water level surge, entrapment, age demographics (infants,
            elderly), and urgent medical conditions.
          </p>
        </div>

        <button
          onClick={() => setIsAddVictimModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs tracking-wider shadow-lg shadow-red-900/40 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>LOG EMERGENCY INTAKE</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by victim name, phone, incident ID, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Priority:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded text-[11px] border transition-all ${
                  filterPriority === p
                    ? 'bg-red-500/20 text-red-300 border-red-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Status:</span>
            {['ALL', 'WAITING', 'DISPATCHED', 'RESCUED', 'IN_SHELTER'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded text-[11px] border transition-all ${
                  filterStatus === s
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Victims Triage Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVictims.map((v) => {
          const isCritical = v.priority === 'CRITICAL';
          const availableTeams = rescueTeams.filter((t) => t.status === 'STANDBY' || t.status === 'ACTIVE');

          return (
            <div
              key={v.id}
              className={`p-5 rounded-xl glass-panel flex flex-col justify-between space-y-4 border shadow-xl ${
                isCritical ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono-tech text-cyan-400 font-bold block">{v.id}</span>
                    <h3 className="font-bold text-base text-white">{v.name}</h3>
                    <span className="text-xs text-slate-400">{v.contactPhone}</span>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    {getPriorityBadge(v.priority)}
                    {getStatusBadge(v.status)}
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5">
                  {v.description}
                </p>

                <div className="text-xs text-slate-300 space-y-1 font-mono-tech">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{v.address}</span>
                  </div>

                  <div className="flex justify-between pt-1 text-[11px] text-slate-400">
                    <span>
                      People: <b className="text-white">{v.peopleCount}</b>
                    </span>
                    <span>
                      Wait Time: <b className="text-amber-400">{v.timeElapsed}</b>
                    </span>
                  </div>
                </div>

                {/* Demographic & Vulnerability Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {v.hasElderly && (
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px]">
                      👴 Elderly
                    </span>
                  )}
                  {v.hasChildren && (
                    <span className="px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800 text-[10px]">
                      👶 Infants/Kids
                    </span>
                  )}
                  {v.hasMedicalNeed && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                      ✚ Medical Triage
                    </span>
                  )}
                  {v.isTrapped && (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px]">
                      🚨 Trapped
                    </span>
                  )}
                </div>

                {v.assignedTeamName && (
                  <div className="p-2 rounded bg-purple-950/40 border border-purple-700/50 text-xs text-purple-200">
                    Assigned Unit: <b>{v.assignedTeamName}</b>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                {v.status === 'WAITING' ? (
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) assignRescueTeamToVictim(v.id, e.target.value);
                      }}
                      defaultValue=""
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="" disabled>
                        Assign Rescue Unit...
                      </option>
                      {availableTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.vehicleType})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => updateVictimStatus(v.id, 'DISPATCHED')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold"
                    >
                      Dispatch
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateVictimStatus(v.id, 'RESCUED')}
                      className="py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Mark Rescued
                    </button>
                    <button
                      onClick={() => updateVictimStatus(v.id, 'IN_SHELTER')}
                      className="py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      In Shelter
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Victim Intake Modal */}
      {isAddVictimModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl glass-panel border border-cyan-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-white uppercase">Log New Emergency Victim Intake</h3>
              <button onClick={() => setIsAddVictimModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVictim} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Victim / Contact Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Number of People</label>
                  <input
                    type="number"
                    min="1"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Street Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Emergency Nature</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Ground floor flooded 4ft deep, elderly patient on oxygen cylinder"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasElderly}
                    onChange={(e) => setHasElderly(e.target.checked)}
                    className="rounded accent-cyan-500"
                  />
                  <span>Elderly Present</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                    className="rounded accent-cyan-500"
                  />
                  <span>Infants / Children</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasMedical}
                    onChange={(e) => setHasMedical(e.target.checked)}
                    className="rounded accent-cyan-500"
                  />
                  <span>Urgent Medical Need</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs tracking-wider shadow-lg mt-3"
              >
                DISPATCH TO TRIAGE QUEUE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

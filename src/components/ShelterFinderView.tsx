import React, { useState } from 'react';
import {
  LifeBuoy,
  Navigation,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Droplets,
  Utensils,
  Pill,
  Zap,
  Phone,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { Shelter } from '../types';

interface ShelterFinderViewProps {
  setActiveTab: (tab: string) => void;
}

export const ShelterFinderView: React.FC<ShelterFinderViewProps> = ({ setActiveTab }) => {
  const {
    rankedShelters,
    userLocation,
    userAddress,
    startNavigationToShelter,
    activeEvacuationRoute,
  } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMedical, setFilterMedical] = useState(false);
  const [filterWheelchair, setFilterWheelchair] = useState(false);
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);
  const [filterOnlyOpen, setFilterOnlyOpen] = useState(false);
  const [selectedShelterForDetails, setSelectedShelterForDetails] = useState<Shelter | null>(null);

  const filteredShelters = rankedShelters.filter((s) => {
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterMedical && !s.medicalSupport) return false;
    if (filterWheelchair && !s.wheelchairAccessible) return false;
    if (filterPetFriendly && !s.petFriendly) return false;
    if (filterOnlyOpen && (s.status === 'FULL' || s.status === 'CLOSED')) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <LifeBuoy className="w-4 h-4" />
            <span>INTELLIGENT SHELTER MATCHING ENGINE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Safe Shelter Finder & Evacuation Hub
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Shelters ranked dynamically based on: <b className="text-cyan-400">40% Hazard Zone Safety</b> +{' '}
            <b className="text-cyan-400">25% Distance</b> + <b className="text-cyan-400">20% Capacity</b> +{' '}
            <b className="text-cyan-400">10% Accessibility</b> + <b className="text-cyan-400">5% Provisions</b>.
          </p>
        </div>

        {activeEvacuationRoute && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-right">
            <span className="text-[10px] font-mono-tech text-emerald-300 block uppercase">Active Evacuation Path</span>
            <span className="font-bold text-sm text-white">{activeEvacuationRoute.destinationShelter.name}</span>
            <span className="text-xs text-emerald-400 block font-mono-tech">
              {activeEvacuationRoute.distanceKm} km • ~{activeEvacuationRoute.estimatedMinutes} mins
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by shelter name, neighborhood, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <button
            onClick={() => setFilterMedical(!filterMedical)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterMedical ? 'bg-rose-950/70 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            ✚ Medical Support
          </button>

          <button
            onClick={() => setFilterWheelchair(!filterWheelchair)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterWheelchair ? 'bg-purple-950/70 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            ♿ Wheelchair Access
          </button>

          <button
            onClick={() => setFilterPetFriendly(!filterPetFriendly)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterPetFriendly ? 'bg-amber-950/70 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            🐾 Pet Friendly
          </button>

          <button
            onClick={() => setFilterOnlyOpen(!filterOnlyOpen)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterOnlyOpen ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            🟢 Open Only
          </button>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShelters.map((shelter, index) => {
          const isTopMatch = index === 0;
          const occupancyRatio = Math.round((shelter.currentOccupancy / (shelter.maxCapacity || 1)) * 100);

          const statusColor =
            shelter.status === 'OPEN'
              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
              : shelter.status === 'NEAR_CAPACITY'
              ? 'text-amber-400 bg-amber-950/60 border-amber-800'
              : 'text-red-400 bg-red-950/60 border-red-800';

          return (
            <div
              key={shelter.id}
              className={`p-5 rounded-xl glass-panel flex flex-col justify-between space-y-4 border transition-all hover:border-cyan-400 shadow-xl ${
                isTopMatch ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-slate-950/90' : 'border-slate-800/80'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {isTopMatch && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono-tech bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1.5">
                        <Shield className="w-3 h-3" />
                        <span>#1 HIGHEST SAFETY MATCH</span>
                      </span>
                    )}
                    <h3 className="font-bold text-base text-white">{shelter.name}</h3>
                    <p className="text-xs text-slate-400">{shelter.address}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono-tech border ${statusColor}`}>
                    {shelter.status}
                  </span>
                </div>

                {/* Score & Distance Bar */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-black/40 border border-white/5 text-center font-mono-tech text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">SAFETY SCORE</span>
                    <span
                      className={`font-bold text-sm ${
                        shelter.safetyScore >= 85 ? 'text-emerald-400' : shelter.safetyScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}
                    >
                      {shelter.safetyScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">DISTANCE</span>
                    <span className="font-bold text-sm text-cyan-400">{shelter.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">TRAVEL TIME</span>
                    <span className="font-bold text-sm text-slate-200">~{shelter.estimatedTravelTimeMin} min</span>
                  </div>
                </div>

                {/* Occupancy Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-slate-400">Capacity Load:</span>
                    <span className="text-slate-200">
                      <b>{shelter.currentOccupancy}</b> / {shelter.maxCapacity} ({occupancyRatio}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRatio >= 90 ? 'bg-red-500' : occupancyRatio >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRatio}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono-tech text-slate-400 text-right">
                    Available Spaces: <b className="text-emerald-400">{shelter.availableCapacity}</b>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
                  {shelter.resources.water && (
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center space-x-1">
                      <Droplets className="w-3 h-3" /> <span>Water</span>
                    </span>
                  )}
                  {shelter.resources.food && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center space-x-1">
                      <Utensils className="w-3 h-3" /> <span>Food</span>
                    </span>
                  )}
                  {shelter.medicalSupport && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center space-x-1">
                      <Pill className="w-3 h-3" /> <span>Medical Staff</span>
                    </span>
                  )}
                  {shelter.wheelchairAccessible && (
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      ♿ Accessible
                    </span>
                  )}
                  {shelter.petFriendly && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      🐾 Pets OK
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex gap-2">
                <button
                  onClick={() => {
                    startNavigationToShelter(shelter);
                    setActiveTab('map');
                  }}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs tracking-wider shadow-md active:scale-95 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GET SAFE ROUTE</span>
                </button>

                <a
                  href={`tel:${shelter.contactPhone}`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                  title={`Call Shelter (${shelter.contactPhone})`}
                >
                  <Phone className="w-4 h-4 text-cyan-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

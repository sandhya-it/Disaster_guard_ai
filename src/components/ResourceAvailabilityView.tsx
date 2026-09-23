import React, { useState } from 'react';
import {
  Box,
  Droplets,
  Utensils,
  Pill,
  Shirt,
  Baby,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Send,
  Building2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

export const ResourceAvailabilityView: React.FC = () => {
  const { reliefResources, allocateResource, shelters } = useDisaster();

  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [requestQty, setRequestQty] = useState<number>(100);
  const [targetLocation, setTargetLocation] = useState<string>('Triplicane High-Need Sector');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredResources = reliefResources.filter((r) => {
    if (filterType !== 'ALL' && r.type !== filterType) return false;
    return true;
  });

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return;
    setIsSubmitting(true);
    try {
      await allocateResource(selectedResourceId, requestQty, targetLocation);
      setSelectedResourceId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOOD':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'WATER':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'MEDICAL':
        return <Pill className="w-5 h-5 text-rose-400" />;
      case 'CLOTHING':
        return <Shirt className="w-5 h-5 text-purple-400" />;
      case 'BABY_CARE':
        return <Baby className="w-5 h-5 text-pink-400" />;
      default:
        return <Box className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <Box className="w-4 h-4" />
            <span>DISASTER RELIEF LOGISTICS & INVENTORY</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Critical Emergency Resources & Supply Reserves
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Real-time monitoring of food rations, potable water, medical kits, bedding, and baby nutrition deployed
            across emergency regional hubs.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'CLOTHING', 'BABY_CARE', 'RESCUE_EQUIPMENT'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterType === type
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Resources Grid & Dispatch Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resources List (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => {
            const available = res.totalQuantity - res.allocatedQuantity;
            const percentageLeft = Math.round((available / res.totalQuantity) * 100);

            const statusClass =
              res.status === 'AVAILABLE'
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                : res.status === 'LOW'
                ? 'text-amber-400 bg-amber-950/60 border-amber-800'
                : 'text-red-400 bg-red-950/60 border-red-800';

            return (
              <div
                key={res.id}
                className="p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">{getIcon(res.type)}</div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{res.name}</h3>
                        <span className="text-[10px] font-mono-tech text-slate-400 uppercase">{res.type}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold border ${statusClass}`}>
                      {res.status}
                    </span>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-xs font-mono-tech">
                      <span className="text-slate-400">Remaining Inventory:</span>
                      <span className="text-white font-bold">
                        {available.toLocaleString()} / {res.totalQuantity.toLocaleString()} {res.unit}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentageLeft <= 25 ? 'bg-red-500' : percentageLeft <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentageLeft}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono-tech text-slate-400 pt-0.5">
                      <span>Allocated: {res.allocatedQuantity.toLocaleString()}</span>
                      <span>Critical Threshold: {res.criticalThreshold.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Location info */}
                  <div className="text-xs text-slate-300 font-mono-tech">
                    Nearest Hub: <b className="text-cyan-300">{res.nearestCenter}</b> (~{res.nearestCenterDistanceKm} km)
                  </div>
                </div>

                <button
                  onClick={() => setSelectedResourceId(res.id)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>DISPATCH THIS SUPPLY</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Resource Allocation Panel (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl space-y-4 h-fit">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wide flex items-center space-x-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>RAPID RESOURCE DISPATCH</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono-tech">DIRECT LOGISTICS ALLOCATION</p>
          </div>

          <form onSubmit={handleAllocate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Select Supply Item</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                required
              >
                <option value="">-- Choose Relief Resource --</option>
                {reliefResources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.totalQuantity - r.allocatedQuantity} {r.unit} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Quantity to Allocate</label>
              <input
                type="number"
                min="10"
                max="5000"
                step="10"
                value={requestQty}
                onChange={(e) => setRequestQty(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Sector / Safe Shelter</label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                placeholder="e.g. Triplicane Zone Red or Anna Nagar Shelter"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedResourceId}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-display font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all mt-2"
            >
              {isSubmitting ? 'DISPATCHING...' : 'CONFIRM & DISPATCH AID'}
            </button>
          </form>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">⚡ Autonomous Logistics Rule:</span>
            <p>Allocations automatically notify nearest rescue teams and update regional supply inventory.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

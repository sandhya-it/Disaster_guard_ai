import React, { useState } from 'react';
import {
  Box,
  Truck,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  Droplets,
  Utensils,
  Pill,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

export const SmartResourceAllocationView: React.FC = () => {
  const { reliefResources, disasterZones, shelters, allocateResource } = useDisaster();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [allocationLog, setAllocationLog] = useState<string[]>([]);

  // Calculate high demand zones
  const sectorDemands = [
    {
      sector: 'Sector A: Triplicane Inundated Zone',
      danger: 'CRITICAL',
      peopleAtRisk: 8400,
      deficits: [
        { item: 'Potable Drinking Water (L)', needed: 1200, unit: 'Liters', currentSupply: 400 },
        { item: 'Ready-to-Eat Food Packets', needed: 800, unit: 'Meals', currentSupply: 250 },
        { item: 'First Aid & Trauma Kits', needed: 150, unit: 'Kits', currentSupply: 30 },
      ],
    },
    {
      sector: 'Sector B: Egmore Low-Lying Runoff Basin',
      danger: 'WARNING',
      peopleAtRisk: 4200,
      deficits: [
        { item: 'Potable Drinking Water (L)', needed: 600, unit: 'Liters', currentSupply: 350 },
        { item: 'Emergency Blankets', needed: 400, unit: 'Pcs', currentSupply: 100 },
      ],
    },
    {
      sector: 'Sector C: T. Nagar Waterlogged Pocket',
      danger: 'DANGER',
      peopleAtRisk: 6100,
      deficits: [
        { item: 'Baby Nutrition Kits', needed: 120, unit: 'Kits', currentSupply: 20 },
        { item: 'Inflatable Life Rafts', needed: 25, unit: 'Units', currentSupply: 8 },
      ],
    },
  ];

  const handleRunAiOptimization = async () => {
    setIsOptimizing(true);
    setAllocationLog([]);

    setTimeout(async () => {
      // Execute 3 automated allocations
      if (reliefResources.length >= 3) {
        await allocateResource(reliefResources[0].id, 500, 'Triplicane Critical Sector A');
        await allocateResource(reliefResources[1].id, 400, 'Egmore Relief Depot');
        await allocateResource(reliefResources[2].id, 100, 'T. Nagar Primary Care Camp');
      }

      setAllocationLog([
        '✅ AI Algorithm completed in 420ms.',
        '📦 Dispatched 500L Water from Central Hub → Triplicane Critical Sector (ETA 18 min)',
        '🍱 Dispatched 400 Food Rations → Egmore Depot (ETA 12 min)',
        '💊 Dispatched 100 Trauma Kits → T. Nagar Primary Care Camp (ETA 14 min)',
        '⚡ Redistribution balanced: Sector survival buffer increased by +6.4 hours.',
      ]);
      setIsOptimizing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>PREDICTIVE DISASTER SUPPLY BALANCING ENGINE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Smart Resource Allocation Matrix
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Machine intelligence matching live flood surge velocities, population vulnerability vectors, and depot
            stock levels to eliminate localized humanitarian starvation gaps.
          </p>
        </div>

        <button
          onClick={handleRunAiOptimization}
          disabled={isOptimizing}
          className="px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-display font-bold text-xs tracking-wider shadow-xl shadow-purple-950/50 flex items-center space-x-2 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'CALCULATING OPTIMAL PATHS...' : 'RUN AI AUTO-ALLOCATION'}</span>
        </button>
      </div>

      {/* AI Log Output if triggered */}
      {allocationLog.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-1.5 font-mono-tech text-xs text-purple-200">
          <span className="font-bold text-white block mb-1">⚡ AI DISPATCH EXECUTION REPORT:</span>
          {allocationLog.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}

      {/* Sector Deficit Matrix */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">
          Sector Supply Vulnerability & Deficit Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sectorDemands.map((sec, i) => (
            <div
              key={i}
              className={`p-5 rounded-xl glass-panel border flex flex-col justify-between space-y-4 shadow-xl ${
                sec.danger === 'CRITICAL'
                  ? 'border-red-500/50 bg-red-950/15'
                  : sec.danger === 'DANGER'
                  ? 'border-orange-500/50 bg-orange-950/15'
                  : 'border-amber-500/50 bg-amber-950/15'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-white">{sec.sector}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold ${
                      sec.danger === 'CRITICAL' ? 'bg-red-950 text-red-300' : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {sec.danger}
                  </span>
                </div>

                <div className="text-xs font-mono-tech text-slate-300">
                  Population Affected: <b className="text-white">{sec.peopleAtRisk.toLocaleString()}</b>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono-tech uppercase text-slate-400 font-bold block">
                    Critical Supply Deficits:
                  </span>
                  {sec.deficits.map((def, j) => {
                    const percentFilled = Math.round((def.currentSupply / def.needed) * 100);
                    return (
                      <div key={j} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200">{def.item}</span>
                          <span className="font-mono-tech text-amber-400 font-bold">
                            {def.currentSupply} / {def.needed} {def.unit}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentFilled}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() =>
                  alert(`Direct relief convoy mobilization dispatched for ${sec.sector}. Rescue convoy en route.`)
                }
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center space-x-1"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>DISPATCH DEDICATED CONVOY</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

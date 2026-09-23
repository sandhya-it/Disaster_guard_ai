import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Flame,
  Droplets,
  Wind,
  Activity,
  AlertTriangle,
  MapPin,
  TrendingUp,
  LifeBuoy,
  Users,
  Radio,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { LiveDisasterMap } from './LiveDisasterMap';
import { DisasterType } from '../types';

interface DisasterSimulationViewProps {
  onBack?: () => void;
}

export const DisasterSimulationView: React.FC<DisasterSimulationViewProps> = ({ onBack }) => {
  const { simulationState, updateSimulation, isSimulationRunning, setIsSimulationRunning } = useDisaster();

  const [selectedType, setSelectedType] = useState<DisasterType>(simulationState.disasterType);
  const [severity, setSeverity] = useState<number>(simulationState.severity);
  const [radius, setRadius] = useState<number>(simulationState.radiusKm);
  const [timeline, setTimeline] = useState<number>(simulationState.timelineMinutes);

  // Sync with context
  useEffect(() => {
    setSelectedType(simulationState.disasterType);
    setSeverity(simulationState.severity);
    setRadius(simulationState.radiusKm);
    setTimeline(simulationState.timelineMinutes);
  }, [simulationState]);

  // Automated Timeline Advance loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulationRunning) {
      interval = setInterval(() => {
        setTimeline((prev) => {
          const next = prev >= 60 ? 0 : prev + 5;
          updateSimulation({ timelineMinutes: next });
          return next;
        });
      }, 1800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulationRunning, updateSimulation]);

  const handleTypeChange = (type: DisasterType) => {
    setSelectedType(type);
    updateSimulation({ disasterType: type });
  };

  const handleSeverityChange = (sev: number) => {
    setSeverity(sev);
    updateSimulation({ severity: sev });
  };

  const handleRadiusChange = (rad: number) => {
    setRadius(rad);
    updateSimulation({ radiusKm: rad });
  };

  const handleTimelineChange = (t: number) => {
    setTimeline(t);
    updateSimulation({ timelineMinutes: t });
  };

  const handleResetSimulation = () => {
    setIsSimulationRunning(false);
    setTimeline(0);
    setRadius(3.5);
    setSeverity(3);
    setSelectedType('FLOOD');
    updateSimulation({
      disasterType: 'FLOOD',
      severity: 3,
      radiusKm: 3.5,
      timelineMinutes: 0,
      epicenter: { lat: 13.0768, lng: 80.2742 },
    });
  };

  // Calculated simulation impact indicators
  const projectedCasualties = Math.round(severity * radius * 420 * (1 + timeline / 40));
  const shelterStressPercentage = Math.min(100, Math.round(45 + severity * 8 + (timeline / 60) * 35));
  const inundatedRoadKm = (radius * 1.8 * (severity / 2) * (1 + timeline / 60)).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-xl glass-panel border border-purple-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-purple-950/30 to-slate-950">
        <div>
          <div className="flex items-center space-x-2 text-purple-300 font-mono-tech text-xs mb-1">
            <Cpu className="w-4 h-4" />
            <span>PREDICTIVE HAZARD PROPAGATION SIMULATOR</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Disaster Scenario Lab & Stress Test Matrix
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Simulate flash floods, cyclones, earthquakes, and toxic plumes across space and time (T+0 to T+60m) to test
            infrastructure resilience and evacuation bottlenecks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-display font-bold text-xs tracking-wider border border-white/20 shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>← DASHBOARD</span>
            </button>
          )}

          <button
            onClick={() => setIsSimulationRunning(!isSimulationRunning)}
            className={`px-5 py-2.5 rounded-lg font-display font-bold text-xs tracking-wider shadow-lg flex items-center space-x-2 transition-all ${
              isSimulationRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulationRunning ? 'PAUSE TIMELINE' : 'PLAY SIMULATION (AUTO)'}</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Simulation Workspace Grid: Controls on Left, Map & Impact Metrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. DISASTER TYPE SELECTOR */}
          <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center space-x-2">
              <Flame className="w-4 h-4 text-purple-400" />
              <span>1. Hazard Archetype Model</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                { type: 'FLOOD', label: '🌊 Flash Flood / Surge' },
                { type: 'CYCLONE', label: '🌀 Tropical Cyclone' },
                { type: 'EARTHQUAKE', label: '🌋 Major Earthquake' },
                { type: 'WILDFIRE', label: '🔥 Urban Firestorm' },
                { type: 'LANDSLIDE', label: '⛰️ Mudflow / Landslide' },
                { type: 'INDUSTRIAL', label: '☣️ Toxic Chemical Leak' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleTypeChange(item.type as DisasterType)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedType === item.type
                      ? 'bg-purple-600/30 text-white border-purple-400 font-bold shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SEVERITY & RADIUS SLIDERS */}
          <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>2. Intensity & Hazard Radius</span>
            </h3>

            {/* Severity 1 to 5 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-tech">
                <span className="text-slate-400">Severity Scale:</span>
                <span className="text-purple-300 font-bold">Category {severity} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center text-xs font-mono-tech">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleSeverityChange(lvl)}
                    className={`py-1.5 rounded border transition-all ${
                      severity === lvl
                        ? 'bg-red-600 text-white border-red-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    CAT {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono-tech">
                <span className="text-slate-400">Hazard Impact Radius:</span>
                <span className="text-cyan-400 font-bold">{radius} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono-tech text-slate-500">
                <span>0.5 km (Localized)</span>
                <span>7.5 km (Metropolitan)</span>
                <span>15.0 km (Regional)</span>
              </div>
            </div>
          </div>

          {/* 3. TIME-PROPAGATION SLIDER (T+0 to T+60) */}
          <div className="p-5 rounded-xl glass-panel border border-purple-500/40 space-y-3 bg-purple-950/15">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>3. Temporal Surge Evolution</span>
              </h3>
              <span className="font-mono-tech font-bold text-xs text-purple-300">T+{timeline} Minutes</span>
            </div>

            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={timeline}
              onChange={(e) => handleTimelineChange(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono-tech text-slate-400">
              <span>T+0 (Surge Onset)</span>
              <span>T+30 (Peak Inundation)</span>
              <span>T+60 (Saturation)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Map & Impact Telemetry (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Simulation Live Geospatial Map */}
          <div className="rounded-xl overflow-hidden glass-panel border border-purple-500/40 shadow-2xl relative">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping"></span>
                <span className="font-display font-bold text-xs text-white uppercase tracking-wide">
                  Live Dynamic Scenario Propagation Model
                </span>
              </div>
              <span className="text-[10px] font-mono-tech text-purple-300">
                EPICENTER: {simulationState.epicenter.lat.toFixed(4)}°N, {simulationState.epicenter.lng.toFixed(4)}°E
              </span>
            </div>

            <LiveDisasterMap isEmbedded={true} height="360px" />
          </div>

          {/* Real-Time Impact Assessment Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl glass-panel border border-red-500/30 bg-red-950/20 text-center space-y-1">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-red-400 block">
                Projected People At Risk
              </span>
              <span className="text-2xl font-black font-mono-tech text-white">
                {projectedCasualties.toLocaleString()}
              </span>
              <span className="text-[10px] text-red-300 block">High water / structural hazard</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-amber-500/30 bg-amber-950/20 text-center space-y-1">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-amber-400 block">
                Shelter System Load
              </span>
              <span className="text-2xl font-black font-mono-tech text-white">{shelterStressPercentage}%</span>
              <span className="text-[10px] text-amber-300 block">Systemic bed saturation</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-cyan-500/30 bg-cyan-950/20 text-center space-y-1">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-cyan-400 block">
                Inundated Corridors
              </span>
              <span className="text-2xl font-black font-mono-tech text-white">{inundatedRoadKm} km</span>
              <span className="text-[10px] text-cyan-300 block">Roadways impassable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

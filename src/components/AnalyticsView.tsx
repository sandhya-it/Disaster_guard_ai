import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Box,
  HeartPulse,
  LifeBuoy,
  ShieldAlert,
  Clock,
  Download,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

export const AnalyticsView: React.FC = () => {
  const { dashboardStats, shelters, reliefResources, victims } = useDisaster();

  // Hourly Evacuation Trend Data
  const evacuationTrends = [
    { hour: '06:00', evacuated: 420, waterSurgeCm: 15, alerts: 2 },
    { hour: '08:00', evacuated: 950, waterSurgeCm: 32, alerts: 5 },
    { hour: '10:00', evacuated: 1820, waterSurgeCm: 48, alerts: 8 },
    { hour: '12:00', evacuated: 3200, waterSurgeCm: 75, alerts: 14 },
    { hour: '14:00', evacuated: 4850, waterSurgeCm: 92, alerts: 22 },
    { hour: '16:00', evacuated: 7420, waterSurgeCm: 110, alerts: 29 },
    { hour: '18:00', evacuated: 9150, waterSurgeCm: 125, alerts: 34 },
  ];

  // Shelter Occupancy Data
  const shelterCapacityData = shelters.map((s) => ({
    name: s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1] || ''),
    Occupied: s.currentOccupancy,
    Capacity: s.maxCapacity,
  }));

  // Resource Allocation Data
  const resourceData = reliefResources.slice(0, 5).map((r) => ({
    name: r.name.split(' ')[0],
    Total: r.totalQuantity,
    Dispatched: r.allocatedQuantity,
    Remaining: r.totalQuantity - r.allocatedQuantity,
  }));

  // Victim Priority Distribution
  const priorityCounts = {
    CRITICAL: victims.filter((v) => v.priority === 'CRITICAL').length || 2,
    HIGH: victims.filter((v) => v.priority === 'HIGH').length || 4,
    MEDIUM: victims.filter((v) => v.priority === 'MEDIUM').length || 5,
    LOW: victims.filter((v) => v.priority === 'LOW').length || 3,
  };

  const victimPieData = [
    { name: 'Critical (Red)', value: priorityCounts.CRITICAL, color: '#ef4444' },
    { name: 'High (Orange)', value: priorityCounts.HIGH, color: '#f97316' },
    { name: 'Medium (Amber)', value: priorityCounts.MEDIUM, color: '#f59e0b' },
    { name: 'Low (Green)', value: priorityCounts.LOW, color: '#10b981' },
  ];

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: dashboardStats,
      sheltersSummary: shelterCapacityData,
      resourcesSummary: resourceData,
      priorityDistribution: priorityCounts,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DisasterGuard-EOC-Report-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <Activity className="w-4 h-4" />
            <span>EXECUTIVE DISASTER ANALYTICS & AUDIT TELEMETRY</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Situational Analytics & Resource Consumption
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Predictive modeling of civilian evacuation rates, supply burn curves, priority queue resolution times, and
            shelter occupancy saturation.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-display font-bold text-xs tracking-wider shadow-lg flex items-center space-x-2 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT EOC SITREP (JSON)</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Evacuees Flow vs Water Surge */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white uppercase">
              Evacuation Cumulative Flow vs Water Inundation
            </h3>
            <span className="text-[10px] font-mono-tech text-cyan-400">HOURLY DELTA</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evacuationTrends}>
                <defs>
                  <linearGradient id="colorEvac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSurge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="evacuated" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEvac)" name="Safe Evacuees" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shelter Occupancy vs Max Capacity */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white uppercase">
              Shelter Occupancy vs Maximum Capacity
            </h3>
            <span className="text-[10px] font-mono-tech text-emerald-400">BED UTILIZATION</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterCapacityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="Occupied" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Occupied Beds" />
                <Bar dataKey="Capacity" fill="#334155" radius={[4, 4, 0, 0]} name="Total Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Resource Inventory & Dispatches */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white uppercase">
              Relief Supplies: Dispatched vs Available Buffer
            </h3>
            <span className="text-[10px] font-mono-tech text-purple-400">LOGISTICS BURN</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="Dispatched" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Dispatched to Field" />
                <Bar dataKey="Remaining" fill="#10b981" radius={[4, 4, 0, 0]} name="Available in Reserve" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Victim Priority Demographics */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white uppercase">
              Victim Triage Queue Priority Distribution
            </h3>
            <span className="text-[10px] font-mono-tech text-red-400">SEVERITY SPLIT</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={victimPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {victimPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

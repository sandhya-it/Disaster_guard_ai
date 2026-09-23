import React, { useState } from 'react';
import {
  Flame,
  PhoneCall,
  MapPin,
  ExternalLink,
  Shield,
  Activity,
  Heart,
  Globe,
  Radio,
  Clock,
  Navigation,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

export const EmergencyServicesView: React.FC = () => {
  const { emergencyServices, userAddress, userLocation, setIsSOSModalOpen } = useDisaster();

  const [region, setRegion] = useState<'INDIA' | 'USA' | 'UK' | 'GLOBAL'>('INDIA');
  const [filterType, setFilterType] = useState<string>('ALL');

  const emergencyContactsByRegion = {
    INDIA: [
      { name: 'National Disaster Helpline (NDMA)', number: '1070', type: 'Disaster', color: 'text-cyan-400' },
      { name: 'State Emergency Operations (SEOC)', number: '1077', type: 'Disaster', color: 'text-cyan-400' },
      { name: 'Police Emergency Response', number: '100 / 112', type: 'Police', color: 'text-blue-400' },
      { name: 'Fire & Rescue Service', number: '101', type: 'Fire', color: 'text-orange-400' },
      { name: '108 Ambulance & Trauma', number: '108', type: 'Medical', color: 'text-emerald-400' },
      { name: 'Women & Child Safety Helpline', number: '1091 / 1098', type: 'Special', color: 'text-pink-400' },
    ],
    USA: [
      { name: 'National Emergency Response', number: '911', type: 'General', color: 'text-red-400' },
      { name: 'FEMA Disaster Assistance', number: '1-800-621-3362', type: 'Disaster', color: 'text-cyan-400' },
      { name: 'Poison Control Center', number: '1-800-222-1222', type: 'Medical', color: 'text-emerald-400' },
    ],
    UK: [
      { name: 'Emergency Police / Fire / Ambulance', number: '999 / 112', type: 'General', color: 'text-red-400' },
      { name: 'NHS Medical Advice Non-Emergency', number: '111', type: 'Medical', color: 'text-emerald-400' },
      { name: 'Floodline Environmental Agency', number: '0345 988 1188', type: 'Disaster', color: 'text-cyan-400' },
    ],
    GLOBAL: [
      { name: 'Universal International Emergency', number: '112', type: 'General', color: 'text-cyan-400' },
      { name: 'Red Cross Emergency Global', number: '+41 22 730 4222', type: 'Disaster', color: 'text-rose-400' },
    ],
  };

  const filteredServices = emergencyServices.filter((s) => {
    if (filterType !== 'ALL' && s.type !== filterType) return false;
    return true;
  });

  const handleDemoCall = (name: string, phone: string) => {
    alert(`[DEMO CALL SIMULATION]\nConnecting to ${name} at verified emergency channel: ${phone}.\nIn a real-world emergency, your local telephony provider will connect immediately.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <Flame className="w-4 h-4" />
            <span>DIRECT EMERGENCY DISPATCH CHANNELS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Verified Emergency Services & Field Stations
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Direct priority telecommunication links and nearest physical stations for Police, Fire & Rescue, Trauma
            Ambulances, and 24/7 Government Medical Centers.
          </p>
        </div>

        <button
          onClick={() => setIsSOSModalOpen(true)}
          className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs tracking-wider shadow-lg shadow-red-900/50 border border-red-400 flex items-center space-x-2 animate-beacon"
        >
          <Radio className="w-4 h-4" />
          <span>BROADCAST EMERGENCY SOS</span>
        </button>
      </div>

      {/* Regional Hotline Cards */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm text-white uppercase">Verified Emergency Numbers</h3>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-400 mr-1">Region:</span>
            {(['INDIA', 'USA', 'UK', 'GLOBAL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono-tech transition-all ${
                  region === r ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {emergencyContactsByRegion[region].map((contact, i) => (
            <div
              key={i}
              className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-white block">{contact.name}</span>
                <span className={`font-mono-tech font-black text-base ${contact.color}`}>{contact.number}</span>
              </div>

              <button
                onClick={() => handleDemoCall(contact.name, contact.number)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center space-x-1"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities Near You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">
            Nearest Mapped Emergency Stations
          </h2>

          <div className="flex items-center space-x-1 text-xs">
            {['ALL', 'POLICE', 'FIRE', 'AMBULANCE', 'HOSPITAL'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterType === t
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => {
            const getIcon = () => {
              if (svc.type === 'POLICE') return <span className="text-xl">👮</span>;
              if (svc.type === 'FIRE') return <span className="text-xl">🚒</span>;
              if (svc.type === 'AMBULANCE') return <span className="text-xl">🚑</span>;
              return <span className="text-xl">✚</span>;
            };

            const getBorderColor = () => {
              if (svc.type === 'POLICE') return 'border-blue-500/40';
              if (svc.type === 'FIRE') return 'border-orange-500/40';
              if (svc.type === 'AMBULANCE') return 'border-emerald-500/40';
              return 'border-rose-500/40';
            };

            return (
              <div
                key={svc.id}
                className={`p-5 rounded-xl glass-panel flex flex-col justify-between space-y-4 border ${getBorderColor()} shadow-xl`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">{getIcon()}</div>
                      <div>
                        <span className="text-[10px] font-mono-tech text-slate-400 font-bold uppercase tracking-wider">
                          {svc.type} STATION
                        </span>
                        <h3 className="font-bold text-sm text-white">{svc.name}</h3>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {svc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{svc.address}</p>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono-tech space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance from you:</span>
                      <b className="text-cyan-400">{svc.distanceKm} km</b>
                    </div>
                    {svc.emergencyDeptStatus && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Emergency Dept:</span>
                        <b className="text-emerald-400">{svc.emergencyDeptStatus}</b>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Direct Phone:</span>
                      <b className="text-slate-200">{svc.phone}</b>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleDemoCall(svc.name, svc.phone)}
                    className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>DEMO CALL</span>
                  </button>

                  <button
                    onClick={() => alert(`Directions calculated to ${svc.name} (${svc.address}). Distance: ${svc.distanceKm} km.`)}
                    className="py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>DIRECTIONS</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Award,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { Volunteer } from '../types';

export const VolunteerManagementView: React.FC = () => {
  const { volunteers, registerVolunteer } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<string>('ALL');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('First Aid, Food Distribution');
  const [assignedZone, setAssignedZone] = useState('Anna Nagar Relief Depot');

  const filteredVolunteers = volunteers.filter((v) => {
    if (filterAvailability !== 'ALL' && v.availability !== filterAvailability) return false;
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase()) && !v.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerVolunteer({
      name,
      contactPhone: phone,
      skills: skills.split(',').map((s) => s.trim()),
      availability: 'AVAILABLE',
      assignedZone,
      totalHoursServed: 0,
      isVerified: true,
      currentLocation: { lat: 13.0827, lng: 80.2707 },
    });
    setIsRegisterOpen(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-tech text-xs mb-1">
            <Users className="w-4 h-4" />
            <span>CIVIC RESPONSE CORPS ROSTER</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Volunteer Management & Field Coordination
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Certified volunteer mobilization roster with specialized certifications (Paramedic, Swift Water Rescue, HAM
            Radio, Heavy Equipment).
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs tracking-wider shadow-lg shadow-emerald-900/40 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>JOIN CIVIC CORPS (REGISTER)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search volunteers by name, specialized skill, or assigned sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-slate-400">Status:</span>
          {['ALL', 'AVAILABLE', 'DEPLOYED', 'OFFLINE'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterAvailability(status)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterAvailability === status
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVolunteers.map((vol) => {
          const isAvailable = vol.availability === 'AVAILABLE';

          return (
            <div
              key={vol.id}
              className="p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-base text-white">{vol.name}</h3>
                      {vol.isVerified && (
                        <span title="Verified Civil Responder" className="text-cyan-400 text-xs">
                          🛡️
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono-tech">{vol.contactPhone}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono-tech font-bold border ${
                      isAvailable
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-purple-950 text-purple-300 border-purple-800'
                    }`}
                  >
                    {vol.availability}
                  </span>
                </div>

                <div className="text-xs font-mono-tech text-slate-300 space-y-1">
                  <div>
                    Assigned Sector: <b className="text-cyan-400">{vol.assignedZone}</b>
                  </div>
                  <div>
                    Service Hours Logged: <b className="text-white">{vol.totalHoursServed} hrs</b>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase font-bold block">
                    Certified Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {vol.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={`tel:${vol.contactPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Volunteer</span>
                </a>

                <button
                  onClick={() => alert(`Task dispatched to volunteer ${vol.name} for sector ${vol.assignedZone}.`)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Assign Field Task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Volunteer Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl glass-panel border border-emerald-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-white uppercase">
                Register as Emergency Volunteer
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Skills & Certifications (Comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Paramedic, Swift Water Rescue, HAM Radio, Heavy Truck"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Preferred Deployment Sector</label>
                <input
                  type="text"
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs tracking-wider shadow-lg mt-3"
              >
                JOIN DISASTER RESPONSE CORPS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

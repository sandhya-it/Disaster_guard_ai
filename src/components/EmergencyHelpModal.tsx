import React, { useState } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  MapPin,
  Send,
  X,
  Radio,
  CheckCircle2,
  Clock,
  Phone,
  Baby,
  Activity,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

export const EmergencyHelpModal: React.FC = () => {
  const { isHelpModalOpen, setIsHelpModalOpen, userLocation, userAddress, reportVictimNeed } = useDisaster();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(userAddress);
  const [peopleCount, setPeopleCount] = useState(1);
  const [waterLevel, setWaterLevel] = useState('WAIST_HIGH');
  const [hasElderly, setHasElderly] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasMedical, setHasMedical] = useState(false);
  const [isTrapped, setIsTrapped] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncidentId, setSubmittedIncidentId] = useState<string | null>(null);

  if (!isHelpModalOpen) return null;

  // Real-time Priority Preview based on conditions
  const calculatePreviewPriority = () => {
    if (hasMedical || isTrapped || waterLevel === 'ROOF_LEVEL') return 'CRITICAL';
    if (hasElderly || hasChildren || waterLevel === 'WAIST_HIGH') return 'HIGH';
    if (waterLevel === 'ANKLE_HIGH') return 'MEDIUM';
    return 'LOW';
  };

  const currentPreviewPriority = calculatePreviewPriority();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const generatedId = await reportVictimNeed({
        name: name || 'Anonymous Citizen',
        contactPhone: phone || '9999999999',
        address: address || userAddress,
        currentLocation: userLocation,
        peopleCount,
        emergencyType: `WATER_LEVEL_${waterLevel}`,
        hasElderly,
        hasChildren,
        hasMedicalNeed: hasMedical,
        isTrapped,
        description: `Water level: ${waterLevel.replace('_', ' ')}. ${notes || 'Immediate evacuation assistance requested.'}`,
      });

      setSubmittedIncidentId(generatedId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsHelpModalOpen(false);
    setSubmittedIncidentId(null);
    setName('');
    setPhone('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl glass-panel border border-red-500/50 p-6 space-y-5 shadow-2xl bg-gradient-to-b from-slate-950 via-[#12070d] to-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-red-600/30 text-red-400 border border-red-500/40">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wide">
                Emergency Assistance Request (SOS Intake)
              </h2>
              <p className="text-[11px] font-mono-tech text-red-300">DIRECT DISPATCH TO EOC TRIAGE MATRIX</p>
            </div>
          </div>

          <button onClick={handleClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedIncidentId ? (
          /* Confirmation Screen with Live Ticket Tracker */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono-tech text-emerald-400 font-bold block">
                EMERGENCY DISPATCH CONFIRMED
              </span>
              <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                Help Request Transmitted
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Your incident ticket has been assigned to the regional rescue command center. Maintain your phone battery
                and elevate to high ground if possible.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono-tech text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Incident Reference:</span>
                <b className="text-cyan-400">{submittedIncidentId}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Triage Tier:</span>
                <b className="text-red-400">{currentPreviewPriority} (PRIORITY 1)</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rescue Status:</span>
                <span className="text-amber-400 font-bold flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>DISPATCHING TASKFORCE</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-display font-bold text-xs tracking-wider shadow-lg"
            >
              CLOSE & RETURN TO RADAR
            </button>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Live Calculated Priority Pill */}
            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Auto-Calculated Triage Severity:</span>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono-tech font-bold ${
                  currentPreviewPriority === 'CRITICAL'
                    ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                    : currentPreviewPriority === 'HIGH'
                    ? 'bg-orange-950 text-orange-300 border border-orange-700'
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}
              >
                {currentPreviewPriority} TIER
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Your Name / Spokesperson</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Current Street Address / Landmark</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Number of People Stranded</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Water Depth / Hazard Level</label>
                <select
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-400"
                >
                  <option value="ANKLE_HIGH">Ankle High (1-2 ft)</option>
                  <option value="WAIST_HIGH">Waist High (3-4 ft)</option>
                  <option value="CHEST_HIGH">Chest High (5-6 ft)</option>
                  <option value="ROOF_LEVEL">Roof Level / Ground Submerged (&gt;6 ft)</option>
                </select>
              </div>
            </div>

            {/* Vulnerability Checklist */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono-tech text-slate-400 font-bold uppercase block">
                Special Demographics (Prioritizes Rescue Order):
              </span>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasElderly}
                    onChange={(e) => setHasElderly(e.target.checked)}
                    className="rounded accent-red-500"
                  />
                  <span>👴 Elderly Member</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                    className="rounded accent-red-500"
                  />
                  <span>👶 Infants / Toddlers</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasMedical}
                    onChange={(e) => setHasMedical(e.target.checked)}
                    className="rounded accent-red-500"
                  />
                  <span>✚ Critical Medical Issue</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isTrapped}
                    onChange={(e) => setIsTrapped(e.target.checked)}
                    className="rounded accent-red-500"
                  />
                  <span>🚨 Unable to Escape (Trapped)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Additional Critical Details</label>
              <textarea
                rows={2}
                placeholder="e.g. Diabetic patient without insulin, water entering first floor balcony"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-display font-black text-sm tracking-wider shadow-xl shadow-red-950/60 border border-red-400 active:scale-95 transition-all mt-2"
            >
              {isSubmitting ? 'TRANSMITTING SOS...' : '🚨 BROADCAST EMERGENCY RESCUE REQUEST'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

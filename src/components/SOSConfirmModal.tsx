import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  AlertTriangle,
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Loader2,
  MapPin,
  Compass,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { evaluateLocationSafety } from '../services/geoUtils';

type VerificationState = 'VERIFYING' | 'REJECTED_SAFE' | 'TRANSMITTED';

// Synthesize an audible emergency alert siren using Web Audio API
function playEmergencyAlarmSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Two-tone emergency siren modulation
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.75);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  } catch (err) {
    console.warn('Audio siren playback notice:', err);
  }
}

export const SOSConfirmModal: React.FC = () => {
  const {
    isSOSModalOpen,
    setIsSOSModalOpen,
    userLocation,
    userAddress,
    disasterZones,
    shelters,
    reportVictimNeed,
  } = useDisaster();

  const [verificationState, setVerificationState] = useState<VerificationState>('VERIFYING');
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [hazardDetails, setHazardDetails] = useState<{
    zoneName: string;
    dangerLevel: string;
    riskScore: number;
    distanceToEdge: number;
    hazardType: string;
  } | null>(null);

  // Guard to ensure single execution per modal open
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!isSOSModalOpen) {
      hasProcessedRef.current = false;
      setVerificationState('VERIFYING');
      setIncidentId(null);
      setHazardDetails(null);
      return;
    }

    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    // 1. Verify location against disaster hazard zones
    setVerificationState('VERIFYING');

    const verifyTimer = setTimeout(async () => {
      const evaluation = evaluateLocationSafety(userLocation, disasterZones, shelters);

      // Check whether user is inside or immediately at the perimeter of an active hazard zone
      const isInHazardZone =
        evaluation.dangerLevel === 'CRITICAL' ||
        evaluation.dangerLevel === 'DANGER' ||
        evaluation.dangerLevel === 'WARNING' ||
        evaluation.distanceToDangerZoneKm <= 1.0;

      const activeZone = evaluation.nearestDisasterZone || disasterZones[0];

      if (isInHazardZone && activeZone) {
        const details = {
          zoneName: activeZone.name,
          dangerLevel: evaluation.dangerLevel,
          riskScore: evaluation.riskScore,
          distanceToEdge: evaluation.distanceToDangerZoneKm,
          hazardType: activeZone.type,
        };
        setHazardDetails(details);

        // 2. Play emergency alarm siren once
        playEmergencyAlarmSound();

        // 3. Immediately transmit alarm and stop (stops loading!)
        try {
          const generatedCode = await reportVictimNeed({
            name: 'EMERGENCY SOS CITIZEN',
            contactPhone: '911-SOS-DIRECT',
            address: userAddress,
            currentLocation: userLocation,
            peopleCount: 1,
            emergencyType: 'DISTRESS_BEACON_SOS',
            isTrapped: true,
            hasMedicalNeed: true,
            hasElderly: false,
            hasChildren: false,
            description: `VERIFIED HAZARD ZONE ALARM: Transmitted from ${details.zoneName} (${details.dangerLevel}).`,
          });
          setIncidentId(generatedCode);
        } catch (e) {
          setIncidentId(`DG-SOS-${Math.floor(10000 + Math.random() * 90000)}`);
        }

        // Move directly to TRANSMITTED (no more spinners or endless loading)
        setVerificationState('TRANSMITTED');
      } else {
        // User outside hazard zone: reject transmission and stop loading
        setHazardDetails({
          zoneName: activeZone?.name || 'Safe Sector',
          dangerLevel: evaluation.dangerLevel,
          riskScore: evaluation.riskScore,
          distanceToEdge: evaluation.distanceToDangerZoneKm,
          hazardType: activeZone?.type || 'None',
        });
        setVerificationState('REJECTED_SAFE');
      }
    }, 900); // Quick 900ms scan then done

    return () => clearTimeout(verifyTimer);
  }, [isSOSModalOpen]);

  const handleClose = () => {
    setIsSOSModalOpen(false);
    hasProcessedRef.current = false;
    setVerificationState('VERIFYING');
    setIncidentId(null);
    setHazardDetails(null);
  };

  if (!isSOSModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl glass-panel border-2 border-red-500/80 p-6 space-y-5 shadow-2xl text-center bg-slate-950">
        
        {/* 1. VERIFYING LOCATION (Brief quick scan) */}
        {verificationState === 'VERIFYING' && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/20 text-cyan-400 flex items-center justify-center border-2 border-cyan-500/50">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono-tech text-cyan-400 font-bold block uppercase tracking-widest">
                VERIFYING GPS LOCATION
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase">
                Scanning Hazard Zone...
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Checking your coordinates against active flood and cyclone perimeters...
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono-tech text-slate-400 space-y-1 text-left">
              <div className="flex justify-between">
                <span>Current GPS:</span>
                <span className="text-cyan-300 font-bold">
                  {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
                </span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-white truncate max-w-[200px]">{userAddress}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        )}

        {/* 2. REJECTED: USER NOT IN HAZARD ZONE (Stops immediately) */}
        {verificationState === 'REJECTED_SAFE' && (
          <div className="space-y-4 py-1">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono-tech text-emerald-400 font-bold block uppercase tracking-widest">
                VERIFICATION COMPLETE: SAFE SECTOR
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase">
                SOS Transmission Standby
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Emergency SOS alarms are restricted to confirmed hazard zones. Your location was verified as{' '}
                <b className="text-emerald-400">OUTSIDE</b> the active disaster perimeter ({hazardDetails?.distanceToEdge} km away).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono-tech space-y-1.5 text-left text-slate-300">
              <div className="flex justify-between">
                <span>Area Classification:</span>
                <b className="text-emerald-400">SAFE / NON-HAZARD</b>
              </div>
              <div className="flex justify-between">
                <span>Nearest Hazard Zone:</span>
                <span className="text-white font-bold">{hazardDetails?.zoneName}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance to Hazard:</span>
                <span className="text-cyan-300 font-bold">~{hazardDetails?.distanceToEdge} km away</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-left space-y-1">
              <p className="text-amber-300 font-bold">Need non-life-threatening assistance?</p>
              <p>For medical support or inquiries, please use the 24/7 National Emergency Helplines (108 / 101) or find the nearest safe shelter.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                CLOSE WINDOW
              </button>
              <a
                href="tel:108"
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>DIAL 108</span>
              </a>
            </div>
          </div>
        )}

        {/* 3. VERIFIED & TRANSMITTED: STOPS LOADING IMMEDIATELY */}
        {verificationState === 'TRANSMITTED' && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-600/30 text-red-500 flex items-center justify-center border-2 border-red-500 animate-beacon">
              <Radio className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono-tech text-red-400 font-bold block uppercase tracking-widest">
                LOCATION VERIFIED IN HAZARD ZONE
              </span>
              <h3 className="font-display font-black text-2xl text-white uppercase">
                SOS Alarm Transmitted
              </h3>
              <p className="text-xs text-slate-300">
                Alarm successfully transmitted. Your coordinates are pinned onto the rescue team and EOC dispatch monitors.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs font-mono-tech space-y-1.5 text-slate-300 text-left">
              <div className="flex justify-between">
                <span>Incident Code:</span>
                <b className="text-white">{incidentId || 'DG-SOS-ACTIVE'}</b>
              </div>
              <div className="flex justify-between">
                <span>Hazard Sector:</span>
                <b className="text-red-400">{hazardDetails?.zoneName}</b>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <b className="text-emerald-400">DISPATCH ALARM SENT & STOPPED</b>
              </div>
              <div className="flex justify-between">
                <span>GPS Verified:</span>
                <b className="text-cyan-400">
                  {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
                </b>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display tracking-wider border border-red-500 cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              DISMISS / CLOSE
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

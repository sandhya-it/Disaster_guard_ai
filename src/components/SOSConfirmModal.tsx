import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, X, ShieldAlert, CheckCircle2, PhoneCall } from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

export const SOSConfirmModal: React.FC = () => {
  const { isSOSModalOpen, setIsSOSModalOpen, userLocation, userAddress, reportVictimNeed } = useDisaster();

  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [isBroadcastSent, setIsBroadcastSent] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isSOSModalOpen && isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isSOSModalOpen && isCountingDown && countdown === 0) {
      triggerBroadcast();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSOSModalOpen, isCountingDown, countdown]);

  const triggerBroadcast = async () => {
    setIsCountingDown(false);
    const id = await reportVictimNeed({
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
      description: 'HIGH-PRIORITY 1-CLICK SOS BEACON ACTIVATED VIA MOBILE DEVICE.',
    });
    setIncidentId(id);
    setIsBroadcastSent(true);
  };

  const handleCancel = () => {
    setIsSOSModalOpen(false);
    setIsCountingDown(true);
    setCountdown(3);
    setIsBroadcastSent(false);
  };

  if (!isSOSModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl glass-panel border-2 border-red-500 p-6 space-y-5 shadow-2xl text-center bg-slate-950">
        {isBroadcastSent ? (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-600/30 text-red-500 flex items-center justify-center border-2 border-red-500 animate-beacon">
              <Radio className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono-tech text-red-400 font-bold block uppercase tracking-widest">
                DISTRESS BEACON BROADCASTING
              </span>
              <h3 className="font-display font-black text-2xl text-white uppercase">SOS Incident Active</h3>
              <p className="text-xs text-slate-300">
                Your coordinates have been pinned onto every EOC monitor and nearest NDRF rescue boat.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs font-mono-tech space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Incident ID:</span>
                <b className="text-white">{incidentId}</b>
              </div>
              <div className="flex justify-between">
                <span>GPS Location:</span>
                <b className="text-cyan-400">
                  {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
                </b>
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-display tracking-wider border border-slate-700"
            >
              DISMISS WINDOW
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-600/30 text-red-400 flex items-center justify-center border-2 border-red-500 animate-pulse">
              <span className="font-display font-black text-3xl text-white">{countdown}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono-tech text-red-400 font-bold block uppercase">
                CRITICAL LIFE-SAFETY PROTOCOL
              </span>
              <h3 className="font-display font-black text-2xl text-white uppercase">Broadcasting Emergency SOS</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Transmitting your exact live GPS coordinates and distress beacon to all regional emergency responders in{' '}
                <b className="text-white">{countdown} seconds</b>.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
              >
                CANCEL (FALSE ALARM)
              </button>

              <button
                onClick={triggerBroadcast}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/80"
              >
                TRANSMIT NOW
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  Radio,
  Flame,
  LifeBuoy,
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Activity,
  Shield,
} from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { setIsSOSModalOpen } = useDisaster();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#060a12]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Catchy Brand Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('dashboard')}
          >
            {/* Catchy Emergency Shield Emblem */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-[0_0_22px_rgba(239,68,68,0.55)] border border-red-400/40 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white drop-shadow-md" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060a12] animate-pulse"></div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-black text-xl text-white tracking-tight leading-none group-hover:text-red-100 transition-colors">
                  DISASTER<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">GUARD</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 rounded-md uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                Emergency Operations & Citizen Grid
              </p>
            </div>
          </div>

          {/* Clean Right Action: Emergency SOS Button (No badges, No DG, No address bar) */}
          <div className="flex items-center space-x-3">
            <button
              id="header-sos-button"
              onClick={() => setIsSOSModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs tracking-wider shadow-[0_0_25px_rgba(220,38,38,0.6)] active:scale-95 transition-all border border-red-400 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse text-white" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

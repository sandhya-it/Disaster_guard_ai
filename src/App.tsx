import React, { useState } from 'react';
import { DisasterProvider } from './context/DisasterContext';
import { Navbar } from './components/Navbar';
import { HeroLanding } from './components/HeroLanding';
import { CitizenDashboard } from './components/CitizenDashboard';
import { LiveDisasterMap } from './components/LiveDisasterMap';
import { ShelterFinderView } from './components/ShelterFinderView';
import { ResourceAvailabilityView } from './components/ResourceAvailabilityView';
import { EmergencyServicesView } from './components/EmergencyServicesView';
import { AlertCenterView } from './components/AlertCenterView';
import { CommandCenterView } from './components/CommandCenterView';
import { VictimManagementView } from './components/VictimManagementView';
import { SmartResourceAllocationView } from './components/SmartResourceAllocationView';
import { ShelterManagementAdminView } from './components/ShelterManagementAdminView';
import { VolunteerManagementView } from './components/VolunteerManagementView';
import { RescueOperationsView } from './components/RescueOperationsView';
import { DisasterSimulationView } from './components/DisasterSimulationView';
import { AnalyticsView } from './components/AnalyticsView';
import { DisasterZonesNewsMap } from './components/DisasterZonesNewsMap';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { SOSConfirmModal } from './components/SOSConfirmModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'landing':
        return <HeroLanding setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <CitizenDashboard setActiveTab={setActiveTab} />;
      case 'map':
        return (
          <div className="w-full h-[calc(100vh-4rem)] relative">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="absolute top-4 right-4 z-20 px-4 py-2 bg-[#070b12]/90 hover:bg-slate-800 text-white border border-white/20 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
            >
              <span>← Back to Dashboard</span>
            </button>
            <LiveDisasterMap height="calc(100vh - 4rem)" />
          </div>
        );
      case 'news-map':
        return (
          <div className="w-full h-[calc(100vh-4rem)] p-3">
            <DisasterZonesNewsMap
              height="calc(100vh - 5.5rem)"
              onBack={() => setActiveTab('dashboard')}
            />
          </div>
        );
      case 'shelters':
        return (
          <div className="space-y-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>← Back to Dashboard</span>
              </button>
            </div>
            <ShelterFinderView setActiveTab={setActiveTab} />
          </div>
        );
      case 'resources':
        return <ResourceAvailabilityView />;
      case 'emergency':
        return <EmergencyServicesView />;
      case 'alerts':
        return <AlertCenterView setActiveTab={setActiveTab} />;
      case 'command-center':
        return <CommandCenterView setActiveTab={setActiveTab} />;
      case 'victims':
        return <VictimManagementView />;
      case 'resource-allocation':
        return <SmartResourceAllocationView />;
      case 'shelter-admin':
        return <ShelterManagementAdminView />;
      case 'volunteers':
        return <VolunteerManagementView />;
      case 'rescue-ops':
        return <RescueOperationsView />;
      case 'simulation':
        return <DisasterSimulationView onBack={() => setActiveTab('dashboard')} />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <HeroLanding setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Global Command Center Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Active View Area */}
      <main className="flex-1 overflow-x-hidden">{renderCurrentView()}</main>

      {/* Clean Status Bar */}
      <footer className="h-10 bg-[#060a12] border-t border-white/10 flex items-center justify-between px-6 text-[11px] text-slate-400 z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Disaster Network Online
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span>Smart Disaster Relief & Resource Prediction System</span>
        </div>
      </footer>

      {/* Emergency Modals */}
      <EmergencyHelpModal />
      <SOSConfirmModal />
    </div>
  );
}

export default function App() {
  return (
    <DisasterProvider>
      <AppContent />
    </DisasterProvider>
  );
}

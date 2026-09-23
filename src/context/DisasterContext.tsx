import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GeoPoint,
  DisasterZone,
  Shelter,
  ReliefResource,
  EmergencyServiceFacility,
  Victim,
  Incident,
  Volunteer,
  RescueTeam,
  AlertNotification,
  DashboardStats,
  SimulationState,
  AIDecisionRecommendation,
  SafetyAnalysisResult,
  EvacuationRoute,
  DangerLevel,
} from '../types';
import { DisasterAPI } from '../services/api';
import { evaluateLocationSafety, rankSafestShelters, generateSafeEvacuationRoute, reverseGeocode } from '../services/geoUtils';

interface DisasterContextType {
  // Location & Safety
  userLocation: GeoPoint;
  userAddress: string;
  gpsStatus: 'LIVE' | 'SIMULATED' | 'OFFLINE' | 'DENIED' | 'ACQUIRING';
  gpsAccuracyMeters: number;
  lastLocationUpdate: string;
  isLiveTracking: boolean;
  safetyAnalysis: SafetyAnalysisResult;
  rankedShelters: Shelter[];
  recommendedShelter?: Shelter;
  activeEvacuationRoute?: EvacuationRoute;
  isNavigating: boolean;

  // Actions
  requestCurrentLocation: () => Promise<void>;
  setUserCustomLocation: (point: GeoPoint, address?: string) => Promise<void>;
  toggleLiveTracking: () => void;
  findSafestPlace: () => void;
  startNavigationToShelter: (shelter: Shelter) => void;
  stopNavigation: () => void;

  // App Data
  disasterZones: DisasterZone[];
  shelters: Shelter[];
  reliefResources: ReliefResource[];
  emergencyServices: EmergencyServiceFacility[];
  victims: Victim[];
  incidents: Incident[];
  volunteers: Volunteer[];
  rescueTeams: RescueTeam[];
  alerts: AlertNotification[];
  dashboardStats: DashboardStats;
  simulationState: SimulationState;
  aiAdvisor: AIDecisionRecommendation[];
  isOffline: boolean;
  isLoading: boolean;

  // Operations / Handlers
  submitEmergencyRequest: (data: any) => Promise<{ success: boolean; incident: Incident }>;
  reportVictimNeed: (data: any) => Promise<string>;
  triggerSOS: () => Promise<{ success: boolean; incident: Incident }>;
  allocateResource: (resourceId: string, quantity: number, targetZone?: string, targetShelterId?: string) => Promise<void>;
  assignVictimToRescueTeam: (victimId: string, teamId: string) => Promise<void>;
  assignRescueTeamToVictim: (victimId: string, teamId: string) => Promise<void>;
  updateVictimStatus: (victimId: string, status: any) => Promise<void>;
  registerVolunteer: (volunteerData: any) => Promise<void>;
  startSimulation: (config: any) => Promise<void>;
  stepSimulation: (step: 'T+0' | 'T+15' | 'T+30' | 'T+60') => Promise<void>;
  stopSimulation: () => Promise<void>;
  updateSimulation: (params: any) => Promise<void>;
  isSimulationRunning: boolean;
  setIsSimulationRunning: (running: boolean) => void;
  loadPresetScenario: (preset: string) => Promise<void>;
  updateShelterCapacity: (shelterId: string, delta: number) => Promise<void>;
  updateShelterOccupancy: (shelterId: string, newOccupancy: number) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // UI Triggers
  isSOSModalOpen: boolean;
  setIsSOSModalOpen: (open: boolean) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  toasts: { id: string; title: string; message: string; severity: string }[];
  dismissToast: (id: string) => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

// Initial Default Location: Triplicane/Marina Sector (In Flood Risk Zone for dynamic demo)
const INITIAL_LOCATION: GeoPoint = { lat: 13.0768, lng: 80.2742 };

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<GeoPoint>(INITIAL_LOCATION);
  const [userAddress, setUserAddress] = useState<string>('Dr. Besant Road, Marina Coastal Sector, Chennai');
  const [gpsStatus, setGpsStatus] = useState<'LIVE' | 'SIMULATED' | 'OFFLINE' | 'DENIED' | 'ACQUIRING'>('SIMULATED');
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number>(8);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<string>(new Date().toLocaleTimeString());
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core domain data
  const [disasterZones, setDisasterZones] = useState<DisasterZone[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [reliefResources, setReliefResources] = useState<ReliefResource[]>([]);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyServiceFacility[]>([]);
  const [victims, setVictims] = useState<Victim[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [aiAdvisor, setAiAdvisor] = useState<AIDecisionRecommendation[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeIncidents: 128,
    peopleAtRisk: 4820,
    safeCitizens: 2940,
    needingAssistance: 1240,
    openShelters: 37,
    totalShelterCapacity: 4500,
    currentShelterOccupancy: 2840,
    rescueTeamsActive: 18,
    totalRescueTeams: 24,
    criticalVictimsCount: 6,
    lowStockResourcesCount: 2,
  });
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    disasterType: 'Flood',
    severity: 'Critical',
    radiusKm: 4.8,
    epicenter: { lat: 13.0827, lng: 80.2707 },
    timelineStep: 'T+0',
    isPlaying: false,
    affectedPopulation: 87800,
    affectedSheltersCount: 3,
    peopleAtRiskCount: 4820,
    roadClosuresCount: 8,
  });

  // Navigation and Shelter
  const [rankedShelters, setRankedShelters] = useState<Shelter[]>([]);
  const [recommendedShelter, setRecommendedShelter] = useState<Shelter | undefined>(undefined);
  const [activeEvacuationRoute, setActiveEvacuationRoute] = useState<EvacuationRoute | undefined>(undefined);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // UI Modal States
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; severity: string }[]>([]);

  // Computed Safety Analysis
  const [safetyAnalysis, setSafetyAnalysis] = useState<SafetyAnalysisResult>({
    userLocation: INITIAL_LOCATION,
    address: 'Dr. Besant Road, Marina Coastal Sector, Chennai',
    dangerLevel: 'DANGER',
    riskScore: 82,
    distanceToDangerZoneKm: 0,
    distanceToDisasterCenterKm: 0.9,
    statusMessage: 'You are inside an affected flood zone. Move toward nearest safe zone.',
    actionDirective: 'EVACUATE IMMEDIATELY to designated high-ground safe shelter.',
    nearbyHazards: ['Marina Shoreline & Cooum Basin (Flood - Critical)'],
    gpsAccuracyMeters: 8,
    lastUpdated: new Date().toLocaleTimeString(),
  });

  const triggerToast = useCallback((title: string, message: string, severity: string = 'WARNING') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, severity }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Re-calculate safety analysis and shelter rankings
  const recalculateSafety = useCallback(
    (loc: GeoPoint, addr: string, zones: DisasterZone[], shelterList: Shelter[]) => {
      const evaluation = evaluateLocationSafety(loc, zones, shelterList);
      const ranked = rankSafestShelters(loc, shelterList, zones);
      const bestShelter = ranked.length > 0 ? ranked[0] : undefined;

      let route: EvacuationRoute | undefined = undefined;
      if (bestShelter) {
        route = generateSafeEvacuationRoute(loc, bestShelter, zones);
      }

      setRankedShelters(ranked);
      setRecommendedShelter(bestShelter);
      if (!isNavigating && route) {
        setActiveEvacuationRoute(route);
      }

      const prevDanger = safetyAnalysis.dangerLevel;
      const newDanger = evaluation.dangerLevel;

      // Notify if zone change occurs
      if (prevDanger !== newDanger) {
        if (newDanger === 'CRITICAL' || newDanger === 'DANGER') {
          triggerToast(
            `🚨 ${newDanger} HAZARD DETECTED`,
            `Your location is inside an active danger zone. Nearest shelter: ${bestShelter?.name || 'Safe Zone'}`,
            'CRITICAL'
          );
        } else if (newDanger === 'WARNING') {
          triggerToast('⚠️ YOU ARE APPROACHING A HAZARD ZONE', 'Stay alert and prepare emergency supplies.', 'WARNING');
        } else if (newDanger === 'SAFE' && (prevDanger === 'DANGER' || prevDanger === 'CRITICAL')) {
          triggerToast('🛡️ YOU HAVE ENTERED A SAFE ZONE', 'You are now outside the affected hazard perimeter.', 'SAFETY');
        }
      }

      setSafetyAnalysis({
        userLocation: loc,
        address: addr,
        dangerLevel: evaluation.dangerLevel,
        riskScore: evaluation.riskScore,
        nearestDisasterZone: evaluation.nearestDisasterZone,
        distanceToDangerZoneKm: evaluation.distanceToDangerZoneKm,
        distanceToDisasterCenterKm: evaluation.distanceToDisasterCenterKm,
        statusMessage: evaluation.statusMessage,
        actionDirective: evaluation.actionDirective,
        recommendedShelter: bestShelter,
        evacuationRoute: route,
        nearbyHazards: evaluation.nearbyHazards,
        gpsAccuracyMeters: gpsAccuracyMeters,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    },
    [gpsAccuracyMeters, isNavigating, safetyAnalysis.dangerLevel, triggerToast]
  );

  // Initial Data Fetch
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [disastersRes, sheltersRes, resourcesRes, servicesRes, victimsRes, incidentsRes, volunteersRes, rescueTeamsRes, alertsRes, statsRes, aiAdvRes] =
        await Promise.all([
          DisasterAPI.getDisasters(),
          DisasterAPI.getShelters(),
          DisasterAPI.getResources(),
          DisasterAPI.getEmergencyServices(),
          DisasterAPI.getVictims(),
          DisasterAPI.getIncidents(),
          DisasterAPI.getVolunteers(),
          DisasterAPI.getRescueTeams(),
          DisasterAPI.getAlerts(),
          DisasterAPI.getDashboardStats(),
          DisasterAPI.getAIAdvisor(),
        ]);

      setDisasterZones(disastersRes.disasterZones || []);
      setSimulationState(disastersRes.simulationState || simulationState);
      setShelters(sheltersRes || []);
      setReliefResources(resourcesRes || []);
      setEmergencyServices(servicesRes || []);
      setVictims(victimsRes || []);
      setIncidents(incidentsRes || []);
      setVolunteers(volunteersRes || []);
      setRescueTeams(rescueTeamsRes || []);
      setAlerts(alertsRes || []);
      setDashboardStats(statsRes || dashboardStats);
      setAiAdvisor(aiAdvRes || []);

      recalculateSafety(userLocation, userAddress, disastersRes.disasterZones || [], sheltersRes || []);
    } catch (err) {
      console.error('Failed to load disaster telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardStats, recalculateSafety, simulationState, userAddress, userLocation]);

  useEffect(() => {
    refreshData();
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Location detection via Browser Geolocation API
  const requestCurrentLocation = async () => {
    setGpsStatus('ACQUIRING');
    if (!navigator.geolocation) {
      setGpsStatus('DENIED');
      triggerToast('GPS Unavailable', 'Geolocation is not supported by your browser.', 'WARNING');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const point: GeoPoint = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        };
        const accuracy = Math.round(pos.coords.accuracy || 10);
        setGpsAccuracyMeters(accuracy);
        setGpsStatus('LIVE');
        setLastLocationUpdate(new Date().toLocaleTimeString());
        setUserLocation(point);

        const addr = await reverseGeocode(point.lat, point.lng);
        setUserAddress(addr);
        recalculateSafety(point, addr, disasterZones, shelters);
        triggerToast('📍 GPS Location Acquired', `${addr} (Accuracy: ±${accuracy}m)`, 'SAFETY');
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setGpsStatus('DENIED');
        triggerToast('GPS Access Notice', 'Location permission denied or timed out. Using simulated disaster sector.', 'INFO');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Set manual / preset location
  const setUserCustomLocation = async (point: GeoPoint, addressOverride?: string) => {
    setUserLocation(point);
    setGpsStatus('SIMULATED');
    setLastLocationUpdate(new Date().toLocaleTimeString());
    const addr = addressOverride || (await reverseGeocode(point.lat, point.lng));
    setUserAddress(addr);
    recalculateSafety(point, addr, disasterZones, shelters);
  };

  // Live Location Tracking Toggle
  const toggleLiveTracking = () => {
    setIsLiveTracking((prev) => {
      const next = !prev;
      if (next) {
        triggerToast('📡 Live Location Tracking Active', 'Real-time hazard proximity and evacuation re-routing enabled.', 'SAFETY');
      } else {
        triggerToast('Location Tracking Paused', 'Continuous location monitoring stopped.', 'INFO');
      }
      return next;
    });
  };

  // Live tracking timer loop
  useEffect(() => {
    if (!isLiveTracking) return;

    const interval = setInterval(() => {
      setLastLocationUpdate(new Date().toLocaleTimeString());
      // In live tracking mode, check real GPS if active or simulate slight drift for demo
      if (gpsStatus === 'LIVE' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const pt: GeoPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(pt);
          recalculateSafety(pt, userAddress, disasterZones, shelters);
        });
      } else {
        // Subtle drift simulation
        setUserLocation((prev) => {
          const drifted = {
            lat: Number((prev.lat + (Math.random() - 0.5) * 0.0004).toFixed(5)),
            lng: Number((prev.lng + (Math.random() - 0.5) * 0.0004).toFixed(5)),
          };
          recalculateSafety(drifted, userAddress, disasterZones, shelters);
          return drifted;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveTracking, gpsStatus, userAddress, disasterZones, shelters, recalculateSafety]);

  // Find Safest Place
  const findSafestPlace = () => {
    const ranked = rankSafestShelters(userLocation, shelters, disasterZones);
    if (ranked.length > 0) {
      const safest = ranked[0];
      setRecommendedShelter(safest);
      const route = generateSafeEvacuationRoute(userLocation, safest, disasterZones);
      setActiveEvacuationRoute(route);
      triggerToast(
        `🛡️ Safest Shelter Identified: ${safest.name}`,
        `Safety Score: ${safest.safetyScore}% • Distance: ${safest.distanceKm} km • Available Beds: ${safest.availableCapacity}`,
        'SAFETY'
      );
    }
  };

  const startNavigationToShelter = (shelter: Shelter) => {
    const route = generateSafeEvacuationRoute(userLocation, shelter, disasterZones);
    setActiveEvacuationRoute(route);
    setIsNavigating(true);
    triggerToast(
      `🧭 Turn-by-Turn Navigation Started`,
      `Routing to ${shelter.name} (${route.distanceKm} km, ~${route.estimatedMinutes} mins)`,
      'SAFETY'
    );
  };

  const stopNavigation = () => {
    setIsNavigating(false);
  };

  // Submit Emergency Request / Form
  const submitEmergencyRequest = async (formData: any) => {
    const payload = {
      ...formData,
      location: userLocation,
      address: userAddress,
    };
    const res = await DisasterAPI.createIncident(payload);
    if (res.success) {
      setIncidents((prev) => [res.incident, ...prev]);
      triggerToast(
        `🚨 Emergency Assistance Logged (#${res.incident.code})`,
        `Priority: ${res.incident.priority}. Emergency response teams notified.`,
        'CRITICAL'
      );
      refreshData();
    }
    return res;
  };

  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);

  // One-Click SOS
  const triggerSOS = async () => {
    const payload: Partial<Incident> = {
      userName: 'Emergency SOS User',
      userPhone: '+91 91100 00000',
      location: userLocation,
      address: userAddress,
      emergencyType: 'IMMEDIATE SOS DISTRESS CALL',
      peopleCount: 1,
      vulnerabilities: ['Trapped / High Hazard Zone'],
      description: `SOS Button activated from ${userAddress}. Coordinates: ${userLocation.lat}, ${userLocation.lng}`,
      priority: 'CRITICAL',
    };
    const res = await DisasterAPI.createIncident(payload);
    if (res.success) {
      setIncidents((prev) => [res.incident, ...prev]);
      triggerToast(
        `🚨 SOS DISPATCH ACTIVE (#${res.incident.code})`,
        `Emergency coordinates transmitted. Rescue team triage in progress.`,
        'CRITICAL'
      );
      refreshData();
    }
    return res;
  };

  const reportVictimNeed = async (data: any): Promise<string> => {
    const res = await submitEmergencyRequest(data);
    return res.incident?.code || `DG-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  };

  const assignRescueTeamToVictim = async (victimId: string, teamId: string) => {
    await assignVictimToRescueTeam(victimId, teamId);
  };

  const updateVictimStatus = async (victimId: string, status: any) => {
    setVictims((prev) =>
      prev.map((v) => (v.id === victimId ? { ...v, status: status } : v))
    );
    triggerToast('Victim Status Updated', `Status changed to ${status}`, 'INFO');
  };

  const registerVolunteer = async (volunteerData: any) => {
    const newVol: Volunteer = {
      id: `vol-${Date.now()}`,
      name: volunteerData.name,
      phone: volunteerData.contactPhone || volunteerData.phone,
      skills: volunteerData.skills || ['Rescue', 'Medical'],
      location: volunteerData.currentLocation || userLocation,
      address: volunteerData.assignedZone || userAddress,
      availability: 'AVAILABLE',
    };
    setVolunteers((prev) => [newVol, ...prev]);
    triggerToast('Volunteer Registered', `Welcome to the Civic Response Corps, ${volunteerData.name}!`, 'SAFETY');
  };

  const updateSimulation = async (params: any) => {
    setSimulationState((prev) => ({
      ...prev,
      ...params,
    }));
  };

  const updateShelterOccupancy = async (shelterId: string, newOccupancy: number) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id === shelterId) {
          const cap = s.maxCapacity;
          const occ = Math.max(0, Math.min(cap, newOccupancy));
          const status = occ >= cap ? 'FULL' : occ >= cap * 0.8 ? 'NEAR_CAPACITY' : 'OPEN';
          return {
            ...s,
            currentOccupancy: occ,
            availableCapacity: cap - occ,
            status,
          };
        }
        return s;
      })
    );
  };

  // Resource Allocation
  const allocateResource = async (resourceId: string, quantity: number, targetZone?: string, targetShelterId?: string) => {
    const res = await DisasterAPI.allocateResources({ resourceId, quantity, targetZone, targetShelterId });
    if (res.success) {
      triggerToast('📦 Resource Dispatched', `Allocated ${quantity} units to destination.`, 'SAFETY');
      refreshData();
    }
  };

  // Victim Assignment
  const assignVictimToRescueTeam = async (victimId: string, teamId: string) => {
    const res = await DisasterAPI.assignVictimTeam(victimId, teamId);
    if (res.success) {
      triggerToast('🚑 Rescue Team Dispatched', `Team assigned to victim incident.`, 'SAFETY');
      refreshData();
    }
  };

  // Simulation Operations
  const startSimulation = async (config: any) => {
    const res = await DisasterAPI.startSimulation(config);
    if (res.success) {
      setSimulationState(res.simulationState);
      setDisasterZones(res.disasterZones);
      setAiAdvisor(res.aiAdvisorRecommendations);
      recalculateSafety(userLocation, userAddress, res.disasterZones, shelters);
      triggerToast('⚡ Disaster Simulation Active', `${config.disasterType} simulation initialized at ${config.radiusKm} km radius.`, 'WARNING');
    }
  };

  const stepSimulation = async (step: 'T+0' | 'T+15' | 'T+30' | 'T+60') => {
    const res = await DisasterAPI.stepSimulation(step);
    if (res.success) {
      setSimulationState(res.simulationState);
      setDisasterZones(res.disasterZones);
      setShelters(res.shelters);
      recalculateSafety(userLocation, userAddress, res.disasterZones, res.shelters);
      triggerToast(`⏱️ Simulation Timeline: ${step}`, `Disaster perimeter expanded. Shelter stress & risk scores recalculated.`, 'INFO');
    }
  };

  const stopSimulation = async () => {
    const res = await DisasterAPI.stopSimulation();
    if (res.success) {
      setSimulationState(res.simulationState);
      triggerToast('Simulation Reset', 'Disaster simulation stopped.', 'INFO');
      refreshData();
    }
  };

  const loadPresetScenario = async (preset: string) => {
    const res = await DisasterAPI.loadPreset(preset);
    if (res.success) {
      setSimulationState(res.simulationState);
      setDisasterZones(res.disasterZones);
      setUserLocation(res.simulationState.epicenter);
      const addr = await reverseGeocode(res.simulationState.epicenter.lat, res.simulationState.epicenter.lng);
      setUserAddress(addr);
      recalculateSafety(res.simulationState.epicenter, addr, res.disasterZones, shelters);
      triggerToast(`Scenario Loaded: ${preset.toUpperCase()}`, `Simulation centered on ${addr}`, 'INFO');
    }
  };

  const updateShelterCapacity = async (shelterId: string, delta: number) => {
    await DisasterAPI.updateShelterOccupancy(shelterId, delta);
    refreshData();
  };

  return (
    <DisasterContext.Provider
      value={{
        userLocation,
        userAddress,
        gpsStatus,
        gpsAccuracyMeters,
        lastLocationUpdate,
        isLiveTracking,
        safetyAnalysis,
        rankedShelters,
        recommendedShelter,
        activeEvacuationRoute,
        isNavigating,
        requestCurrentLocation,
        setUserCustomLocation,
        toggleLiveTracking,
        findSafestPlace,
        startNavigationToShelter,
        stopNavigation,
        disasterZones,
        shelters,
        reliefResources,
        emergencyServices,
        victims,
        incidents,
        volunteers,
        rescueTeams,
        alerts,
        dashboardStats,
        simulationState,
        aiAdvisor,
        isOffline,
        isLoading,
        submitEmergencyRequest,
        reportVictimNeed,
        triggerSOS,
        allocateResource,
        assignVictimToRescueTeam,
        assignRescueTeamToVictim,
        updateVictimStatus,
        registerVolunteer,
        startSimulation,
        stepSimulation,
        stopSimulation,
        updateSimulation,
        isSimulationRunning,
        setIsSimulationRunning,
        loadPresetScenario,
        updateShelterCapacity,
        updateShelterOccupancy,
        refreshData,
        isSOSModalOpen,
        setIsSOSModalOpen,
        isHelpModalOpen,
        setIsHelpModalOpen,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};

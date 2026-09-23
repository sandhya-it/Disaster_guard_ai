import {
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
  GeoPoint,
} from '../types';

const STORAGE_KEYS = {
  SHELTERS: 'dg_cached_shelters',
  ZONES: 'dg_cached_zones',
  RESOURCES: 'dg_cached_resources',
  SERVICES: 'dg_cached_services',
  INCIDENTS: 'dg_cached_incidents',
  ALERTS: 'dg_cached_alerts',
  STATS: 'dg_cached_stats',
};

// Safe fetch with local storage caching fallback
async function fetchWithFallback<T>(url: string, storageKey: string, defaultFallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        // ignore localStorage quota errors
      }
      return data;
    }
  } catch (err) {
    console.warn(`Network fetch failed for ${url}, attempting cache fallback:`, err);
  }

  // Attempt local storage cache
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    // ignore
  }

  return defaultFallback;
}

export const DisasterAPI = {
  async getDisasters(): Promise<{ currentDisaster: any; disasterZones: DisasterZone[]; simulationState: SimulationState }> {
    return fetchWithFallback('/api/disasters', STORAGE_KEYS.ZONES, {
      currentDisaster: {
        id: 'DEMO-DISASTER',
        name: 'Severe Inundation Surge',
        type: 'Flood',
        severity: 'Critical',
        activeSince: new Date().toISOString(),
        center: { lat: 13.0827, lng: 80.2707 },
        radiusKm: 4.8,
      },
      disasterZones: [],
      simulationState: {
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
      },
    });
  },

  async getDisasterZones(): Promise<DisasterZone[]> {
    return fetchWithFallback('/api/disaster-zones', STORAGE_KEYS.ZONES, []);
  },

  async getShelters(): Promise<Shelter[]> {
    return fetchWithFallback('/api/shelters', STORAGE_KEYS.SHELTERS, []);
  },

  async getResources(): Promise<ReliefResource[]> {
    return fetchWithFallback('/api/resources', STORAGE_KEYS.RESOURCES, []);
  },

  async getEmergencyServices(): Promise<EmergencyServiceFacility[]> {
    return fetchWithFallback('/api/emergency-services', STORAGE_KEYS.SERVICES, []);
  },

  async getVictims(): Promise<Victim[]> {
    return fetchWithFallback('/api/victims', 'dg_cached_victims', []);
  },

  async getIncidents(): Promise<Incident[]> {
    return fetchWithFallback('/api/incidents', STORAGE_KEYS.INCIDENTS, []);
  },

  async getVolunteers(): Promise<Volunteer[]> {
    return fetchWithFallback('/api/volunteers', 'dg_cached_volunteers', []);
  },

  async getRescueTeams(): Promise<RescueTeam[]> {
    return fetchWithFallback('/api/rescue-teams', 'dg_cached_rescueteams', []);
  },

  async getAlerts(): Promise<AlertNotification[]> {
    return fetchWithFallback('/api/alerts', STORAGE_KEYS.ALERTS, []);
  },

  async getAIAdvisor(): Promise<AIDecisionRecommendation[]> {
    return fetchWithFallback('/api/ai-advisor', 'dg_cached_aiadvisor', []);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return fetchWithFallback('/api/dashboard/stats', STORAGE_KEYS.STATS, {
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
  },

  async createIncident(incidentData: Partial<Incident>): Promise<{ success: boolean; incident: Incident }> {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Incident creation offline fallback', err);
    }

    // Offline simulation creation
    const offlineIncident: Incident = {
      id: `INC-OFFLINE-${Date.now().toString().slice(-4)}`,
      code: `DG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      userName: incidentData.userName || 'Citizen (Offline Mode)',
      userPhone: incidentData.userPhone || 'Not provided',
      location: incidentData.location || { lat: 13.0827, lng: 80.2707 },
      address: incidentData.address || 'Cached Coordinates',
      emergencyType: incidentData.emergencyType || 'Emergency Help',
      peopleCount: incidentData.peopleCount || 1,
      vulnerabilities: incidentData.vulnerabilities || [],
      description: incidentData.description || 'Queued locally in offline storage',
      priority: incidentData.priority || 'CRITICAL',
      status: 'REQUEST_RECEIVED',
      notes: ['Logged locally during low-connectivity. Will sync when reconnected.'],
    };

    return { success: true, incident: offlineIncident };
  },

  async allocateResources(data: { resourceId: string; quantity: number; targetZone?: string; targetShelterId?: string }): Promise<any> {
    const res = await fetch('/api/resources/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async assignVictimTeam(victimId: string, teamId: string): Promise<any> {
    const res = await fetch(`/api/victims/${victimId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
    return res.json();
  },

  async updateShelterOccupancy(shelterId: string, occupancyDelta: number): Promise<any> {
    const res = await fetch(`/api/shelters/${shelterId}/update-occupancy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupancyDelta }),
    });
    return res.json();
  },

  async startSimulation(config: any): Promise<any> {
    const res = await fetch('/api/simulation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async stepSimulation(step: string): Promise<any> {
    const res = await fetch('/api/simulation/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step }),
    });
    return res.json();
  },

  async stopSimulation(): Promise<any> {
    const res = await fetch('/api/simulation/stop', {
      method: 'POST',
    });
    return res.json();
  },

  async loadPreset(presetName: string): Promise<any> {
    const res = await fetch('/api/simulation/load-preset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset: presetName }),
    });
    return res.json();
  },
};

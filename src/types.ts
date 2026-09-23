export type DangerLevel = 'SAFE' | 'LOW_RISK' | 'WARNING' | 'DANGER' | 'CRITICAL';

export type DisasterType = 'Flood' | 'Cyclone' | 'Earthquake' | 'Wildfire' | 'Landslide' | 'Industrial accident';

export type DisasterSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface DisasterZone {
  id: string;
  name: string;
  type: DisasterType;
  severity: DisasterSeverity;
  dangerLevel: DangerLevel;
  center: GeoPoint;
  radiusKm: number;
  polygon?: GeoPoint[]; // Custom boundary vertices if applicable
  description: string;
  affectedPopulation: number;
  activeSince: string;
}

export interface Shelter {
  id: string;
  name: string;
  location: GeoPoint;
  address: string;
  maxCapacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  status: 'OPEN' | 'NEAR_CAPACITY' | 'FULL' | 'CLOSED';
  safetyScore: number; // 0 - 100
  distanceKm?: number;
  estimatedTravelTimeMin?: number;
  resources: {
    water: boolean;
    food: boolean;
    medical: boolean;
    power: boolean;
    bedding: boolean;
    babyCare: boolean;
  };
  medicalSupport: boolean;
  wheelchairAccessible: boolean;
  petFriendly: boolean;
  contactPhone: string;
}

export interface ReliefResource {
  id: string;
  type: 'FOOD' | 'WATER' | 'MEDICAL' | 'SHELTER' | 'CLOTHING' | 'BABY_CARE' | 'RESCUE_EQUIPMENT';
  name: string;
  totalQuantity: number;
  unit: string;
  nearestCenter: string;
  nearestCenterDistanceKm: number;
  status: 'AVAILABLE' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
  allocatedQuantity: number;
  criticalThreshold: number;
}

export interface EmergencyServiceFacility {
  id: string;
  name: string;
  type: 'POLICE' | 'FIRE' | 'AMBULANCE' | 'HOSPITAL';
  location: GeoPoint;
  address: string;
  distanceKm?: number;
  phone: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'STANDBY' | 'BUSY';
  emergencyDeptStatus?: 'OPEN 24/7' | 'HIGH OCCUPANCY' | 'DIVERTING';
}

export interface Victim {
  id: string;
  code: string; // e.g. V-1042
  name: string;
  location: GeoPoint;
  address: string;
  emergencyType: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore: number; // 0 - 100
  waitingTimeMinutes: number;
  peopleCount: number;
  hasChildren: boolean;
  hasElderly: boolean;
  hasDisabled: boolean;
  isMedicalEmergency: boolean;
  isTrapped: boolean;
  dangerLevelAtLocation: DangerLevel;
  status: 'WAITING' | 'TRIAGED' | 'ASSIGNED' | 'RESCUED';
  assignedTeamId?: string;
  phone: string;
  notes: string;
}

export interface Incident {
  id: string;
  code: string; // e.g. DG-2026-00481
  timestamp: string;
  userName: string;
  userPhone: string;
  location: GeoPoint;
  address: string;
  emergencyType: string;
  peopleCount: number;
  vulnerabilities: string[];
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'REQUEST_RECEIVED' | 'TRIAGED' | 'TEAM_ASSIGNED' | 'RESCUE_IN_PROGRESS' | 'RESOLVED';
  assignedTeam?: string;
  notes?: string[];
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  skills: ('Medical' | 'Rescue' | 'Driving' | 'Food distribution' | 'Logistics' | 'Communication' | 'Search & rescue')[];
  location: GeoPoint;
  address: string;
  availability: 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY';
  assignedTaskId?: string;
  assignedTaskName?: string;
}

export interface RescueTeam {
  id: string;
  name: string;
  unitCode: string; // e.g. RT-ALPHA
  vehicleType: '4x4 Ambulance' | 'Heavy Rescue Boat' | 'Helicopter Unit' | 'ATV Squad' | 'Search & Extraction';
  capacity: number;
  currentLocation: GeoPoint;
  destinationLocation?: GeoPoint;
  status: 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED';
  currentTaskId?: string;
  currentTaskDescription?: string;
  etaMinutes?: number;
  routePath?: GeoPoint[];
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'SAFETY' | 'RESOURCE' | 'INFO';
  timestamp: string;
  distanceKm?: number;
  actionLabel?: string;
  actionUrl?: string;
}

export interface SimulationState {
  isActive: boolean;
  disasterType: DisasterType;
  severity: DisasterSeverity;
  radiusKm: number;
  epicenter: GeoPoint;
  timelineStep: 'T+0' | 'T+15' | 'T+30' | 'T+60';
  isPlaying: boolean;
  affectedPopulation: number;
  affectedSheltersCount: number;
  peopleAtRiskCount: number;
  roadClosuresCount: number;
}

export interface EvacuationRoute {
  origin: GeoPoint;
  destinationShelter: Shelter;
  distanceKm: number;
  estimatedMinutes: number;
  safetyScore: number;
  avoidedHazards: string[];
  waypoints: GeoPoint[];
  steps: {
    instruction: string;
    distanceMeters: number;
    hazardWarning?: string;
  }[];
}

export interface SafetyAnalysisResult {
  userLocation: GeoPoint;
  address: string;
  dangerLevel: DangerLevel;
  riskScore: number; // 0 - 100
  nearestDisasterZone?: DisasterZone;
  distanceToDangerZoneKm: number;
  distanceToDisasterCenterKm: number;
  statusMessage: string;
  actionDirective: string;
  recommendedShelter?: Shelter;
  evacuationRoute?: EvacuationRoute;
  nearbyHazards: string[];
  gpsAccuracyMeters: number;
  lastUpdated: string;
}

export interface DashboardStats {
  activeIncidents: number;
  peopleAtRisk: number;
  safeCitizens: number;
  needingAssistance: number;
  openShelters: number;
  totalShelterCapacity: number;
  currentShelterOccupancy: number;
  rescueTeamsActive: number;
  totalRescueTeams: number;
  criticalVictimsCount: number;
  lowStockResourcesCount: number;
}

export interface AIDecisionRecommendation {
  id: string;
  type: 'RESOURCE_DEFICIT' | 'CAPACITY_WARNING' | 'RESCUE_DISPATCH' | 'ROUTE_ALERT' | 'EVACUATION_NOTICE';
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  message: string;
  suggestedAction: string;
  timestamp: string;
}

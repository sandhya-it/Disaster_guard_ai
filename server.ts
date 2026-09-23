import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database Seeded with Realistic Disaster Scenario Data
// Default Anchor: Chennai Metropolitan Coastal Sector (13.0827, 80.2707)

let currentDisaster = {
  id: 'DISASTER-2026-CYCLONE-NIVAR',
  name: 'Severe Cyclonic Storm & Inundation Surge',
  type: 'Flood',
  severity: 'Critical',
  activeSince: '2026-08-25T18:00:00Z',
  center: { lat: 13.0827, lng: 80.2707 },
  radiusKm: 4.8,
  description: 'Coastal tidal surge with Adyar and Cooum river overflow. Low-lying urban sectors inundated.',
};

let disasterZones = [
  {
    id: 'ZONE-RED-CRITICAL',
    name: 'Marina Shoreline & Cooum River Basin',
    type: 'Flood',
    severity: 'Critical',
    dangerLevel: 'CRITICAL',
    center: { lat: 13.078, lng: 80.276 },
    radiusKm: 2.4,
    description: 'Extreme inundation (>2.5m). Roads submerged, power lines deactivated.',
    affectedPopulation: 14200,
    activeSince: '2026-08-25T18:30:00Z',
  },
  {
    id: 'ZONE-ORANGE-DANGER',
    name: 'Adyar Inundation Corridor & Triplicane',
    type: 'Flood',
    severity: 'High',
    dangerLevel: 'DANGER',
    center: { lat: 13.065, lng: 80.260 },
    radiusKm: 3.6,
    description: 'Severe surface waterlogging, ground floor access compromised.',
    affectedPopulation: 28600,
    activeSince: '2026-08-25T19:00:00Z',
  },
  {
    id: 'ZONE-YELLOW-WARNING',
    name: 'Nungambakkam & Egmore Periphery',
    type: 'Flood',
    severity: 'Medium',
    dangerLevel: 'WARNING',
    center: { lat: 13.088, lng: 80.245 },
    radiusKm: 5.2,
    description: 'High runoff advisory, potential drainage backup and localized flash floods.',
    affectedPopulation: 45000,
    activeSince: '2026-08-25T19:30:00Z',
  },
];

let shelters = [
  {
    id: 'SHELTER-01',
    name: 'Anna Nagar Community Mega Shelter',
    location: { lat: 13.085, lng: 80.210 },
    address: '2nd Avenue, Anna Nagar West (High Ground)',
    maxCapacity: 600,
    currentOccupancy: 340,
    availableCapacity: 260,
    status: 'OPEN',
    safetyScore: 96,
    resources: { water: true, food: true, medical: true, power: true, bedding: true, babyCare: true },
    medicalSupport: true,
    wheelchairAccessible: true,
    petFriendly: true,
    contactPhone: '+91 44 2621 8000',
  },
  {
    id: 'SHELTER-02',
    name: 'Loyola College Elevated Campus Relief Center',
    location: { lat: 13.064, lng: 80.233 },
    address: 'Sterling Road, Nungambakkam',
    maxCapacity: 450,
    currentOccupancy: 395,
    availableCapacity: 55,
    status: 'NEAR_CAPACITY',
    safetyScore: 89,
    resources: { water: true, food: true, medical: true, power: true, bedding: true, babyCare: false },
    medicalSupport: true,
    wheelchairAccessible: true,
    petFriendly: false,
    contactPhone: '+91 44 2817 8200',
  },
  {
    id: 'SHELTER-03',
    name: 'Koyambedu Indoor Stadium Safe Zone',
    location: { lat: 13.071, lng: 80.194 },
    address: 'Jawaharlal Nehru Road, Koyambedu',
    maxCapacity: 800,
    currentOccupancy: 420,
    availableCapacity: 380,
    status: 'OPEN',
    safetyScore: 94,
    resources: { water: true, food: true, medical: true, power: true, bedding: true, babyCare: true },
    medicalSupport: true,
    wheelchairAccessible: true,
    petFriendly: true,
    contactPhone: '+91 44 2479 6600',
  },
  {
    id: 'SHELTER-04',
    name: 'Kilpauk Medical College Pavilion',
    location: { lat: 13.079, lng: 80.243 },
    address: 'E.V.R. Periyar Salai, Kilpauk',
    maxCapacity: 300,
    currentOccupancy: 285,
    availableCapacity: 15,
    status: 'NEAR_CAPACITY',
    safetyScore: 84,
    resources: { water: true, food: true, medical: true, power: true, bedding: false, babyCare: true },
    medicalSupport: true,
    wheelchairAccessible: true,
    petFriendly: false,
    contactPhone: '+91 44 2836 4950',
  },
  {
    id: 'SHELTER-05',
    name: 'Guindy Race Course High ground Camp',
    location: { lat: 13.007, lng: 80.218 },
    address: 'Guindy Grand Southern Trunk Rd',
    maxCapacity: 500,
    currentOccupancy: 210,
    availableCapacity: 290,
    status: 'OPEN',
    safetyScore: 92,
    resources: { water: true, food: true, medical: false, power: true, bedding: true, babyCare: true },
    medicalSupport: false,
    wheelchairAccessible: true,
    petFriendly: true,
    contactPhone: '+91 44 2235 1100',
  },
  {
    id: 'SHELTER-06',
    name: 'Madras University Chepauk Relief Point',
    location: { lat: 13.068, lng: 80.281 },
    address: 'Chepauk Beach Road (Low Elevation)',
    maxCapacity: 400,
    currentOccupancy: 400,
    availableCapacity: 0,
    status: 'FULL',
    safetyScore: 32, // Dangerous zone proximity!
    resources: { water: false, food: false, medical: true, power: false, bedding: false, babyCare: false },
    medicalSupport: true,
    wheelchairAccessible: false,
    petFriendly: false,
    contactPhone: '+91 44 2539 9000',
  },
  {
    id: 'SHELTER-07',
    name: 'Perambur Railway Community Hall',
    location: { lat: 13.112, lng: 80.238 },
    address: 'Siruvallur High Rd, Perambur',
    maxCapacity: 350,
    currentOccupancy: 180,
    availableCapacity: 170,
    status: 'OPEN',
    safetyScore: 95,
    resources: { water: true, food: true, medical: true, power: true, bedding: true, babyCare: true },
    medicalSupport: true,
    wheelchairAccessible: true,
    petFriendly: false,
    contactPhone: '+91 44 2670 1200',
  },
  {
    id: 'SHELTER-08',
    name: 'Mylapore Sanskrit College Sanctuary',
    location: { lat: 13.036, lng: 80.266 },
    address: 'Royapettah High Rd, Mylapore',
    maxCapacity: 250,
    currentOccupancy: 250,
    availableCapacity: 0,
    status: 'FULL',
    safetyScore: 48,
    resources: { water: true, food: false, medical: false, power: true, bedding: false, babyCare: false },
    medicalSupport: false,
    wheelchairAccessible: false,
    petFriendly: false,
    contactPhone: '+91 44 2498 0400',
  },
  {
    id: 'SHELTER-09',
    name: 'T. Nagar Holy Angels Safe Pavilion',
    location: { lat: 13.041, lng: 80.237 },
    address: 'Sir Thyagaraya Rd, Pondy Bazaar',
    maxCapacity: 350,
    currentOccupancy: 290,
    availableCapacity: 60,
    status: 'OPEN',
    safetyScore: 82,
    resources: { water: true, food: true, medical: true, power: true, bedding: true, babyCare: true },
    medicalSupport: true,
    wheelchairAccessible: true,
    petFriendly: true,
    contactPhone: '+91 44 2815 3000',
  },
  {
    id: 'SHELTER-10',
    name: 'IIT Madras Indoor Complex Reserve Shelter',
    location: { lat: 12.991, lng: 80.233 },
    address: 'Sardar Patel Road, Adyar/Guindy boundary',
    maxCapacity: 750,
    currentOccupancy: 190,
    availableCapacity: 560,
    status: 'OPEN',
    safetyScore: 98,
    resources: { water: true, food: true, medical: true, power: true, bedding: true, babyCare: true },
    medicalSupport: true,
    wheelchairAccessible: true,
    petFriendly: true,
    contactPhone: '+91 44 2257 8000',
  },
];

let reliefResources = [
  {
    id: 'RES-01',
    type: 'FOOD',
    name: 'Emergency Ration Packs & MREs',
    totalQuantity: 8400,
    unit: 'meal packets',
    nearestCenter: 'Central Logistics Depot (Koyambedu)',
    nearestCenterDistanceKm: 2.2,
    status: 'AVAILABLE',
    allocatedQuantity: 5120,
    criticalThreshold: 2000,
  },
  {
    id: 'RES-02',
    type: 'WATER',
    name: 'Purified Potable Water Pouches',
    totalQuantity: 18500,
    unit: 'liters / pouches',
    nearestCenter: 'Metro Water Central Reserve',
    nearestCenterDistanceKm: 1.4,
    status: 'AVAILABLE',
    allocatedQuantity: 12400,
    criticalThreshold: 4000,
  },
  {
    id: 'RES-03',
    type: 'MEDICAL',
    name: 'Trauma & Waterborne Disease Kits',
    totalQuantity: 1450,
    unit: 'medical trauma kits',
    nearestCenter: 'Kilpauk Disaster Medical Depot',
    nearestCenterDistanceKm: 1.9,
    status: 'LOW',
    allocatedQuantity: 1180,
    criticalThreshold: 500,
  },
  {
    id: 'RES-04',
    type: 'SHELTER',
    name: 'Emergency Folding Cots & Insulation Pads',
    totalQuantity: 3200,
    unit: 'bedding sets',
    nearestCenter: 'State Relief Warehouse',
    nearestCenterDistanceKm: 3.1,
    status: 'AVAILABLE',
    allocatedQuantity: 2100,
    criticalThreshold: 800,
  },
  {
    id: 'RES-05',
    type: 'CLOTHING',
    name: 'Dry Thermal Garments & Blankets',
    totalQuantity: 4200,
    unit: 'kits',
    nearestCenter: 'Egmore Red Cross Station',
    nearestCenterDistanceKm: 1.1,
    status: 'AVAILABLE',
    allocatedQuantity: 2800,
    criticalThreshold: 1000,
  },
  {
    id: 'RES-06',
    type: 'BABY_CARE',
    name: 'Infant Nutrition & Formula Supplies',
    totalQuantity: 850,
    unit: 'care packs',
    nearestCenter: 'Institute of Child Health Center',
    nearestCenterDistanceKm: 1.7,
    status: 'CRITICAL',
    allocatedQuantity: 760,
    criticalThreshold: 250,
  },
  {
    id: 'RES-07',
    type: 'RESCUE_EQUIPMENT',
    name: 'Inflatable Life Rafts & Life Jackets',
    totalQuantity: 340,
    unit: 'units',
    nearestCenter: 'Disaster Rapid Response HQ',
    nearestCenterDistanceKm: 2.8,
    status: 'AVAILABLE',
    allocatedQuantity: 280,
    criticalThreshold: 80,
  },
];

let emergencyServices = [
  {
    id: 'POLICE-01',
    name: 'Vepery Commissionerate Police Headquarters',
    type: 'POLICE',
    location: { lat: 13.084, lng: 80.260 },
    address: 'EVK Sampath Rd, Vepery',
    distanceKm: 1.2,
    phone: '100 / +91 44 2345 2359',
    status: 'AVAILABLE',
  },
  {
    id: 'POLICE-02',
    name: 'Mylapore Sector Police Station',
    type: 'POLICE',
    location: { lat: 13.037, lng: 80.271 },
    address: 'Kutchery Rd, Mylapore',
    distanceKm: 4.8,
    phone: '+91 44 2345 2588',
    status: 'DISPATCHED',
  },
  {
    id: 'FIRE-01',
    name: 'Egmore Fire & State Rescue Command',
    type: 'FIRE',
    location: { lat: 13.076, lng: 80.258 },
    address: 'Rukmani Lakshmipathi Salai, Egmore',
    distanceKm: 0.9,
    phone: '101 / +91 44 2855 4101',
    status: 'AVAILABLE',
  },
  {
    id: 'FIRE-02',
    name: 'T. Nagar Emergency Fire Station',
    type: 'FIRE',
    location: { lat: 13.045, lng: 80.241 },
    address: 'South Usman Road, T. Nagar',
    distanceKm: 3.9,
    phone: '+91 44 2434 2101',
    status: 'DISPATCHED',
  },
  {
    id: 'AMBULANCE-01',
    name: '108 Rapid Medical Response Fleet - Central',
    type: 'AMBULANCE',
    location: { lat: 13.080, lng: 80.270 },
    address: 'Park Town Trauma Hub',
    distanceKm: 0.7,
    phone: '108',
    status: 'AVAILABLE',
  },
  {
    id: 'AMBULANCE-02',
    name: 'Southern Riverine Water Rescue Ambulance',
    type: 'AMBULANCE',
    location: { lat: 13.060, lng: 80.265 },
    address: 'Adyar Estuary Base',
    distanceKm: 2.6,
    phone: '108',
    status: 'DISPATCHED',
  },
  {
    id: 'HOSP-01',
    name: 'Rajiv Gandhi Government General Hospital (RGGGH)',
    type: 'HOSPITAL',
    location: { lat: 13.081, lng: 80.279 },
    address: 'EVR Periyar Salai, Park Town',
    distanceKm: 0.6,
    phone: '+91 44 2530 5000',
    status: 'AVAILABLE',
    emergencyDeptStatus: 'OPEN 24/7',
  },
  {
    id: 'HOSP-02',
    name: 'Apollo Speciality Hospitals Greams Road',
    type: 'HOSPITAL',
    location: { lat: 13.060, lng: 80.252 },
    address: 'Greams Lane, Thousand Lights',
    distanceKm: 2.8,
    phone: '+91 44 2829 0200',
    status: 'AVAILABLE',
    emergencyDeptStatus: 'HIGH OCCUPANCY',
  },
  {
    id: 'HOSP-03',
    name: 'Kilpauk Government Medical College Hospital',
    type: 'HOSPITAL',
    location: { lat: 13.079, lng: 80.243 },
    address: 'Poonamallee High Rd, Kilpauk',
    distanceKm: 3.1,
    phone: '+91 44 2836 4951',
    status: 'AVAILABLE',
    emergencyDeptStatus: 'OPEN 24/7',
  },
];

let victims = [
  {
    id: 'VIC-1042',
    code: 'V-1042',
    name: 'Suresh Kumar & Family',
    location: { lat: 13.077, lng: 80.275 },
    address: 'Dr. Besant Rd, Triplicane (Ground floor flooded 5ft)',
    emergencyType: 'Trapped on Rooftop & Diabetic Medical Shortage',
    priority: 'CRITICAL',
    priorityScore: 96,
    waitingTimeMinutes: 24,
    peopleCount: 4,
    hasChildren: true,
    hasElderly: true,
    hasDisabled: true,
    isMedicalEmergency: true,
    isTrapped: true,
    dangerLevelAtLocation: 'CRITICAL',
    status: 'WAITING',
    phone: '+91 98401 22910',
    notes: 'Elderly patient needing insulin. Water rising 10cm/hr.',
  },
  {
    id: 'VIC-1043',
    code: 'V-1043',
    name: 'Meenakshi Sundaram',
    location: { lat: 13.072, lng: 80.271 },
    address: 'Canal Bank Road, Chepauk',
    emergencyType: 'Structural Wall Collapse Risk',
    priority: 'CRITICAL',
    priorityScore: 92,
    waitingTimeMinutes: 38,
    peopleCount: 6,
    hasChildren: true,
    hasElderly: true,
    hasDisabled: false,
    isMedicalEmergency: false,
    isTrapped: true,
    dangerLevelAtLocation: 'CRITICAL',
    status: 'WAITING',
    phone: '+91 94440 88123',
    notes: '2 infants under 1 year. Need immediate boat evacuation.',
  },
  {
    id: 'VIC-1044',
    code: 'V-1044',
    name: 'Dr. Arunkumar R.',
    location: { lat: 13.064, lng: 80.262 },
    address: 'Royapettah High Rd near Flyover',
    emergencyType: 'Compound Fracture & Head Laceration',
    priority: 'CRITICAL',
    priorityScore: 89,
    waitingTimeMinutes: 14,
    peopleCount: 2,
    hasChildren: false,
    hasElderly: false,
    hasDisabled: false,
    isMedicalEmergency: true,
    isTrapped: false,
    dangerLevelAtLocation: 'DANGER',
    status: 'WAITING',
    phone: '+91 97909 43210',
    notes: 'Severe bleeding controlled with tourniquet. Needs ambulance triage.',
  },
  {
    id: 'VIC-1045',
    code: 'V-1045',
    name: 'Kavitha Nathan',
    location: { lat: 13.067, lng: 80.255 },
    address: 'Gopalapuram 2nd Street',
    emergencyType: 'Oxygen Concentrator Battery Depleted',
    priority: 'HIGH',
    priorityScore: 84,
    waitingTimeMinutes: 45,
    peopleCount: 3,
    hasChildren: false,
    hasElderly: true,
    hasDisabled: true,
    isMedicalEmergency: true,
    isTrapped: false,
    dangerLevelAtLocation: 'WARNING',
    status: 'TRIAGED',
    phone: '+91 98840 55102',
    notes: 'Generator backup failure. Oxygen cylinder required immediately.',
  },
  {
    id: 'VIC-1046',
    code: 'V-1046',
    name: 'Ranganathan P.',
    location: { lat: 13.083, lng: 80.252 },
    address: 'Egmore Marshalls Road',
    emergencyType: 'Potable Drinking Water & Food Depletion',
    priority: 'MEDIUM',
    priorityScore: 65,
    waitingTimeMinutes: 70,
    peopleCount: 5,
    hasChildren: true,
    hasElderly: false,
    hasDisabled: false,
    isMedicalEmergency: false,
    isTrapped: false,
    dangerLevelAtLocation: 'WARNING',
    status: 'WAITING',
    phone: '+91 94441 33299',
    notes: 'Safe on 2nd floor, but isolated by standing water. Ration requested.',
  },
  {
    id: 'VIC-1047',
    code: 'V-1047',
    name: 'Shankar Viswanathan',
    location: { lat: 13.055, lng: 80.245 },
    address: 'T. Nagar South Boag Road',
    emergencyType: 'Evacuation Assistance - Wheelchair bound',
    priority: 'HIGH',
    priorityScore: 78,
    waitingTimeMinutes: 52,
    peopleCount: 2,
    hasChildren: false,
    hasElderly: true,
    hasDisabled: true,
    isMedicalEmergency: false,
    isTrapped: false,
    dangerLevelAtLocation: 'WARNING',
    status: 'ASSIGNED',
    assignedTeamId: 'RT-02',
    phone: '+91 98402 11988',
    notes: 'Assigned to Rescue Team Alpha-2 with wheelchair transport.',
  },
  {
    id: 'VIC-1048',
    code: 'V-1048',
    name: 'Geetha Balaji',
    location: { lat: 13.090, lng: 80.280 },
    address: 'Royapuram Coastal Lane',
    emergencyType: 'Rooftop Stranded without Tarpaulin',
    priority: 'HIGH',
    priorityScore: 82,
    waitingTimeMinutes: 30,
    peopleCount: 8,
    hasChildren: true,
    hasElderly: true,
    hasDisabled: false,
    isMedicalEmergency: false,
    isTrapped: true,
    dangerLevelAtLocation: 'CRITICAL',
    status: 'WAITING',
    phone: '+91 97100 44556',
    notes: 'Heavy rainfall exposure. 3 young children shivering.',
  },
];

let volunteers = [
  {
    id: 'VOL-01',
    name: 'Aravind Krishnan',
    phone: '+91 98400 12345',
    skills: ['Search & rescue', 'Driving'],
    location: { lat: 13.080, lng: 80.260 },
    address: 'Egmore Mobilization Camp',
    availability: 'AVAILABLE',
  },
  {
    id: 'VOL-02',
    name: 'Dr. Priya Ramanathan',
    phone: '+91 97890 23456',
    skills: ['Medical', 'Search & rescue'],
    location: { lat: 13.075, lng: 80.245 },
    address: 'Kilpauk Triage Field Center',
    availability: 'ASSIGNED',
    assignedTaskId: 'INC-01',
    assignedTaskName: 'Triage for Triplicane Inundated Sector',
  },
  {
    id: 'VOL-03',
    name: 'Karthik Raja',
    phone: '+91 94440 34567',
    skills: ['Food distribution', 'Logistics'],
    location: { lat: 13.070, lng: 80.200 },
    address: 'Koyambedu Distribution Depot',
    availability: 'AVAILABLE',
  },
  {
    id: 'VOL-04',
    name: 'Divya Sundar',
    phone: '+91 98401 45678',
    skills: ['Communication', 'Logistics'],
    location: { lat: 13.085, lng: 80.210 },
    address: 'Anna Nagar Mega Shelter EOC',
    availability: 'AVAILABLE',
  },
  {
    id: 'VOL-05',
    name: 'Siddharth M.',
    phone: '+91 99620 56789',
    skills: ['Driving', 'Rescue'],
    location: { lat: 13.060, lng: 80.230 },
    address: 'Loyola Relief Camp Hub',
    availability: 'AVAILABLE',
  },
  {
    id: 'VOL-06',
    name: 'Ananya Iyer',
    phone: '+91 98842 67890',
    skills: ['Medical', 'Communication'],
    location: { lat: 13.082, lng: 80.278 },
    address: 'RGGGH Emergency Annex',
    availability: 'ASSIGNED',
    assignedTaskId: 'INC-02',
    assignedTaskName: 'Patient Intake Coordination',
  },
];

let rescueTeams = [
  {
    id: 'RT-01',
    name: 'NDRF Taskforce Alpha',
    unitCode: 'NDRF-ALPHA',
    vehicleType: 'Heavy Rescue Boat',
    capacity: 12,
    currentLocation: { lat: 13.074, lng: 80.272 },
    destinationLocation: { lat: 13.077, lng: 80.275 },
    status: 'EN_ROUTE',
    currentTaskId: 'VIC-1042',
    currentTaskDescription: 'Extracting Suresh Kumar family from Triplicane rooftop',
    etaMinutes: 6,
    routePath: [
      { lat: 13.074, lng: 80.272 },
      { lat: 13.076, lng: 80.274 },
      { lat: 13.077, lng: 80.275 },
    ],
  },
  {
    id: 'RT-02',
    name: 'SDRF Riverine Unit Beta',
    unitCode: 'SDRF-BETA',
    vehicleType: '4x4 Ambulance',
    capacity: 4,
    currentLocation: { lat: 13.050, lng: 80.240 },
    destinationLocation: { lat: 13.055, lng: 80.245 },
    status: 'ASSIGNED',
    currentTaskId: 'VIC-1047',
    currentTaskDescription: 'High-clearance wheelchair evacuation at T. Nagar',
    etaMinutes: 11,
  },
  {
    id: 'RT-03',
    name: 'Coast Guard Aircrew Cheetah',
    unitCode: 'CG-AIR-03',
    vehicleType: 'Helicopter Unit',
    capacity: 6,
    currentLocation: { lat: 13.080, lng: 80.285 },
    status: 'AVAILABLE',
  },
  {
    id: 'RT-04',
    name: 'Fire Service Urban Tactical Squad',
    unitCode: 'FS-TACTICAL-04',
    vehicleType: 'Search & Extraction',
    capacity: 8,
    currentLocation: { lat: 13.076, lng: 80.258 },
    status: 'AVAILABLE',
  },
  {
    id: 'RT-05',
    name: 'Civil Defence All-Terrain Brigade',
    unitCode: 'CD-ATV-05',
    vehicleType: 'ATV Squad',
    capacity: 4,
    currentLocation: { lat: 13.085, lng: 80.210 },
    status: 'AVAILABLE',
  },
];

let incidents = [
  {
    id: 'INC-01',
    code: 'DG-2026-00481',
    timestamp: '2026-08-25T20:15:00Z',
    userName: 'Suresh Kumar',
    userPhone: '+91 98401 22910',
    location: { lat: 13.077, lng: 80.275 },
    address: 'Dr. Besant Rd, Triplicane',
    emergencyType: 'Trapped on Rooftop',
    peopleCount: 4,
    vulnerabilities: ['Elderly', 'Infant', 'Medical Emergency (Insulin)'],
    description: 'Ground floor submerged by 5 feet. High tidal runoff. Power off.',
    priority: 'CRITICAL',
    status: 'RESCUE_IN_PROGRESS',
    assignedTeam: 'NDRF Taskforce Alpha (Boat 01)',
    notes: [
      '20:15 - SOS Incident Created',
      '20:18 - Triaged as CRITICAL by AI priority engine',
      '20:21 - NDRF Taskforce Alpha deployed with rescue boat',
      '20:25 - Team en route, ETA 6 mins',
    ],
  },
  {
    id: 'INC-02',
    code: 'DG-2026-00482',
    timestamp: '2026-08-25T20:45:00Z',
    userName: 'Ramesh Sundar',
    userPhone: '+91 98400 99881',
    location: { lat: 13.064, lng: 80.233 },
    address: 'Sterling Road, Nungambakkam',
    emergencyType: 'Water Shortage & Senior Evacuation',
    peopleCount: 3,
    vulnerabilities: ['Senior Citizen'],
    description: 'Clean water exhausted. Requesting transport to Loyola shelter.',
    priority: 'MEDIUM',
    status: 'TRIAGED',
    notes: ['20:45 - Online Request logged', '20:50 - Triaged as MEDIUM priority'],
  },
];

let alerts = [
  {
    id: 'ALT-01',
    title: 'CRITICAL FLOOD SURGE WARNING',
    message: 'Cooum River cresting +1.8m above danger level. Evacuation mandatory for Marina & Triplicane sectors.',
    severity: 'CRITICAL',
    timestamp: '2026-08-25T21:00:00Z',
    distanceKm: 0.8,
    actionLabel: 'View Safe Evacuation Route',
  },
  {
    id: 'ALT-02',
    title: 'ROAD INUNDATION DETECTED',
    message: 'Kamarajar Salai and Wallajah Road underpass blocked by floodwaters. System rerouting via elevated GST Corridor.',
    severity: 'WARNING',
    timestamp: '2026-08-25T21:15:00Z',
    distanceKm: 1.4,
  },
  {
    id: 'ALT-03',
    title: 'NEW HIGH-CAPACITY SHELTER OPENED',
    message: 'IIT Madras Indoor Complex Reserve Shelter opened with 560 available beds and backup generators.',
    severity: 'SAFETY',
    timestamp: '2026-08-25T21:20:00Z',
    distanceKm: 4.2,
  },
  {
    id: 'ALT-04',
    title: 'INFANT NUTRITION SHORTAGE ALERT',
    message: 'Baby care kits in Central Logistics reach critical threshold (760/850 allocated). Priority restock underway.',
    severity: 'RESOURCE',
    timestamp: '2026-08-25T21:30:00Z',
  },
];

let simulationState = {
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
};

let aiAdvisorRecommendations = [
  {
    id: 'REC-01',
    type: 'RESOURCE_DEFICIT',
    priority: 'CRITICAL',
    message: 'Potable water shortage projected in Triplicane & Chepauk sectors within 40 minutes.',
    suggestedAction: 'Dispatch 1,200 water pouches from Koyambedu reserve depot via High-Axle Truck 04.',
    timestamp: '2026-08-25T21:35:00Z',
  },
  {
    id: 'REC-02',
    type: 'CAPACITY_WARNING',
    priority: 'HIGH',
    message: 'Loyola College Shelter is at 88% capacity (395/450). Reaching saturation in 25 mins.',
    suggestedAction: 'Divert incoming evacuees to Anna Nagar Mega Shelter (260 available beds, 96% safety score).',
    timestamp: '2026-08-25T21:38:00Z',
  },
  {
    id: 'REC-03',
    type: 'RESCUE_DISPATCH',
    priority: 'CRITICAL',
    message: '3 critical priority victims with trapped infants identified in Zone Red.',
    suggestedAction: 'Reassign Coast Guard Aircrew Cheetah or SDRF Boat 02 for immediate rooftop extraction.',
    timestamp: '2026-08-25T21:40:00Z',
  },
  {
    id: 'REC-04',
    type: 'ROUTE_ALERT',
    priority: 'MEDIUM',
    message: 'Underpass on Wallajah Road inundated with 3.2ft runoff.',
    suggestedAction: 'Broadcast dynamic evacuation waypoint update to route through Anna Salai Flyover corridor.',
    timestamp: '2026-08-25T21:42:00Z',
  },
];

// --- REST API ENDPOINTS ---

// Disasters
app.get('/api/disasters', (req, res) => {
  res.json({ currentDisaster, disasterZones, simulationState });
});

app.get('/api/disaster-zones', (req, res) => {
  res.json(disasterZones);
});

// Shelters
app.get('/api/shelters', (req, res) => {
  res.json(shelters);
});

app.post('/api/shelters/:id/update-occupancy', (req, res) => {
  const { id } = req.params;
  const { occupancyDelta } = req.body;
  const shelter = shelters.find((s) => s.id === id);
  if (shelter) {
    shelter.currentOccupancy = Math.max(0, Math.min(shelter.maxCapacity, shelter.currentOccupancy + Number(occupancyDelta || 0)));
    shelter.availableCapacity = shelter.maxCapacity - shelter.currentOccupancy;
    if (shelter.currentOccupancy >= shelter.maxCapacity) {
      shelter.status = 'FULL';
    } else if (shelter.currentOccupancy >= shelter.maxCapacity * 0.85) {
      shelter.status = 'NEAR_CAPACITY';
    } else {
      shelter.status = 'OPEN';
    }
    return res.json({ success: true, shelter });
  }
  res.status(404).json({ error: 'Shelter not found' });
});

// Resources
app.get('/api/resources', (req, res) => {
  res.json(reliefResources);
});

app.post('/api/resources/allocate', (req, res) => {
  const { resourceId, quantity, targetZone, targetShelterId } = req.body;
  const resource = reliefResources.find((r) => r.id === resourceId);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  const qty = Number(quantity || 0);
  if (resource.allocatedQuantity + qty > resource.totalQuantity) {
    return res.status(400).json({ error: 'Exceeds available resource inventory' });
  }
  resource.allocatedQuantity += qty;
  const remaining = resource.totalQuantity - resource.allocatedQuantity;
  if (remaining <= 0) {
    resource.status = 'OUT_OF_STOCK';
  } else if (remaining <= resource.criticalThreshold) {
    resource.status = 'CRITICAL';
  } else if (remaining <= resource.criticalThreshold * 2) {
    resource.status = 'LOW';
  }

  // Create alert for allocation
  alerts.unshift({
    id: `ALT-RES-${Date.now()}`,
    title: `RESOURCE ALLOCATED: ${resource.name}`,
    message: `${qty} ${resource.unit} dispatched to ${targetShelterId || targetZone || 'High Need Sector'}`,
    severity: 'SAFETY',
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, resource, alerts });
});

// Emergency Services
app.get('/api/emergency-services', (req, res) => {
  res.json(emergencyServices);
});

// Victims & Priority Queue
app.get('/api/victims', (req, res) => {
  res.json(victims);
});

app.post('/api/victims/:id/assign', (req, res) => {
  const { id } = req.params;
  const { teamId } = req.body;
  const victim = victims.find((v) => v.id === id);
  if (victim) {
    victim.status = 'ASSIGNED';
    victim.assignedTeamId = teamId || 'RT-01';
    const team = rescueTeams.find((t) => t.id === teamId);
    if (team) {
      team.status = 'ASSIGNED';
      team.currentTaskId = victim.id;
      team.currentTaskDescription = `Assisting ${victim.name} (${victim.emergencyType})`;
    }
    return res.json({ success: true, victim, team });
  }
  res.status(404).json({ error: 'Victim not found' });
});

// Incidents & SOS
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.post('/api/incidents', (req, res) => {
  const { userName, userPhone, location, address, emergencyType, peopleCount, vulnerabilities, description } = req.body;
  
  // Calculate priority automatically
  let priorityScore = 50;
  if (emergencyType?.includes('Medical') || emergencyType?.includes('Trapped') || emergencyType?.includes('Fire')) priorityScore += 30;
  if (peopleCount && Number(peopleCount) >= 4) priorityScore += 10;
  if (vulnerabilities && vulnerabilities.length > 0) priorityScore += 15;

  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  if (priorityScore >= 85) priority = 'CRITICAL';
  else if (priorityScore >= 70) priority = 'HIGH';
  else if (priorityScore >= 50) priority = 'MEDIUM';
  else priority = 'LOW';

  const newIncident = {
    id: `INC-${Date.now().toString().slice(-4)}`,
    code: `DG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: new Date().toISOString(),
    userName: userName || 'Citizen in Distress',
    userPhone: userPhone || '+91 90000 00000',
    location: location || { lat: 13.0827, lng: 80.2707 },
    address: address || 'Current Shared Coordinates',
    emergencyType: emergencyType || 'Emergency Assistance',
    peopleCount: Number(peopleCount || 1),
    vulnerabilities: vulnerabilities || [],
    description: description || 'Emergency rescue requested via DisasterGuard UI',
    priority,
    status: 'REQUEST_RECEIVED' as const,
    notes: [
      `${new Date().toLocaleTimeString()} - Emergency Incident Logged`,
      `${new Date().toLocaleTimeString()} - Automatic Triaged Priority: ${priority}`,
    ],
  };

  incidents.unshift(newIncident);

  // Also add to victim priority queue if high/critical
  victims.unshift({
    id: `VIC-${newIncident.code}`,
    code: newIncident.code,
    name: newIncident.userName,
    location: newIncident.location,
    address: newIncident.address,
    emergencyType: newIncident.emergencyType,
    priority: newIncident.priority,
    priorityScore,
    waitingTimeMinutes: 1,
    peopleCount: newIncident.peopleCount,
    hasChildren: vulnerabilities?.includes('Children') || false,
    hasElderly: vulnerabilities?.includes('Elderly') || false,
    hasDisabled: vulnerabilities?.includes('Disabled') || false,
    isMedicalEmergency: emergencyType?.includes('Medical') || false,
    isTrapped: emergencyType?.includes('Trapped') || false,
    dangerLevelAtLocation: 'DANGER',
    status: 'WAITING',
    phone: newIncident.userPhone,
    notes: newIncident.description,
  });

  // Trigger automated Alert
  alerts.unshift({
    id: `ALT-SOS-${Date.now()}`,
    title: `🚨 EMERGENCY INCIDENT #${newIncident.code}`,
    message: `${newIncident.emergencyType} reported at ${newIncident.address} (${newIncident.peopleCount} people). Priority: ${newIncident.priority}`,
    severity: newIncident.priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, incident: newIncident });
});

// Volunteers & Rescue Teams
app.get('/api/volunteers', (req, res) => {
  res.json(volunteers);
});

app.post('/api/volunteers', (req, res) => {
  const { name, phone, skills, address, location } = req.body;
  const newVol = {
    id: `VOL-${Date.now().toString().slice(-4)}`,
    name,
    phone,
    skills: skills || ['Food distribution'],
    location: location || { lat: 13.0827, lng: 80.2707 },
    address: address || 'City Sector',
    availability: 'AVAILABLE' as const,
  };
  volunteers.push(newVol);
  res.json({ success: true, volunteer: newVol });
});

app.get('/api/rescue-teams', (req, res) => {
  res.json(rescueTeams);
});

// Alerts
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// AI Advisor recommendations
app.get('/api/ai-advisor', (req, res) => {
  res.json(aiAdvisorRecommendations);
});

// Dashboard overall stats
app.get('/api/dashboard/stats', (req, res) => {
  const totalCap = shelters.reduce((acc, s) => acc + s.maxCapacity, 0);
  const totalOcc = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const openCount = shelters.filter((s) => s.status === 'OPEN' || s.status === 'NEAR_CAPACITY').length;
  const activeTeams = rescueTeams.filter((t) => t.status === 'EN_ROUTE' || t.status === 'ASSIGNED' || t.status === 'ON_SITE').length;
  const critVictims = victims.filter((v) => v.priority === 'CRITICAL' && v.status === 'WAITING').length;
  const lowStock = reliefResources.filter((r) => r.status === 'LOW' || r.status === 'CRITICAL' || r.status === 'OUT_OF_STOCK').length;

  res.json({
    activeIncidents: incidents.length + victims.length,
    peopleAtRisk: simulationState.peopleAtRiskCount,
    safeCitizens: Math.max(0, 12000 - simulationState.peopleAtRiskCount),
    needingAssistance: victims.filter((v) => v.status !== 'RESCUED').reduce((acc, v) => acc + v.peopleCount, 0) + 120,
    openShelters: openCount,
    totalShelterCapacity: totalCap,
    currentShelterOccupancy: totalOcc,
    rescueTeamsActive: activeTeams,
    totalRescueTeams: rescueTeams.length,
    criticalVictimsCount: critVictims,
    lowStockResourcesCount: lowStock,
    simulationState,
  });
});

// Disaster Simulation Trigger & Timeline Engine
app.post('/api/simulation/start', (req, res) => {
  const { disasterType, severity, radiusKm, epicenter, timelineStep } = req.body;
  
  simulationState = {
    isActive: true,
    disasterType: disasterType || simulationState.disasterType,
    severity: severity || simulationState.severity,
    radiusKm: Number(radiusKm || 5.0),
    epicenter: epicenter || simulationState.epicenter,
    timelineStep: timelineStep || 'T+0',
    isPlaying: true,
    affectedPopulation: Math.round(Number(radiusKm || 5.0) * 18200),
    affectedSheltersCount: Math.min(8, Math.round(Number(radiusKm || 5.0) * 0.8)),
    peopleAtRiskCount: Math.round(Number(radiusKm || 5.0) * 1100),
    roadClosuresCount: Math.round(Number(radiusKm || 5.0) * 2.2),
  };

  currentDisaster = {
    id: `DISASTER-${Date.now()}`,
    name: `Simulated ${simulationState.disasterType} Surge`,
    type: simulationState.disasterType,
    severity: simulationState.severity,
    activeSince: new Date().toISOString(),
    center: simulationState.epicenter,
    radiusKm: simulationState.radiusKm,
    description: `Real-time simulated ${simulationState.disasterType} event with ${simulationState.radiusKm} km impact perimeter.`,
  };

  // Re-adjust zones around epicenter
  disasterZones = [
    {
      id: 'ZONE-SIM-CRITICAL',
      name: `${simulationState.disasterType} Epicenter - High Inundation`,
      type: simulationState.disasterType,
      severity: simulationState.severity,
      dangerLevel: 'CRITICAL',
      center: simulationState.epicenter,
      radiusKm: Number((simulationState.radiusKm * 0.5).toFixed(1)),
      description: 'Immediate severe danger area. Mandatory evacuation.',
      affectedPopulation: Math.round(simulationState.affectedPopulation * 0.4),
      activeSince: new Date().toISOString(),
    },
    {
      id: 'ZONE-SIM-DANGER',
      name: `${simulationState.disasterType} Buffer Perimeter`,
      type: simulationState.disasterType,
      severity: simulationState.severity === 'Critical' ? 'High' : 'Medium',
      dangerLevel: 'DANGER',
      center: simulationState.epicenter,
      radiusKm: Number((simulationState.radiusKm * 0.85).toFixed(1)),
      description: 'Expanding hazardous runoff and road disruptions.',
      affectedPopulation: Math.round(simulationState.affectedPopulation * 0.35),
      activeSince: new Date().toISOString(),
    },
    {
      id: 'ZONE-SIM-WARNING',
      name: `${simulationState.disasterType} Advisory Edge`,
      type: simulationState.disasterType,
      severity: 'Low',
      dangerLevel: 'WARNING',
      center: simulationState.epicenter,
      radiusKm: Number((simulationState.radiusKm * 1.25).toFixed(1)),
      description: 'Peripheral caution zone. Prepare evacuation kit.',
      affectedPopulation: Math.round(simulationState.affectedPopulation * 0.25),
      activeSince: new Date().toISOString(),
    },
  ];

  // Update AI Advisor
  aiAdvisorRecommendations.unshift({
    id: `REC-SIM-${Date.now()}`,
    type: 'EVACUATION_NOTICE',
    priority: 'CRITICAL',
    message: `Simulation ${simulationState.disasterType} (${simulationState.severity}) triggered with ${simulationState.radiusKm}km radius.`,
    suggestedAction: `Mobilize 4 high-clearance rescue teams and notify ${simulationState.peopleAtRiskCount} citizens in path.`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, simulationState, currentDisaster, disasterZones, aiAdvisorRecommendations });
});

app.post('/api/simulation/step', (req, res) => {
  const { step } = req.body; // 'T+0' | 'T+15' | 'T+30' | 'T+60'
  const stepMultipliers: Record<string, { radMult: number; popMult: number; riskMult: number }> = {
    'T+0': { radMult: 1.0, popMult: 1.0, riskMult: 1.0 },
    'T+15': { radMult: 1.2, popMult: 1.28, riskMult: 1.35 },
    'T+30': { radMult: 1.45, popMult: 1.62, riskMult: 1.75 },
    'T+60': { radMult: 1.75, popMult: 2.1, riskMult: 2.3 },
  };

  const mult = stepMultipliers[step] || stepMultipliers['T+0'];
  simulationState.timelineStep = step;
  simulationState.affectedPopulation = Math.round(52000 * mult.popMult);
  simulationState.peopleAtRiskCount = Math.round(3200 * mult.riskMult);
  simulationState.roadClosuresCount = Math.round(6 * mult.radMult);

  // Scale disaster zones
  disasterZones.forEach((z, i) => {
    z.radiusKm = Number(((i === 0 ? 2.4 : i === 1 ? 3.6 : 5.2) * mult.radMult).toFixed(1));
  });

  // Stochastically stress shelters
  shelters.forEach((s) => {
    if (s.status !== 'CLOSED') {
      const extraOccupancy = Math.round(Math.random() * 25 * mult.radMult);
      s.currentOccupancy = Math.min(s.maxCapacity, s.currentOccupancy + extraOccupancy);
      s.availableCapacity = s.maxCapacity - s.currentOccupancy;
      if (s.currentOccupancy >= s.maxCapacity) s.status = 'FULL';
      else if (s.currentOccupancy >= s.maxCapacity * 0.85) s.status = 'NEAR_CAPACITY';
    }
  });

  res.json({ success: true, simulationState, disasterZones, shelters });
});

app.post('/api/simulation/stop', (req, res) => {
  simulationState.isActive = false;
  simulationState.isPlaying = false;
  simulationState.timelineStep = 'T+0';
  res.json({ success: true, simulationState });
});

// Preset Scenarios Endpoint (Chennai, Mumbai, Miami, Tokyo, New Orleans)
app.post('/api/simulation/load-preset', (req, res) => {
  const { preset } = req.body;
  
  if (preset === 'mumbai-monsoon') {
    simulationState.epicenter = { lat: 19.0760, lng: 72.8777 };
    simulationState.disasterType = 'Flood';
    simulationState.severity = 'Critical';
    simulationState.radiusKm = 6.0;
  } else if (preset === 'miami-hurricane') {
    simulationState.epicenter = { lat: 25.7617, lng: -80.1918 };
    simulationState.disasterType = 'Cyclone';
    simulationState.severity = 'Critical';
    simulationState.radiusKm = 7.5;
  } else if (preset === 'tokyo-earthquake') {
    simulationState.epicenter = { lat: 35.6762, lng: 139.6503 };
    simulationState.disasterType = 'Earthquake';
    simulationState.severity = 'Critical';
    simulationState.radiusKm = 5.5;
  } else {
    // Default Chennai Coastal Storm
    simulationState.epicenter = { lat: 13.0827, lng: 80.2707 };
    simulationState.disasterType = 'Flood';
    simulationState.severity = 'Critical';
    simulationState.radiusKm = 4.8;
  }

  currentDisaster.center = simulationState.epicenter;
  currentDisaster.type = simulationState.disasterType;
  currentDisaster.severity = simulationState.severity;

  // Re-center primary zones
  disasterZones.forEach((z, idx) => {
    z.center = {
      lat: simulationState.epicenter.lat + (idx === 0 ? -0.005 : idx === 1 ? -0.015 : 0.008),
      lng: simulationState.epicenter.lng + (idx === 0 ? 0.005 : idx === 1 ? -0.010 : -0.020),
    };
    z.type = simulationState.disasterType;
  });

  res.json({ success: true, simulationState, currentDisaster, disasterZones });
});

// Vite Middleware & Static Server
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DisasterGuard AI Server running at http://0.0.0.0:${PORT}`);
  });
}

start();

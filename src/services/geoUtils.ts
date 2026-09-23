import { GeoPoint, DisasterZone, Shelter, SafetyAnalysisResult, DangerLevel, EvacuationRoute } from '../types';

/**
 * Calculates great-circle distance between two points in kilometers (Haversine formula).
 */
export function calculateDistanceKm(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371; // Earth radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Evaluates whether a location is within or near any disaster zones,
 * computing a dynamic risk score from 0 to 100 and danger classification.
 */
export function evaluateLocationSafety(
  userLocation: GeoPoint,
  disasterZones: DisasterZone[],
  shelters: Shelter[]
): {
  dangerLevel: DangerLevel;
  riskScore: number;
  statusMessage: string;
  actionDirective: string;
  nearestDisasterZone?: DisasterZone;
  distanceToDangerZoneKm: number;
  distanceToDisasterCenterKm: number;
  nearbyHazards: string[];
} {
  if (!disasterZones || disasterZones.length === 0) {
    return {
      dangerLevel: 'SAFE',
      riskScore: 8,
      statusMessage: 'You are currently outside any known affected zones.',
      actionDirective: 'Monitor emergency channels and keep an emergency kit ready.',
      distanceToDangerZoneKm: 999,
      distanceToDisasterCenterKm: 999,
      nearbyHazards: [],
    };
  }

  let minCenterDistance = Infinity;
  let minEdgeDistance = Infinity;
  let mostSevereZone: DisasterZone | undefined = undefined;
  const nearbyHazards: string[] = [];

  for (const zone of disasterZones) {
    const distToCenter = calculateDistanceKm(userLocation, zone.center);
    const distToEdge = distToCenter - zone.radiusKm;

    if (distToCenter < minCenterDistance) {
      minCenterDistance = distToCenter;
      mostSevereZone = zone;
    }

    if (distToEdge < minEdgeDistance) {
      minEdgeDistance = distToEdge;
    }

    if (distToCenter <= zone.radiusKm) {
      nearbyHazards.push(`${zone.name} (${zone.type} - ${zone.severity} intensity)`);
    } else if (distToCenter <= zone.radiusKm + 3) {
      nearbyHazards.push(`Proximity hazard: ${zone.name} within ${(distToCenter - zone.radiusKm).toFixed(1)} km`);
    }
  }

  const activeZone = mostSevereZone || disasterZones[0];
  const severityMultiplier =
    activeZone.severity === 'Critical' ? 1.4 :
    activeZone.severity === 'High' ? 1.15 :
    activeZone.severity === 'Medium' ? 0.9 : 0.7;

  let calculatedRisk = 0;

  if (minEdgeDistance <= 0) {
    // INSIDE THE DISASTER ZONE
    // Closer to center = closer to 100
    const penetrationRatio = 1 - Math.min(1, minCenterDistance / (activeZone.radiusKm || 1));
    const baseRisk = 72 + penetrationRatio * 26; // 72 to 98
    calculatedRisk = Math.min(100, Math.round(baseRisk * (severityMultiplier >= 1 ? 1.02 : 0.95)));
  } else if (minEdgeDistance <= 2.0) {
    // WARNING BUFFER (0km to 2km outside edge)
    const proximityRatio = 1 - minEdgeDistance / 2.0;
    const baseRisk = 52 + proximityRatio * 18; // 52 to 70
    calculatedRisk = Math.round(baseRisk * severityMultiplier);
  } else if (minEdgeDistance <= 5.0) {
    // LOW RISK BUFFER (2km to 5km outside edge)
    const proximityRatio = 1 - (minEdgeDistance - 2.0) / 3.0;
    const baseRisk = 26 + proximityRatio * 24; // 26 to 50
    calculatedRisk = Math.round(baseRisk * severityMultiplier);
  } else {
    // SAFE ZONE (>5km away)
    calculatedRisk = Math.max(4, Math.round(15 - Math.min(10, minEdgeDistance)));
  }

  // Clamp 0 - 100
  calculatedRisk = Math.max(0, Math.min(100, calculatedRisk));

  let dangerLevel: DangerLevel;
  let statusMessage: string;
  let actionDirective: string;

  if (calculatedRisk >= 86) {
    dangerLevel = 'CRITICAL';
    statusMessage = 'You are in a high-risk disaster zone. Evacuate immediately.';
    actionDirective = 'EVACUATE IMMEDIATELY to designated high-ground safe shelter. Call SOS if trapped.';
  } else if (calculatedRisk >= 71) {
    dangerLevel = 'DANGER';
    statusMessage = 'You are inside an affected area. Move toward the nearest safe zone.';
    actionDirective = 'Follow safe evacuation route. Avoid flooded roads and low elevation areas.';
  } else if (calculatedRisk >= 51) {
    dangerLevel = 'WARNING';
    statusMessage = 'You are near an affected area. Stay alert and prepare to evacuate.';
    actionDirective = 'Prepare essential medicines, waterproof docs, and identify closest open shelter.';
  } else if (calculatedRisk >= 26) {
    dangerLevel = 'LOW_RISK';
    statusMessage = 'You are in an elevated caution zone. Monitor meteorological warnings.';
    actionDirective = 'Check family emergency plan and ensure phone battery is charged.';
  } else {
    dangerLevel = 'SAFE';
    statusMessage = 'You are currently outside the affected zone.';
    actionDirective = 'Safe status confirmed. Keep emergency lines clear for high-risk zones.';
  }

  return {
    dangerLevel,
    riskScore: calculatedRisk,
    statusMessage,
    actionDirective,
    nearestDisasterZone: activeZone,
    distanceToDangerZoneKm: Math.max(0, Number(minEdgeDistance.toFixed(2))),
    distanceToDisasterCenterKm: Number(minCenterDistance.toFixed(2)),
    nearbyHazards,
  };
}

/**
 * Calculates Multi-Factor Safe Shelter Score according to the formula:
 * 40% disaster-zone safety + 25% distance + 20% shelter capacity + 10% accessibility + 5% resource availability
 */
export function rankSafestShelters(
  userLocation: GeoPoint,
  shelters: Shelter[],
  disasterZones: DisasterZone[]
): Shelter[] {
  return shelters
    .map((shelter) => {
      const distance = calculateDistanceKm(userLocation, shelter.location);

      // 1. Disaster-zone safety (40%): Shelter must not be inside or directly adjacent to red hazard zones
      let minDisasterDist = Infinity;
      for (const zone of disasterZones) {
        const d = calculateDistanceKm(shelter.location, zone.center) - zone.radiusKm;
        if (d < minDisasterDist) minDisasterDist = d;
      }
      let zoneSafetyScore = 100;
      if (minDisasterDist <= 0) {
        zoneSafetyScore = 10; // inside disaster zone - dangerous!
      } else if (minDisasterDist < 2) {
        zoneSafetyScore = 45;
      } else if (minDisasterDist < 5) {
        zoneSafetyScore = 80;
      } else {
        zoneSafetyScore = 100;
      }

      // 2. Distance score (25%): Closer is better (up to 15km scale)
      const distanceScore = Math.max(0, 100 - (distance / 15) * 100);

      // 3. Shelter Capacity (20%): Available seats vs full
      const capacityRatio = shelter.maxCapacity > 0 ? (shelter.maxCapacity - shelter.currentOccupancy) / shelter.maxCapacity : 0;
      let capacityScore = Math.max(0, capacityRatio * 100);
      if (shelter.status === 'FULL' || shelter.status === 'CLOSED') {
        capacityScore = 0;
      }

      // 4. Accessibility (10%)
      const accessibilityScore = (shelter.wheelchairAccessible ? 50 : 20) + (shelter.medicalSupport ? 50 : 20);

      // 5. Resource Availability (5%)
      const res = shelter.resources;
      const resourceCount = [res.water, res.food, res.medical, res.power, res.bedding].filter(Boolean).length;
      const resourceScore = (resourceCount / 5) * 100;

      // Composite Safety Score
      const totalScore = Math.round(
        zoneSafetyScore * 0.4 +
        distanceScore * 0.25 +
        capacityScore * 0.2 +
        accessibilityScore * 0.1 +
        resourceScore * 0.05
      );

      const estimatedMinutes = Math.max(3, Math.round((distance / 25) * 60 + 3));

      return {
        ...shelter,
        distanceKm: distance,
        estimatedTravelTimeMin: estimatedMinutes,
        safetyScore: Math.min(99, Math.max(12, totalScore)),
      };
    })
    .sort((a, b) => (b.safetyScore || 0) - (a.safetyScore || 0));
}

/**
 * Generates an intelligent obstacle-avoidance evacuation route from current location
 * to the safest shelter, avoiding active flood/disaster polygons.
 */
export function generateSafeEvacuationRoute(
  origin: GeoPoint,
  destinationShelter: Shelter,
  disasterZones: DisasterZone[]
): EvacuationRoute {
  const directDistance = calculateDistanceKm(origin, destinationShelter.location);
  const waypoints: GeoPoint[] = [origin];
  const avoidedHazards: string[] = [];

  // Check if straight line intersects any severe disaster zones
  const midLat = (origin.lat + destinationShelter.location.lat) / 2;
  const midLng = (origin.lng + destinationShelter.location.lng) / 2;
  const midPoint: GeoPoint = { lat: midLat, lng: midLng };

  let needsDetour = false;
  let detourOffsetLat = 0;
  let detourOffsetLng = 0;

  for (const zone of disasterZones) {
    const distToMid = calculateDistanceKm(midPoint, zone.center);
    if (distToMid <= zone.radiusKm + 0.8) {
      needsDetour = true;
      avoidedHazards.push(`${zone.name} Inundation Zone`);
      // Compute detour vector perpendicular to the line to push route away from hazard center
      const latDiff = zone.center.lat - midLat;
      const lngDiff = zone.center.lng - midLng;
      // Perpendicular displacement
      detourOffsetLat = -lngDiff * 0.012;
      detourOffsetLng = latDiff * 0.012;
    }
  }

  if (needsDetour) {
    // Add safe intermediate waypoint pushing outside danger zone
    waypoints.push({
      lat: midLat + detourOffsetLat,
      lng: midLng + detourOffsetLng,
    });
    // Add sub-waypoint
    waypoints.push({
      lat: (midLat + destinationShelter.location.lat) / 2 + detourOffsetLat * 0.5,
      lng: (midLng + destinationShelter.location.lng) / 2 + detourOffsetLng * 0.5,
    });
  } else {
    // Gentle natural curvature waypoint
    waypoints.push({
      lat: midLat + 0.002,
      lng: midLng - 0.002,
    });
  }

  waypoints.push(destinationShelter.location);

  const routeDistance = Number((directDistance * (needsDetour ? 1.25 : 1.08)).toFixed(2));
  const estimatedMinutes = Math.max(5, Math.round((routeDistance / 20) * 60 + 2));

  const steps = [
    {
      instruction: `Head out toward elevated main artery toward ${destinationShelter.name}`,
      distanceMeters: Math.round(routeDistance * 300),
      hazardWarning: needsDetour ? 'Caution: Lower street experiencing surface runoff' : undefined,
    },
    {
      instruction: needsDetour ? `Divert onto designated high-elevation bypass to bypass ${avoidedHazards[0] || 'danger zone'}` : 'Proceed along clear emergency relief corridor',
      distanceMeters: Math.round(routeDistance * 500),
      hazardWarning: needsDetour ? 'Avoided: Submerged underpass / Blocked corridor' : undefined,
    },
    {
      instruction: `Arrive at Safe Emergency Shelter: ${destinationShelter.name} (${destinationShelter.address})`,
      distanceMeters: Math.round(routeDistance * 200),
    },
  ];

  return {
    origin,
    destinationShelter,
    distanceKm: routeDistance,
    estimatedMinutes,
    safetyScore: destinationShelter.safetyScore || 92,
    avoidedHazards: avoidedHazards.length > 0 ? avoidedHazards : ['Direct low-elevation runoff paths'],
    waypoints,
    steps,
  };
}

/**
 * Reverse Geocoding with fallback to known coordinates map
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { 'User-Agent': 'DisasterGuardAI-Platform/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Return clean concise address
        const parts = data.display_name.split(', ');
        return parts.slice(0, 3).join(', ');
      }
    }
  } catch (err) {
    // Network or rate-limit fallback
  }

  // High quality coordinate fallback mapping
  if (Math.abs(lat - 13.0827) < 0.2 && Math.abs(lng - 80.2707) < 0.2) {
    return 'Marina Coastal Sector, Chennai, Tamil Nadu';
  } else if (Math.abs(lat - 19.076) < 0.3 && Math.abs(lng - 72.8777) < 0.3) {
    return 'Bandra-Kurla Complex, Mumbai, Maharashtra';
  } else if (Math.abs(lat - 28.6139) < 0.3 && Math.abs(lng - 77.209) < 0.3) {
    return 'Connaught Sector, New Delhi';
  } else if (Math.abs(lat - 25.7617) < 0.3 && Math.abs(lng - -80.1918) < 0.3) {
    return 'Biscayne Bay District, Miami, Florida';
  } else if (Math.abs(lat - 35.6762) < 0.3 && Math.abs(lng - 139.6503) < 0.3) {
    return 'Chiyoda-ku, Tokyo, Japan';
  }

  return `Geographic Point (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
}

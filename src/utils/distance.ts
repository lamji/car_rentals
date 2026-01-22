import { Car, GarageLocation } from "@/lib/types";

/**
 * Calculate the distance between two geographic points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1  
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  // Differences in coordinates
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  const distance = R * c;

  return distance;
}

/**
 * Calculate distance from user's current location to a garage location
 * @param userLocation User's geolocation position
 * @param garageLocation Garage location with coordinates
 * @returns Distance in kilometers, or null if coordinates are missing
 */
export function calculateDistanceToGarage(
  userLocation: { lat: number; lng: number },
  garageLocation: GarageLocation
): number | null {
  if (!garageLocation.coordinates?.lat || !garageLocation.coordinates?.lng) {
    return null;
  }

  return calculateDistance(
    userLocation.lat,
    userLocation.lng,
    garageLocation.coordinates.lat,
    garageLocation.coordinates.lng
  );
}

/**
 * Calculate distance from user's current location to a car's garage
 * @param userLocation User's geolocation position
 * @param car Car object with garage location
 * @returns Distance in kilometers, or null if coordinates are missing
 */
export function calculateDistanceToCar(
  userLocation: { lat: number; lng: number },
  car: Car
): number | null {
  console.log(`🔍 Calculating distance for ${car.name}`);

  if (!car.garageLocation.coordinates?.lat || !car.garageLocation.coordinates?.lng) {
    console.log(`❌ Missing garage coordinates for ${car.name}`);
    return null;
  }

  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    car.garageLocation.coordinates.lat,
    car.garageLocation.coordinates.lng
  );

  console.log(`✅ ${car.name} is ${distance}km away`);
  return distance;
}

/**
 * Get coordinates from address using geocoding
 * @param address Address string to convert to coordinates
 * @returns Promise that resolves to coordinates object
 */
export async function getCoordinatesFromAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'CarRentalApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting coordinates from address:', error);
    return null;
  }
}

/**
 * Get a readable address from coordinates using reverse geocoding
 * @param coordinates Latitude and longitude
 * @returns Promise that resolves to a readable address string
 */
export async function getReadableAddressFromCoordinates(
  coordinates: { lat: number; lng: number }
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1&zoom=18`,
      {
        headers: {
          'User-Agent': 'CarRentalApp/1.0'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`⚠️ Address API returned ${response.status}`);
      return 'Location unavailable';
    }

    const data = await response.json();
    
    // Build a readable address from the components
    const address = data.address || {};
    const components = [];
    
    // Add road/highway if available
    if (address.road || address.highway) {
      components.push(address.road || address.highway);
    }
    
    // Add town/city (truncate if too long)
    const town = address.town || address.city || address.village;
    if (town) {
      // Truncate long town names to 15 characters
      const truncatedTown = town.length > 15 ? town.substring(0, 15) + '...' : town;
      components.push(truncatedTown);
    }
    
    // Add province/state (truncate if too long)
    const state = address.state || address.province;
    if (state) {
      // Truncate long state names to 12 characters
      const truncatedState = state.length > 12 ? state.substring(0, 12) + '...' : state;
      components.push(truncatedState);
    }
    
    // Limit to maximum 3 components and join
    const finalComponents = components.slice(0, 3);
    
    return finalComponents.length > 0 ? finalComponents.join(', ') : 'Unknown Location';
  } catch (error) {
    console.warn('⚠️ Address fetch failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
    return 'Location unavailable';
  }
}

/**
 * Format distance for display
 * @param distanceInKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    // Convert to meters for distances less than 1km
    const meters = Math.round(distanceInKm * 1000);
    return `${meters}m away`;
  } else if (distanceInKm < 10) {
    // Show 1 decimal place for distances less than 10km
    return `${distanceInKm.toFixed(1)}km away`;
  } else {
    // Show whole kilometers for longer distances
    return `${Math.round(distanceInKm)}km away`;
  }
}

/**
 * Get distance category for sorting/filtering
 * @param distanceInKm Distance in kilometers
 * @returns Distance category
 */
export function getDistanceCategory(distanceInKm: number): 'nearby' | 'moderate' | 'far' {
  if (distanceInKm < 5) {
    return 'nearby';
  } else if (distanceInKm < 20) {
    return 'moderate';
  } else {
    return 'far';
  }
}

export interface GeocodedAddress {
  formattedAddress: string;
  street?: string;
  city?: string;
  municipality?: string;
  province?: string;
  region?: string;
  barangay?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Convert latitude/longitude to a human-readable address using reverse geocoding
 * Uses OpenStreetMap's Nominatim API (free, no API key required)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress | null> {
  // Quick fallback to prevent crashes
  try {
    console.log(`🔍 Reverse geocoding for lat: ${lat}, lng: ${lng}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CarRentalApp/1.0'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`⚠️ Geocoding API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || data.error) {
      console.warn('⚠️ Invalid response from geocoding service');
      return null;
    }

    const address = data.address || {};
    
    // Extract address components with fallbacks
    const geocodedAddress: GeocodedAddress = {
      formattedAddress: data.display_name || 'Unknown address',
      street: address.road || address.pedestrian || address.residential || undefined,
      city: address.city || address.town || address.village || undefined,
      municipality: address.municipality || address.city || address.town || undefined,
      province: address.state || address.province || undefined,
      region: address.region || undefined,
      barangay: address.suburb || address.neighbourhood || undefined,
      country: address.country || undefined,
      postalCode: address.postcode || undefined,
    };

    console.log('✅ Geocoding successful:', geocodedAddress.city || geocodedAddress.municipality);
    return geocodedAddress;

  } catch (error) {
    console.warn('⚠️ Geocoding failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return a minimal fallback address to prevent crashes
    return {
      formattedAddress: 'Location unavailable',
      city: 'Unknown',
      municipality: 'Unknown',
      province: 'Unknown',
    };
  }
}

/**
 * Simple address formatting for display
 */
export function formatAddress(address: GeocodedAddress): string {
  if (!address) return 'Unknown location';

  const parts = [
    address.street,
    address.barangay,
    address.city || address.municipality,
    address.province,
    address.region,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : address.formattedAddress;
}

/**
 * Get short address for UI display (city/municipality, province)
 */
export function getShortAddress(address: GeocodedAddress): string {
  if (!address) return 'Unknown location';

  const parts = [
    address.city || address.municipality,
    address.province,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : address.formattedAddress;
}

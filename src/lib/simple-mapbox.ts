/**
 * Simple Mapbox API function without complex service layer
 * Just makes a direct fetch call to get route data
 */

export interface SimpleRoute {
  geometry: any;
  distance: number;
  duration: number;
}

/**
 * Simple function to get route from Mapbox Directions API
 * @param pointA - Starting coordinates {lng, lat}
 * @param pointB - Ending coordinates {lng, lat}
 * @param accessToken - Mapbox access token
 * @returns Promise with route data
 */
export async function getSimpleRoute(
  pointA: { lng: number; lat: number },
  pointB: { lng: number; lat: number },
  accessToken: string
): Promise<SimpleRoute | null> {
  try {
    console.log("test:simple - Making direct API call");
    
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pointA.lng},${pointA.lat};${pointB.lng},${pointB.lat}?access_token=${accessToken}&geometries=geojson&overview=full&steps=true`;
    
    console.log("test:simple - URL:", url);
    
    const response = await fetch(url);
    console.log("test:simple - Response:", response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("test:simple - Data received:", data);
    
    if (data.routes && data.routes[0]) {
      return {
        geometry: data.routes[0].geometry,
        distance: data.routes[0].distance,
        duration: data.routes[0].duration
      };
    }
    
    return null;
  } catch (error) {
    console.error("test:simple - Error:", error);
    return null;
  }
}

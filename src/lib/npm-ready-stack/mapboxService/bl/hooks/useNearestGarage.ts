import { useCallback, useState } from 'react';
import type { Car } from '@/lib/types';

export interface NearestGarageResult {
  id: string;
  name: string;
  address: string;
  distance: number;
  distanceText: string;
  lat: number;
  lng: number;
  available: boolean;
  carData: Car;
}

interface Position {
  lat: number;
  lng: number;
}

export default function useNearestGarage() {
  const [nearestGarageResults, setNearestGarageResults] = useState<NearestGarageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const getNearestGarage = useCallback(async (
    data: Car[], // All cars data
    position: Position, // User's current position
    radius: number = 25 // Search radius in km
  ): Promise<NearestGarageResult[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("debug-location: Searching for nearest garages using Mapbox", { 
        userPosition: position, 
        radius, 
        totalCars: data.length 
      });
      
      // Calculate distances for all cars and filter by radius
      const garagesWithDistance = data
        .map(car => {
          const garagePos = car.garageLocation.coordinates;
          const distance = calculateDistance(position, garagePos);
          
          return {
            id: car.id,
            name: car.name,
            address: car.garageLocation.address,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            distanceText: `${Math.round(distance * 10) / 10} km away`, // Human readable distance text
            lat: garagePos.lat,
            lng: garagePos.lng,
            available: car.availability.isAvailableToday,
            carData: car
          } as NearestGarageResult;
        })
        .filter(garage => garage.distance <= radius) // Filter by radius
        .sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)

      // Simulate API delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, 500));

      setNearestGarageResults(garagesWithDistance);
      setLoading(false);
      
      console.log("debug-location: Found garages within radius", { 
        totalFound: garagesWithDistance.length,
        radius: `${radius}km`,
        garages: garagesWithDistance.map(g => ({ 
          name: g.name, 
          distance: `${g.distance}km`, 
          available: g.available 
        }))
      });
      
      return garagesWithDistance;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to calculate nearest garages";
      console.error("debug-location: Error calculating nearest garages:", err);
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    nearestGarageResults,
    loading,
    error,
    getNearestGarage
  };
}

import { useCallback, useEffect, useMemo } from "react";
import { formatCurrency } from "../../../../../lib/currency";
import { setDistanceCharge } from "../../../../../lib/slices/mapBoxSlice";

import {
  calculateDistance,
  formatDistance,
} from "../../../../../utils/distance";
import { useAppDispatch } from "../../../../store";

interface Point {
  lat: number;
  lng: number;
}

interface RouteCalculationResult {
  distance: number;
  distanceText: string;
  chargePerKm: number;
  baseCharge: number;
  totalCharge: number;
  formattedCharge: string;
}

/**
 * Custom hook for calculating route distance and charges between two points
 * @param props - Object containing pointA and pointB coordinates
 * @returns {Object} Route calculation results including distance, formatted distance, and charges
 */

export default function useCalculateRotes({
  pointA,
  pointB,
}: {
  pointA: Point;
  pointB: Point;
}) {
  const dispatch = useAppDispatch(); // Add this line
  const CHARGE_PER_KM = Number(process.env.NEXT_PUBLIC_CHARGE_PER_KM) || 30; // Charge per kilometer
  const BASE_CHARGE = Number(process.env.NEXT_PUBLIC_BASED_CHARGE) || 100; // Base fare

  /**
   * Calculate the distance between pointA and pointB using Haversine formula
   * @returns {number} Distance in kilometers
   */
  const calculateRouteDistance = useCallback(() => {
    if (!pointA || !pointB) return 0;

    return calculateDistance(pointA.lat, pointA.lng, pointB.lat, pointB.lng);
  }, [pointA, pointB]);

  /**
   * Calculate the total charge based on distance
   * @param distanceInKm - Distance in kilometers
   * @returns {number} Total charge in PHP
   */
  const calculateRouteCharge = useCallback((distanceInKm: number) => {
    return (distanceInKm * CHARGE_PER_KM) + BASE_CHARGE;
  }, [CHARGE_PER_KM, BASE_CHARGE]);

  // Memoize all calculations to prevent unnecessary re-renders
  const routeData = useMemo((): RouteCalculationResult => {
    const distance = calculateRouteDistance();
    const distanceText = formatDistance(distance);
    const totalCharge = calculateRouteCharge(distance);
    const formattedCharge = formatCurrency(totalCharge);

    return {
      distance,
      distanceText,
      chargePerKm: CHARGE_PER_KM,
      baseCharge: BASE_CHARGE,
      totalCharge,
      formattedCharge,
    };
  }, [calculateRouteDistance, calculateRouteCharge, CHARGE_PER_KM, BASE_CHARGE]);

  // Save distance charge to Redux when calculations are updated
  useEffect(() => {
    if (routeData.distance > 0) {
      dispatch(
        setDistanceCharge({
          distance: routeData.distance,
          price: routeData.totalCharge,
        }),
      );
    }
  }, [routeData.distance, routeData.totalCharge, dispatch]);

  return routeData;
}

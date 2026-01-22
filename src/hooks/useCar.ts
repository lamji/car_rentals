"use client";

import { useMemo } from "react";
import { CARS } from "@/lib/data/cars";

export function useCar(id: string) {
  return useMemo(() => {
    const car = CARS.find((c) => c.id === id) ?? null;
    
    if (!car) return null;
    
    // Calculate dynamic availability based on current date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const isActuallyAvailableToday = !car.availability.unavailableDates.includes(todayStr);
    
    // Return car with dynamic availability
    return {
      ...car,
      availability: {
        ...car.availability,
        isAvailableToday: isActuallyAvailableToday
      }
    };
  }, [id]);
}

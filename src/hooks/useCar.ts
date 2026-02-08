/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useCarsFromRedux } from "@/lib/data/cars";

export function useCar(id: string) {
  const carsFromRedux = useCarsFromRedux();
  
  return useMemo(() => {
    const car = carsFromRedux.find((c:any) => c.id === id) ?? null;
    
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
  }, [id, carsFromRedux]);
}

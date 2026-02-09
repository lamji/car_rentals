"use client";

import { useMemo } from "react";

import { useCarsFromRedux } from "@/lib/data/cars";
import type { Car } from "@/lib/types";
import type { CarsFilters } from "@/lib/types/booking";

export function useCars(params: {
  location: string;
  startDate: string;
  endDate: string;
  carType?: string;
  filters?: CarsFilters;
}) {
  const carsFromRedux = useCarsFromRedux();
  
  return useMemo(() => {
    const { carType, filters } = params;

    // Add null check to prevent undefined error
    let cars: Car[] = Array.isArray(carsFromRedux) ? [...carsFromRedux] : [];

    // Calculate dynamic availability for all cars
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    cars = cars.map(car => ({
      ...car,
      availability: {
        ...car.availability,
        isAvailableToday: !car.availability.unavailableDates.includes(todayStr)
      }
    }));

    if (carType) {
      cars = cars.filter((c) => c.type === carType);
    }

    if (filters?.priceMax != null) {
      cars = cars.filter((c) => c.pricePerDay <= filters.priceMax!);
    }

    if (filters?.seats != null) {
      cars = cars.filter((c) => c.seats >= filters.seats!);
    }

    if (filters?.transmission) {
      cars = cars.filter((c) => c.transmission === filters.transmission);
    }

    return cars;
  }, [params, carsFromRedux]);
}

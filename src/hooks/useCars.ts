"use client";

import { useMemo } from "react";

import { CARS } from "@/lib/data/cars";
import type { Car, Transmission } from "@/lib/types";

export type CarsFilters = {
  priceMax?: number;
  seats?: number;
  transmission?: Transmission;
};

export function useCars(params: {
  location: string;
  startDate: string;
  endDate: string;
  carType?: string;
  filters?: CarsFilters;
}) {
  return useMemo(() => {
    const { carType, filters } = params;

    let cars: Car[] = [...CARS];

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
  }, [params.carType, params.filters?.priceMax, params.filters?.seats, params.filters?.transmission]);
}

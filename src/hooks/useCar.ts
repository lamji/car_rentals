"use client";

import { useMemo } from "react";
import { CARS } from "@/lib/data/cars";

export function useCar(id: string) {
  return useMemo(() => CARS.find((c) => c.id === id) ?? null, [id]);
}

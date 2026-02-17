"use client";

import { useMemo } from "react";
import { parseIsoDate, diffDaysInclusive } from "@/lib/date";

export function usePricing(params: {
  startDate: string;
  endDate: string;
  pricePerDay?: number;
  pricePer24Hours?: number;
  deliveryFee?: number;
}) {
  return useMemo(() => {
    const start = parseIsoDate(params.startDate);
    const end = parseIsoDate(params.endDate);

    const days = start && end ? diffDaysInclusive(start, end) : 1;
    const dailyRate = params.pricePer24Hours ?? params.pricePerDay ?? 0;
    const rentCost = days * dailyRate;
    const deliveryFee = params.deliveryFee ?? 0;

    return {
      days,
      rentCost,
      deliveryFee,
      total: rentCost + deliveryFee,
    };
  }, [params.deliveryFee, params.endDate, params.pricePer24Hours, params.pricePerDay, params.startDate]);
}

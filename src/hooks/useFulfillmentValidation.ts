"use client";

import type { FulfillmentState } from "@/lib/types";

export function useFulfillmentValidation(fulfillment: FulfillmentState | undefined) {
  if (!fulfillment) {
    return {
      valid: false,
      reason: "Choose pickup or delivery",
    };
  }

  if (fulfillment.type === "pickup") {
    return {
      valid: true,
      reason: null as string | null,
    };
  }

  if (!fulfillment.deliveryAddress?.trim()) {
    return {
      valid: false,
      reason: "Delivery address is required",
    };
  }

  return {
    valid: true,
    reason: null as string | null,
  };
}

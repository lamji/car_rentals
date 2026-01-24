import type { Transmission } from "@/lib/types";

export type BookingDraft = {
  carId?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  duration?: "12hours" | "24hours";
  fulfillmentType?: "pickup" | "delivery";
  deliveryFee?: number;
  fulfillment?: FulfillmentState;
};

export type FulfillmentState = {
  type: "pickup" | "delivery";
  deliveryAddress?: string;
};

export type CarsFilters = {
  priceMax?: number;
  seats?: number;
  transmission?: Transmission;
};

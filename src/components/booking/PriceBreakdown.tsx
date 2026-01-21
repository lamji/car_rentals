"use client";

import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";

export function PriceBreakdown(props: {
  days: number;
  pricePerDay: number;
  rentCost: number;
  deliveryFee: number;
  total: number;
  duration?: "12hours" | "24hours";
}) {
  const duration = props.duration || "24hours";
  const unitLabel = duration === "12hours" ? "12-hour" : "24-hour";
  
  // Calculate the number of periods based on duration
  // For 12-hour duration: 1 day = 2 periods, for 24-hour duration: 1 day = 1 period
  const periods = duration === "12hours" ? props.days * 2 : props.days;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <div>
          Rent ({periods} {unitLabel}{periods === 1 ? "" : "s"} × {formatCurrency(props.pricePerDay)})
        </div>
        <div className="font-medium">{formatCurrency(props.rentCost)}</div>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <div>Delivery fee</div>
        <div className="font-medium">{formatCurrency(props.deliveryFee)}</div>
      </div>
      <Separator className="my-3" />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Total</div>
        <div className="text-lg font-semibold">{formatCurrency(props.total)}</div>
      </div>
    </div>
  );
}

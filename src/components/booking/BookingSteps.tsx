"use client";

import { cn } from "@/lib/utils";

const STEPS = ["Search", "Car", "Dates", "Confirm"] as const;

export function BookingSteps(props: { activeIndex: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STEPS.map((label, idx) => {
        const active = idx <= props.activeIndex;
        return (
          <div
            key={label}
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

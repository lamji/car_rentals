"use client";

import type { CarType } from "@/lib/types";
import { Button } from "@/components/ui/button";

const OPTIONS: { label: string; value: CarType }[] = [
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Van", value: "van" },
];

export function FilterChips(props: {
  value?: CarType;
  onChange: (value?: CarType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = props.value === opt.value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={active ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => props.onChange(active ? undefined : opt.value)}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

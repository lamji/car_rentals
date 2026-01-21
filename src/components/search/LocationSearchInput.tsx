"use client";

import { Input } from "@/components/ui/input";

export function LocationSearchInput(props: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Input
      placeholder="Enter city / area"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className={props.className}
    />
  );
}

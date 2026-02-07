"use client";

import { useMemo } from "react";

import { DateRangePicker } from "@/components/search/DateRangePicker";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSearchState } from "@/hooks/useSearchState";

export function SearchHeader() {
  const { state, setState } = useSearchState();

  const subtitle = useMemo(() => {
    if (!state.startDate || !state.endDate) return "";
    return `${state.startDate} → ${state.endDate}`;
  }, [state.endDate, state.startDate]);

  return (
    <Card className="sticky top-0 z-40 backdrop-blur supports-backdrop-filter:bg-background/60">
      <CardContent className="grid gap-3 p-4 md:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Location</div>
          <Input value={state.location} onChange={(e) => setState({ location: e.target.value }, { replace: true })} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Dates</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
          <DateRangePicker
            startDate={state.startDate}
            endDate={state.endDate}
            onChange={(next) => setState(next, { replace: true })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

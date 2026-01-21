"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SearchHeader } from "@/components/cars/SearchHeader";
import { CarAvailabilityCard } from "@/components/cars/CarAvailabilityCard";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCars } from "@/hooks/useCars";

export default function CarsPage() {
  const searchParams = useSearchParams();

  const location = searchParams.get("location") ?? "";
  const startDate = searchParams.get("start") ?? "";
  const endDate = searchParams.get("end") ?? "";
  const carType = searchParams.get("type") ?? undefined;

  const [priceMax, setPriceMax] = useState<number>(120);
  const [seats, setSeats] = useState<number | undefined>(undefined);
  const [transmission, setTransmission] = useState<"automatic" | "manual" | undefined>(undefined);

  const cars = useCars({
    location,
    startDate,
    endDate,
    carType,
    filters: {
      priceMax,
      seats,
      transmission,
    },
  });

  const detailsHrefFor = useMemo(() => {
    const base = `/cars`;
    return (id: string) =>
      `${base}/${encodeURIComponent(id)}?location=${encodeURIComponent(location)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}${carType ? `&type=${encodeURIComponent(carType)}` : ""}`;
  }, [carType, endDate, location, startDate]);

  // Mock availability: make some cars unavailable based on date parity
  const availabilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    cars.forEach((car) => {
      // Simple mock: unavailable if start date day is even and car id ends with an even number
      const startDay = startDate ? parseInt(startDate.split("-").pop() ?? "0", 10) : 0;
      const lastChar = car.id.slice(-1);
      const lastNum = parseInt(lastChar, 10);
      map.set(car.id, !(startDay % 2 === 0 && lastNum % 2 === 0));
    });
    return map;
  }, [cars, startDate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <BookingSteps activeIndex={1} />
            <div>
              <div className="text-xl font-semibold">Available cars</div>
              <div className="text-sm text-muted-foreground">Available for your dates</div>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href="/">New search</Link>
          </Button>
        </div>

        <div className="space-y-4">
          <SearchHeader />

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Max price/day</div>
                <Slider value={[priceMax]} min={30} max={200} step={5} onValueChange={(v) => setPriceMax(v[0] ?? 120)} />
                <div className="text-xs text-muted-foreground">Up to ${priceMax} / day</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Seats</div>
                <Select value={seats ? String(seats) : "any"} onValueChange={(v) => setSeats(v === "any" ? undefined : Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                    <SelectItem value="7">7+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Transmission</div>
                <Select value={transmission ?? "any"} onValueChange={(v) => setTransmission(v === "any" ? undefined : (v as "automatic" | "manual"))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {cars.map((car) => (
              <CarAvailabilityCard
                key={car.id}
                car={car}
                isAvailable={availabilityMap.get(car.id) ?? true}
                href={detailsHrefFor(car.id)}
              />
            ))}

            {cars.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="text-base font-semibold">No cars match your filters</div>
                <div className="mt-1 text-sm text-muted-foreground">Try adjusting price, seats, or transmission.</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

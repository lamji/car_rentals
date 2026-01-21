"use client";

import { useMemo, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/search/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReduxLocationSearchInput } from "@/components/search/ReduxLocationSearchInput";
import { useSearchState } from "@/hooks/useSearchState";
import { CarAvailabilityCard } from "@/components/cars/CarAvailabilityCard";
import { CARS } from "@/lib/data/cars";
import type { CarType } from "@/lib/types";
import { MapPin, Calendar, Car, Search, Check, Shield, Zap, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function HomeContent() {
  const router = useRouter();
  const { state, setState } = useSearchState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canSearch = useMemo(() => {
    return Boolean(state.location.trim() && state.startDate && state.endDate);
  }, [state.endDate, state.location, state.startDate]);

  // Real availability data from car objects
  const availabilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    CARS.forEach((car) => {
      map.set(car.id, car.availability.isAvailableToday);
    });
    return map;
  }, []);

  const detailsHrefFor = (id: string) => {
  const params = new URLSearchParams();
  
  if (state.location) params.set('location', state.location);
  if (state.startDate) params.set('start', state.startDate);
  if (state.endDate) params.set('end', state.endDate);
  if (state.carType) params.set('type', state.carType);
  
  const queryString = params.toString();
  return `/cars/${encodeURIComponent(id)}${queryString ? `?${queryString}` : ''}`;
};

  // Category filtering
  const categories: { label: string; value: CarType | "all" }[] = [
    { label: "All Cars", value: "all" },
    { label: "SUV", value: "suv" },
    { label: "Sedan", value: "sedan" },
    { label: "Van", value: "van" },
  ];

  const [selectedCategory, setSelectedCategory] = useState<CarType | "all">("all");

  const filteredCars = useMemo(() => {
    if (selectedCategory === "all") return CARS;
    return CARS.filter((car) => car.type === selectedCategory);
  }, [selectedCategory]);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://res.cloudinary.com/dlax3esau/image/upload/v1768987069/ChatGPT_Image_Jan_21_2026_05_17_38_PM_fxfior.png"
            alt="Car rental"
            fill
            className="object-contain"
            priority
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>

        {/* Hero content */}
        <div className="flex h-full items-center justify-center px-4">
          <div className="w-full max-w-5xl space-y-8">
            {/* Top: marketing text */}
            <div className="text-center text-black sm:px-4">
              <h1 className="text-2xl font-black uppercase leading-tight sm:text-4xl md:text-5xl">
                Rent a <span className="text-yellow-400">Car Today!</span>
              </h1>
              <p className="mt-1 text-sm font-semibold sm:text-lg md:text-xl">Affordable & Reliable Car Rentals</p>

              <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-6 text-xs sm:text-base sm:text-lg">
                <li className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-black/20 p-1 sm:p-2">
                    <Car className="h-3 w-3 text-black sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs sm:text-sm sm:text-base">Wide Selection</span>
                </li>
                <li className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-black/20 p-1 sm:p-2">
                    <Zap className="h-3 w-3 text-black sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs sm:text-sm sm:text-base">Easy Booking</span>
                </li>
                <li className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-black/20 p-1 sm:p-2">
                    <Headphones className="h-3 w-3 text-black sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs sm:text-sm sm:text-base">24/5 Support</span>
                </li>
              </ul>
            </div>

            {/* Bottom row: booking section */}
            <div className="mx-auto w-full max-w-4xl px-4">
              <div className="rounded-3xl bg-white/10 p-1 shadow-2xl">
                <div className="rounded-3xl bg-background p-4 sm:p-6 md:p-8">
                  <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-2 sm:space-y-3 lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
                        <label className="text-xs font-semibold text-foreground sm:text-sm">Pickup Location</label>
                      </div>
                      <ReduxLocationSearchInput 
                        value={state.location} 
                        onChange={(location) => setState({ location }, { replace: true })} 
                        className="border-black" 
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
                        <label className="text-xs font-semibold text-foreground sm:text-sm">Rental Dates</label>
                      </div>
                      <DateRangePicker
                        startDate={state.startDate}
                        endDate={state.endDate}
                        onChange={(next) => setState(next, { replace: true })}
                        className="border-black"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <Car className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
                        <label className="text-xs font-semibold text-foreground sm:text-sm">Car Type</label>
                      </div>
                      <Select value={state.carType ?? "any"} onValueChange={(value) => setState({ carType: value === "any" ? undefined : (value as CarType) }, { replace: true })}>
                        <SelectTrigger className="border-black w-full">
                          <SelectValue placeholder="Any type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any type</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
                        <label className="text-xs font-semibold text-foreground sm:text-sm">Search</label>
                      </div>
                      <Button
                        disabled={!canSearch}
                        onClick={() => {
                          router.push(`/cars?location=${encodeURIComponent(state.location)}&start=${encodeURIComponent(state.startDate)}&end=${encodeURIComponent(state.endDate)}${state.carType ? `&type=${encodeURIComponent(state.carType)}` : ""}`);
                        }}
                        className="w-full py-2 text-sm font-semibold sm:py-3 sm:text-base"
                        size="lg"
                      >
                        Check
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Car cards below hero */}
      <div className="mx-auto w-full max-w-6xl px-2 py-8 sm:px-4 sm:py-12">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
          {/* Left sidebar: categories */}
          <div className="lg:col-span-1 lg:border-r-4 lg:border-r-border lg:pr-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl font-semibold sm:text-2xl">Cars</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">Availability based on your selected dates</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">Categories</h3>
              {/* Mobile swipeable categories */}
              <div className="lg:hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex-shrink-0 snap-center rounded-lg px-4 py-2 text-left text-xs font-medium transition-colors ${
                        selectedCategory === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Desktop vertical categories */}
              <div className="hidden lg:block">
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                        selectedCategory === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right grid: filtered cars */}
          <div className="lg:col-span-3">
            <div className="grid gap-2 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car) => (
                <CarAvailabilityCard
                  key={car.id}
                  car={car}
                  isAvailable={availabilityMap.get(car.id) ?? true}
                  href={detailsHrefFor(car.id)}
                />
              ))}
            </div>
            {filteredCars.length === 0 && (
              <div className="rounded-lg border bg-card p-4 text-center sm:p-6">
                <div className="text-sm font-semibold sm:text-base">No cars in this category</div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Try selecting another category.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

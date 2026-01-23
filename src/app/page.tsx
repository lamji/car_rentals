"use client";

import { useMemo, useState, Suspense, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LocationModal, LocationData } from "@/components/location/LocationModal";
import { NearestGarageModal } from "@/components/location/NearestGarageModal";
import { useSearchState } from "@/hooks/useSearchState";
import { CarAvailabilityCard } from "@/components/cars/CarAvailabilityCard";
import { CARS } from "@/lib/data/cars";
import type { CarType } from "@/lib/types";
import { Car, Zap, Headphones, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNearestGarage, SearchNearestGarageResponse } from "@/lib/api/useNearestGarage";

function HomeContent() {
  const { state, setState } = useSearchState();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNearestGarageModalOpen, setIsNearestGarageModalOpen] = useState(false);
  const [nearestGarageResults, setNearestGarageResults] = useState<SearchNearestGarageResponse | null>(null);
  const { searchNearestGarage } = useNearestGarage();
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleLocationSelect = async (locationString: string, locationData?: LocationData) => {
    setState({ location: locationString }, { replace: true });
    setIsLocationModalOpen(false);
    
    // Trigger nearest garage search when location is selected from modal
    if (locationString.trim().length > 3) {
      try {
        const results = await searchNearestGarage({ 
          address: locationString,
          timeoutMs: 1500,
          progressIntervalMs: 300
        });
        setNearestGarageResults(results);
        setIsNearestGarageModalOpen(true);
      } catch (error) {
        console.error('Error searching nearest garage:', error);
      }
    }
  };

  const handleClearLocation = () => {
    setState({ location: '' });
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    setNearestGarageResults(null);
    setIsNearestGarageModalOpen(false);
  };

  const handleLocationChange = (value: string) => {
    console.log('handleLocationChange called with:', value);
    setState({ location: value });
    alert(value); // Testing alert
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Trigger nearest garage search with debouncing
    if (value.trim().length > 3) {
      const timeout = setTimeout(async () => {
        try {
          const results = await searchNearestGarage({ 
            address: value,
            timeoutMs: 1500,
            progressIntervalMs: 300
          });
          setNearestGarageResults(results);
          setIsNearestGarageModalOpen(true);
        } catch (error) {
          console.error('Error searching nearest garage:', error);
        }
      }, 500); // 500ms debounce
      
      setSearchTimeout(timeout);
    }
  };

  const handleSelectGarage = (carId: string) => {
    console.log('Selected car:', carId);
    setIsNearestGarageModalOpen(false);
    
    // Extract car ID from the listing ID (format: "car-listing-{carId}")
    const actualCarId = carId.replace('car-listing-', '');
    
    // Redirect to car details page
    router.push(`/cars/${actualCarId}`);
  };



  // Real availability data from car objects

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
      <div className="relative h-[40vh] sm:h-[60vh] w-full overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://res.cloudinary.com/dlax3esau/image/upload/v1769172920/herobg_nxiyen.png"
            alt="Car rental"
            fill
            className="object-cover"
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
                <li className="flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-white/20 p-1 sm:p-2">
                    <Car className="h-3 w-3 text-white sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs text-white sm:text-sm sm:text-base">Wide Selection</span>
                </li>
                <li className="flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-white/20 p-1 sm:p-2">
                    <Zap className="h-3 w-3 text-white sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs text-white sm:text-sm sm:text-base">Easy Booking</span>
                </li>
                <li className="flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-white/20 p-1 sm:p-2">
                    <Headphones className="h-3 w-3 text-white sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs text-white sm:text-sm sm:text-base">24/5 Support</span>
                </li>
              </ul>

              {/* Address Search inside hero */}
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-2">
                  <div className="flex items-center px-4 py-3">
                    <MapPin className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/80 font-medium">PICKUP LOCATION</p>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Enter city, airport, or address..."
                          value={state.location || ''}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          onFocus={() => setIsLocationModalOpen(true)}
                          className="w-full border border-white/20 bg-transparent px-3 py-2 pr-10 text-base font-medium placeholder:text-white/60 focus:ring-0 cursor-pointer text-white rounded-md"
                        />
                        {state.location && (
                          <button
                            onClick={handleClearLocation}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-white/60 mt-1">Enter your address so we can suggest the nearest garage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Car cards below hero */}
      <div className="w-full px-2 py-8 sm:px-12 sm:py-12">
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
            <div className="grid gap-2 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5">
              {filteredCars.map((car) => {
                console.log("test:cars", car)
                // Get today's date and check if it's in unavailableDates
                const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
                const isTodayUnavailable = car.availability.unavailableDates.includes(today);
                const isAvailable = !isTodayUnavailable;
                
                return(
                <CarAvailabilityCard
                  key={car.id}
                  car={car}
                  isAvailable={isAvailable}
                  href={detailsHrefFor(car.id)}
                />
              )
              })}
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

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        title="Select Pickup Location"
        showLandmark={true}
        required={[true, true, true, true]}
      />

      {/* Nearest Garage Modal */}
      <NearestGarageModal
        isOpen={isNearestGarageModalOpen}
        onClose={() => setIsNearestGarageModalOpen(false)}
        searchResults={nearestGarageResults}
        onSelectGarage={handleSelectGarage}
      />
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

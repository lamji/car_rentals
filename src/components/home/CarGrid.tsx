/* eslint-disable @typescript-eslint/no-explicit-any */
import { CarAvailabilityCard } from "@/components/cars/CarAvailabilityCard";
import { setRadius } from "@/lib/slices/data";
import { Car } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import { isCarAvailableToday } from "@/utils/validateBlockedDates";
import { Car as CarIcon, Filter, Loader2, MapPin, MapPinOff, Search } from "lucide-react";


interface CarGridProps {
  filteredCars: Car[];
  detailsHrefFor: (id: string) => string;
  radiusList: number[];
  selectedCategory?: string;
}

export function CarGrid({ filteredCars, detailsHrefFor, radiusList, selectedCategory = "all" }: CarGridProps) {
  const dispatch = useDispatch();
  const currentRadius = useSelector((state: any) => state.data.radius);
  const isLoading = useSelector((state: any) => state.data.loading);
  const hasUserLocation = useSelector((state: any) => !!state.mapBox.current.position?.lat);
  const hasNearestGarages = useSelector((state: any) => (state.data.nearestGarages?.length ?? 0) > 0);
  const isFilteredByCategory = selectedCategory !== "all";

  return (
    <div className="lg:col-span-3">
      {/* Header with title and radius selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <CarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Available Cars</h2>
            <p className="text-xs text-gray-500 mt-0.5">{filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} found</p>
          </div>
        </div>

        {/* Radius selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-gray-500 mr-1">
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Radius</span>
          </div>
          <div className="inline-flex rounded-full bg-gray-100 p-0.5">
            {radiusList.map((radius) => (
              <button
                key={radius}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${currentRadius === radius
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => {
                  dispatch(setRadius(radius));
                }}
              >
                {radius}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Car grid with loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16 min-h-[200px]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="bg-primary/10 p-4 rounded-full">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Searching nearby</p>
              <p className="text-xs text-gray-400 mt-0.5">Finding the best cars for you...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredCars.map((car:any) => {
            // Use new booking-based availability check
            const isAvailable = isCarAvailableToday(car.availability?.unavailableDates || []);
            const isOnHold = car.isOnHold;
            return (
              <CarAvailabilityCard
                key={car.id}
                car={car}
                isAvailable={isAvailable}
                isOnHold={isOnHold}
                href={detailsHrefFor(car.id)}
              />
            );
          })}
        </div>
      )}

      {/* No cars message (only show when not loading) */}
      {!isLoading && filteredCars.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {isFilteredByCategory && hasNearestGarages ? (
            <>
              <div className="bg-amber-50 p-4 rounded-full mb-4">
                <Filter className="h-8 w-8 text-amber-500" />
              </div>
              <p className="text-base font-semibold text-gray-800">No cars in this category</p>
              <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">Try selecting a different category to see available cars nearby.</p>
            </>
          ) : hasUserLocation ? (
            <>
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-base font-semibold text-gray-800">No cars found nearby</p>
              <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">Try increasing the search radius or selecting a different location.</p>
            </>
          ) : (
            <>
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <MapPinOff className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-semibold text-gray-800">No cars available</p>
              <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">Enable location services or search for a location to discover cars near you.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

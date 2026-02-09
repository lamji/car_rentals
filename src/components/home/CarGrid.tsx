/* eslint-disable @typescript-eslint/no-explicit-any */
import { CarAvailabilityCard } from "@/components/cars/CarAvailabilityCard";
import { setRadius } from "@/lib/slices/data";
import { Car } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import { isCarAvailableToday } from "@/utils/validateBlockedDates";


interface CarGridProps {
  filteredCars: Car[];
  detailsHrefFor: (id: string) => string;
  radiusList: number[];
}

export function CarGrid({ filteredCars, detailsHrefFor, radiusList }: CarGridProps) {
  const dispatch = useDispatch();
  const currentRadius = useSelector((state: any) => state.data.radius);
  const isLoading = useSelector((state: any) => state.data.loading);

  return (
    <div className="lg:col-span-3">
      {/* Header with title and radius selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Available Cars</h2>
          <p className="text-sm text-gray-600 mt-1">Find the perfect car for your journey</p>
        </div>

        {/* Radius selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Search radius:</span>
          <div className="inline-flex rounded-md border border-gray-200 bg-white p-1 ">
            {radiusList.map((radius) => (
              <button
                key={radius}
                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${currentRadius === radius
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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
        <div className="flex justify-center items-center py-12 min-h-[200px]">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="mt-3 text-gray-600 text-center">Finding nearby cars...</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredCars.map((car:any) => {
            // Use new booking-based availability check
            const isAvailable = isCarAvailableToday(car.availability?.unavailableDates || []);
            const isOnHold = car.isOnHold;
            console.log('test:is available', {isAvailable, car, isOnHold});

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
        <div className="rounded-lg border bg-card p-4 text-center sm:p-6">
          <div className="text-sm font-semibold sm:text-base">No cars in this category</div>
          <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Try selecting another category.</div>
        </div>
      )}
    </div>
  );
}

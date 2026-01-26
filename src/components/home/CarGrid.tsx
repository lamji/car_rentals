import { CarAvailabilityCard } from "@/components/cars/CarAvailabilityCard";
import { Car } from "@/lib/types";

interface CarGridProps {
  filteredCars: Car[];
  detailsHrefFor: (id: string) => string;
}

export function CarGrid({ filteredCars, detailsHrefFor }: CarGridProps) {
  return (
    <div className="lg:col-span-3">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5">
        {filteredCars.map((car) => {
          console.log("test:cars", car);
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
          );
        })}
      </div>
      {filteredCars.length === 0 && (
        <div className="rounded-lg border bg-card p-4 text-center sm:p-6">
          <div className="text-sm font-semibold sm:text-base">No cars in this category</div>
          <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Try selecting another category.</div>
        </div>
      )}
    </div>
  );
}

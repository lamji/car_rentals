"use client";

import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Star, Car as CarIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type Props = {
  car: Car;
  isAvailable: boolean;
  href: string;
};

function getNextAvailableDate(unavailableDates: string[]): string | null {
  if (unavailableDates.length === 0) return null;
  
  const today = new Date();
  const sortedDates = unavailableDates
    .map(date => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  // Find the first date after today
  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i] > today) {
      return sortedDates[i].toISOString().split('T')[0];
    }
  }
  
  return null;
}


export function CarAvailabilityCard({ car, isAvailable, href }: Props) {
  const nextAvailableDate = getNextAvailableDate(car.availability.unavailableDates);
  
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        {/* Image on top */}
        <div className="relative h-36 w-full overflow-hidden bg-muted">
          <Image src={car.imageUrls[0]} alt={car.name} fill className="object-cover" />
          {/* Availability badge on top of image */}
          <div className="absolute top-2 right-2">
            <Badge variant={isAvailable ? "default" : "secondary"} className={isAvailable ? "bg-green-500 hover:bg-green-600" : ""}>
              {isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>
        
        {/* Details below */}
        <div className="px-3 py-0 sm:px-4 sm:py-0">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold sm:text-base">
              {car.name} {car.year}
            </div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {car.seats} seats • {car.transmission}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span>{car.rating}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="sm:hidden">·</span>
              <span>{car.rentedCount} rented</span>
              <span className="hidden sm:inline">•</span>
              <span className="sm:hidden">·</span>
              <div className="flex items-center gap-1">
                <CarIcon className="h-2.5 w-2.5" />
                <span className="whitespace-nowrap">{car.selfDrive ? "Self-drive" : "With driver"}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t pt-3">
            <div className="flex justify-around text-center">
              <div className="flex-1">
                <div className="text-lg font-bold text-primary sm:text-xl">{formatCurrency(car.pricePer12Hours)}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">12 Hours</div>
              </div>
              <div className="w-px bg-border"></div>
              <div className="flex-1">
                <div className="text-lg font-bold text-primary sm:text-xl">{formatCurrency(car.pricePer24Hours)}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">24 Hours</div>
              </div>
            </div>
          </div>
          
          {/* Availability information */}
          <div className="mt-3 p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-xs">
              {isAvailable ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">Available today</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="text-red-600 font-medium">Not available today</span>
                </>
              )}
            </div>
            {!isAvailable && nextAvailableDate && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Available from {new Date(nextAvailableDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" disabled={!isAvailable}>
          <Link href={href}>{isAvailable ? "View Details" : "Check Other Dates"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

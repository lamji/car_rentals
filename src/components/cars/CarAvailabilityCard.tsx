"use client";

import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle, Star, Car as CarIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useGeolocationContext } from "@/contexts/GeolocationContext";
import { calculateDistanceToCar, formatDistance } from "@/utils/distance";

type Props = {
  car: Car;
  isAvailable: boolean;
  href: string;
};

export function CarAvailabilityCard({ car, isAvailable, href }: Props) {
  const { position, loading } = useGeolocationContext();
  const distance = position ? calculateDistanceToCar(position, car) : null;
  const distanceText = distance ? formatDistance(distance) : null;
  
  return (
    <Card className="transition-shadow hover:shadow-lg h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Image on top */}
        <div className="relative h-36 w-full overflow-hidden bg-white p-2">
          <div className="relative w-full h-full">
            <Image src={car.imageUrls[0]} alt={car.name} fill className="object-cover" />
          </div>
          {/* Availability badge on top of image */}
          <div className="absolute top-2 right-2">
            <Badge variant={isAvailable ? "default" : "secondary"} className={isAvailable ? "bg-green-500 hover:bg-green-600" : ""}>
              {isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>
        
        {/* Details below */}
        <div className="px-3 py-0 sm:px-4 sm:py-0 flex-1 flex flex-col">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold sm:text-base">
              {car.name} {car.year}
            </div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {car.seats} seats • {car.transmission}
            </div>
            {loading ? (
              <div className="mt-1">
                <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
              </div>
            ) : distanceText ? (
              <div className="mt-1 text-xs text-muted-foreground">
                📍 {distanceText}
              </div>
            ) : null}
            <div className="mt-1 text-xs text-muted-foreground">
              🏢 Cebu City, Philippines
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

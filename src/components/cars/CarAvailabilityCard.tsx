"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Car } from "@/lib/types";
import { MapPin, Car as CarIcon, Users, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


type Props = {
  car: Car;
  isAvailable: boolean;
  href: string;
};

export function CarAvailabilityCard({ car, isAvailable, href }: Props) {

  return (
    <Card className="transition-shadow hover:shadow-lg h-full flex flex-col gap-2 border shadow-sm bg-gray-50 sm:bg-background">
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Image on top */}
        <div className="relative h-36 w-full overflow-hidden bg-white p-2 border border-white rounded-[20px] sm:h-40">
          <div className="relative w-full h-full">
            <Image
              src={car.imageUrls[0]}
              alt={car.name}
              fill
              className="object-contain sm:object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          {/* Availability badge on top of image */}
          <div className="absolute top-2 right-2">
            <Badge
              variant={isAvailable ? "default" : "secondary"}
              className={isAvailable ? "bg-green-500 hover:bg-green-600" : ""}
            >
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
            <div className="mt-1 text-[10px] text-muted-foreground sm:text-sm flex justify-between gap-2 border-t pt-2">
              <div className="flex-1 flex items-center gap-1">
                <Users className="h-3 w-3 text-primary" />
                <span>{car.seats} seats</span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex-1 flex items-center justify-end gap-1">
                <Settings className="h-3 w-3 text-primary" />
                <span>{car.transmission}</span>
              </div>
            </div>

            <div className="mt-1 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 border-t border-b py-2">
              <CarIcon className="h-3 w-3 text-primary" />
              {car?.distanceText}
            </div>

            <div className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground flex items-start gap-1 border-b pb-2">
              <MapPin className="h-3 w-3 mt-[1px] flex-shrink-0 text-primary" />
              <span className="break-words">{car?.garageAddress}</span>
            </div>
          </div>

          {/* Availability information */}

        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0 sm:p-4 sm:pt-0">
        <Button asChild className="w-full" disabled={!isAvailable}>
          <Link href={href}>
            {isAvailable ? "View Details" : "Check Other Dates"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useGeolocation } from "@/lib/npm-ready-stack/locationPicker";
import type { Car } from "@/lib/types";
import { calculateDistanceToCar, formatDistance } from "@/utils/distance";

export function CarCard(props: { car: Car; href: string }) {
  const car = props.car;
  const { position } = useGeolocation();

  // Calculate distance from user's location to car's garage
  const distance = position ? calculateDistanceToCar(position, car) : null;
  const distanceText = distance ? formatDistance(distance) : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={car.imageUrls[0]}
              alt={car.name}
              fill
              className="object-contain p-2"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">
                  {car.name} {car.year}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {car.seats} seats • {car.transmission}
                </div>
                {distanceText && (
                  <div className="mt-1 text-xs text-blue-600 font-medium">
                    📍 {distanceText}
                  </div>
                )}
              </div>
              <Badge variant="secondary">Available</Badge>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-lg font-semibold">${car.pricePer24Hours ?? car.pricePerDay ?? 0}</span>
              <span className="text-muted-foreground"> / day</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={props.href}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

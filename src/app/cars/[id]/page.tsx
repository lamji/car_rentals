"use client";

import * as React from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/currency";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { StickyBottomCTA } from "@/components/booking/StickyBottomCTA";
import { DateRangePicker } from "@/components/search/DateRangePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LocationModal } from "@/components/location/LocationModal";
import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";
import { usePricing } from "@/hooks/usePricing";

function CarDetailsPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [duration, setDuration] = useState<"12hours" | "24hours">("24hours");
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const id = params.id;
  const car = useCar(id);

  const location = searchParams.get("location") ?? "";
  const startDate = searchParams.get("start") ?? "";
  const endDate = searchParams.get("end") ?? "";

  const { patchDraft } = useBooking();

  // Calculate pricing based on duration selection
  const pricePerUnit = duration === "12hours" ? (car?.pricePer12Hours ?? 0) : (car?.pricePer24Hours ?? car?.pricePerDay ?? 0);
  const deliveryFee = fulfillmentType === "delivery" ? 150 : 0; // Add delivery fee if delivery is selected
  const pricing = usePricing({
    startDate,
    endDate,
    pricePerDay: pricePerUnit,
    deliveryFee,
  });

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-lg font-semibold">Car not found</div>
            <Button asChild className="mt-4">
              <Link href="/cars">Back to results</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canContinue = Boolean(startDate && endDate && fulfillmentType && startDate !== "" && endDate !== "" && location.trim());

  const handleLocationSelect = (newLocation: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("location", newLocation);
    router.replace(`/cars/${encodeURIComponent(id)}?${nextParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4">
          <div>
            <div className="text-xl font-semibold">{car.name} {car.year}</div>
            <div className="text-sm text-muted-foreground">Confirm car + dates</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              {/* Main image */}
              <div className="relative aspect-[4/2.4] w-full overflow-hidden rounded-lg bg-muted">
                <Image src={car.imageUrls[selectedImageIndex]} alt={car.name} fill className="object-cover" />
              </div>

              {/* Thumbnail gallery */}
              {car.imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {car.imageUrls.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary opacity-100"
                          : "border-transparent opacity-60 hover:opacity-80"
                      }`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${car.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                  Available
                </Badge>
                <Badge variant="outline">{car.seats} seats</Badge>
                <Badge variant="outline">{car.transmission}</Badge>
              </div>

              {/* Drive type section */}
              <div className="mt-4">
                <Badge 
                  variant={car.selfDrive ? "default" : "destructive"} 
                  className={`text-sm px-3 py-1 ${
                    car.selfDrive 
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" 
                      : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                  }`}
                >
                  {car.selfDrive ? "Self-drive Available" : "With Driver Only"}
                </Badge>
              </div>

              {/* Unavailable dates section */}
              {car.availability.unavailableDates.length > 0 && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-red-800">Unavailable Dates</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {car.availability.unavailableDates.sort().map((date) => (
                      <Badge key={date} variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                        {new Date(date).toLocaleDateString()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <div className="text-sm font-medium">Rent dates</div>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  unavailableDates={car.availability.unavailableDates}
                  onChange={(next) => {
                    const nextParams = new URLSearchParams(searchParams.toString());
                    nextParams.set("start", next.startDate);
                    nextParams.set("end", next.endDate);
                    router.replace(`/cars/${encodeURIComponent(id)}?${nextParams.toString()}`);
                  }}
                />
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium">Rental Duration</div>
                <RadioGroup value={duration} onValueChange={(value) => setDuration(value as "12hours" | "24hours")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12hours" id="12hours" />
                    <Label htmlFor="12hours" className="flex items-center justify-between w-full cursor-pointer">
                      <span>12 Hours</span>
                      <span className="font-semibold text-primary">{formatCurrency(car.pricePer12Hours)}</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24hours" id="24hours" />
                    <Label htmlFor="24hours" className="flex items-center justify-between w-full cursor-pointer">
                      <span>24 Hours</span>
                      <span className="font-semibold text-primary">{formatCurrency(car.pricePer24Hours)}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium">Fulfillment Type</div>
                <RadioGroup value={fulfillmentType} onValueChange={(value) => setFulfillmentType(value as "pickup" | "delivery")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>Pickup</span>
                        <span className="text-xs text-muted-foreground">at garage</span>
                      </div>
                      <span className="font-semibold text-green-600">Free</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>Delivery</span>
                        <span className="text-xs text-muted-foreground">to your location</span>
                      </div>
                      <span className="font-semibold text-primary">{formatCurrency(150)}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <PriceBreakdown
              days={pricing.days}
              pricePerDay={pricePerUnit}
              rentCost={pricing.rentCost}
              deliveryFee={pricing.deliveryFee}
              total={pricing.total}
              duration={duration}
            />

            <div className="rounded-lg border bg-card p-4">
              {location ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Location: <span className="text-foreground">{location}</span></span>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  <MapPin className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">Add location</span>
                  <Plus className="h-3 w-3 text-destructive" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <StickyBottomCTA
        label="Continue"
        total={pricing.total}
        disabled={!canContinue}
        onClick={() => {
          patchDraft({
            carId: car.id,
            location,
            startDate,
            endDate,
            duration,
            fulfillmentType,
            deliveryFee,
          });
          router.push(`/cars/${encodeURIComponent(car.id)}/fulfillment`);
        }}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={location}
      />
    </div>
  );
}

export default function CarDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CarDetailsPageContent />
    </Suspense>
  );
}

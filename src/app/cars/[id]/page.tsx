"use client";

import * as React from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import { MapLinkModal } from "@/components/ui/MapLinkModal";

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
import { useGeolocationContext } from "@/contexts/GeolocationContext";
import { calculateDistanceToCar, formatDistance, getReadableAddressFromCoordinates } from "@/utils/distance";

function CarDetailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [readableAddress, setReadableAddress] = useState<string>('Loading location...');
  const [showMapModal, setShowMapModal] = useState(false);

  const { position, loading } = useGeolocationContext();
  const id = params.id;
  const car = useCar(id);

  // Calculate distance from user's location to car's garage
  const distance = position && car ? calculateDistanceToCar(position, car) : null;
  const distanceText = distance ? formatDistance(distance) : null;

  // Fetch readable address from coordinates
  useEffect(() => {
    if (car?.garageLocation.coordinates) {
      const fetchAddress = async () => {
        try {
          const address = await getReadableAddressFromCoordinates(car.garageLocation.coordinates);
          setReadableAddress(address);
        } catch (error) {
          console.error('Failed to fetch address:', error);
          setReadableAddress('Location unavailable');
        }
      };

      fetchAddress();
    }
  }, [car?.garageLocation.coordinates]);

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

  const handleLocationSelect = (newLocation: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("location", newLocation);
    router.replace(`/cars/${encodeURIComponent(id)}?${nextParams.toString()}`);
    
    // Clear location error when location is selected
    if (newLocation.trim() && validationErrors.location) {
      setValidationErrors(prev => ({ ...prev, location: undefined }));
    }
  };

  const handleDateChange = (next: { startDate: string; endDate: string }) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("start", next.startDate);
    nextParams.set("end", next.endDate);
    router.replace(`/cars/${encodeURIComponent(id)}?${nextParams.toString()}`);
    
    // Clear date error when dates are selected
    if (next.startDate && next.endDate && validationErrors.dates) {
      setValidationErrors(prev => ({ ...prev, dates: undefined }));
    }
  };

  // Disable dates before today and dates too far in the future
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    // Allow bookings up to 6 months in advance (more reasonable for car rentals)
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 6);
    maxDate.setHours(0, 0, 0, 0);
    
    // Debug logging to check date comparison (current date should be Jan 22, 2026)
    console.log('Date validation:', {
      checking: date.toDateString(),
      today: today.toDateString(),
      maxDate: maxDate.toDateString(),
      isPast: date < today,
      isFuture: date > maxDate,
      checkingTime: date.getTime(),
      todayTime: today.getTime()
    });
    
    // Disable if date is before today OR after max booking window
    return date.getTime() < today.getTime() || date.getTime() > maxDate.getTime();
  };

  const validateAndContinue = () => {
    const errors: { location?: string; dates?: string } = {};
    
    if (!location.trim()) {
      errors.location = "Location is required";
    }
    
    if (!startDate || !endDate || startDate === "" || endDate === "") {
      errors.dates = "Rent dates are required";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Clear any existing errors
    setValidationErrors({});
    
    // If validation passes, proceed with the original logic
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
                <Badge 
                  variant={car.availability.isAvailableToday ? "default" : "destructive"} 
                  className={`${
                    car.availability.isAvailableToday 
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200" 
                      : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                  }`}
                >
                  {car.availability.isAvailableToday ? "Available" : "Unavailable"}
                </Badge>
                <Badge variant="outline">{car.seats} seats</Badge>
                <Badge variant="outline">{car.transmission}</Badge>
              </div>

              {/* Distance and Garage Location */}
              <div className="mt-4 space-y-2">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                ) : distanceText ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>📍</span>
                    <span>{distanceText} from your location</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🏢</span>
                  <span>Garage: {readableAddress}</span>
                  {car?.garageLocation.coordinates && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary hover:text-primary/80 underline ml-1"
                      onClick={() => setShowMapModal(true)}
                    >
                      <span className="flex items-center gap-1">
                        <span>Map</span>
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </Button>
                  )}
                </div>
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

              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium flex items-center gap-1">
                  Location <span className="text-destructive">*</span>
                </div>
                <div className={`rounded-lg border bg-card p-4 ${validationErrors.location ? 'border-destructive' : ''}`}>
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
                {validationErrors.location && (
                  <p className="text-sm text-destructive">{validationErrors.location}</p>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <div className="text-sm font-medium flex items-center gap-1">
                  Rent dates <span className="text-destructive">*</span>
                </div>
                <div className={validationErrors.dates ? 'border border-destructive rounded-md' : ''}>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    unavailableDates={car.availability.unavailableDates}
                    onChange={handleDateChange}
                    disabled={disabledDays}
                  />
                </div>
                {validationErrors.dates && (
                  <p className="text-sm text-destructive">{validationErrors.dates}</p>
                )}
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
          </div>
        </div>
      </div>

      <StickyBottomCTA
        label="Continue"
        total={pricing.total}
        disabled={false} // Always enabled now
        onClick={validateAndContinue}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialData={{ region: location }}
      />
      
      {/* Map Link Modal */}
      {car?.garageLocation.coordinates && (
        <MapLinkModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          mapUrl={`https://www.google.com/maps/search/?api=1&query=${car.garageLocation.coordinates.lat},${car.garageLocation.coordinates.lng}`}
          locationName={`${car.name} Garage`}
        />
      )}
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

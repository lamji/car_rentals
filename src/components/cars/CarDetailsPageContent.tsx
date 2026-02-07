/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";

import { MapLinkModal } from "@/components/ui/MapLinkModal";
import { Button } from "@/components/ui/button";
import { useCarDetailsPage } from "@/hooks/useCarDetailsPage";
import { MapBoxService } from "@/lib/npm-ready-stack/mapboxService/ui";
import { useAppSelector } from "@/lib/store";
import { Car, Copy, CreditCard, MapPin, Navigation, Phone, Settings, Users } from "lucide-react";
import { useMemo } from "react";
import { CarImages } from "./CarImages";

export function CarDetailsPageContent() {
  const {
    showMapModal,
    car,
    goToBooking,
    setShowMapModal,
    notesText,
    pointA,
    pointB,
    address,
    mapBoxDistanceText
  } = useCarDetailsPage();

  // Memoize map points to prevent unnecessary re-renders
  const memoPointA = useMemo(() => pointA, [pointA]);
  const memoPointB = useMemo(() => pointB, [pointB]);
  const mapBoxState = useAppSelector((state: any) => state.mapBox);

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

  return (
    <div data-testid="car-details-page" className="min-h-screen bg-white">
      <div className="flex p-5 gap-10">
        <div className="h-[80vh] bg-gray-200 relative w-1/2 rounded-lg p-2 overflow-hidden">
          <MapBoxService
            pointA={mapBoxState.current.position || memoPointA}
            pointB={memoPointB}
            className="w-full h-full rounded-lg"
            distanceText={mapBoxDistanceText}
          />
        </div>
        <div className="w-1/2">
          <div>
            <CarImages imageUrls={car.imageUrls} carName={car.name} />
          </div>
          <div className="space-y-2">
            <h1
              data-testid="car-name"
              className="text-4xl font-bold text-gray-900 tracking-tight"
            >
              {car.name} - {car.year}
            </h1>

          </div>
          <div className={`p-3 mt-4 text-sm font-medium px-3 py-1 rounded-lg text-center w-1/3 border border-green-300 mb-2 ${car.availability.isAvailableToday
            ? 'bg-green-100/50 text-green-600'
            : 'bg-red-100/50 text-red-600'}`}>
            {car.availability.isAvailableToday ? 'Available Now' : 'Currently Unavailable'}
          </div>
          <div className="text-gray-600 text-sm flex flex-row gap-2 items-center">
            <MapPin className="h-4 w-4 text-primary" />
            {address || 'Address not available'}
          </div>
          <div className="flex justify-between my-0 mt-2 border-t border-b">
            <div className="border-r w-1/4 text-center p-2 flex flex-col gap-0 items-center justify-center">
              <div className="flex flex-row gap-2 items-center">
                <Car className="h-5 w-5 text-primary" />
                {car.selfDrive ? "Self-Drive" : "With Driver"}
                <span className={`inline-block h-2 w-2 rounded-full ${car.selfDrive ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              {!car.selfDrive && (
                <div className="text-[10px] text-gray-600 font-medium">
                  + ₱500/day fees
                </div>
              )}
            </div>
            <div className="border-r w-1/4 text-center p-2 flex flex-row items-center justify-center gap-2">
              <Users className="h-5 w-5 mb-1 text-primary" />
              {car.seats} Seats
            </div>
            <div className="border-r w-1/4 text-center p-2 flex flex-row items-center justify-center gap-2">
              <Settings className="h-5 w-5 mb-1 text-primary" />
              {car.transmission}
            </div>
            <div className="border-r w-1/4 text-center p-2 flex flex-row items-center justify-center gap-2">
              <Navigation className="h-5 w-5 mb-1 text-primary" />
              {mapBoxDistanceText}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mt-3">Rates</h3>
          <h3 className="text-lg font-bold text-gray-900 mt-3"></h3>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex flex-row items-center mb-5 justify-between gap-2">
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2 bg-green-100/50 rounded-lg px-3 py-2 flex-1 border border-green-300">
                <div className="bg-primary rounded p-1"><CreditCard className="h-5 w-5 text-white" /></div>
                ₱{car.pricePerHour?.toLocaleString() || '0'}/hr
              </div>
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2 bg-green-100/50 rounded-lg px-3 py-2 flex-1 border border-green-300">
                <div className="bg-primary rounded p-1"><CreditCard className="h-5 w-5 text-white" /></div>
                ₱{car.pricePer12Hours?.toLocaleString() || '0'}/12hr
              </div>
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2 bg-green-100/50 rounded-lg px-3 py-2 flex-1 border border-green-300">
                <div className="bg-primary rounded p-1"><CreditCard className="h-5 w-5 text-white" /></div>
                ₱{car.pricePer24Hours?.toLocaleString() || '0'}/24hr
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary rounded-full p-2">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{car.owner?.name}</div>
                  <div className="text-sm text-gray-600">Owner</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary rounded-full p-2">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{car.owner?.contactNumber}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(car.owner?.contactNumber || '')}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy number"
                  >
                    <Copy className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 mb-10">
            <div className="flex items-start gap-2">
              <div className="bg-amber-100 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-2">Booking Information</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>{notesText}</li>
                  {car.selfDrive && (
                    <>
                      <li>• Self-drive requires valid driver&apos;s license verification</li>
                      <li>• Screenshots from LTO portal may be required for verification</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <Button
            onClick={goToBooking}
            className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 z-50"
          >
            <CreditCard className="h-5 w-5" />
            Book Now
          </Button>
        </div>

      </div>

      {car?.garageLocation.coordinates && (
        <MapLinkModal
          data-testid="map-modal"
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          mapUrl={`https://www.google.com/maps/search/?api=1&query=${car.garageLocation.coordinates.lat},${car.garageLocation.coordinates.lng}`}
          locationName={`${car.name} Garage`}
        />
      )}
    </div>
  );
}

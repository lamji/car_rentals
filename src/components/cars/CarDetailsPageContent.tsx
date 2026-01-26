"use client";

import Link from "next/link";

import { MapLinkModal } from "@/components/ui/MapLinkModal";
import { Button } from "@/components/ui/button";
import { RentalOptions } from "@/components/cars/RentalOptions";
import { CarImages } from "@/components/cars/CarImages";
import { useCarDetailsPage } from "@/hooks/useCarDetailsPage";

export function CarDetailsPageContent() {
  const {
    showMapModal,
    car,
    distanceText,
    loading,
    goToBooking,
    setShowMapModal,
  } = useCarDetailsPage();

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
      <div
        data-testid="car-details-container"
        className="mx-auto w-full max-w-7xl px-4 py-8"
      >
        <div
          data-testid="car-details-content"
          className="grid gap-12 lg:grid-cols-2"
        >
          <div>
            <CarImages imageUrls={car.imageUrls} carName={car.name} />
          </div>

          <div data-testid="car-info-section" className="space-y-8">
            <div data-testid="car-title-section" className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1
                    data-testid="car-name"
                    className="text-4xl font-bold text-gray-900 tracking-tight"
                  >
                    {car.name} {car.year}
                  </h1>
                  <p
                    data-testid="car-type"
                    className="text-xl text-gray-600 font-medium capitalize"
                  >
                    {car.type}
                  </p>
                </div>
              </div>

              <div
                data-testid="car-badges"
                className="flex flex-wrap gap-3 pt-4"
              >
                <div
                  data-testid="driving-mode-badge"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                    car.selfDrive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      car.selfDrive ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  ></div>
                  {car.selfDrive ? "Self-Drive" : "With Driver"}
                </div>
                <div
                  data-testid="availability-badge"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                    car.availability.isAvailableToday
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      car.availability.isAvailableToday
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  {car.availability.isAvailableToday
                    ? "Available Now"
                    : "Currently Unavailable"}
                </div>
                <div
                  data-testid="seats-badge"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {car.seats} Seats
                </div>
                <div
                  data-testid="transmission-badge"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  {car.transmission}
                </div>
              </div>
            </div>

            <div
              data-testid="owner-contact-section"
              className="border-t border-gray-200 pt-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Owner Information
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div
                        data-testid="owner-name"
                        className="font-semibold text-gray-900"
                      >
                        {car.owner.name}
                      </div>
                      <div
                        data-testid="owner-contact"
                        className="text-sm text-gray-600"
                      >
                        {car.owner.contactNumber}
                      </div>
                    </div>
                  </div>
                  <Button
                    data-testid="contact-owner-button"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() =>
                      window.open(`tel:${car.owner.contactNumber}`, "_self")
                    }
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Call Owner
                  </Button>
                </div>
              </div>
            </div>

            <RentalOptions car={car} />

            <div
              data-testid="location-section"
              className="border-t border-gray-200 pt-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Location & Distance
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : distanceText ? (
                  <div
                    data-testid="distance-info"
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{distanceText} from your location</span>
                  </div>
                ) : null}
                <div
                  data-testid="garage-address"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="font-medium">{car.garageAddress}</span>
                  </div>
                  {car?.garageLocation.coordinates && (
                    <Button
                      data-testid="view-map-button"
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => setShowMapModal(true)}
                    >
                      View Map
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {car.availability.unavailableDates.length > 0 && (
              <div
                data-testid="unavailable-dates-section"
                className="border-t border-gray-200 pt-8"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Unavailable Dates
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-red-900">
                        Already Booked
                      </h3>
                      <p className="text-xs text-red-600">
                        {car.availability.unavailableDates.length} dates
                        unavailable
                      </p>
                    </div>
                  </div>
                  <div
                    data-testid="unavailable-dates-list"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {car.availability.unavailableDates
                      .slice()
                      .sort()
                      .map((date) => (
                        <div
                          key={date}
                          data-testid={`unavailable-date-${date}`}
                          className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-800"
                        >
                          <svg
                            className="h-3.5 w-3.5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <div
              data-testid="booking-section"
              className="border-t border-gray-200 pt-8"
            >
              <Button
                data-testid="continue-booking-button"
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/80 text-white"
                onClick={goToBooking}
              >
                <span className="flex items-center justify-center gap-2">
                  Continue to Booking
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Button>
              <p className="text-xs text-gray-500 text-center mt-3">
                20% down payment required • No refund upon cancellation
              </p>
            </div>
          </div>
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

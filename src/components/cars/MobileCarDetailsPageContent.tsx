"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MapLinkModal } from "@/components/ui/MapLinkModal";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useCarDetailsPage } from "@/hooks/useCarDetailsPage";
import { formatCurrency } from "@/lib/currency";
import { MapBoxService } from "@/lib/npm-ready-stack/mapboxService/ui";
import { getFutureUnavailableDates } from "@/utils/dateHelpers";
import { Calendar, Copy, MoveLeft, Phone, User } from "lucide-react";

export function MobileCarDetailsPageContent() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const {
    showMapModal,
    car,
    distanceText,
    loading,
    setShowMapModal,
    goToBooking,
    selectedImageIndex,
    selectImage,
    notesText,
    pointA,
    pointB,
    address,
  } = useCarDetailsPage();

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-lg font-semibold">Car not found</div>
            <Button className="mt-4" onClick={() => router.push("/cars")}>
              Back to results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="car-details-page"
      className="min-h-screen bg-white relative"
    >
      {/* Top section: 60vh - Gray background with header and map */}
      <div className="h-[60vh] bg-gray-200 relative">
        {/* Map as background */}
        <MapBoxService
          pointA={pointA}
          pointB={pointB}
          className="w-full h-full"
        />

        {/* Header with back arrow and title - positioned over map */}
        <div className="absolute top-0 left-0 right-0 z-40">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 rounded-full"
              onClick={() => router.push("/cars")}
            >
              <MoveLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white drop-shadow-lg">
              View Details
            </h1>
          </div>
        </div>
      </div>

      {/* Bottom section: 40vh - Scrollable content */}

      <div className=" overflow-y-auto bg-white flex flex-col items-start justify-start p-4 pb-24 rounded-tl-[20px] rounded-tr-[20px] -mt-4 relative z-30">
        {/* Car Image */}
        {/* Car Name */}
        <div className="text-gray-900 text-xl font-bold mb-2">
          {car?.name} {car?.year}
        </div>
        {/* Car Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
            ⛽ Gasoline
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
            👥 {car?.seats} Seats
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
            🚗 {car?.transmission}
          </div>
        </div>

        <div className="w-full mb-4">
          {car?.imageUrls && (
            <div className="flex gap-3">
              {/* Left Section - Small Thumbnails */}
              <div className="flex flex-col gap-2 w-12">
                {car.imageUrls.slice(0, 3).map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    className={`relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedImageIndex === index
                        ? "border-blue-600 shadow-lg"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${car.name} thumbnail ${index + 1}`}
                      fill
                      className="object-contain rounded-lg bg-gray-50"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>

              {/* Right Section - Main Car Image */}
              <div className="flex-1 relative h-48">
                <Image
                  src={car.imageUrls[selectedImageIndex]}
                  alt={car.name}
                  fill
                  className="object-cover rounded-lg bg-gray-50"
                  sizes="(max-width: 768px) calc(100% - 60px), 50vw"
                />
                {/* Availability Badge - Floating on top */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                      car?.availability?.isAvailableToday
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        car?.availability?.isAvailableToday
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    {car?.availability?.isAvailableToday
                      ? "Available"
                      : "Unavailable"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Garage Address */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="h-4 w-4 text-gray-500"
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
            <span className="text-gray-600 text-sm">{address}</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 ml-6">
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : distanceText ? (
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-500 ml-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-gray-500 text-xs">
                {distanceText} from your location
              </span>
            </div>
          ) : null}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 mb-4"></div>

        {/* Three Boxes */}
        <div className="flex gap-3 w-full">
          {/* Box 1 - Per Hour */}
          <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-400">
            <div className="text-gray-900 font-semibold mb-1 text-xs">
              Per Hour
            </div>
            <div className="text-gray-600 text-sm">
              <div>{formatCurrency(car?.pricePerHour)}</div>
            </div>
          </div>

          {/* Box 2 - 12 Hours */}
          <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-400">
            <div className="text-gray-900 font-semibold mb-1 text-xs">
              12 Hours
            </div>
            <div className="text-gray-600 text-sm">
              <div>{formatCurrency(car?.pricePer12Hours)}</div>
            </div>
          </div>

          {/* Box 3 - 24 Hours */}
          <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-400">
            <div className="text-gray-900 font-semibold mb-1 text-xs">
              24 Hours
            </div>
            <div className="text-gray-600 text-sm">
              <div>{formatCurrency(car?.pricePer24Hours)}</div>
            </div>
          </div>
        </div>

        {/* Self Drive Option - Full Width Box */}
        <div className="w-full bg-gray-800 rounded-lg p-4 flex items-center gap-3 relative mt-5">
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <div
              className={`h-2 w-2 rounded-full ${
                car?.selfDrive ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          </div>

          <div className="flex-shrink-0">
            <svg
              className={`h-8 w-8 ${
                car?.selfDrive ? "text-green-600" : "text-red-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">
              {car?.selfDrive ? "Self-Drive" : "With Driver"}
            </div>
            <div className="text-gray-300 text-xs">
              {car?.selfDrive
                ? "Drive the car yourself"
                : "Professional driver included"}
            </div>
            {!car?.selfDrive && (
              <div className="text-amber-400 text-xs font-medium mt-1">
                +{formatCurrency(50)} driver fee
              </div>
            )}
          </div>
        </div>

        {/* Unavailable Dates */}
        {car?.availability?.unavailableDates &&
          (() => {
            const futureDates = getFutureUnavailableDates(
              car.availability.unavailableDates,
            );

            return (
              futureDates.length > 0 && (
                <div className="my-4">
                  <h3 className="text-gray-900 font-semibold text-sm mb-3">
                    Unavailable Dates
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {futureDates
                      .slice()
                      .sort()
                      .map((date) => (
                        <div
                          key={date}
                          className="flex flex-col items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                        >
                          <Calendar className="h-6 w-6 text-red-500" />
                          <span className="text-xs font-medium text-red-800 text-center">
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
              )
            );
          })()}

        {/* Owner Information */}
        <div className="flex-grow my-4 w-full">
          <h3 className="text-gray-900 font-semibold text-sm mb-3">
            Owner Information
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">
                  {car?.owner?.name}
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1 truncate">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{car?.owner?.contactNumber}</span>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 flex-shrink-0"
                onClick={() => {
                  if (car?.owner?.contactNumber) {
                    navigator.clipboard.writeText(car.owner.contactNumber);
                    setShowToast(true);
                  }
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Booking Notes */}
        <div className="mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg
                className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-amber-800 leading-relaxed">
                {notesText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Continue Booking Button */}
      <div className="fixed bottom-2 left-4 right-4 z-50">
        <Button
          onClick={goToBooking}
          size="lg"
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/80 text-white shadow-lg"
        >
          Continue to Booking
        </Button>
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

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Phone number copied to clipboard!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

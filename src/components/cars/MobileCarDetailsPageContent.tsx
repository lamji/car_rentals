"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { MapLinkModal } from "@/components/ui/MapLinkModal";
import { useCarDetailsPage } from "@/hooks/useCarDetailsPage";
import { formatCurrency } from "@/lib/currency";

export function MobileCarDetailsPageContent() {
    const {
        showMapModal,
        car,
        distanceText,
        loading,
        setShowMapModal,
        goToBooking,
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
        <div data-testid="car-details-page" className="min-h-screen bg-white relative">
            {/* Top section: 60vh - Gray background with header and map */}
            <div className="h-[50vh] bg-gray-200 relative">
                {/* Map as background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://res.cloudinary.com/dlax3esau/image/upload/v1769445895/Screenshot_from_2026-01-27_00-44-00_ew9olg.png)'
                    }}
                />
                
                {/* Header with back arrow and title - positioned over map */}
                <div className="relative z-40 bg-transparent">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Link href="/cars">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold text-white">View Details</h1>
                    </div>
                </div>
            </div>

            {/* Bottom section: 40vh - Scrollable content */}
            <div className=" overflow-y-auto bg-white flex flex-col items-start justify-start p-4 pb-24 rounded-tl-[20px] rounded-tr-[20px] -mt-4 relative z-30">
                {/* Car Image */}
                <div className="w-full mb-4">
                    {car?.imageUrls?.[0] && (
                        <div className="relative w-full h-32">
                            <Image 
                                src={car.imageUrls[0]} 
                                alt={car.name}
                                fill
                                className="object-contain rounded-lg bg-gray-50"
                                sizes="(max-width: 768px) 100vw, 50vw"
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
                    )}
                </div>
                
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

                {/* Garage Address */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600 text-sm">{car?.garageAddress}</span>
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2 ml-6">
                            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                    ) : distanceText ? (
                        <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-500 ml-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-gray-500 text-xs">{distanceText} from your location</span>
                        </div>
                    ) : null}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 mb-4"></div>

                {/* Three Boxes */}
                <div className="flex gap-3 w-full">
                    {/* Box 1 - Per Hour */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-900 font-semibold mb-1 text-xs">Per Hour</div>
                        <div className="text-gray-600 text-sm">
                            <div>{formatCurrency(car?.pricePerHour)}</div>
                        </div>
                    </div>
                    
                    {/* Box 2 - 12 Hours */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-900 font-semibold mb-1 text-xs">12 Hours</div>
                        <div className="text-gray-600 text-sm">
                            <div>{formatCurrency(car?.pricePer12Hours)}</div>
                        </div>
                    </div>
                    
                    {/* Box 3 - 24 Hours */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-900 font-semibold mb-1 text-xs">24 Hours</div>
                        <div className="text-gray-600 text-sm">
                            <div>{formatCurrency(car?.pricePer24Hours)}</div>
                        </div>
                    </div>
                </div>

                {/* Self Drive Option - Full Width Box */}
                <div className="w-full bg-gray-800 rounded-lg p-4 flex items-center gap-3 relative mt-5">
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                        <div className={`h-2 w-2 rounded-full ${
                            car?.selfDrive ? "bg-green-500" : "bg-red-500"
                        }`}></div>
                    </div>
                    
                    <div className="flex-shrink-0">
                        <svg className={`h-8 w-8 ${
                            car?.selfDrive ? "text-green-600" : "text-red-600"
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="text-white font-semibold text-sm">
                            {car?.selfDrive ? "Self-Drive" : "With Driver"}
                        </div>
                        <div className="text-gray-300 text-xs">
                            {car?.selfDrive ? "Drive the car yourself" : "Professional driver included"}
                        </div>
                        {!car?.selfDrive && (
                            <div className="text-amber-400 text-xs font-medium mt-1">
                                +{formatCurrency(50)} driver fee
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-gray-600 text-lg">
                    Bottom Section
                </div>
            </div>

            {/* Floating Continue Booking Button */}
            <div className="fixed bottom-6 left-4 right-4 z-50">
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
        </div>
    );
}

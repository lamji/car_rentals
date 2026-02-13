/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";
import { setSelectedCar } from "@/lib/slices/bookingSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGeolocation } from "../lib/npm-ready-stack/locationPicker";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetCurrentLocation,
  useReverseLocation,
} from "../lib/npm-ready-stack/mapboxService";
import useCalculateRotes from "../lib/npm-ready-stack/mapboxService/bl/hooks/useCalculateRotes";

export function useCarDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const {cars} = useAppSelector((state:any) => state.data);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [address, setAddress] = useState("Unknown location");
  const { getLocationNameFromPoint } = useReverseLocation();
  const { position: currentData, getCurrentLocation } = useGetCurrentLocation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const previousIsOnHold = useRef<boolean | undefined>(undefined);

  const {  loading } = useGeolocation();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  const car = useCar(id);
      // Store entire car data in Redux

  const distanceText = cars?.distanceText;

  const { patchDraft } = useBooking();

  const goToBooking = useCallback(() => {
    if (!car) return;
    dispatch(setSelectedCar(car));

    patchDraft({ carId: cars.id });
    router.push(`/cars/${encodeURIComponent(car.id)}/booking`);
  }, [car, dispatch, patchDraft, router]);

  const toggleMapModal = useCallback(() => {
    setShowMapModal((prev) => !prev);
  }, []);

  const selectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const notesText =
    "When you continue to booking, this unit will be placed on hold for 2 minutes to avoid double bookings. If you don't complete the booking within 2 minutes, the unit will become available again for other users.";

  // Listen for hold status changes for this specific car
  useEffect(() => {
    if (!cars) return;
    
    // Initialize previousIsOnHold on first render to prevent false trigger
    if (previousIsOnHold.current === undefined) {
      previousIsOnHold.current = cars.isOnHold;
      return;
    }
    
    // Only show toast when isOnHold actually changes
    if (previousIsOnHold.current !== cars.isOnHold) {
      if (cars.isOnHold) {
        showToast(
          `${cars.name} is currently on hold: ${cars.holdReason || 'Someone is processing a booking for this car'}`,
          'info'
        );
      } else {
        showToast(
          `${cars.name} is now available for booking!`,
          'success'
        );
      }
      
      // Update previous state
      previousIsOnHold.current = cars.isOnHold;
    }
  }, [cars, cars?.isOnHold, cars?.name, cars?.holdReason, showToast]);

  // Fetch address when car data is available
  useEffect(() => {
    const fetchAddress = async () => {
      if (car?.garageLocation?.coordinates) {
        try {
          const locationName = await getLocationNameFromPoint(
            car.garageLocation.coordinates,
          );
          setAddress(locationName);
        } catch (error) {
          console.error("Failed to fetch address:", error);
          setAddress("Unknown location");
        }
      } else {
        setAddress("Unknown location");
      }
    };

    fetchAddress();
  }, [car?.garageLocation?.coordinates, getLocationNameFromPoint]);

  const mapBoxState = useAppSelector((state: any) => state.mapBox);

  useEffect(() => {
    // Only fetch GPS if no position exists in Redux (user hasn't selected a location)
    if (!mapBoxState.current.position?.lat) {
      getCurrentLocation();
    }
  }, []);

  // Use Redux position (from LocationModal or GPS) as source of truth, fallback to GPS data
  const pointA = useMemo(
    () => ({
      lat: mapBoxState.current.position?.lat || currentData?.lat || 0,
      lng: mapBoxState.current.position?.lng || currentData?.lng || 0,
    }),
    [mapBoxState.current.position?.lat, mapBoxState.current.position?.lng, currentData?.lat, currentData?.lng],
  );

  const pointB = useMemo(
    () => ({
      lat: car?.garageLocation?.coordinates?.lat || 0,
      lng: car?.garageLocation?.coordinates?.lng || 0,
    }),
    [
      car?.garageLocation?.coordinates?.lat,
      car?.garageLocation?.coordinates?.lng,
    ],
  );

  // implement here
  const {
    distance: mapBoxDistance,
    distanceText: mapBoxDistanceText,
    chargePerKm,
    totalCharge,
    formattedCharge,
  } = useCalculateRotes({ pointA, pointB });
  return {
    // State
    showMapModal,
    car:cars,
    distanceText,
    loading,
    id,
    selectedImageIndex,
    notesText,
    address,
    // Actions
    goToBooking,
    toggleMapModal,
    setShowMapModal,
    selectImage,
    pointA,
    pointB,
    mapBoxDistance,
    mapBoxDistanceText,
    chargePerKm,
    totalCharge,
    formattedCharge,
  };
}

/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";
import { setSelectedCar } from "@/lib/slices/bookingSlice";
import { useAppDispatch } from "@/lib/store";
import { calculateDistanceToCar, formatDistance } from "@/utils/distance";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGeolocation } from "../lib/npm-ready-stack/locationPicker";
import {
  useGetCurrentLocation,
  useReverseLocation,
} from "../lib/npm-ready-stack/mapboxService";
import useCalculateRotes from "../lib/npm-ready-stack/mapboxService/bl/hooks/useCalculateRotes";

export function useCarDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [address, setAddress] = useState("Unknown location");
  const { getLocationNameFromPoint } = useReverseLocation();
  const { position: currentData, getCurrentLocation } = useGetCurrentLocation();
  const dispatch = useAppDispatch();

  const { position, loading } = useGeolocation();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  const car = useCar(id);

  // Calculate distance from user's location to car's garage
  const distance =
    position && car ? calculateDistanceToCar(position, car) : null;
  const distanceText = distance ? formatDistance(distance) : null;

  const { patchDraft } = useBooking();

  const goToBooking = useCallback(() => {
    if (!car) return;

    // Store entire car data in Redux
    console.log("test:cardData:", car);
    dispatch(setSelectedCar(car));

    patchDraft({ carId: car.id });
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

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Memoize pointA and pointB to prevent unnecessary re-renders
  const pointA = useMemo(
    () => ({
      lat: currentData?.lat || 0,
      lng: currentData?.lng || 0,
    }),
    [currentData?.lat, currentData?.lng],
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

  console.log(
    "test:mapbox",
    mapBoxDistance,
    mapBoxDistanceText,
    chargePerKm,
    totalCharge,
    formattedCharge,
  );
  return {
    // State
    showMapModal,
    car,
    distance,
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

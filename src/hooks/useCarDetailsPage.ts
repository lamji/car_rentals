"use client";

import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";
import { setSelectedCar } from "@/lib/slices/bookingSlice";
import { useAppDispatch } from "@/lib/store";
import { calculateDistanceToCar, formatDistance } from "@/utils/distance";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useGeolocation } from "../lib/npm-ready-stack/locationPicker";

export function useCarDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const dispatch = useAppDispatch();

  const { position, loading } = useGeolocation();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const car = useCar(id);

  // Calculate distance from user's location to car's garage
  const distance = position && car ? calculateDistanceToCar(position, car) : null;
  const distanceText = distance ? formatDistance(distance) : null;

  const { patchDraft } = useBooking();

  const goToBooking = useCallback(() => {
    if (!car) return;
    
    // Store entire car data in Redux
    console.log('test:cardData:', car);
    dispatch(setSelectedCar(car));
    
    patchDraft({ carId: car.id });
    router.push(`/cars/${encodeURIComponent(car.id)}/booking`);
  }, [car, dispatch, patchDraft, router]);

  const toggleMapModal = useCallback(() => {
    setShowMapModal(prev => !prev);
  }, []);

  const selectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const notesText = "When you continue to booking, this unit will be placed on hold for 2 minutes to avoid double bookings. If you don't complete the booking within 2 minutes, the unit will become available again for other users."

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
    
    // Actions
    goToBooking,
    toggleMapModal,
    setShowMapModal,
    selectImage,
  };
}

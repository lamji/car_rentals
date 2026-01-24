"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useGeolocationContext } from "@/contexts/GeolocationContext";
import { useAppDispatch } from "@/lib/store";
import { setSelectedCar } from "@/lib/slices/bookingSlice";
import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";
import { calculateDistanceToCar, formatDistance } from "@/utils/distance";

export function useCarDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [showMapModal, setShowMapModal] = useState(false);
  const dispatch = useAppDispatch();

  const { position, loading } = useGeolocationContext();
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

  return {
    // State
    showMapModal,
    car,
    distance,
    distanceText,
    loading,
    id,
    
    // Actions
    goToBooking,
    toggleMapModal,
    setShowMapModal,
  };
}

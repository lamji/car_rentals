"use client";

import { useSearchState } from "@/hooks/useSearchState";
import {
  SearchNearestGarageResponse,
  useNearestGarage,
} from "@/lib/api/useNearestGarage";
import { CARS } from "@/lib/data/cars";
import type { CarType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAppSelector } from "../lib/store";

export function useHomeContent() {
  const { state, setState } = useSearchState();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNearestGarageModalOpen, setIsNearestGarageModalOpen] =
    useState(false);
  const [nearestGarageResults, setNearestGarageResults] =
    useState<SearchNearestGarageResponse | null>(null);
  const { searchNearestGarage } = useNearestGarage();
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const router = useRouter();
  const stateMapBox = useAppSelector((state) => state.mapBox);

  console.log("Hero - stateMapBox:", stateMapBox);

  const handleLocationSelect = useCallback(
    async (locationString: string) => {
      setState({ location: locationString }, { replace: true });
      setIsLocationModalOpen(false);

      // Trigger nearest garage search when location is selected from modal
      if (locationString.trim().length > 3) {
        try {
          const results = await searchNearestGarage({
            address: locationString,
            timeoutMs: 1500,
            progressIntervalMs: 300,
          });
          setNearestGarageResults(results);
          setIsNearestGarageModalOpen(true);
        } catch (error) {
          console.error("Error searching nearest garage:", error);
        }
      }
    },
    [setState, searchNearestGarage],
  );

  const handleClearLocation = useCallback(() => {
    setState({ location: "" });
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    setNearestGarageResults(null);
    setIsNearestGarageModalOpen(false);
  }, [setState, searchTimeout]);

  const handleLocationChange = useCallback(
    (value: string) => {
      console.log("handleLocationChange called with:", value);
      setState({ location: value });
      alert(value); // Testing alert

      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Trigger nearest garage search with debouncing
      if (value.trim().length > 3) {
        const timeout = setTimeout(async () => {
          try {
            const results = await searchNearestGarage({
              address: value,
              timeoutMs: 1500,
              progressIntervalMs: 300,
            });
            setNearestGarageResults(results);
            setIsNearestGarageModalOpen(true);
          } catch (error) {
            console.error("Error searching nearest garage:", error);
          }
        }, 500); // 500ms debounce

        setSearchTimeout(timeout);
      }
    },
    [setState, searchNearestGarage, searchTimeout],
  );

  const handleSelectGarage = useCallback(
    (carId: string) => {
      console.log("Selected car:", carId);
      setIsNearestGarageModalOpen(false);

      // Extract car ID from the listing ID (format: "car-listing-{carId}")
      const actualCarId = carId.replace("car-listing-", "");

      // Redirect to car details page
      router.push(`/cars/${actualCarId}`);
    },
    [router],
  );

  const detailsHrefFor = useCallback(
    (id: string) => {
      const params = new URLSearchParams();

      if (state.location) params.set("location", state.location);
      if (state.startDate) params.set("start", state.startDate);
      if (state.endDate) params.set("end", state.endDate);
      if (state.carType) params.set("type", state.carType);

      const queryString = params.toString();
      return `/cars/${encodeURIComponent(id)}${queryString ? `?${queryString}` : ""}`;
    },
    [state],
  );

  // Category filtering
  const categories: { label: string; value: CarType | "all" }[] = [
    { label: "All Cars", value: "all" },
    { label: "SUV", value: "suv" },
    { label: "Sedan", value: "sedan" },
    { label: "Van", value: "van" },
  ];

  const [selectedCategory, setSelectedCategory] = useState<CarType | "all">(
    "all",
  );

  const filteredCars = useMemo(() => {
    if (selectedCategory === "all") return CARS;
    return CARS.filter((car) => car.type === selectedCategory);
  }, [selectedCategory]);

  return {
    // State
    state,
    isLocationModalOpen,
    isNearestGarageModalOpen,
    nearestGarageResults,
    selectedCategory,
    filteredCars,
    categories,

    // Actions
    setIsLocationModalOpen,
    setIsNearestGarageModalOpen,
    setSelectedCategory,
    handleLocationSelect,
    handleClearLocation,
    handleLocationChange,
    handleSelectGarage,
    detailsHrefFor,
    currentAddress: stateMapBox.current.address,
  };
}

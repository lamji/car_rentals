"use client";

import { Header } from "./Header";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useLocationModal } from "@/contexts/LocationModalContext";

export function HeaderWithLocation() {
  const {
    state,
    handleLocationChange,
    handleClearLocation,
  } = useHomeContent();
  
  const { openLocationModal } = useLocationModal();

  return (
    <Header
      state={state}
      setIsLocationModalOpen={openLocationModal}
      handleLocationChange={handleLocationChange}
      handleClearLocation={handleClearLocation}
    />
  );
}

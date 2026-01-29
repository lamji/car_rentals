"use client";

import { useHomeContent } from "@/hooks/useHomeContent";
import { openLocationModal } from "@/lib/slices/uiSlice";
import { useDispatch } from "react-redux";
import { Header } from "./Header";

export function HeaderWithLocation() {
  const dispatch = useDispatch();
  const {
    state,
    handleLocationChange,
    handleClearLocation,
  } = useHomeContent();
  
  /**
   * Handle opening the location modal via Redux
   * @returns {void}
   */
  const handleOpenLocationModal = () => {
    dispatch(openLocationModal());
  };

  return (
    <Header
      state={state}
      setIsLocationModalOpen={handleOpenLocationModal}
      handleLocationChange={handleLocationChange}
      handleClearLocation={handleClearLocation}
    />
  );
}

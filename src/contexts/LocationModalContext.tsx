"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { LocationModal } from "@/components/location/LocationModal";

interface LocationData {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  landmark?: string;
}

interface LocationModalContextType {
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  handleLocationSelect: (location: string, locationData?: LocationData) => void;
}

const LocationModalContext = createContext<LocationModalContextType | undefined>(undefined);

interface LocationModalProviderProps {
  children: ReactNode;
  onLocationSelect: (location: string, locationData?: LocationData) => void;
}

export function LocationModalProvider({ children, onLocationSelect }: LocationModalProviderProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  const handleLocationSelect = (location: string, locationData?: LocationData) => {
    onLocationSelect(location, locationData);
    closeLocationModal();
  };

  return (
    <LocationModalContext.Provider
      value={{
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        handleLocationSelect,
      }}
    >
      {children}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        onLocationSelect={handleLocationSelect}
        title="Select Pickup Location"
        showLandmark={true}
        required={[true, true, true, true]}
      />
    </LocationModalContext.Provider>
  );
}

export function useLocationModal() {
  const context = useContext(LocationModalContext);
  if (context === undefined) {
    throw new Error("useLocationModal must be used within a LocationModalProvider");
  }
  return context;
}

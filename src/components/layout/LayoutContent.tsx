"use client";

import { HeaderWithLocation } from "./HeaderWithLocation";
import { LocationModalProvider } from "@/contexts/LocationModalContext";
import { NearestGarageModal } from "@/components/location/NearestGarageModal";
import { useHomeContent } from "@/hooks/useHomeContent";
import { GlobalLoaderOverlay } from "@/components/ui/GlobalLoaderOverlay";
import { GeolocationTest } from "@/components/debug/GeolocationTest";
import { MessengerAlertWrapper } from "@/components/ui/MessengerAlertWrapper";
import { AlertModal } from "@/components/ui/AlertModal";
import { ConfirmationModal } from "@/components/modal/ConfirmationModal";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { handleLocationSelect, isNearestGarageModalOpen, setIsNearestGarageModalOpen, nearestGarageResults, handleSelectGarage } = useHomeContent();

  return (
    <LocationModalProvider onLocationSelect={handleLocationSelect}>
      <div className="hidden lg:block">
        <HeaderWithLocation />
      </div>
      <GlobalLoaderOverlay />
      {children}
      <GeolocationTest />
      <MessengerAlertWrapper />
      <AlertModal />
      <ConfirmationModal />
      <NearestGarageModal
        isOpen={isNearestGarageModalOpen}
        onClose={() => setIsNearestGarageModalOpen(false)}
        searchResults={nearestGarageResults}
        onSelectGarage={handleSelectGarage}
      />
    </LocationModalProvider>
  );
}

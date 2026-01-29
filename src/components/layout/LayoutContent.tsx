"use client";

import { GeolocationTest } from "@/components/debug/GeolocationTest";
import { NearestGarageModal } from "@/components/location/NearestGarageModal";
import { ConfirmationModal } from "@/components/modal/ConfirmationModal";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { AlertModal } from "@/components/ui/AlertModal";
import { GlobalLoaderOverlay } from "@/components/ui/GlobalLoaderOverlay";
import { MessengerAlertWrapper } from "@/components/ui/MessengerAlertWrapper";
import { LocationModalProvider } from "@/contexts/LocationModalContext";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useUrlBasedNavigation } from "@/hooks/useUrlBasedNavigation";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { HeaderWithLocation } from "./HeaderWithLocation";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { handleLocationSelect, isNearestGarageModalOpen, setIsNearestGarageModalOpen, nearestGarageResults, handleSelectGarage } = useHomeContent();
  const pathname = usePathname();
  
  // Auto-update navigation based on current URL
  useUrlBasedNavigation();

  // Check if current page is a car detail page
  const isCarDetailPage = /^\/cars\/[^\/]+$/.test(pathname);
  
  // Check if current page is profile page
  const isProfilePage = pathname === '/profile';
  
  // Check if current page is bookings page
  const isBookingsPage = pathname === '/bookings';

  return (
    <LocationModalProvider onLocationSelect={handleLocationSelect}>
      {!isProfilePage && !isBookingsPage && (
        <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-white">
          <HeaderWithLocation />
        </div>
      )}
      <GlobalLoaderOverlay />
      <div className={cn("md:pb-0", !isCarDetailPage && !isBookingsPage && "pb-16", !isProfilePage && !isBookingsPage && "lg:pt-16")}>
        {children}
      </div>
      {!isBookingsPage && <BottomNavigation />}
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

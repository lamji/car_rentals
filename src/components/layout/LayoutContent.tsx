"use client";

import { NearestGarageModal } from "@/components/location/NearestGarageModal";
import { ConfirmationModal } from "@/components/modal/ConfirmationModal";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { AlertModal } from "@/components/ui/AlertModal";
import { GlobalLoaderOverlay } from "@/components/ui/GlobalLoaderOverlay";
import { MessengerAlertWrapper } from "@/components/wrapper/MessengerAlertWrapper";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useUrlBasedNavigation } from "@/hooks/useUrlBasedNavigation";
import { LocationModal } from "@/lib/npm-ready-stack/locationPicker";

import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { closeLocationModal } from "../../lib/slices/uiSlice";
import { HeaderWithLocation } from "./HeaderWithLocation";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const dispatch = useDispatch();
  const {
    handleLocationSelect,
    isNearestGarageModalOpen,
    setIsNearestGarageModalOpen,
    nearestGarageResults,
    handleSelectGarage,
  } = useHomeContent();
  const pathname = usePathname();

  // Get location modal state from Redux
  const isLocationModalOpen = useSelector(
    (state: RootState) => state.ui.isLocationModalOpen,
  );

  // Auto-update navigation based on current URL
  useUrlBasedNavigation();

  // Check if current page is a car detail page
  const isCarDetailPage = /^\/cars\/[^\/]+$/.test(pathname);

  // Check if current page is profile page
  const isProfilePage = pathname === "/profile";

  // Check if current page is bookings page
  const isBookingsPage = pathname === "/bookings";

  /**
   * Handle closing the location modal
   * @returns {void}
   */
  const handleCloseLocationModal = () => {
    dispatch(closeLocationModal());
  };

  return (
    <>
      {!isProfilePage && !isBookingsPage && (
        <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-white">
          <HeaderWithLocation />
        </div>
      )}
      <GlobalLoaderOverlay />
      <div
        className={cn(
          "md:pb-0",
          !isCarDetailPage && !isBookingsPage && "pb-16",
          !isProfilePage && !isBookingsPage && "lg:pt-16",
        )}
      >
        {children}
      </div>
      {!isBookingsPage && <BottomNavigation />}
      <MessengerAlertWrapper />
      <AlertModal />
      <ConfirmationModal />
      <NearestGarageModal
        isOpen={isNearestGarageModalOpen}
        onClose={() => setIsNearestGarageModalOpen(false)}
        searchResults={nearestGarageResults}
        onSelectGarage={handleSelectGarage}
      />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={handleCloseLocationModal}
        onLocationSelect={handleLocationSelect}
        title="Select Pickup Location"
        showLandmark={true}
        required={{
          region: true,
          province: true,
          city: true,
          barangay: true,
        }}
      />
    </>
  );
}

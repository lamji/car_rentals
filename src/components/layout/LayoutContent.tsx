"use client";

import { NearestGarageModal } from "@/components/location/NearestGarageModal";
import { ConfirmationModal } from "@/components/modal/ConfirmationModal";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { AlertModal } from "@/components/ui/AlertModal";
import { GlobalLoaderOverlay } from "@/components/ui/GlobalLoaderOverlay";
import { MessengerAlertWrapper } from "@/components/wrapper/MessengerAlertWrapper";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useLocationPermission } from "@/hooks/useLocationPermission";
import { useUrlBasedNavigation } from "@/hooks/useUrlBasedNavigation";
import { LocationModal } from "@/lib/npm-ready-stack/locationPicker";
import { useInitConfig } from "@/lib/npm-ready-stack/mapboxService";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useInitCloudenary } from "../../lib/npm-ready-stack/cloudinary";
import { closeLocationModal } from "../../lib/slices/uiSlice";
import { HeaderWithLocation } from "./HeaderWithLocation";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const dispatch = useDispatch();
  const { setConfig } = useInitConfig();
  const { init: initializedCloudinary } = useInitCloudenary()
  const { checkLocationOnce } = useLocationPermission();
  const {
    handleLocationSelect,
    isNearestGarageModalOpen,
    setIsNearestGarageModalOpen,
    nearestGarageResults,
    handleSelectGarage,
  } = useHomeContent();
  const pathname = usePathname();

  /**
   * Initialize Cloudinary configuration
   * Supports both signed and unsigned uploads
   */
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_PRESET
    ) {
      initializedCloudinary({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        preset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET,
        useSigned: true, // Use signed uploads with API route
      })
    } else {
      console.warn('Cloudinary environment variables not set');
      console.warn('Required: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_PRESET');
      console.warn('For signed uploads, also ensure: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (server-side)');
    }
  }, [initializedCloudinary]);

  // Set Mapbox configuration on component mount
  useEffect(() => {
    console.log("debug-location: Setting Mapbox config");
    console.log(
      "debug-location: Token:",
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    );
    setConfig({
      token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      style: "mapbox://styles/lamjilampago/ckg2ggpzw0r9j19mit7o0fr2n",
    });
    console.log("debug-location: Config set complete");
  }, [setConfig]);

  /**
   * In initial render, check location permission
   * Store the result in mapBoxSlice
   * The actual address will be save here setCurrentAddress
   * The long lat will be save here setPosition
   * If location not granted, alert the modal to enable location since it is needed to get the recomendation cars
   * currentAddress is use in home page to display the address
   * setPosition will be use in calculation of the distance
   */
  useEffect(() => {
    if (pathname === "/") {
      checkLocationOnce();
    }
  }, [pathname, checkLocationOnce]);

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

  // Check if current page is admin route
  const isAdminRoute = pathname.includes("admin");

  /**
   * Handle closing the location modal
   * @returns {void}
   */
  const handleCloseLocationModal = () => {
    dispatch(closeLocationModal());
  };

  return (
    <>
      <GlobalLoaderOverlay />
      <div
        className={cn(
          "md:pb-0",
          !isCarDetailPage && !isBookingsPage && "pb-16",
          !isProfilePage && !isBookingsPage && "lg:pt-16",
        )}
      >
        <div className="mx-auto max-w-[1366px]">
          {!isProfilePage && !isBookingsPage && !isAdminRoute && (
            <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-white">
              <div className="mx-auto max-w-[1386px] px-4">
                <HeaderWithLocation />
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
      {pathname === "/" && <BottomNavigation />}

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

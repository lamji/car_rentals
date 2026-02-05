"use client";

import { Crosshair, Loader2, MapPin, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { setCurrentAddress, setLoading } from "../../../slices/mapBoxSlice";
import { useAppDispatch, useAppSelector } from "../../../store";
import type { BrowserInfo } from "../../../utils/browserDetection";
import {
  detectBrowser,
  getLocationPermissionInstructions,
} from "../../../utils/browserDetection";
import useGetCurrentLocation from "../../mapboxService/bl/hooks/useGetCurrentLocation";
import { useGeolocation } from "../hooks/useGeolocation";
import { usePSGCLocations } from "../hooks/usePSGCLocations";
import type {
  LocationData,
  LocationModalProps,
  PSGCLocation,
  PSGCRegion,
} from "../types";

/**
 * LocationModal component for selecting Philippine locations
 * Supports both manual cascading selection and geolocation-based selection
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onLocationSelect - Callback when location is selected
 * @param initialData - Initial location data to populate fields
 * @param title - Modal title
 * @param showLandmark - Whether to show landmark input
 * @param required - Object of required fields {region, province, city, barangay}
 * @returns {JSX.Element} LocationModal component
 */
export function LocationModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialData,
  title = "Select Location",
  showLandmark = true,
  required = {
    region: true,
    province: true,
    city: true,
    barangay: true,
  },
}: LocationModalProps) {
  const dispatch = useAppDispatch();
  const currentAddress = useAppSelector((state: any) => state.mapBox.current.address);
  // Mapbox current location hook
  const {
    address: mapBoxAddress,
    getCurrentLocation: getMapboxCurrentLocation,
    loading: mapBoxLoading,
  } = useGetCurrentLocation();
  // Local input states
  const [localProvinceQuery, setLocalProvinceQuery] = useState(
    initialData?.province || "",
  );
  const [finalAddress, setFinalAddress] = useState<string>(mapBoxAddress || "");
  const [localCityQuery, setLocalCityQuery] = useState(initialData?.city || "");
  const [localBarangayQuery, setLocalBarangayQuery] = useState(
    initialData?.barangay || "",
  );
  const [landmark, setLandmark] = useState(initialData?.landmark || "");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);

  // Selection states
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeDropdown, setActiveDropdown] = useState<
    "region" | "province" | "city" | "barangay" | null
  >(null);

  // Input refs for focus management
  const regionInputRef = useRef<HTMLInputElement>(null);
  const provinceInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const barangayInputRef = useRef<HTMLInputElement>(null);
  const landmarkInputRef = useRef<HTMLInputElement>(null);

  // PSGC locations hook
  const {
    filteredRegions,
    regionsLoading,
    regionQuery,
    filteredProvinces,
    provincesLoading,
    filteredCities,
    citiesLoading,
    filteredBarangays,
    barangaysLoading,
    cascadingState,
    setSelectedRegion,
    setSelectedProvince,
    setSelectedCity,
    setSelectedBarangay,
    setRegionQuery,
    setProvinceQuery,
    setCityQuery,
    setBarangayQuery,
    fetchRegions,
  } = usePSGCLocations();

  // Geolocation hook
  const {
    address,
    loading: locationLoading,
    getCurrentPosition,
    requestLocationPermission,
    permissionDenied,
  } = useGeolocation();

  // Fetch regions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRegions();
    }
  }, [isOpen, fetchRegions]);

  // Initialize with initial data
  useEffect(() => {
    if (initialData && isOpen) {
      setRegionQuery(initialData.region || "");
      setLocalProvinceQuery(initialData.province || "");
      setLocalCityQuery(initialData.city || "");
      setLocalBarangayQuery(initialData.barangay || "");
      setLandmark(initialData.landmark || "");
    }
  }, [initialData, isOpen, setRegionQuery]);

  /**
   * Handle geolocation toggle switch
   * @param enabled - Whether geolocation is enabled
   * @returns {void}
   */
  const handleLocationToggle = (enabled: boolean) => {
    setUseCurrentLocation(enabled);

    if (enabled) {
      if (permissionDenied) {
        requestLocationPermission();
      } else if (!address) {
        getCurrentPosition();
      }
    } else {
      // Clear inputs when toggled off
      setRegionQuery("");
      setLocalProvinceQuery("");
      setLocalCityQuery("");
      setLocalBarangayQuery("");
    }
  };

  // Populate inputs when geolocation address is available
  useEffect(() => {
    if (useCurrentLocation && address && isOpen) {
      setRegionQuery(address.region || "");
      setLocalProvinceQuery(address.province || "");
      setLocalCityQuery(address.city || address.municipality || "");
      setLocalBarangayQuery(address.barangay || "");
    }
  }, [useCurrentLocation, address, isOpen, setRegionQuery]);

  /**
   * Check if form is valid for submission
   * @returns {boolean} Whether form is valid
   */
  const isFormValid = () => {
    if (useCurrentLocation && address) return true;

    if (required.region && !cascadingState.selectedRegion) return false;
    if (required.province && !cascadingState.selectedProvince) return false;
    if (required.city && !cascadingState.selectedCity) return false;
    if (required.barangay && !cascadingState.selectedBarangay) return false;

    return true;
  };

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && regionInputRef.current) {
      setTimeout(() => regionInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /**
   * Handle region query input change
   * @param newQuery - New query string
   * @returns {void}
   */
  const handleRegionQueryChange = (newQuery: string) => {
    setRegionQuery(newQuery);
    setSelectedIndex(-1);
    setShowRegionDropdown(newQuery.length >= 1);
    setActiveDropdown("region");

    if (!newQuery.trim()) {
      setSelectedRegion(null);
      setSelectedProvince(null);
      setSelectedCity(null);
      setSelectedBarangay(null);
      setProvinceQuery("");
      setCityQuery("");
      setBarangayQuery("");
    }
  };

  /**
   * Handle province query input change
   * @param newQuery - New query string
   * @returns {void}
   */
  const handleProvinceQueryChange = (newQuery: string) => {
    setLocalProvinceQuery(newQuery);
    setProvinceQuery(newQuery);
    setSelectedIndex(-1);
    setShowProvinceDropdown(newQuery.length >= 1);
    setActiveDropdown("province");
  };

  /**
   * Handle city query input change
   * @param newQuery - New query string
   * @returns {void}
   */
  const handleCityQueryChange = (newQuery: string) => {
    setLocalCityQuery(newQuery);
    setCityQuery(newQuery);
    setSelectedIndex(-1);
    setShowCityDropdown(newQuery.length >= 1);
    setActiveDropdown("city");
  };

  /**
   * Handle barangay query input change
   * @param newQuery - New query string
   * @returns {void}
   */
  const handleBarangayQueryChange = (newQuery: string) => {
    setLocalBarangayQuery(newQuery);
    setBarangayQuery(newQuery);
    setSelectedIndex(-1);
    setShowBarangayDropdown(newQuery.length >= 1);
    setActiveDropdown("barangay");
  };

  /**
   * Handle region selection from dropdown
   * @param region - Selected region
   * @returns {void}
   */
  const handleRegionSelect = (region: PSGCRegion) => {
    setRegionQuery(region.name);
    setSelectedRegion(region);
    setShowRegionDropdown(false);
    setActiveDropdown(null);

    // Clear downstream
    setLocalProvinceQuery("");
    setLocalCityQuery("");
    setLocalBarangayQuery("");

    setTimeout(() => provinceInputRef.current?.focus(), 100);
  };

  /**
   * Handle province selection from dropdown
   * @param province - Selected province
   * @returns {void}
   */
  const handleProvinceSelect = (province: PSGCLocation) => {
    setLocalProvinceQuery(province.name);
    setProvinceQuery(province.name);
    setSelectedProvince(province);
    setShowProvinceDropdown(false);
    setActiveDropdown(null);

    // Clear downstream
    setLocalCityQuery("");
    setLocalBarangayQuery("");

    setTimeout(() => cityInputRef.current?.focus(), 100);
  };

  /**
   * Handle city selection from dropdown
   * @param city - Selected city
   * @returns {void}
   */
  const handleCitySelect = (city: PSGCLocation) => {
    setLocalCityQuery(city.name);
    setCityQuery(city.name);
    setSelectedCity(city);
    setShowCityDropdown(false);
    setActiveDropdown(null);

    // Clear downstream
    setLocalBarangayQuery("");

    setTimeout(() => barangayInputRef.current?.focus(), 100);
  };

  /**
   * Handle barangay selection from dropdown
   * @param barangay - Selected barangay
   * @returns {void}
   */
  const handleBarangaySelect = (barangay: PSGCLocation) => {
    setLocalBarangayQuery(barangay.name);
    setBarangayQuery(barangay.name);
    setSelectedBarangay(barangay);
    setShowBarangayDropdown(false);
    setActiveDropdown(null);

    if (showLandmark) {
      setTimeout(() => landmarkInputRef.current?.focus(), 100);
    }
  };

  /**
   * Handle form submission
   * Builds location string and calls onLocationSelect callback
   * @returns {void}
   */
  const handleLocationSubmit = () => {
    // If using current location with address data
    if (useCurrentLocation && address) {
      const locationData: LocationData = {
        region: address.region,
        province: address.province,
        city: address.city || address.municipality,
        barangay: address.barangay,
        landmark: landmark.trim() || undefined,
      };

      const locationString = address.formattedAddress;
      onLocationSelect(locationString, locationData);
      onClose();
      return;
    }

    // Validate required fields for manual entry
    if (required.region && !cascadingState.selectedRegion) return;
    if (required.province && !cascadingState.selectedProvince) return;
    if (required.city && !cascadingState.selectedCity) return;
    if (required.barangay && !cascadingState.selectedBarangay) return;

    // Build location string from selections
    const parts = [];
    if (cascadingState.selectedBarangay)
      parts.push(cascadingState.selectedBarangay.name);
    if (cascadingState.selectedCity)
      parts.push(cascadingState.selectedCity.name);
    if (cascadingState.selectedProvince)
      parts.push(cascadingState.selectedProvince.name);
    if (cascadingState.selectedRegion)
      parts.push(cascadingState.selectedRegion.name);

    let locationString = parts.join(", ");
    if (landmark.trim()) {
      locationString += ` (Near: ${landmark.trim()})`;
    }

    const locationData: LocationData = {
      region: cascadingState.selectedRegion?.name,
      province: cascadingState.selectedProvince?.name,
      city: cascadingState.selectedCity?.name,
      barangay: cascadingState.selectedBarangay?.name,
      landmark: landmark.trim() || undefined,
    };

    onLocationSelect(locationString, locationData);
    onClose();
  };

  /**
   * Handle quick current location selection
   * @returns {Promise<void>}
   */
  const handleCurrentLocation = async () => {
    if (permissionDenied) {
      requestLocationPermission();
      return;
    }

    if (!address) {
      getCurrentPosition();
      return;
    }

    const locationString = address.formattedAddress;
    const locationData: LocationData = {
      region: address.region,
      province: address.province,
      city: address.city || address.municipality,
      barangay: address.barangay,
      landmark: undefined,
    };

    onLocationSelect(locationString, locationData);
    onClose();
  };

  /**
   * Handle retry/refresh location button
   * @returns {void}
   */
  const handleRetryLocation = () => {
    if (permissionDenied) {
      requestLocationPermission();
      return;
    }
    getMapboxCurrentLocation();
  };

  /**
   * Handle modal close
   * Clears all dropdown states
   * @returns {void}
   */
  const handleModalClose = () => {
    setShowRegionDropdown(false);
    setShowProvinceDropdown(false);
    setShowCityDropdown(false);
    setShowBarangayDropdown(false);
    setActiveDropdown(null);
    onClose();
  };

  /**
   * Handle keyboard navigation in dropdowns
   * @param e - Keyboard event
   * @param dropdownType - Type of dropdown being navigated
   * @returns {void}
   */
  const handleKeyDown = (
    e: React.KeyboardEvent,
    dropdownType: "region" | "province" | "city" | "barangay",
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      let items;
      if (dropdownType === "region") items = filteredRegions;
      else if (dropdownType === "province") items = filteredProvinces;
      else if (dropdownType === "city") items = filteredCities;
      else items = filteredBarangays;
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      let items;
      if (dropdownType === "region") items = filteredRegions;
      else if (dropdownType === "province") items = filteredProvinces;
      else if (dropdownType === "city") items = filteredCities;
      else items = filteredBarangays;

      if (selectedIndex >= 0 && items[selectedIndex]) {
        const selectedItem = items[selectedIndex];
        switch (dropdownType) {
          case "region":
            handleRegionSelect(selectedItem as PSGCRegion);
            break;
          case "province":
            handleProvinceSelect(selectedItem);
            break;
          case "city":
            handleCitySelect(selectedItem);
            break;
          case "barangay":
            handleBarangaySelect(selectedItem);
            break;
        }
      }
    } else if (e.key === "Escape") {
      handleModalClose();
    }
  };

  // Detect browser information on component mount
  useEffect(() => {
    const info = detectBrowser();
    setBrowserInfo(info);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowRegionDropdown(false);
      setShowProvinceDropdown(false);
      setShowCityDropdown(false);
      setShowBarangayDropdown(false);
      setActiveDropdown(null);
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    setFinalAddress(mapBoxAddress || "");
    if (mapBoxAddress) {
      dispatch(setCurrentAddress(mapBoxAddress));
    }
  }, [mapBoxAddress, dispatch]);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Current Location Section */}
        <div className="flex items-start justify-between p-3 border rounded-lg bg-gray-50 gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Crosshair className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <button
                onClick={handleCurrentLocation}
                disabled={locationLoading || permissionDenied}
                className="text-left w-full"
              >
                <span className="text-sm font-medium block">
                  {locationLoading
                    ? "Getting location..."
                    : permissionDenied
                      ? "Location Access Denied"
                      : "Use Current Location"}
                </span>
                {permissionDenied && (
                  <div className="text-xs text-orange-600 mt-1 leading-tight">
                    <div className="font-medium">
                      📍 Location Required for Car Rental
                    </div>
                    <div className="mt-1">
                      Location access denied. Enable in your browser settings:
                    </div>
                    {browserInfo && (
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="font-medium text-orange-700">
                          {browserInfo.name} {browserInfo.version} - Reset
                          Instructions:
                        </div>
                        {getLocationPermissionInstructions(browserInfo).map(
                          (instruction, index) => (
                            <div key={index} className="text-orange-600">
                              {index + 1}. {instruction}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}

                <span className="text-xs text-muted-foreground mt-1 leading-tight block">
                  {mapBoxLoading ? "Getting location..." : currentAddress || finalAddress}
                </span>
              </button>

              <div className="mt-2">
                <Button
                  type="button"
                  onClick={handleRetryLocation}
                  variant="default"
                  size="sm"
                  className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Location
                </Button>
              </div>
            </div>
          </div>
          <div className="shrink-0 pt-1">
            <Switch
              checked={useCurrentLocation}
              onCheckedChange={handleLocationToggle}
              disabled={locationLoading}
            />
          </div>
        </div>

        <div className="space-y-4">
          {!useCurrentLocation && (
            <>
              {/* Region Input */}
              <div className="relative">
                <Input
                  ref={regionInputRef}
                  placeholder="Region *"
                  value={regionQuery}
                  onChange={(e) => handleRegionQueryChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "region")}
                  className="pr-10 border-black"
                />
                {regionsLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {showRegionDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                    {filteredRegions.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                          Philippine Regions ({filteredRegions.length})
                        </div>
                        {filteredRegions.map((region, index) => (
                          <button
                            key={region.psgc_id}
                            type="button"
                            className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-3 ${
                              index === selectedIndex ? "bg-accent" : ""
                            }`}
                            onClick={() => handleRegionSelect(region)}
                          >
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {region.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                Population: {region.population?.trim()}
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No regions found matching &quot;{regionQuery}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Province Input */}
              <div className="relative">
                <Input
                  ref={provinceInputRef}
                  placeholder="Province *"
                  value={localProvinceQuery}
                  onChange={(e) => handleProvinceQueryChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "province")}
                  disabled={!cascadingState.selectedRegion}
                  className="pr-10 border-black"
                />
                {provincesLoading && activeDropdown === "province" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {showProvinceDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                    {filteredProvinces.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                          Provinces in {cascadingState.selectedRegion?.name} (
                          {filteredProvinces.length})
                        </div>
                        {filteredProvinces.map((province, index) => (
                          <button
                            key={province.psgc_id}
                            type="button"
                            className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-3 ${
                              index === selectedIndex ? "bg-accent" : ""
                            }`}
                            onClick={() => handleProvinceSelect(province)}
                          >
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {province.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {province.geographic_level}
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        {provincesLoading
                          ? "Loading provinces..."
                          : `No provinces found matching "${localProvinceQuery}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* City Input */}
              <div className="relative">
                <Input
                  ref={cityInputRef}
                  placeholder="City/Municipality *"
                  value={localCityQuery}
                  onChange={(e) => handleCityQueryChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "city")}
                  disabled={!cascadingState.selectedProvince}
                  className="pr-10 border-black"
                />
                {citiesLoading && activeDropdown === "city" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {showCityDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                    {filteredCities.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                          Cities in {cascadingState.selectedProvince?.name} (
                          {filteredCities.length})
                        </div>
                        {filteredCities.map((city, index) => (
                          <button
                            key={city.psgc_id}
                            type="button"
                            className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-3 ${
                              index === selectedIndex ? "bg-accent" : ""
                            }`}
                            onClick={() => handleCitySelect(city)}
                          >
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {city.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {city.geographic_level}
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        {citiesLoading
                          ? "Loading cities..."
                          : `No cities found matching "${localCityQuery}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Barangay Input */}
              <div className="relative">
                <Input
                  ref={barangayInputRef}
                  placeholder="Barangay *"
                  value={localBarangayQuery}
                  onChange={(e) => handleBarangayQueryChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "barangay")}
                  disabled={!cascadingState.selectedCity}
                  className="pr-10 border-black"
                />
                {barangaysLoading && activeDropdown === "barangay" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {showBarangayDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                    {filteredBarangays.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                          Barangays in {cascadingState.selectedCity?.name} (
                          {filteredBarangays.length})
                        </div>
                        {filteredBarangays.map((barangay, index) => (
                          <button
                            key={barangay.psgc_id}
                            type="button"
                            className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-3 ${
                              index === selectedIndex ? "bg-accent" : ""
                            }`}
                            onClick={() => handleBarangaySelect(barangay)}
                          >
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {barangay.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {barangay.geographic_level}
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        {barangaysLoading
                          ? "Loading barangays..."
                          : `No barangays found matching "${localBarangayQuery}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Landmark Input */}
          {showLandmark && (
            <div className="relative">
              <Input
                ref={landmarkInputRef}
                placeholder="Landmark (optional)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                disabled={
                  !useCurrentLocation && !cascadingState.selectedBarangay
                }
                className="border-black"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleModalClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLocationSubmit}
              disabled={!isFormValid()}
              className="flex-1"
            >
              Use Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReduxPSGCLocations } from "@/hooks/useReduxPSGCLocations";
import { PSGCRegion } from "@/lib/slices/regionsSlice";

export interface LocationData {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  landmark?: string;
}

interface PSGCLocation {
  psgc_id: string;
  name: string;
  correspondence_code: string;
  geographic_level: "Reg" | "Prov" | "City" | "Bgy";
  old_names: string;
  city_class: string;
  income_classification: string;
  urban_rural: string;
  population: string;
  status: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string, locationData?: LocationData) => void;
  initialData?: LocationData;
  title?: string;
  showLandmark?: boolean;
  required?: boolean[];
}

export function LocationModal({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  initialData,
  title = "Select Location",
  showLandmark = true,
  required = [true, true, true, true] // region, province, city, barangay
}: LocationModalProps) {
  // Input states
  const [localProvinceQuery, setLocalProvinceQuery] = useState(initialData?.province || "");
  const [localCityQuery, setLocalCityQuery] = useState(initialData?.city || "");
  const [localBarangayQuery, setLocalBarangayQuery] = useState(initialData?.barangay || "");
  const [landmark, setLandmark] = useState(initialData?.landmark || "");
  
  // Dropdown states
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);
  
  // Selection states
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeDropdown, setActiveDropdown] = useState<'region' | 'province' | 'city' | 'barangay' | null>(null);
  
  // Refs
  const regionInputRef = useRef<HTMLInputElement>(null);
  const provinceInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const barangayInputRef = useRef<HTMLInputElement>(null);
  const landmarkInputRef = useRef<HTMLInputElement>(null);
  
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
  } = useReduxPSGCLocations();

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

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && regionInputRef.current) {
      setTimeout(() => regionInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle region query change
  const handleRegionQueryChange = (newQuery: string) => {
    setRegionQuery(newQuery);
    setSelectedIndex(-1);
    setShowRegionDropdown(newQuery.length >= 1);
    setActiveDropdown('region');
    
    if (newQuery.trim()) {
      // Filter regions will be handled by the hook
    } else {
      setSelectedRegion(null);
      setSelectedProvince(null);
      setSelectedCity(null);
      setSelectedBarangay(null);
      setProvinceQuery("");
      setCityQuery("");
      setBarangayQuery("");
    }
  };

  // Handle province query change
  const handleProvinceQueryChange = (newQuery: string) => {
    setLocalProvinceQuery(newQuery);
    setProvinceQuery(newQuery); // Redux setter
    setSelectedIndex(-1);
    setShowProvinceDropdown(newQuery.length >= 1);
    setActiveDropdown('province');
  };

  // Handle city query change
  const handleCityQueryChange = (newQuery: string) => {
    setLocalCityQuery(newQuery);
    setCityQuery(newQuery); // Redux setter
    setSelectedIndex(-1);
    setShowCityDropdown(newQuery.length >= 1);
    setActiveDropdown('city');
  };

  // Handle barangay query change
  const handleBarangayQueryChange = (newQuery: string) => {
    setLocalBarangayQuery(newQuery);
    setBarangayQuery(newQuery); // Redux setter
    setSelectedIndex(-1);
    setShowBarangayDropdown(newQuery.length >= 1);
    setActiveDropdown('barangay');
  };

  // Selection handlers
  const handleRegionSelect = (region: PSGCRegion) => {
    setRegionQuery(region.name);
    setSelectedRegion(region);
    setShowRegionDropdown(false);
    setActiveDropdown(null);
    
    // Clear downstream selections
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setProvinceQuery("");
    setCityQuery("");
    setBarangayQuery("");
    
    // Focus province input
    setTimeout(() => provinceInputRef.current?.focus(), 100);
  };

  const handleProvinceSelect = (province: any) => {
    setLocalProvinceQuery(province.name);
    setProvinceQuery(province.name);
    setSelectedProvince(province as PSGCLocation);
    setShowProvinceDropdown(false);
    setActiveDropdown(null);
    
    // Clear downstream selections
    setSelectedCity(null);
    setSelectedBarangay(null);
    setCityQuery("");
    setBarangayQuery("");
    setLocalCityQuery("");
    setLocalBarangayQuery("");
    
    // Focus city input
    setTimeout(() => cityInputRef.current?.focus(), 100);
  };

  const handleCitySelect = (city: any) => {
    setLocalCityQuery(city.name);
    setCityQuery(city.name);
    setSelectedCity(city as PSGCLocation);
    setShowCityDropdown(false);
    setActiveDropdown(null);
    
    // Clear downstream selections
    setSelectedBarangay(null);
    setBarangayQuery("");
    setLocalBarangayQuery("");
    
    // Focus barangay input
    setTimeout(() => barangayInputRef.current?.focus(), 100);
  };

  const handleBarangaySelect = (barangay: any) => {
    setLocalBarangayQuery(barangay.name);
    setBarangayQuery(barangay.name);
    setSelectedBarangay(barangay as PSGCLocation);
    setShowBarangayDropdown(false);
    setActiveDropdown(null);
    
    // Focus landmark input if shown
    if (showLandmark) {
      setTimeout(() => landmarkInputRef.current?.focus(), 100);
    }
  };

  // Handle location submit
  const handleLocationSubmit = () => {
    // Check required fields
    if (required[0] && !cascadingState.selectedRegion) {
      return;
    }
    if (required[1] && !cascadingState.selectedProvince) {
      return;
    }
    if (required[2] && !cascadingState.selectedCity) {
      return;
    }
    if (required[3] && !cascadingState.selectedBarangay) {
      return;
    }

    // Build location string
    const parts = [];
    if (cascadingState.selectedBarangay) parts.push(cascadingState.selectedBarangay.name);
    if (cascadingState.selectedCity) parts.push(cascadingState.selectedCity.name);
    if (cascadingState.selectedProvince) parts.push(cascadingState.selectedProvince.name);
    if (cascadingState.selectedRegion) parts.push(cascadingState.selectedRegion.name);
    
    let locationString = parts.join(", ");
    if (landmark.trim()) {
      locationString += ` (Near: ${landmark.trim()})`;
    }

    // Prepare location data
    const locationData: LocationData = {
      region: cascadingState.selectedRegion?.name,
      province: cascadingState.selectedProvince?.name,
      city: cascadingState.selectedCity?.name,
      barangay: cascadingState.selectedBarangay?.name,
      landmark: landmark.trim() || undefined
    };

    onLocationSelect(locationString, locationData);
    onClose();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowRegionDropdown(false);
    setShowProvinceDropdown(false);
    setShowCityDropdown(false);
    setShowBarangayDropdown(false);
    setActiveDropdown(null);
    onClose();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, dropdownType: 'region' | 'province' | 'city' | 'barangay') => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      let items;
      if (dropdownType === 'region') {
        items = filteredRegions;
      } else if (dropdownType === 'province') {
        items = filteredProvinces;
      } else if (dropdownType === 'city') {
        items = filteredCities;
      } else {
        items = filteredBarangays;
      }
      setSelectedIndex(prev => prev < items.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      let items;
      if (dropdownType === 'region') {
        items = filteredRegions;
      } else if (dropdownType === 'province') {
        items = filteredProvinces;
      } else if (dropdownType === 'city') {
        items = filteredCities;
      } else {
        items = filteredBarangays;
      }
      if (selectedIndex >= 0 && items[selectedIndex]) {
        const selectedItem = items[selectedIndex];
        switch (dropdownType) {
          case 'region':
            handleRegionSelect(selectedItem as PSGCRegion);
            break;
          case 'province':
            handleProvinceSelect(selectedItem);
            break;
          case 'city':
            handleCitySelect(selectedItem);
            break;
          case 'barangay':
            handleBarangaySelect(selectedItem);
            break;
        }
      }
    } else if (e.key === "Escape") {
      handleModalClose();
    }
  };

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
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Region Input */}
          <div className="relative">
            <Input
              ref={regionInputRef}
              placeholder="Region *"
              value={regionQuery}
              onChange={(e) => handleRegionQueryChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'region')}
              className="pr-10 border-black"
            />
            {regionsLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {/* Region Dropdown */}
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
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
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
                    No regions found matching &quot;{regionQuery}&quot;. Showing all regions.
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
              onKeyDown={(e) => handleKeyDown(e, 'province')}
              disabled={!cascadingState.selectedRegion}
              className="pr-10 border-black"
            />
            {provincesLoading && activeDropdown === 'province' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {/* Province Dropdown */}
            {showProvinceDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                {filteredProvinces.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                      Provinces in {cascadingState.selectedRegion?.name} ({filteredProvinces.length})
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
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
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
                    {provincesLoading ? 'Loading provinces...' : 'No provinces found matching "' + localProvinceQuery + '"'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* City/Municipality Input */}
          <div className="relative">
            <Input
              ref={cityInputRef}
              placeholder="City/Municipality *"
              value={localCityQuery}
              onChange={(e) => handleCityQueryChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'city')}
              disabled={!cascadingState.selectedProvince}
              className="pr-10 border-black"
            />
            {citiesLoading && activeDropdown === 'city' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {/* City Dropdown */}
            {showCityDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                {filteredCities.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                      Cities/Municipalities in {cascadingState.selectedProvince?.name} ({filteredCities.length})
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
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
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
                    {citiesLoading ? 'Loading cities...' : 'No cities found matching "' + localCityQuery + '"'}
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
              onKeyDown={(e) => handleKeyDown(e, 'barangay')}
              disabled={!cascadingState.selectedCity}
              className="pr-10 border-black"
            />
            {barangaysLoading && activeDropdown === 'barangay' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {/* Barangay Dropdown */}
            {showBarangayDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                {filteredBarangays.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                      Barangays in {cascadingState.selectedCity?.name} ({filteredBarangays.length})
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
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
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
                    {barangaysLoading ? 'Loading barangays...' : 'No barangays found matching "' + localBarangayQuery + '"'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Landmark Input */}
          {showLandmark && (
            <div className="relative">
              <Input
                ref={landmarkInputRef}
                placeholder="Landmark (optional)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                disabled={!cascadingState.selectedBarangay}
                className="border-black"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleModalClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleLocationSubmit}
              disabled={
                (required[0] && !cascadingState.selectedRegion) ||
                (required[1] && !cascadingState.selectedProvince) ||
                (required[2] && !cascadingState.selectedCity) ||
                (required[3] && !cascadingState.selectedBarangay)
              }
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

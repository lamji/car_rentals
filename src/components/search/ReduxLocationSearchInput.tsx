"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useReduxPSGCLocations } from "@/hooks/useReduxPSGCLocations";
import { MapPin } from "lucide-react";

interface ReduxLocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function ReduxLocationSearchInput({ 
  value, 
  onChange, 
  className,
  placeholder = "Enter city / area"
}: ReduxLocationSearchInputProps) {
  const {
    filteredRegions,
    regionsLoading,
    regionQuery,
    setRegionQuery,
    cascadingState,
    setSelectedRegion,
    setSelectedProvince,
    setSelectedCity,
    setSelectedBarangay,
  } = useReduxPSGCLocations();

  const [showDropdown, setShowDropdown] = useState(false);
  const [internalQuery, setInternalQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value with internal state
  useEffect(() => {
    setInternalQuery(value);
    setRegionQuery(value);
  }, [value, setRegionQuery]);

  // Handle input change
  const handleInputChange = (newValue: string) => {
    console.log('🔍 LocationSearchInput changed:', newValue);
    setInternalQuery(newValue);
    setRegionQuery(newValue);
    setShowDropdown(newValue.length >= 1);
    
    // If user clears the input, also clear the parent value
    if (!newValue.trim()) {
      onChange('');
      // Reset cascading selections
      setSelectedRegion(null);
      setSelectedProvince(null);
      setSelectedCity(null);
      setSelectedBarangay(null);
    }
  };

  // Handle region selection
  const handleRegionSelect = (region: any) => {
    console.log('✅ Region selected:', region.name);
    const locationString = `${region.name}`;
    setInternalQuery(locationString);
    onChange(locationString);
    setShowDropdown(false);
    setSelectedRegion(region);
  };

  // Handle province selection
  const handleProvinceSelect = (province: any) => {
    console.log('✅ Province selected:', province.name);
    let locationString = province.name;
    if (cascadingState.selectedRegion) {
      locationString = `${province.name}, ${cascadingState.selectedRegion.name}`;
    }
    setInternalQuery(locationString);
    onChange(locationString);
    setShowDropdown(false);
    setSelectedProvince(province);
  };

  // Handle city selection
  const handleCitySelect = (city: any) => {
    console.log('✅ City selected:', city.name);
    let locationString = city.name;
    if (cascadingState.selectedProvince) {
      locationString = `${city.name}, ${cascadingState.selectedProvince.name}`;
    } else if (cascadingState.selectedRegion) {
      locationString = `${city.name}, ${cascadingState.selectedRegion.name}`;
    }
    setInternalQuery(locationString);
    onChange(locationString);
    setShowDropdown(false);
    setSelectedCity(city);
  };

  // Handle barangay selection
  const handleBarangaySelect = (barangay: any) => {
    console.log('✅ Barangay selected:', barangay.name);
    let locationString = barangay.name;
    if (cascadingState.selectedCity) {
      locationString = `${barangay.name}, ${cascadingState.selectedCity.name}`;
    } else if (cascadingState.selectedProvince) {
      locationString = `${barangay.name}, ${cascadingState.selectedProvince.name}`;
    } else if (cascadingState.selectedRegion) {
      locationString = `${barangay.name}, ${cascadingState.selectedRegion.name}`;
    }
    setInternalQuery(locationString);
    onChange(locationString);
    setShowDropdown(false);
    setSelectedBarangay(barangay);
  };

  // Handle focus
  const handleFocus = () => {
    console.log('🎯 LocationSearchInput focused');
    setShowDropdown(internalQuery.length >= 1);
  };

  // Handle blur
  const handleBlur = () => {
    console.log('❌ LocationSearchInput blurred');
    setTimeout(() => setShowDropdown(false), 200);
  };

  // Get current level predictions based on cascading state
  const getCurrentPredictions = () => {
    if (cascadingState.selectedCity) {
      // Show barangays if city is selected
      return [];
    } else if (cascadingState.selectedProvince) {
      // Show cities if province is selected
      return [];
    } else if (cascadingState.selectedRegion) {
      // Show provinces if region is selected
      return [];
    } else {
      // Show regions by default
      return filteredRegions;
    }
  };

  const currentPredictions = getCurrentPredictions();

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={internalQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`pl-10 ${className || ''}`}
        />
        {regionsLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {console.log('🔍 Dropdown render check:', {
            showDropdown,
            internalQuery,
            filteredRegionsLength: filteredRegions.length,
            currentPredictionsLength: currentPredictions.length
          })}
          
          {filteredRegions.length > 0 && !cascadingState.selectedRegion && (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                Regions ({filteredRegions.length})
              </div>
              {filteredRegions.map((region) => (
                <div
                  key={region.psgc_id}
                  onClick={() => handleRegionSelect(region)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{region.name}</div>
                  <div className="text-xs text-gray-500">
                    Pop: {region.population?.trim()}
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredRegions.length === 0 && internalQuery.length >= 1 && !regionsLoading && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No regions found matching "{internalQuery}"
            </div>
          )}

          {internalQuery.length === 0 && !regionsLoading && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Type to search regions...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

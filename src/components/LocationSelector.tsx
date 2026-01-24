"use client";

import React, { useState } from "react";
import { usePSGCLocations } from "@/hooks/usePSGCLocations";
import type { PSGCLocation, PSGCPlace } from "@/lib/types/psgc";

// Helper function to convert PSGCPlace to PSGCLocation
const psgcPlaceToLocation = (place: PSGCPlace): PSGCLocation => ({
  psgc_id: place.psgc_id,
  name: place.name,
  correspondence_code: '', // Not available in PSGCPlace
  geographic_level: place.geographic_level as 'Reg' | 'Prov' | 'City' | 'Bgy',
  old_names: '', // Not available in PSGCPlace
  city_class: '', // Not available in PSGCPlace
  income_classification: '', // Not available in PSGCPlace
  urban_rural: '', // Not available in PSGCPlace
  population: place.population || '', // Use empty string if not available
  status: '', // Not available in PSGCPlace
});

interface LocationSelectorProps {
  onLocationSelect?: (location: {
    region?: PSGCPlace | null;
    province?: PSGCPlace | null;
    city?: PSGCPlace | null;
    barangay?: PSGCPlace | null;
  }) => void;
}

export default function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const {
    predictions,
    isLoading,
    error,
    fetchPredictions,
    cascadingState,
    setSelectedRegion,
    setSelectedProvince,
    setSelectedCity,
    setSelectedBarangay,
    clearPredictions,
  } = usePSGCLocations();

  const [regionQuery, setRegionQuery] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [barangayQuery, setBarangayQuery] = useState("");

  const [showRegionResults, setShowRegionResults] = useState(false);
  const [showProvinceResults, setShowProvinceResults] = useState(false);
  const [showCityResults, setShowCityResults] = useState(false);
  const [showBarangayResults, setShowBarangayResults] = useState(false);

  // Handle region selection
  const handleRegionSelect = (region: PSGCPlace) => {
    const locationRegion = psgcPlaceToLocation(region);
    setSelectedRegion(locationRegion);
    setRegionQuery(region.name);
    setShowRegionResults(false);
    clearPredictions();
    
    // Reset lower level selections
    setProvinceQuery("");
    setCityQuery("");
    setBarangayQuery("");
    
    // Notify parent
    onLocationSelect?.({
      region,
      province: null,
      city: null,
      barangay: null,
    });
  };

  // Handle province selection
  const handleProvinceSelect = (province: PSGCPlace) => {
    const locationProvince = psgcPlaceToLocation(province);
    setSelectedProvince(locationProvince);
    setProvinceQuery(province.name);
    setShowProvinceResults(false);
    clearPredictions();
    
    // Reset lower level selections
    setCityQuery("");
    setBarangayQuery("");
    
    // Notify parent
    onLocationSelect?.({
      ...cascadingState,
      province,
      city: null,
      barangay: null,
    });
  };

  // Handle city selection
  const handleCitySelect = (city: PSGCPlace) => {
    const locationCity = psgcPlaceToLocation(city);
    setSelectedCity(locationCity);
    setCityQuery(city.name);
    setShowCityResults(false);
    clearPredictions();
    
    // Reset lower level selections
    setBarangayQuery("");
    
    // Notify parent
    onLocationSelect?.({
      ...cascadingState,
      city,
      barangay: null,
    });
  };

  // Handle barangay selection
  const handleBarangaySelect = (barangay: PSGCPlace) => {
    const locationBarangay = psgcPlaceToLocation(barangay);
    setSelectedBarangay(locationBarangay);
    setBarangayQuery(barangay.name);
    setShowBarangayResults(false);
    clearPredictions();
    
    // Notify parent
    onLocationSelect?.({
      ...cascadingState,
      barangay,
    });
  };

  // Input handlers
  const handleRegionInputChange = (value: string) => {
    setRegionQuery(value);
    if (value.length >= 2) {
      fetchPredictions(value, 'regions');
      setShowRegionResults(true);
    } else {
      setShowRegionResults(false);
      clearPredictions();
    }
  };

  const handleProvinceInputChange = (value: string) => {
    setProvinceQuery(value);
    if (value.length >= 2 && cascadingState.selectedRegion) {
      fetchPredictions(value, 'provinces');
      setShowProvinceResults(true);
    } else {
      setShowProvinceResults(false);
      clearPredictions();
    }
  };

  const handleCityInputChange = (value: string) => {
    setCityQuery(value);
    if (value.length >= 2 && cascadingState.selectedProvince) {
      fetchPredictions(value, 'cities');
      setShowCityResults(true);
    } else {
      setShowCityResults(false);
      clearPredictions();
    }
  };

  const handleBarangayInputChange = (value: string) => {
    setBarangayQuery(value);
    if (value.length >= 2 && cascadingState.selectedCity) {
      fetchPredictions(value, 'barangays');
      setShowBarangayResults(true);
    } else {
      setShowBarangayResults(false);
      clearPredictions();
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Philippine Location Selector</h2>
      
      {/* Region Input */}
      <div className="relative">
        <label className="block text-sm font-medium mb-1">Region</label>
        <input
          type="text"
          value={regionQuery}
          onChange={(e) => handleRegionInputChange(e.target.value)}
          placeholder="Search for region (e.g., 'ma' for Manila, etc.)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showRegionResults && predictions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {predictions.map((prediction) => (
              <div
                key={prediction.psgc_id}
                onClick={() => handleRegionSelect(prediction)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">{prediction.name}</div>
                <div className="text-sm text-gray-500">{prediction.full_address}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Province Input - Only show after region is selected */}
      {cascadingState.selectedRegion && (
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Province</label>
          <input
            type="text"
            value={provinceQuery}
            onChange={(e) => handleProvinceInputChange(e.target.value)}
            placeholder="Search for province"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showProvinceResults && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.psgc_id}
                  onClick={() => handleProvinceSelect(prediction)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{prediction.name}</div>
                  <div className="text-sm text-gray-500">{prediction.full_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* City/Municipality Input - Only show after province is selected */}
      {cascadingState.selectedProvince && (
        <div className="relative">
          <label className="block text-sm font-medium mb-1">City/Municipality</label>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => handleCityInputChange(e.target.value)}
            placeholder="Search for city/municipality"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showCityResults && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.psgc_id}
                  onClick={() => handleCitySelect(prediction)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{prediction.name}</div>
                  <div className="text-sm text-gray-500">{prediction.full_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Barangay Input - Only show after city is selected */}
      {cascadingState.selectedCity && (
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Barangay</label>
          <input
            type="text"
            value={barangayQuery}
            onChange={(e) => handleBarangayInputChange(e.target.value)}
            placeholder="Search for barangay"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showBarangayResults && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.psgc_id}
                  onClick={() => handleBarangaySelect(prediction)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{prediction.name}</div>
                  <div className="text-sm text-gray-500">{prediction.full_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-sm text-blue-600">Loading...</div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Selected location summary */}
      {cascadingState.selectedRegion && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Selected Location:</h3>
          <div className="text-sm space-y-1">
            {cascadingState.selectedRegion && (
              <div><strong>Region:</strong> {cascadingState.selectedRegion.name}</div>
            )}
            {cascadingState.selectedProvince && (
              <div><strong>Province:</strong> {cascadingState.selectedProvince.name}</div>
            )}
            {cascadingState.selectedCity && (
              <div><strong>City:</strong> {cascadingState.selectedCity.name}</div>
            )}
            {cascadingState.selectedBarangay && (
              <div><strong>Barangay:</strong> {cascadingState.selectedBarangay.name}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReduxPSGCLocations } from "@/hooks/useReduxPSGCLocations";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  initialLocation?: string;
}

export function LocationModal({ isOpen, onClose, onLocationSelect, initialLocation = "" }: LocationModalProps) {
  const [query, setQuery] = useState(initialLocation);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [barangayQuery, setBarangayQuery] = useState("");
  const [landmark, setLandmark] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const provinceInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const barangayInputRef = useRef<HTMLInputElement>(null);
  const landmarkInputRef = useRef<HTMLInputElement>(null);
  
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
    predictions,
    isLoading,
    error,
    fetchPredictions,
    clearPredictions,
  } = useReduxPSGCLocations();

  // Sync query with region query
  useEffect(() => {
    setRegionQuery(query);
  }, [query, setRegionQuery]);

  // Handle query change
  const handleQueryChange = (newQuery: string) => {
    console.log('🔍 LocationModal query change:', newQuery);
    setQuery(newQuery);
    setRegionQuery(newQuery);
    setSelectedIndex(-1);
    setShowDropdown(newQuery.length >= 1);
    
    // Reset selections when query changes
    if (!newQuery.trim()) {
      setSelectedRegion(null);
      setSelectedProvince(null);
      setSelectedCity(null);
      setSelectedBarangay(null);
    }
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredRegions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredRegions[selectedIndex]) {
        handleRegionSelect(filteredRegions[selectedIndex]);
      } else if (query.trim()) {
        handleLocationSubmit(query.trim());
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleRegionSelect = (region: any) => {
    console.log('✅ LocationModal region selected:', region.name);
    const locationString = region.name;
    onLocationSelect(locationString);
    setQuery(locationString);
    setSelectedRegion(region);
    setShowDropdown(false);
    // Don't close the modal, allow province selection
  };

  const handleProvinceSelect = (province: any) => {
    console.log('✅ LocationModal province selected:', province.name);
    let locationString = province.name;
    if (cascadingState.selectedRegion) {
      locationString = `${province.name}, ${cascadingState.selectedRegion.name}`;
    }
    setQuery(locationString);
    setSelectedProvince(province);
    setShowProvinceDropdown(false);
    // Don't close the modal, allow city selection
  };

  const handleCitySelect = (city: any) => {
    console.log('✅ LocationModal city selected:', city.name);
    let locationString = city.name;
    if (cascadingState.selectedProvince) {
      locationString = `${city.name}, ${cascadingState.selectedProvince.name}`;
    } else if (cascadingState.selectedRegion) {
      locationString = `${city.name}, ${cascadingState.selectedRegion.name}`;
    }
    setQuery(locationString);
    setSelectedCity(city);
    setShowCityDropdown(false);
    // Don't close the modal, allow barangay selection
  };

  const handleBarangaySelect = (barangay: any) => {
    console.log('✅ LocationModal barangay selected:', barangay.name);
    let locationString = barangay.name;
    if (cascadingState.selectedCity) {
      locationString = `${barangay.name}, ${cascadingState.selectedCity.name}`;
    } else if (cascadingState.selectedProvince) {
      locationString = `${barangay.name}, ${cascadingState.selectedProvince.name}`;
    } else if (cascadingState.selectedRegion) {
      locationString = `${barangay.name}, ${cascadingState.selectedRegion.name}`;
    }
    setQuery(locationString);
    setSelectedBarangay(barangay);
    setShowBarangayDropdown(false);
    // Don't close the modal, allow landmark entry
  };

  const handleLocationSubmit = () => {
    // Check if all required fields are filled
    if (!cascadingState.selectedRegion) {
      console.log('❌ Region is required');
      return;
    }
    if (!cascadingState.selectedProvince) {
      console.log('❌ Province is required');
      return;
    }
    if (!cascadingState.selectedCity) {
      console.log('❌ City is required');
      return;
    }
    if (!cascadingState.selectedBarangay) {
      console.log('❌ Barangay is required');
      return;
    }

    // Build complete location string
    let locationString = cascadingState.selectedBarangay.name;
    if (cascadingState.selectedCity) {
      locationString += `, ${cascadingState.selectedCity.name}`;
    }
    if (cascadingState.selectedProvince) {
      locationString += `, ${cascadingState.selectedProvince.name}`;
    }
    if (cascadingState.selectedRegion) {
      locationString += `, ${cascadingState.selectedRegion.name}`;
    }
    if (landmark.trim()) {
      locationString += ` (Near: ${landmark.trim()})`;
    }

    console.log('✅ Complete location selected:', locationString);
    onLocationSelect(locationString);
    onClose();
  };

  const handleModalClose = () => {
    setQuery(initialLocation);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onClose();
  };

  const handleInputFocus = () => {
    console.log('🎯 LocationModal input focused');
    setShowDropdown(query.length >= 1);
  };

  const handleInputBlur = () => {
    console.log('❌ LocationModal input blurred');
    setTimeout(() => setShowDropdown(false), 200);
  };

  // Handle province query change
  const handleProvinceQueryChange = (newQuery: string) => {
    console.log('🔍 LocationModal province query change:', newQuery);
    setProvinceQuery(newQuery);
    setSelectedIndex(-1);
    setShowProvinceDropdown(newQuery.length >= 2);
    
    if (newQuery.length >= 2 && cascadingState.selectedRegion) {
      fetchPredictions(newQuery, 'provinces');
    } else {
      clearPredictions();
    }
  };

  const handleProvinceInputFocus = () => {
    console.log('🎯 LocationModal province input focused');
    if (provinceQuery.length >= 2 && cascadingState.selectedRegion) {
      setShowProvinceDropdown(true);
    }
  };

  const handleProvinceInputBlur = () => {
    console.log('❌ LocationModal province input blurred');
    setTimeout(() => setShowProvinceDropdown(false), 200);
  };

  // Handle city query change
  const handleCityQueryChange = (newQuery: string) => {
    console.log('🔍 LocationModal city query change:', newQuery);
    setCityQuery(newQuery);
    setSelectedIndex(-1);
    setShowCityDropdown(newQuery.length >= 2);
    
    if (newQuery.length >= 2 && cascadingState.selectedProvince) {
      fetchPredictions(newQuery, 'cities');
    } else {
      clearPredictions();
    }
  };

  const handleCityInputFocus = () => {
    console.log('🎯 LocationModal city input focused');
    if (cityQuery.length >= 2 && cascadingState.selectedProvince) {
      setShowCityDropdown(true);
    }
  };

  const handleCityInputBlur = () => {
    console.log('❌ LocationModal city input blurred');
    setTimeout(() => setShowCityDropdown(false), 200);
  };

  // Handle barangay query change
  const handleBarangayQueryChange = (newQuery: string) => {
    console.log('🔍 LocationModal barangay query change:', newQuery);
    setBarangayQuery(newQuery);
    setSelectedIndex(-1);
    setShowBarangayDropdown(newQuery.length >= 2);
    
    if (newQuery.length >= 2 && cascadingState.selectedCity) {
      fetchPredictions(newQuery, 'barangays');
    } else {
      clearPredictions();
    }
  };

  const handleBarangayInputFocus = () => {
    console.log('🎯 LocationModal barangay input focused');
    if (barangayQuery.length >= 2 && cascadingState.selectedCity) {
      setShowBarangayDropdown(true);
    }
  };

  const handleBarangayInputBlur = () => {
    console.log('❌ LocationModal barangay input blurred');
    setTimeout(() => setShowBarangayDropdown(false), 200);
  };

  // Handle landmark change
  const handleLandmarkChange = (newLandmark: string) => {
    console.log('🏢 LocationModal landmark change:', newLandmark);
    setLandmark(newLandmark);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Search for a location..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="pr-10"
            />
            {regionsLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Province Input - Only show after region is selected */}
          {cascadingState.selectedRegion && (
            <div className="relative">
              <Input
                ref={provinceInputRef}
                placeholder="Search for province..."
                value={provinceQuery}
                onChange={(e) => handleProvinceQueryChange(e.target.value)}
                onFocus={handleProvinceInputFocus}
                onBlur={handleProvinceInputBlur}
                className="pr-10"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {/* City Input - Only show after province is selected */}
          {cascadingState.selectedProvince && (
            <div className="relative">
              <Input
                ref={cityInputRef}
                placeholder="Search for city/municipality..."
                value={cityQuery}
                onChange={(e) => handleCityQueryChange(e.target.value)}
                onFocus={handleCityInputFocus}
                onBlur={handleCityInputBlur}
                className="pr-10"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {/* Barangay Input - Only show after city is selected */}
          {cascadingState.selectedCity && (
            <div className="relative">
              <Input
                ref={barangayInputRef}
                placeholder="Search for barangay..."
                value={barangayQuery}
                onChange={(e) => handleBarangayQueryChange(e.target.value)}
                onFocus={handleBarangayInputFocus}
                onBlur={handleBarangayInputBlur}
                className="pr-10"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {/* Landmark Input - Only show after barangay is selected */}
          {cascadingState.selectedBarangay && (
            <div className="relative">
              <Input
                ref={landmarkInputRef}
                placeholder="Enter landmark (optional)..."
                value={landmark}
                onChange={(e) => handleLandmarkChange(e.target.value)}
                className="pr-10"
              />
            </div>
          )}

          {/* Regions dropdown */}
          {(() => {
            console.log('🔍 LocationModal render:', {
              query,
              showDropdown,
              filteredRegionsLength: filteredRegions.length,
              regionsLoading
            });
            return showDropdown;
          })() && (
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {(() => {
                console.log('🔍 Dropdown render check:', {
                  showDropdown,
                  filteredRegionsLength: filteredRegions.length,
                  queryLength: query.length
                });
                return null;
              })()}
              
              {filteredRegions.length > 0 && (
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
              )}

              {filteredRegions.length === 0 && query.length >= 1 && !regionsLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No regions found matching "{query}"
                </div>
              )}

              {query.length === 0 && !regionsLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Type to search Philippine regions...
                </div>
              )}
            </div>
          )}

          {/* Provinces dropdown */}
          {(() => {
            console.log('🔍 Province dropdown render check:', {
              showProvinceDropdown,
              predictionsLength: predictions.length,
              provinceQuery,
              selectedRegion: cascadingState.selectedRegion?.name
            });
            return showProvinceDropdown;
          })() && (
            <div className="border rounded-md max-h-60 overflow-y-auto">
              
              {predictions.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                    Provinces in {cascadingState.selectedRegion?.name} ({predictions.length})
                  </div>
                  {predictions.map((prediction, index) => (
                    <button
                      key={prediction.psgc_id}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-3 ${
                        index === selectedIndex ? "bg-accent" : ""
                      }`}
                      onClick={() => handleProvinceSelect(prediction)}
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {prediction.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {prediction.geographic_level}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {predictions.length === 0 && provinceQuery.length >= 2 && !isLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No provinces found matching "{provinceQuery}"
                </div>
              )}

              {provinceQuery.length === 0 && !isLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Type to search provinces in {cascadingState.selectedRegion?.name}...
                </div>
              )}
            </div>
          )}

          {/* Cities dropdown */}
          {(() => {
            console.log('🔍 City dropdown render check:', {
              showCityDropdown,
              predictionsLength: predictions.length,
              cityQuery,
              selectedProvince: cascadingState.selectedProvince?.name
            });
            return showCityDropdown;
          })() && (
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {predictions.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                    Cities/Municipalities in {cascadingState.selectedProvince?.name} ({predictions.length})
                  </div>
                  {predictions.map((prediction, index) => (
                    <button
                      key={prediction.psgc_id}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-3 ${
                        index === selectedIndex ? "bg-accent" : ""
                      }`}
                      onClick={() => handleCitySelect(prediction)}
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {prediction.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {prediction.geographic_level}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {predictions.length === 0 && cityQuery.length >= 2 && !isLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No cities found matching "{cityQuery}"
                </div>
              )}

              {cityQuery.length === 0 && !isLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Type to search cities in {cascadingState.selectedProvince?.name}...
                </div>
              )}
            </div>
          )}

          {/* Barangays dropdown */}
          {(() => {
            console.log('🔍 Barangay dropdown render check:', {
              showBarangayDropdown,
              predictionsLength: predictions.length,
              barangayQuery,
              selectedCity: cascadingState.selectedCity?.name
            });
            return showBarangayDropdown;
          })() && (
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {predictions.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                    Barangays in {cascadingState.selectedCity?.name} ({predictions.length})
                  </div>
                  {predictions.map((prediction, index) => (
                    <button
                      key={prediction.psgc_id}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-3 ${
                        index === selectedIndex ? "bg-accent" : ""
                      }`}
                      onClick={() => handleBarangaySelect(prediction)}
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {prediction.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {prediction.geographic_level}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {predictions.length === 0 && barangayQuery.length >= 2 && !isLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No barangays found matching "{barangayQuery}"
                </div>
              )}

              {barangayQuery.length === 0 && !isLoading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Type to search barangays in {cascadingState.selectedCity?.name}...
                </div>
              )}
            </div>
          )}

          {/* Manual entry option */}
          {query.trim() && filteredRegions.length === 0 && !regionsLoading && (
            <div className="text-sm text-muted-foreground">
              Press Enter to use "{query}" or continue typing for more suggestions.
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleModalClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleLocationSubmit}
              disabled={!cascadingState.selectedRegion || !cascadingState.selectedProvince || !cascadingState.selectedCity || !cascadingState.selectedBarangay}
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

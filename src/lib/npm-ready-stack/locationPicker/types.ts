/**
 * Type definitions for the LocationPicker component
 * All types are self-contained for npm package isolation
 */

// ============================================
// Location Data Types
// ============================================

export interface LocationData {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  landmark?: string;
}

// ============================================
// PSGC (Philippine Standard Geographic Code) Types
// ============================================

export interface PSGCLocation {
  psgc_id: string;
  name: string;
  correspondence_code?: string;
  geographic_level: "Reg" | "Prov" | "City" | "Bgy";
  old_names?: string;
  city_class?: string;
  income_classification?: string;
  urban_rural?: string;
  population?: string;
  status?: string;
}

export interface PSGCRegion extends PSGCLocation {
  geographic_level: "Reg";
}

export interface PSGCProvince extends PSGCLocation {
  geographic_level: "Prov";
}

export interface PSGCCity extends PSGCLocation {
  geographic_level: "City";
}

export interface PSGCBarangay extends PSGCLocation {
  geographic_level: "Bgy";
}

export interface CascadingSearchState {
  selectedRegion: PSGCRegion | null;
  selectedProvince: PSGCLocation | null;
  selectedCity: PSGCLocation | null;
  selectedBarangay: PSGCLocation | null;
}

// ============================================
// Geolocation Types
// ============================================

export interface GeocodedAddress {
  formattedAddress: string;
  street?: string;
  city?: string;
  municipality?: string;
  province?: string;
  region?: string;
  barangay?: string;
  country?: string;
  postalCode?: string;
}

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeolocationState {
  position: GeolocationPosition | null;
  address: GeocodedAddress | null;
  error: GeolocationError | null;
  loading: boolean;
  permissionGranted: boolean | null;
  permissionDenied: boolean;
}

// ============================================
// Hook Options Types
// ============================================

export interface UsePSGCLocationsOptions {
  debounceMs?: number;
  minQueryLength?: number;
  baseUrl?: string;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// ============================================
// Component Props Types
// ============================================

export interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string, locationData?: LocationData) => void;
  initialData?: LocationData;
  title?: string;
  showLandmark?: boolean;
  required?: {
    region?: boolean;
    province?: boolean;
    city?: boolean;
    barangay?: boolean;
  };
}

// ============================================
// Context Types
// ============================================

export interface LocationPickerContextType {
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  handleLocationSelect: (location: string, locationData?: LocationData) => void;
}

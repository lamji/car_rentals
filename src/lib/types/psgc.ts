export interface PSGCLocation {
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

export interface PSGCPlace {
  psgc_id: string;
  name: string;
  geographic_level: string;
  full_address: string;
  population?: string;
}

export interface UseGooglePlacesOptions {
  debounceMs?: number;
  minQueryLength?: number;
  baseUrl?: string;
}

export interface UseGooglePlacesReturn {
  predictions: PSGCPlace[];
  isLoading: boolean;
  error: string | null;
  fetchPredictions: (query: string) => void;
  getPlaceDetails: (psgcId: string) => Promise<PSGCLocation | null>;
  clearPredictions: () => void;
}

export interface UsePSGCLocationsOptions {
  debounceMs?: number;
  minQueryLength?: number;
  baseUrl?: string;
}

export interface CascadingSearchState {
  selectedRegion: PSGCLocation | null;
  selectedProvince: PSGCLocation | null;
  selectedCity: PSGCLocation | null;
  selectedBarangay: PSGCLocation | null;
}

export interface UsePSGCLocationsReturn {
  predictions: PSGCPlace[];
  isLoading: boolean;
  error: string | null;
  fetchPredictions: (query: string, level?: 'regions' | 'provinces' | 'cities' | 'barangays') => void;
  getLocationDetails: (psgcId: string) => Promise<PSGCLocation | null>;
  clearPredictions: () => void;
  cascadingState: CascadingSearchState;
  setSelectedRegion: (region: PSGCLocation | null) => void;
  setSelectedProvince: (province: PSGCLocation | null) => void;
  setSelectedCity: (city: PSGCLocation | null) => void;
  setSelectedBarangay: (barangay: PSGCLocation | null) => void;
  resetCascadingSearch: () => void;
}

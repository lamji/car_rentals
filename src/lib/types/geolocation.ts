import type { GeocodedAddress } from "@/utils/geocoding";

export type GeolocationPosition = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

export type GeolocationError = {
  code: number;
  message: string;
};

export type GeolocationState = {
  position: GeolocationPosition | null;
  address: GeocodedAddress | null;
  error: GeolocationError | null;
  loading: boolean;
  permissionGranted: boolean | null;
  permissionDenied: boolean;
};

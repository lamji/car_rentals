"use client";

/**
 * LocationPicker - Isolated Philippine Location Selection Component
 * 
 * A fully self-contained location picker with:
 * - PSGC API integration for Philippine locations
 * - Browser geolocation with reverse geocoding
 * - Cascading selection (Region -> Province -> City -> Barangay)
 * 
 * @example
 * import { LocationModal, useGeolocation, usePSGCLocations } from './locationPicker';
 */

// Export types
export * from "./types";

// Export hooks
export { useGeolocation } from "./hooks/useGeolocation";
export { usePSGCLocations } from "./hooks/usePSGCLocations";

// Export UI components
export { LocationModal } from "./ui/LocationModal";

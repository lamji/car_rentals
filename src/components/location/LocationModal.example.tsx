// Example usage of the improved LocationModal component

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LocationModal, LocationData } from "./LocationModal";

export function LocationModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const handleLocationSelect = (locationString: string, data?: LocationData) => {
    setSelectedLocation(locationString);
    setLocationData(data || null);
    console.log("Selected location:", locationString);
    console.log("Location data:", data);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Location Modal Examples</h2>
      
      {/* Basic Usage */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic Usage</h3>
        <Button onClick={handleOpenModal}>
          Select Location
        </Button>
        {selectedLocation && (
          <p className="text-sm text-gray-600">
            Selected: {selectedLocation}
          </p>
        )}
      </div>

      {/* Pre-filled Data */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">With Pre-filled Data</h3>
        <Button 
          onClick={() => {
            setLocationData({
              region: "National Capital Region",
              province: "Metro Manila",
              city: "Manila",
              barangay: "San Andres"
            });
            setIsModalOpen(true);
          }}
        >
          Edit Pre-filled Location
        </Button>
      </div>

      {/* Custom Title and Options */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Configuration</h3>
        <Button 
          onClick={() => {
            // This would open with custom settings
            setIsModalOpen(true);
          }}
        >
          Open Custom Modal
        </Button>
      </div>

      {/* Display Location Data */}
      {locationData && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Location Details:</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Region:</strong> {locationData.region || "Not selected"}</p>
            <p><strong>Province:</strong> {locationData.province || "Not selected"}</p>
            <p><strong>City:</strong> {locationData.city || "Not selected"}</p>
            <p><strong>Barangay:</strong> {locationData.barangay || "Not selected"}</p>
            <p><strong>Landmark:</strong> {locationData.landmark || "Not specified"}</p>
          </div>
        </div>
      )}

      {/* The Modal Component */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLocationSelect={handleLocationSelect}
        initialData={locationData || undefined}
        title="Select Delivery Location"
        showLandmark={true}
        required={[true, true, true, true]} // All fields required
      />
    </div>
  );
}

// Advanced Usage Example
export function AdvancedLocationModalExample() {
  const [pickupLocation] = useState<LocationData | null>(null);
  const [dropoffLocation] = useState<LocationData | null>(null);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Car Rental Location Selection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pickup Location */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Pickup Location</h3>
          <Button 
            className="w-full"
            variant="outline"
          >
            Select Pickup Location
          </Button>
        </div>

        {/* Drop-off Location */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Drop-off Location</h3>
          <Button 
            className="w-full"
            variant="outline"
          >
            Select Drop-off Location
          </Button>
        </div>
      </div>

      {/* Location Summary */}
      {(pickupLocation || dropoffLocation) && (
        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">Rental Summary:</h3>
          {pickupLocation && (
            <div className="mb-2">
              <strong>Pickup:</strong> {pickupLocation.barangay}, {pickupLocation.city}, {pickupLocation.province}
            </div>
          )}
          {dropoffLocation && (
            <div>
              <strong>Drop-off:</strong> {dropoffLocation.barangay}, {dropoffLocation.city}, {dropoffLocation.province}
            </div>
          )}
        </div>
      )}

      {/* Note: In a real app, you'd have separate modals or state management 
          to handle pickup vs dropoff selection */}
    </div>
  );
}

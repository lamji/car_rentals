/**
 * Client wrapper component for MapBox testing with modal display
 * Creates a modal wrapper around the MapBoxService component for testing
 */

"use client";

import { MapBoxService } from "@/lib/npm-ready-stack/mapboxService/ui";
import { useState } from "react";

/**
 * Test wrapper that displays MapBoxService in a modal for testing purposes
 * @returns {JSX.Element} Modal with MapBoxService for testing
 */
export function MapboxTestWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Handle modal close event
   * @returns {void} No return value - handles side effects only
   */
  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl h-[80vh] rounded-lg border bg-background shadow-lg overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-700 hover:bg-black/95 transition-colors z-10"
          >
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* MapBox Service */}
          <MapBoxService
            pointA={{ lng: 121.03198315333073, lat: 14.532165709610107 }}
            pointB={{ lng: 121.02245594673593, lat: 14.558501989223595 }}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

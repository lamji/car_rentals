"use client";

import { MobileCategoryFilter } from "@/components/home/MobileCategoryFilter";
import { openLocationModal } from "@/lib/slices/uiSlice";
import type { CarType } from "@/lib/types";
import { LocateFixed } from "lucide-react";
import { useDispatch } from "react-redux";

interface Category {
  value: CarType | "all";
  label: string;
}

interface MobileHeroProps {
  location: string | null;
  onClearLocation: () => void;
  userName?: string;
  categories: Category[];
  selectedCategory: CarType | "all";
  setSelectedCategory: (category: CarType | "all") => void;
}

export function MobileHero({
  location,
  onClearLocation,
  userName,
  categories,
  selectedCategory,
  setSelectedCategory,
}: MobileHeroProps) {
  const dispatch = useDispatch();
  
  /**
   * Handle opening the location modal via Redux
   * @returns {void}
   */
  const handleOpenLocationModal = () => {
    dispatch(openLocationModal());
  };

  // Function to truncate text to specific character count
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">
        Hi {userName || "Guest"}
      </h1>
      <p className="text-lg text-white font-medium">
        Find Your Perfect Ride
      </p>
      <p className="text-gray-300">
        Browse our selection of quality vehicles
      </p>
      <div className="mt-4 flex gap-2 max-w-md mx-auto ">
        <button
          onClick={handleOpenLocationModal}
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border-2 border-white text-white placeholder-white/60 hover:bg-white/20 transition-colors text-left flex items-center gap-3 min-w-0"
        >
          <LocateFixed className="w-4 h-4 text-white flex-shrink-0" />
          <span className="flex-1 flex items-center justify-between">
            <span className="truncate">
              {truncateText(location || "Select Location", 30)}
            </span>
            {location && (
              <div
                onClick={onClearLocation}
                className="flex-shrink-0 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                title="Clear location"
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </div>
            )}
          </span>
        </button>
        <MobileCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          data-testid="mobile-filter-wrapper"
        />
      </div>
    </div>
  );
}

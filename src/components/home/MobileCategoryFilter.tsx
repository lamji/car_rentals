"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarType } from "@/lib/types";

interface Category {
  value: CarType | "all";
  label: string;
}

interface MobileCategoryFilterProps {
  categories: Category[];
  selectedCategory: CarType | "all";
  setSelectedCategory: (category: CarType | "all") => void;
}

export function MobileCategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
}: MobileCategoryFilterProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <>
      {/* Mobile filter button - right aligned with Available Cars text */}
      <div className="lg:hidden flex items-center justify-between">
        <Button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-12 h-12 p-3 bg-white border-2 border-white hover:bg-gray-100"
          size="lg"
        >
          <SlidersHorizontal className="h-5 w-5 text-black" />
        </Button>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFilterModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filter by Category</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Options */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setIsFilterModalOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors border ${
                      selectedCategory === cat.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

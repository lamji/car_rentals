"use client";

import { useRipple } from "@/hooks/useRipple";
import type { CarType } from "@/lib/types";

interface Category {
  value: CarType | "all";
  label: string;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: CarType | "all";
  setSelectedCategory: (category: CarType | "all") => void;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategorySidebarProps) {
  const createRipple = useRipple();
  return (
    <div className="lg:col-span-1 lg:border-r-4 lg:border-r-border lg:pr-8" data-testid="category-sidebar">
      {/* Desktop header - hidden on mobile */}
      <div className="hidden sm:block mb-4 sm:mb-6" data-testid="category-sidebar-header">
        <h2 className="text-xl font-semibold sm:text-2xl" data-testid="category-sidebar-title">Cars</h2>
        <p className="text-xs text-muted-foreground sm:text-sm" data-testid="category-sidebar-subtitle">Availability based on your selected dates</p>
      </div>
      
      {/* Filter Categories - Desktop only */}
      <div className="space-y-2 hidden lg:block" data-testid="category-filter-section">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm" data-testid="category-filter-title">Filter by Category</h3>
        
        {/* Desktop filter buttons */}
        <div className="space-y-1" data-testid="category-filter-list">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={(e) => { createRipple(e); setSelectedCategory(cat.value); }}
              data-testid={`category-filter-${cat.value}`}
              data-category-value={cat.value}
              data-selected={selectedCategory === cat.value}
              className={`relative overflow-hidden w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors border ${
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
  );
}

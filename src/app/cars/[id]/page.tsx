"use client";

import { Suspense } from "react";
import { CarDetailsPageContent } from "@/components/cars/CarDetailsPageContent";
import { MobileCarDetailsPageContent } from "@/components/cars/MobileCarDetailsPageContent";

export default function CarDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Mobile: single column layout */}
      <div className="lg:hidden">
        <MobileCarDetailsPageContent />
      </div>
      
      {/* Desktop: side-by-side grid layout */}
      <div className="hidden lg:block">
        <CarDetailsPageContent />
      </div>
    </Suspense>
  );
}

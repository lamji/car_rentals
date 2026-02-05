"use client";

import { CarGrid } from "@/components/home/CarGrid";
import { CategorySidebar } from "@/components/home/CategorySidebar";
import { Hero } from "@/components/home/Hero";
import { MobileHero } from "@/components/home/MobileHero";
import { useHomeContent } from "@/hooks/useHomeContent";
import { Suspense } from "react";

function HomeContent() {
  const {
    state,
    selectedCategory,
    filteredCars,
    categories,
    setSelectedCategory,
    handleClearLocation,
    handleLocationChange,
    detailsHrefFor,
    currentAddress,
    radiusList
  } = useHomeContent();

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <Hero
        state={state}
        handleLocationChange={handleLocationChange}
        handleClearLocation={handleClearLocation}
        className="hidden sm:block"
        data-testid="hero-section"
      />

      {/* Mobile Hero Section */}
      <div
        className="lg:hidden relative border-b-2 border-l-2 border-r-2 border-gray-800 p-6 mb-4 h-[60vh] flex flex-col"
        style={{
          backgroundImage:
            "url(https://res.cloudinary.com/dlax3esau/image/upload/v1769172920/herobg_nxiyen.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.9) 100%)",
          }}
        ></div>

        {/* Top bar with logo and user */}
        <div className="relative z-10 flex items-start justify-between mb-8">
          {/* Left: Location icon and current location */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <span className="text-white text-md font-bold">
                  Your Current Location
                </span>
              </div>
              <span className="text-white text-xs w-[60%] ml-7">
                {currentAddress
                  ? currentAddress
                  : "Search location in search box"}
              </span>
            </div>
          </div>

          {/* Right: User avatar */}
          {/* <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div> */}
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center w-[100%]">
          <MobileHero
            location={currentAddress}
            onClearLocation={handleClearLocation}
            userName={state.user?.name}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Car cards below hero */}
      <div
        className="w-full pb-8 sm:px-12 sm:py-12"
        data-testid="car-content-section"
      >
        <div
          className="grid gap-6 lg:gap-8 lg:grid-cols-4"
          data-testid="car-content-grid"
        >
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            data-testid="category-sidebar-wrapper"
          />

          <div
            className="pt-10 lg:col-span-3 px-5 lg:px-0 -mt-20 lg:-mt-0 rounded-tl-[1rem] rounded-tr-[1rem] bg-white border-0 border-gray-200 relative"
            data-testid="car-main-content"
          >
            <CarGrid
              filteredCars={filteredCars}
              detailsHrefFor={detailsHrefFor}
              radiusList={radiusList}
              data-testid="car-grid-wrapper"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

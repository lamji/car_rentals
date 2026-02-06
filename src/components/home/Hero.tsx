import { LocationSearch } from "@/components/location/LocationSearch";
import { openLocationModal } from "@/lib/slices/uiSlice";
import { Car, Headphones, Zap } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";

interface HeroProps {
  state: {
    location?: string;
  };
  handleLocationChange: (value: string) => void;
  handleClearLocation: () => void;
  className?: string;
}

export function Hero({
  state,
  handleLocationChange,
  handleClearLocation,
  className,
}: HeroProps) {
  const dispatch = useDispatch();

  /**
   * Handle opening the location modal via Redux
   * @returns {void}
   */
  const handleOpenLocationModal = () => {
    dispatch(openLocationModal());
  };
  return (
    <div className={className}>
      <div className="relative h-[100vh] sm:h-[60vh] md:h-[60vh] lg:h-[60vh] w-full overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://res.cloudinary.com/dlax3esau/image/upload/v1770342697/car_rental_hero_jbt77r.png"
            alt="Car rental"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>

        {/* Hero content */}
        <div className="flex h-full items-center justify-center px-4">
          <div className="w-full max-w-5xl space-y-8">
            {/* Top: marketing text */}
            <div className="text-center text-black sm:px-4">
              <h1 className="text-2xl font-black uppercase leading-tight sm:text-4xl md:text-5xl">
                Rent a <span className="text-yellow-400">Car Today!</span>
              </h1>
              <p className="mt-1 text-sm font-semibold sm:text-lg md:text-xl">
                Affordable & Reliable Car Rentals
              </p>

              <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-6 text-xs sm:text-base sm:text-lg">
                <li className="flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-white/20 p-1 sm:p-2">
                    <Car className="h-3 w-3 text-white sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs text-white sm:text-sm sm:text-base">
                    Wide Selection
                  </span>
                </li>
                <li className="flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-white/20 p-1 sm:p-2">
                    <Zap className="h-3 w-3 text-white sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs text-white sm:text-sm sm:text-base">
                    Easy Booking
                  </span>
                </li>
                <li className="flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1 sm:gap-3 sm:px-4 sm:py-2">
                  <div className="rounded-full bg-white/20 p-1 sm:p-2">
                    <Headphones className="h-3 w-3 text-white sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs text-white sm:text-sm sm:text-base">
                    24/5 Support
                  </span>
                </li>
              </ul>

              {/* Address Search inside hero */}
              <LocationSearch
                state={state}
                setIsLocationModalOpen={handleOpenLocationModal}
                handleLocationChange={handleLocationChange}
                handleClearLocation={handleClearLocation}
                className="mt-8 max-w-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

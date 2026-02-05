import { LocationSearch } from "@/components/location/LocationSearch";
import { openLocationModal } from "@/lib/slices/uiSlice";
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
            src="https://res.cloudinary.com/dlax3esau/image/upload/v1769172920/herobg_nxiyen.png"
            alt="Car rental"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 " />
        </div>

        {/* Hero content */}
        <div className="flex h-full items-center justify-end px-0">
          <div className="flex-1"></div>
          <div className="w-[30%] bg-primary/80 flex h-full items-center justify-end px-0">
          <div className="w-full max-w-5xl space-y-8">
            {/* Top: marketing text */}
            <div className="text-center text-black sm:px-4">
              <h1 className="text-2xl text-white font-black uppercase leading-tight sm:text-4xl md:text-5xl">
                Rent a <span className="text-yellow-400">Car Today!</span>
              </h1>
              <p className="mt-1 text-sm font-semibold text-white sm:text-lg md:text-xl">
                Affordable & Reliable Car Rentals
              </p>

       

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
    </div>
  );
}

import { LocationSearch } from "@/components/location/LocationSearch";
import { openLocationModal } from "@/lib/slices/uiSlice";
import { Car } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";

interface HeroProps {
  state: string;
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

  console.log("test:state", state);

  /**
   * Handle opening the location modal via Redux
   * @returns {void}
   */
  const handleOpenLocationModal = () => {
    dispatch(openLocationModal());
  };
  return (
    <div className={className}>
      <div className="relative h-screen sm:h-[60vh] md:h-[60vh] lg:h-[60vh] w-full overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 -z-10 bg-[#f5f3fa]">
          <Image
            src="https://res.cloudinary.com/dlax3esau/image/upload/v1770448817/ChatGPT_Image_Feb_7_2026_03_17_57_PM_mo3tg5.png"
            alt="Car rental"
            fill
            className="object-contain"
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 " />
        </div>

        <div className="flex h-full items-center justify-between px-0">
          <div className="w-[350px] bg-primary/80 h-full p-2">
            <div className="flex items-center justify-center w-full">
              <Car className="h-20 w-20 text-yellow-400" />
            </div>

            <h1 className="text-white text-center text-2xl font-black uppercase leading-tight sm:text-4xl md:text-5xl">
              Rent a <span className="text-yellow-400">Car Today!</span>
            </h1>
            <p className="text-white mt-1 text-center text-sm font-semibold sm:text-lg md:text-xl">
              Affordable & Reliable Car Rentals
            </p>
            <LocationSearch
              state={state}
              setIsLocationModalOpen={handleOpenLocationModal}
              handleLocationChange={handleLocationChange}
              handleClearLocation={handleClearLocation}
              className="mt-8 max-w-2xl mx-auto"
            />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

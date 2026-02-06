import { Input } from "@/components/ui/input";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { MapPin, X } from "lucide-react";

interface LocationSearchProps {
  state: string;
  setIsLocationModalOpen: (open: boolean) => void;
  handleLocationChange: (value: string) => void;
  handleClearLocation: () => void;
  className?: string;
  placeholder?: string;
  showDescription?: boolean;
}

export function LocationSearch({
  state,
  setIsLocationModalOpen,
  handleLocationChange,
  handleClearLocation,
  className = "",
  placeholder = "Enter city, airport, or address...",
  showDescription = true,
}: LocationSearchProps) {

  console.log('LocationSearch', state);
  return (
    <TooltipProvider>
      <div className={className}>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-black p-4">
          <p className="text-xs text-black font-medium mb-2 flex items-center">
            <MapPin className="h-4 w-4 text-black mr-2" />
            Current location
          </p>

          <div className="w-full">
            <Tooltip content={state}>
              <div className="relative flex w-full">
                <Input
                  type="text"
                  placeholder={placeholder}
                  value={state || ''}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => setIsLocationModalOpen(true)}
                  className="w-full"
                />
                <button
                  onClick={handleClearLocation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Tooltip>
          </div>

          {showDescription && (
            <p className="text-xs mt-2">Enter your address so we can suggest the nearest garage</p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

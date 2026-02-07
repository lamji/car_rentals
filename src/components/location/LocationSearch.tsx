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
  return (
    <TooltipProvider>
      <div className={className}>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 sm:border-white/20 p-2 sm:p-2">
          <div className="flex items-center px-4 py-3">

            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-yellow-400 mr-1 shrink-0" />
                <p className="text-xs text-white font-medium text-left my-3"> Current location</p>
              </div>

              {state ? (
                <Tooltip content={state}>
                  <div className="relative w-full">
                    <Input
                      type="text"
                      placeholder={placeholder}
                      value={state || ''}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => setIsLocationModalOpen(true)}
                      className="w-[300px] border border-black/20 bg-transparent px-3 py-2 pr-10 text-base font-medium placeholder:text-white/80 focus:ring-0 cursor-pointer text-white rounded-md sm:placeholder:text-white/60 sm:border-white/20"
                    />
                    <button
                      onClick={handleClearLocation}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </Tooltip>
              ) : (
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder={placeholder}
                    value={state || ''}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => setIsLocationModalOpen(true)}
                    className="w-full border border-black/20 bg-transparent px-3 py-2 pr-10 text-base font-medium placeholder:text-white/80 focus:ring-0 cursor-pointer text-white rounded-md sm:placeholder:text-white/60 sm:border-white/20"
                  />
                </div>
              )}
              {showDescription && (
                <p className="text-xs text-white  mt-1">Enter your address so we can suggest the nearest garage</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

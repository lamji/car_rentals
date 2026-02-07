import { Badge } from '@/components/ui/badge'
import { Car, MapPin } from 'lucide-react'

interface PickupOptionProps {
  pickupType?: string
  garageAddress?: string
}

export function PickupOption({
  pickupType,
  garageAddress
}: PickupOptionProps) {
  return (
    <div className="space-y-2" data-testid="pickup-option">
      <div className="flex items-center gap-2">
        <Car className="h-4 w-4 text-blue-600" />
        <span className="font-medium">Pickup Option</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant={
            pickupType === "pickup"
              ? "default"
              : "secondary"
          }
          data-testid="pickup-type-badge"
          className="flex items-center gap-1"
        >
          {pickupType === "pickup" ? (
            <>
              <MapPin className="h-3 w-3" />
              Garage Pickup
            </>
          ) : (
            <>
              <Car className="h-3 w-3" />
              Home Delivery
            </>
          )}
        </Badge>
        {pickupType === "pickup" && garageAddress && (
          <span className="text-sm text-gray-500 flex items-center gap-1" data-testid="garage-address">
            <MapPin className="h-3 w-3" />
            {garageAddress}
          </span>
        )}
      </div>
    </div>
  )
}

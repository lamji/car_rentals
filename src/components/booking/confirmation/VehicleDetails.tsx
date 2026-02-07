import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/paymentSummaryHelper'
import { Car, Fuel, UserCheck } from 'lucide-react'

interface VehicleDetailsProps {
  name?: string
  year?: number
  seats?: number
  transmission?: string
  fuel?: string
  selfDrive?: boolean
  type?: string
  pricePerHour?: number
  pricePer12Hours?: number
  pricePer24Hours?: number
  priceWithDriver?: number
}

export function VehicleDetails({
  name,
  year,
  seats,
  transmission,
  fuel,
  selfDrive,
  type,
  pricePerHour,
  pricePer12Hours,
  pricePer24Hours,
  priceWithDriver
}: VehicleDetailsProps) {
  return (
    <>
      <div className="flex items-start justify-between" data-testid="vehicle-details">
        <div>
          <h4 className="font-semibold text-gray-900" data-testid="vehicle-name">
            {name}
          </h4>
          <p className="text-sm text-gray-600" data-testid="vehicle-specs">
            {year} • {seats} seats • {transmission}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1" data-testid="vehicle-fuel">
            <Fuel className="h-3 w-3" />
            {fuel} Fuel
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={selfDrive ? "default" : "secondary"}
              data-testid="rental-type-badge"
              className="flex items-center gap-1"
            >
              {selfDrive ? (
                <>
                  <Car className="h-3 w-3" />
                  Self-Drive
                </>
              ) : (
                <>
                  <UserCheck className="h-3 w-3" />
                  With Driver
                </>
              )}
            </Badge>
          </div>
        </div>
        <Badge variant="outline" data-testid="vehicle-type">{type}</Badge>
      </div>
      <div className="flex flex-wrap gap-2 text-xs" data-testid="vehicle-rates">
        {selfDrive ? (
          <>
            <span className="bg-gray-100 px-2 py-1 rounded" data-testid="hourly-rate">
              {pricePerHour ? `${formatCurrency(pricePerHour)}/hour` : ""}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded" data-testid="12h-rate">
              {pricePer12Hours ? `${formatCurrency(pricePer12Hours)}/12h` : ""}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded" data-testid="24h-rate">
              {pricePer24Hours ? `${formatCurrency(pricePer24Hours)}/24h` : ""}
            </span>
          </>
        ) : (
          <span className="bg-gray-100 px-2 py-1 rounded" data-testid="with-driver-rate">
            {priceWithDriver ? `${formatCurrency(priceWithDriver)}/day` : ""}
          </span>
        )}
      </div>
    </>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppSelector } from '@/lib/store'
import { CalendarX, Car, Fuel, Settings, Tag, Users } from 'lucide-react'

export function SelectedCarCard() {
  const selectedCar = useAppSelector(state => state.booking.selectedCar)

  console.log("test:selectedCar", selectedCar)

  if (!selectedCar) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-yellow-100 rounded-full p-2">
            <Car className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900 text-sm">No Car Selected</h3>
            <p className="text-yellow-700 text-xs mt-0.5">Please select a car from the previous page.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 shadow-none">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-primary/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Car className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Selected Vehicle</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
              This car is onhold now
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-red-500 hover:text-destructive hover:border-destructive hover:bg-destructive/10"
              onClick={() => console.log("Cancel selection")}
            >
              Cancel
            </Button>
          </div>
        </div>

        <Separator />

        {/* Car Details */}
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Vehicle</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{selectedCar.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Type</span>
            </div>
            <Badge variant="secondary" className="text-xs capitalize">
              {selectedCar.type}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Year</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{selectedCar.year}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Fuel</span>
            </div>
            <span className="text-sm font-medium text-gray-900 capitalize">{selectedCar.fuel}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Seats</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{selectedCar.seats} seats</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Transmission</span>
            </div>
            <span className="text-sm font-medium text-gray-900 capitalize">{selectedCar.transmission}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarX className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Unavailable</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {selectedCar.unavailableDates.length > 0
                ? `${selectedCar.unavailableDates.length} dates`
                : 'None'
              }
            </span>
          </div>
        </div>

        {/* Unavailable Dates */}
        {selectedCar.unavailableDates.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground block mb-2">Blocked Dates</span>
              <div data-testid="unavailable-dates-container" className="flex flex-wrap gap-1.5">
                {selectedCar.unavailableDates.slice(0, 5).map((date: string) => (
                  <Badge
                    key={date}
                    data-testid={`unavailable-date-${date}`}
                    variant="destructive"
                    className="text-[10px] font-normal px-2 py-0.5"
                  >
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                ))}
                {selectedCar.unavailableDates.length > 5 && (
                  <Badge
                    data-testid="unavailable-dates-more"
                    variant="outline"
                    className="text-[10px] font-normal px-2 py-0.5 border-destructive/30 text-destructive"
                  >
                    +{selectedCar.unavailableDates.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer CTA */}

      </CardContent>
    </Card>
  )
}

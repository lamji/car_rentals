import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppSelector } from '@/lib/store'
import { getFutureBookings } from '@/utils/validateBlockedDates'
import { CalendarX, Car, ChevronDown, ChevronUp, Fuel, Settings, Tag, Users } from 'lucide-react'
import { useState } from 'react'

export function SelectedCarCard() {
  const selectedCar = useAppSelector(state => state.data.cars)
  const [showAllDates, setShowAllDates] = useState(false)

  const futureBookings = getFutureBookings(selectedCar?.availability?.unavailableDates || [])


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
    <Card className="border-primary/20 shadow-none ">
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
              <span className="text-xs text-muted-foreground">Bookings</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {futureBookings.length > 0
                ? `${futureBookings.length} booking${futureBookings.length > 1 ? 's' : ''}`
                : 'None'
              }
            </span>
          </div>
        </div>

        {/* Bookings */}
        {futureBookings.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground block mb-2">Upcoming Bookings</span>
              <div data-testid="bookings-container" className="flex flex-wrap gap-2">
                {(showAllDates ? futureBookings : futureBookings.slice(0, 3))
                  .slice()
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map((booking: any) => (
                  <div
                    key={booking._id}
                    data-testid={`booking-${booking._id}`}
                    className="relative bg-linear-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-2 shadow-sm"
                  >
                    <div className="flex items-center justify-center">
                      <div className="text-left">
                        <div style={{ fontSize: '10px' }} className="font-medium text-gray-900">From</div>
                        <div style={{ fontSize: '10px' }} className="text-gray-600">
                          {new Date(booking.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div style={{ fontSize: '10px' }} className="text-gray-500">
                          {new Date(`2000-01-01T${booking.startTime}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-center px-1">
                        <div className="w-4 h-px bg-linear-to-r from-red-400 to-orange-400"></div>
                        <div style={{ fontSize: '10px' }} className="text-gray-400 my-0.5">to</div>
                        <div className="w-4 h-px bg-linear-to-r from-red-400 to-orange-400"></div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontSize: '10px' }} className="font-medium text-gray-900">Until</div>
                        <div style={{ fontSize: '10px' }} className="text-gray-600">
                          {new Date(booking.endDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div style={{ fontSize: '10px' }} className="text-gray-500">
                          {new Date(`2000-01-01T${booking.endTime}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {futureBookings.length > 3 && (
                  <Badge
                    data-testid="bookings-more"
                    variant="outline"
                    className="text-[10px] font-normal px-2 py-0.5 border-destructive/30 text-destructive cursor-pointer hover:bg-destructive/10 flex items-center gap-1 w-fit"
                    onClick={() => setShowAllDates(!showAllDates)}
                  >
                    {showAllDates ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        +{futureBookings.length - 3} more
                      </>
                    )}
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

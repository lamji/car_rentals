import React from 'react'
import { Car } from 'lucide-react'
import { useAppSelector } from '@/lib/store'

export function SelectedCarCard() {
  const selectedCar = useAppSelector(state => state.booking.selectedCar)

  if (!selectedCar) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">No Car Selected</h3>
        <p className="text-yellow-700">Please select a car from the previous page.</p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 rounded-full p-3">
          <Car className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-3">Selected Vehicle</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Car:</span>
              <span className="text-sm text-blue-600">{selectedCar.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Type:</span>
              <span className="text-sm text-blue-600 capitalize">{selectedCar.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Unavailable Dates:</span>
              <span className="text-sm text-blue-600">
                {selectedCar.unavailableDates.length > 0 
                  ? `${selectedCar.unavailableDates.length} dates`
                  : 'None'
                }
              </span>
            </div>
            {selectedCar.unavailableDates.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <span className="text-xs font-medium text-blue-700 block mb-2">Unavailable Dates:</span>
                <div data-testid="unavailable-dates-container" className="flex flex-wrap gap-1">
                  {selectedCar.unavailableDates.slice(0, 5).map((date: string) => (
                    <span 
                      key={date} 
                      data-testid={`unavailable-date-${date}`}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                    >
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                  {selectedCar.unavailableDates.length > 5 && (
                    <span 
                      data-testid="unavailable-dates-more"
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                    >
                      +{selectedCar.unavailableDates.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-blue-700 mt-4 text-sm">Proceed to set your rental dates and location.</p>
    </div>
  )
}

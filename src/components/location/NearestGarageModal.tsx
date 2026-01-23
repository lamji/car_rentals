import React from 'react'
import { MapPin, X, Car, Users, Settings, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchNearestGarageResponse, NearestGarageResult } from '@/lib/api/useNearestGarage'
import Image from 'next/image'

type Props = {
  isOpen: boolean
  onClose: () => void
  searchResults: SearchNearestGarageResponse | null
  onSelectGarage: (garageId: string) => void
}

export function NearestGarageModal({ isOpen, onClose, searchResults, onSelectGarage }: Props) {
  if (!isOpen || !searchResults) return null

  const availableCars = searchResults.garages.filter((g: NearestGarageResult) => g.available)
  const unavailableCars = searchResults.garages.filter((g: NearestGarageResult) => !g.available)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Nearest Garages</h2>
            <p className="text-sm text-gray-500 mt-1">
              Search results for: {searchResults.searchAddress}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {availableCars.length === 0 && unavailableCars.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cars found near your location</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available Cars */}
              {availableCars.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Available Cars</h3>
                  <div className="space-y-3">
                    {availableCars.map((car: NearestGarageResult) => (
                      <div
                        key={car.id}
                        className="border border-green-500 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => onSelectGarage(car.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-shrink-0 mr-4">
                            <div className="relative w-32 h-24 rounded-lg border-2 border-gray-200 overflow-hidden">
                              <Image
                                src={car.carImage}
                                alt={car.carName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{car.carName}</h4>
                              <span className="text-xs text-gray-500">{car.carYear}</span>
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                Available
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{car.seats} seats</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Settings className="h-4 w-4" />
                                <span>{car.transmission}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                <span>{car.selfDrive ? 'Self-drive' : 'With driver'}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{car.garageAddress} - {car.distance} km away</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{car.ownerContact}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable Cars */}
              {unavailableCars.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Other Cars (Unavailable)</h3>
                  <div className="space-y-3">
                    {unavailableCars.map((car: NearestGarageResult) => (
                      <div
                        key={car.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-60"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-shrink-0 mr-4">
                            <div className="relative w-32 h-24 rounded-lg border-2 border-gray-200 overflow-hidden opacity-50">
                              <Image
                                src={car.carImage}
                                alt={car.carName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-700">{car.carName}</h4>
                              <span className="text-xs text-gray-500">{car.carYear}</span>
                              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                Unavailable
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{car.seats} seats</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Settings className="h-4 w-4" />
                                <span>{car.transmission}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                <span>{car.selfDrive ? 'Self-drive' : 'With driver'}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{car.garageAddress} - {car.distance} km away</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{car.ownerContact}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-xs text-gray-500">
            Search completed at {new Date(searchResults.timestamp).toLocaleTimeString()}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

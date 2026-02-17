/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/store'
import { showLoader, hideLoader } from '@/lib/slices/globalLoaderSlice'
import { useCarsFromRedux } from '@/lib/data/cars'

export type SearchNearestGarageArgs = {
  address: string
  timeoutMs?: number
  progressIntervalMs?: number
}

export type NearestGarageResult = {
  id: string
  carId: string
  carName: string
  carYear: number
  carImage: string
  carType: string
  seats: number
  transmission: string
  selfDrive: boolean
  distance: number
  garageAddress: string
  available: boolean
  ownerName: string
  ownerContact: string
}

export type SearchNearestGarageResponse = {
  success: boolean
  garages: NearestGarageResult[]
  searchAddress: string
  timestamp: string
}

export function useNearestGarage() {
  const selectedCar = useAppSelector(state => state.booking.selectedCar)
  const bookingDetails = useAppSelector(state => state.booking.bookingDetails)
  const dispatch = useAppDispatch()
  const carsFromRedux = useCarsFromRedux()

  const searchNearestGarage = React.useCallback(async (args: SearchNearestGarageArgs): Promise<SearchNearestGarageResponse> => {
    const { address, timeoutMs = 1500, progressIntervalMs = 300 } = args


    // Show global loader
    dispatch(showLoader('Searching for nearest garages...'))

    const startedAt = Date.now()

    await new Promise<void>((resolve) => {
      let intervalId: ReturnType<typeof setInterval> | undefined

      if (progressIntervalMs > 0) {
        intervalId = setInterval(() => {
          const elapsed = Date.now() - startedAt
          const pct = Math.min(100, Math.round((elapsed / timeoutMs) * 100))
          console.log(`[Garage Search] Searching... ${pct}%`)
          
          // Update loader message with progress
          dispatch(showLoader(`Searching for nearest garages... ${pct}%`))
        }, progressIntervalMs)
      }

      setTimeout(() => {
        if (intervalId) clearInterval(intervalId)
        
        // Hide global loader
        dispatch(hideLoader())
        
        resolve()
      }, timeoutMs)
    })

    // Create individual car listings with garage info
    const createCarListings = (): NearestGarageResult[] => {
      return carsFromRedux.map((car: any, index: number) => {
        // Generate mock distance based on index (in real app, this would be calculated from user location to garage)
        const distance = 2.5 + (index * 1.2) + Math.random() * 2
        
        return {
          id: `car-listing-${car.id}`,
          carId: car.id,
          carName: car.name,
          carYear: car.year,
          carImage: car.imageUrls[0],
          carType: car.type,
          seats: car.seats,
          transmission: car.transmission,
          selfDrive: car.selfDrive,
          distance: Math.round(distance * 10) / 10,
          garageAddress: car.garageLocation?.address || car.garageAddress || "",
          available: car.availability.isAvailableToday,
          ownerName: car.owner.name,
          ownerContact: car.owner.contactNumber
        }
      })
    }

    // Simulate API response with individual car listings
    const mockGarages = createCarListings()

    const response: SearchNearestGarageResponse = {
      success: true,
      garages: mockGarages,
      searchAddress: address,
      timestamp: new Date().toISOString()
    }

    console.log('[Garage Search] Complete! Found nearest cars:')
    response.garages.forEach(car => {
      console.log(`- ${car.carName} (${car.garageAddress}) - ${car.distance} km away - ${car.available ? 'Available' : 'Unavailable'}`)
    })

    console.log('=== SEARCH NEAREST GARAGE COMPLETE ===')
    return response
  }, [selectedCar, bookingDetails, dispatch, carsFromRedux])

  return { searchNearestGarage }
}

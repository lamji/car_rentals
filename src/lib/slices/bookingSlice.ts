/* eslint-disable @typescript-eslint/no-explicit-any */
import { Car } from '@/lib/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BookingDetails {
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  location?: string
  pickupType?: 'pickup' | 'delivery'
  firstName?: string
  middleName?: string
  lastName?: string
  contactNumber?: string
  email?: string
  licenseNumber?: string
  licenseImage?: string // Driver's license image URL
  ltoPortalScreenshot?: string // LTO portal screenshot URL
  idType?: string
  dataConsent?: boolean
  // Pricing calculations from Step 2
  rentalPrice?: number
  deliveryFee?: number
  totalPrice?: number
  pricingType?: 'hourly' | '12-hours' | '24-hours' | 'daily'
  durationHours?: number
  excessHours?: number
  excessHoursPrice?: number
}

interface HoldData {
  success: boolean
  carId?: string
  holdExpiry?: string
  bookingDetails?: any
  newBooking?: {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    createdAt: string
    _id: string
  }
  booking?: any
  hold?: {
    room: string
    expiresAt: string
    durationMs: number
  }
}

interface BookingState {
  selectedCar: Car | null
  bookingDetails: BookingDetails
  currentStep: number
  isCompleted: boolean
  isPaymentModalOpen: boolean
  holdData: HoldData | null
}

const initialState: BookingState = {
  selectedCar: null,
  bookingDetails: {},
  currentStep: 1,
  isCompleted: false,
  isPaymentModalOpen: false,
  holdData: null
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedCar: (state, action: PayloadAction<Car>) => {
      // If a different car is being selected, clear all booking data and reset to step 1
      if (state.selectedCar && state.selectedCar.id !== action.payload.id) {
        console.log('🔄 Different car selected, clearing booking data and resetting to step 1')
        console.log('🔄 Previous car:', state.selectedCar.id, 'New car:', action.payload.id)
        state.bookingDetails = {}
        state.currentStep = 1
        state.isCompleted = false
      }
      
      state.selectedCar = action.payload
      state.isCompleted = false
    },
    setBookingDetails: (state, action: PayloadAction<Partial<BookingDetails>>) => {
      state.bookingDetails = { ...state.bookingDetails, ...action.payload }
      state.isCompleted = false
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      // Ensure step is within valid bounds
      const step = Math.max(1, Math.min(4, action.payload))
      state.currentStep = step
    },
    nextStep: (state) => {
      console.log('nextStep Redux action called, current step before:', state.currentStep)
      // Ensure currentStep has a value, default to 1 if undefined
      const currentStep = state.currentStep || 1
      if (currentStep < 4) {
        state.currentStep = currentStep + 1
        console.log('nextStep Redux action: step updated to:', state.currentStep)
      } else {
        console.log('nextStep Redux action: already at max step, currentStep:', currentStep)
      }
    },
    previousStep: (state) => {
      // Ensure currentStep has a value, default to 1 if undefined
      const currentStep = state.currentStep || 1
      if (currentStep > 1) {
        state.currentStep = currentStep - 1
      }
    },
    completeBooking: (state) => {
      state.isCompleted = true
      state.currentStep = 4
    },
    clearBooking: (state) => {
      state.selectedCar = null
      state.bookingDetails = {}
      state.currentStep = 1
      state.isCompleted = false
    },
    resetProgress: (state) => {
      state.currentStep = 1
      state.isCompleted = false
    },
    openPaymentModal: (state) => {
      state.isPaymentModalOpen = true
    },
    closePaymentModal: (state) => {
      state.isPaymentModalOpen = false
    },
    setHoldData: (state, action: PayloadAction<HoldData>) => {
      console.log('debug:holdData - setHoldData reducer called with:', action.payload)
      state.holdData = action.payload
    },
    clearHoldData: (state) => {
      console.log('debug:holdData - clearHoldData reducer called')
      state.holdData = null
    }
  }
})

export const { 
  setSelectedCar, 
  setBookingDetails, 
  setCurrentStep,
  nextStep,
  previousStep,
  completeBooking,
  clearBooking,
  resetProgress,
  openPaymentModal,
  closePaymentModal,
  setHoldData,
  clearHoldData
} = bookingSlice.actions

export default bookingSlice.reducer

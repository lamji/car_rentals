
 import React from 'react'
 import { useAppSelector } from '@/lib/store'

 type ProceedPaymentArgs = {
   timeoutMs?: number
   progressIntervalMs?: number
 }

 export function useProceedPaymet() {
   const selectedCar = useAppSelector(state => state.booking.selectedCar)
   const bookingDetails = useAppSelector(state => state.booking.bookingDetails)

   const proceedPayment = React.useCallback(async (args?: ProceedPaymentArgs) => {
     const timeoutMs = args?.timeoutMs ?? 2000
     const progressIntervalMs = args?.progressIntervalMs ?? 500

     console.log('=== PROCEED PAYMENT (SIMULATED) ===')
     console.log('Step 1: Selected Car:', selectedCar)
     console.log('Step 2: Rental Details:', {
       startDate: bookingDetails.startDate,
       endDate: bookingDetails.endDate,
       startTime: bookingDetails.startTime,
       endTime: bookingDetails.endTime,
       location: bookingDetails.location,
       pickupType: bookingDetails.pickupType,
       rentalPrice: bookingDetails.rentalPrice,
       deliveryFee: bookingDetails.deliveryFee,
       totalPrice: bookingDetails.totalPrice,
       pricingType: bookingDetails.pricingType,
       durationHours: bookingDetails.durationHours
     })
     console.log('Step 3: Personal Info:', {
       firstName: bookingDetails.firstName,
       middleName: bookingDetails.middleName,
       lastName: bookingDetails.lastName,
       contactNumber: bookingDetails.contactNumber,
       email: bookingDetails.email,
       idType: bookingDetails.idType,
       licenseNumber: bookingDetails.licenseNumber,
       dataConsent: bookingDetails.dataConsent
     })

     const startedAt = Date.now()

     await new Promise<void>((resolve) => {
       let intervalId: ReturnType<typeof setInterval> | undefined

       if (progressIntervalMs > 0) {
         intervalId = setInterval(() => {
           const elapsed = Date.now() - startedAt
           const pct = Math.min(100, Math.round((elapsed / timeoutMs) * 100))
           console.log(`[Payment] Processing... ${pct}%`)
         }, progressIntervalMs)
       }

       setTimeout(() => {
         if (intervalId) clearInterval(intervalId)
         resolve()
       }, timeoutMs)
     })

     console.log('=== PROCEED PAYMENT (SIMULATED) COMPLETE ===')
     return { ok: true as const }
   }, [bookingDetails, selectedCar])

   return { proceedPayment }
 }


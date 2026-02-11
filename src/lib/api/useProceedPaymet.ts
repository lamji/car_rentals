
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

     return { ok: true as const }
   }, [bookingDetails, selectedCar])

   return { proceedPayment }
 }


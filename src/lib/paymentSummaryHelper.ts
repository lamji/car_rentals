import { BookingDetails } from '@/lib/slices/bookingSlice'
import { Car } from '@/lib/types'

export interface PricingBreakdown {
  label: string
  hours: number
  rate: number
  amount: number
}

export interface PaymentSummary {
  rentalCost: number
  deliveryFee: number
  driverFee: number
  excessHours: number
  excessHoursPrice: number
  totalAmount: number
  downPaymentRequired: number
  remainingBalance: number
  pricingType: 'hourly' | '12-hours' | '24-hours' | 'daily'
  durationHours: number
  pricingBreakdown: PricingBreakdown[]
  deliveryFeeExplanation: string
}

export function calculatePaymentSummary(
  selectedCar: Car | null,
  bookingDetails: BookingDetails
): PaymentSummary | null {
  if (!selectedCar || !bookingDetails.startDate || !bookingDetails.endDate || !bookingDetails.startTime || !bookingDetails.endTime) {
    return null
  }

  // Calculate duration
  const startDateTime = new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`)
  const endDateTime = new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`)
  const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)

  // Calculate delivery fee
  const deliveryFee = bookingDetails.pickupType === 'delivery' ? (selectedCar.deliveryFee || 0) : 0
  const deliveryFeeExplanation = bookingDetails.pickupType === 'delivery' 
    ? `Home delivery fee: ₱${selectedCar.deliveryFee || 0}` 
    : 'No delivery fee (garage pickup)'

  // Calculate rental cost and pricing breakdown
  let rentalCost = 0
  let pricingType: 'hourly' | '12-hours' | '24-hours' | 'daily' = 'hourly'
  const pricingBreakdown: PricingBreakdown[] = []

  // Add delivery fee to breakdown if applicable
  if (deliveryFee > 0) {
    pricingBreakdown.push({
      label: 'Delivery Fee',
      hours: 0,
      rate: selectedCar.deliveryFee || 0,
      amount: deliveryFee
    })
    pricingBreakdown.push({
      label: '📍 Note: Delivery fee may vary based on your location',
      hours: 0,
      rate: 0,
      amount: 0
    })
  }

  if (durationHours <= 12) {
    // Use 12-hour rate for rentals up to 12 hours
    rentalCost = selectedCar.pricePer12Hours || 0
    pricingType = '12-hours'
    pricingBreakdown.push({
      label: '12-hour rate',
      hours: durationHours,
      rate: selectedCar.pricePer12Hours || 0,
      amount: selectedCar.pricePer12Hours || 0
    })
  } else if (durationHours <= 24) {
    // For durations between 12-24 hours, use 24-hour rate
    rentalCost = selectedCar.pricePer24Hours || 0
    pricingType = '24-hours'
    pricingBreakdown.push({
      label: '24-hour rate',
      hours: durationHours,
      rate: selectedCar.pricePer24Hours || 0,
      amount: selectedCar.pricePer24Hours || 0
    })
  } else {
    // For rentals over 24 hours, calculate daily rate + additional hours
    const fullDays = Math.floor(durationHours / 24)
    const remainingHours = durationHours % 24
    pricingType = 'daily'
    
    // Full days at daily rate
    const daysPrice = (fullDays * (selectedCar.pricePerDay || 0))
    pricingBreakdown.push({
      label: `${fullDays} day(s)`,
      hours: fullDays * 24,
      rate: selectedCar.pricePerDay || 0,
      amount: daysPrice
    })
    
    // Remaining hours
    if (remainingHours > 0) {
      const additionalPrice = remainingHours * (selectedCar.pricePerHour || 0)
      pricingBreakdown.push({
        label: `Additional ${remainingHours.toFixed(1)} hour(s)`,
        hours: remainingHours,
        rate: selectedCar.pricePerHour || 0,
        amount: additionalPrice
      })
      rentalCost = daysPrice + additionalPrice
    } else {
      rentalCost = daysPrice
    }
  }

  const totalAmount = bookingDetails.totalPrice || 0
  const downPaymentRequired = totalAmount * 0.2
  const remainingBalance = totalAmount - downPaymentRequired


  return {
    rentalCost,
    deliveryFee: bookingDetails.deliveryFee || 0,
    driverFee: bookingDetails.driverFee || 0,
    excessHours: bookingDetails.excessHours || 0,
    excessHoursPrice: bookingDetails.excessHoursPrice || 0,
    totalAmount,
    downPaymentRequired,
    remainingBalance,
    pricingType,
    durationHours: Math.round(durationHours * 100) / 100,
    pricingBreakdown,
    deliveryFeeExplanation
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateRentalDuration(startDate: string, endDate: string, startTime: string, endTime: string): string | null {
  if (!startDate || !endDate || !startTime || !endTime) {
    return null;
  }

  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);
  const durationMs = endDateTime.getTime() - startDateTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationDays = Math.floor(durationHours / 24);
  const remainingHours = Math.round(durationHours % 24);

  if (durationDays > 0) {
    return remainingHours > 0 
      ? `${durationDays} day${durationDays > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`
      : `${durationDays} day${durationDays > 1 ? 's' : ''}`;
  } else {
    return `${Math.round(durationHours)} hour${durationHours > 1 ? 's' : ''}`;
  }
}

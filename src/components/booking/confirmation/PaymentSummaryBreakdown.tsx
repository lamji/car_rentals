import { formatCurrency } from '@/lib/paymentSummaryHelper'

interface PaymentSummaryBreakdownProps {
  rentalCost: number
  deliveryFee: number
  driverFee?: number
  excessHoursPrice?: number
  excessHours?: number
  totalAmount: number
}

export function PaymentSummaryBreakdown({
  rentalCost,
  deliveryFee,
  driverFee,
  excessHoursPrice,
  excessHours,
  totalAmount
}: PaymentSummaryBreakdownProps) {
  return (
    <div className="space-y-2" data-testid="cost-breakdown">
      <div className="flex justify-between text-sm" data-testid="rental-cost-only">
        <span className="text-gray-600">Rental Cost</span>
        <span className="font-medium" data-testid="rental-cost-amount">{formatCurrency(rentalCost)}</span>
      </div>
      {Number(deliveryFee) > 0 && (
        <div className="flex justify-between text-sm" data-testid="delivery-fee">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium" data-testid="delivery-fee-amount">{formatCurrency(deliveryFee)}</span>
        </div>
      )}
      {driverFee && Number(driverFee) > 0 && (
        <div className="flex justify-between text-sm" data-testid="driver-fee">
          <span className="text-gray-600">Driver Fee</span>
          <span className="font-medium" data-testid="driver-fee-amount">{formatCurrency(driverFee)}</span>
        </div>
      )}
      {excessHoursPrice && Number(excessHoursPrice) > 0 && (
        <div className="flex justify-between text-sm" data-testid="excess-hours-fee">
          <span className="text-gray-600">Excess Hours ({excessHours || 0}h)</span>
          <span className="font-medium" data-testid="excess-hours-fee-amount">{formatCurrency(excessHoursPrice)}</span>
        </div>
      )}
      <div className="border-t pt-2" data-testid="total-amount">
        <div className="flex justify-between">
          <span className="font-semibold" data-testid="total-amount-label">Total Amount</span>
          <span className="font-bold text-lg" data-testid="total-amount-value">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

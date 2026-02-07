import { formatCurrency } from '@/lib/paymentSummaryHelper'
import { AlertCircle } from 'lucide-react'

interface DownPaymentSectionProps {
  downPaymentRequired: number
  remainingBalance: number
}

export function DownPaymentSection({
  downPaymentRequired,
  remainingBalance
}: DownPaymentSectionProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="down-payment-section">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" data-testid="down-payment-icon" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2" data-testid="down-payment-title">
            Down Payment Required
          </h4>
          <div className="space-y-1 text-sm" data-testid="down-payment-breakdown">
            <div className="flex justify-between" data-testid="down-payment-amount">
              <span className="text-blue-700">Down Payment (20%)</span>
              <span className="font-medium text-blue-900" data-testid="down-payment-value">{formatCurrency(downPaymentRequired)}</span>
            </div>
            <div className="flex justify-between" data-testid="remaining-balance">
              <span className="text-blue-700">Remaining Balance</span>
              <span className="font-medium text-blue-900" data-testid="remaining-balance-value">{formatCurrency(remainingBalance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

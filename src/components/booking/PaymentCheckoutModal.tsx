import { Loader2 } from 'lucide-react'
import React from 'react'

interface PaymentCheckoutModalProps {
  isOpen: boolean
  checkoutUrl: string | null
  onClose: () => void
}

export function PaymentCheckoutModal({ isOpen, checkoutUrl }: PaymentCheckoutModalProps) {
  const [isLoading, setIsLoading] = React.useState(true)

  if (!isOpen || !checkoutUrl) return null

  return (
    <div className="fixed inset-0 z-100 bg-white flex flex-col" data-testid="payment-checkout-modal">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white" data-testid="checkout-header">
        <h2 className="text-lg font-semibold text-gray-900">Complete Payment</h2>
        <p className="text-sm text-gray-500">Do not close this window</p>
      </div>

      <div className="flex-1 relative" data-testid="checkout-iframe-container">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white" data-testid="checkout-loading">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Loading payment page...</p>
            </div>
          </div>
        )}
        <iframe
          src={checkoutUrl}
          className="w-full h-full border-0"
          title="GCash Payment Checkout"
          onLoad={() => setIsLoading(false)}
          data-testid="checkout-iframe"
        />
      </div>
    </div>
  )
}

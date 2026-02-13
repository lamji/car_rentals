import { Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

interface PaymentCheckoutModalProps {
  isOpen: boolean
  checkoutUrl: string | null
  onClose: () => void
}

export function PaymentCheckoutModal({ isOpen, checkoutUrl, onClose }: PaymentCheckoutModalProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  const handleCancel = () => {
    onClose()
    router.push('/payment/failed?reason=Payment%20was%20cancelled%20or%20expired')
  }

  if (!isOpen || !checkoutUrl) return null

  return (
    <div className="fixed inset-0 z-100 bg-white flex flex-col" data-testid="payment-checkout-modal">
      <div className="px-4 py-3 border-b bg-white" data-testid="checkout-header">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Complete Payment</h2>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
            data-testid="checkout-cancel-button"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Refund Policy:</span> Once your booking is approved, no refund will be issued upon client cancellation. If the booking is rejected by the owner, an automatic refund will be processed.
          </p>
        </div>
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

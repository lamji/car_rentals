import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProceedPaymet } from '@/lib/api/useProceedPaymet'
import { formatCurrency, PaymentSummary } from '@/lib/paymentSummaryHelper'
// import { hideLoader, showLoader } from '@/lib/slices/globalLoaderSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { CreditCard, Shield, Smartphone } from 'lucide-react'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentSummary: PaymentSummary
  onPaymentComplete: () => void
}

export function PaymentModal({ isOpen, onClose, paymentSummary, onPaymentComplete }: PaymentModalProps) {
  const dispatch = useAppDispatch()
  const { proceedPayment } = useProceedPaymet()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const state = useAppSelector((state) => state.booking)
  const activeCars = useAppSelector((state) => state.data.cars)


  if (!isOpen) return null

  const handleGcashPayment = async () => {
    if (isProcessing) return
    // setIsProcessing(true)
    // dispatch(showLoader('Processing payment...'))

    // try {
    //   await proceedPayment({ timeoutMs: 2000, progressInterv`alMs: 500 })
    //   onPaymentComplete()
    // } finally {
    //   dispatch(hideLoader())
    //   setIsProcessing(false)
    // }
    const payload = {
      bookingDetails: state.bookingDetails,
      selectedCar: activeCars,
      userId: uuidv4(),
      bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
      paymentStatus:"pending"
    }
    const paymongoPayload = {
      "amount": 200,
      "description": "Car Rental Payment",
      "returnUrl": "https://car-rentals-seven-gamma.vercel.app/",
      "billing": {
        "name": "Jick test",
        "email": "lampagojick5@gmail.com",
        "phone": "09206502183",
        "address": {
          "line1": "line 1",
          "city": "city",
          "state": "state",
          "postal_code": "6006",
          "country": "PH"
        }
      },
      metadata: {
       payload
      }
    }
    console.log("testDAtaState", {
     payload,
     paymongoPayload
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="payment-modal">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        <Card className="p-0 py-6 shadow-none border-none flex-1 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 ">
              <CreditCard className="h-5 w-5" />
              Payment - GCash
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-0 p-4">
            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg" data-testid="payment-summary-section">
              <h3 className="font-semibold text-gray-900 mb-3" data-testid="payment-summary-title">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between" data-testid="rental-cost-row">
                  <span className="text-gray-600">Rental Cost</span>
                  <span className="font-medium">{formatCurrency(paymentSummary.rentalCost)}</span>
                </div>
                {paymentSummary.deliveryFee > 0 && (
                  <div className="flex justify-between" data-testid="delivery-fee-row">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">{formatCurrency(paymentSummary.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t" data-testid="total-amount-row">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="font-bold">{formatCurrency(paymentSummary.totalAmount)}</span>
                </div>
                <div className="flex justify-between" data-testid="down-payment-row">
                  <span className="text-gray-600">Down Payment (20%)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(paymentSummary.downPaymentRequired)}</span>
                </div>
                <div className="flex justify-between" data-testid="remaining-balance-row">
                  <span className="text-gray-600">Remaining Balance</span>
                  <span className="font-medium">{formatCurrency(paymentSummary.remainingBalance)}</span>
                </div>
              </div>
            </div>

            {/* GCash Payment Instructions */}
            <div className="space-y-4" data-testid="gcash-instructions-section">
              <div className="flex items-center gap-3" data-testid="gcash-header">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900" data-testid="gcash-title">Pay with GCash via PayMongo</h4>
                  <p className="text-sm text-gray-600" data-testid="gcash-subtitle">Secure payment processing through PayMongo</p>
                </div>
              </div>

              {/* PayMongo Integration Info */}
              <div className="bg-blue-50 p-4 rounded-lg md:p-4" data-testid="paymongo-info-section">
                <div className="flex items-center gap-2 mb-3" data-testid="secure-payment-header">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h5 className="font-medium text-blue-900">Secure Payment</h5>
                </div>
                <p className="text-sm text-blue-800 mb-3" data-testid="secure-payment-description">
                  Your payment will be processed securely through PayMongo, a trusted payment gateway in the Philippines.
                </p>
                <div className="bg-white p-3 rounded border border-blue-200" data-testid="payment-flow-section">
                  <p className="text-xs text-blue-700 font-medium">Payment Flow:</p>
                  <ol className="text-xs text-blue-600 mt-1 space-y-1" data-testid="payment-flow-steps">
                    <li>1. Click &quot;Proceed to Payment&quot; below</li>
                    <li>2. Redirect to PayMongo secure checkout</li>
                    <li>3. Select GCash as payment method</li>
                    <li>4. Complete payment in GCash app</li>
                    <li>5. Return to confirm booking</li>
                  </ol>
                </div>
              </div>

              {/* Payment Amount Display */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200" data-testid="down-payment-section">
                <div className="text-center" data-testid="down-payment-content">
                  <p className="text-sm text-green-600 font-medium">Down Payment Required</p>
                  <p className="text-2xl font-bold text-green-800">{formatCurrency(paymentSummary.downPaymentRequired)}</p>
                  <p className="text-xs text-green-600 mt-1">20% of total rental cost</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sticky Action Buttons */}
        <div className="p-4 border-t bg-white" data-testid="action-buttons-section">
          <div className="flex gap-3" data-testid="buttons-container">
            <Button variant="outline" onClick={onClose} className="flex-1" data-testid="cancel-payment-button" disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleGcashPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              data-testid="complete-payment-button"
              disabled={isProcessing}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


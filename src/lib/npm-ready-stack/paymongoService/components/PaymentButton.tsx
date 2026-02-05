/**
 * Payment button component for initiating payment processing
 * Clean, professional button design matching modern checkout UX
 */

interface PaymentButtonProps {
  amount: number;
  selectedMethod: string;
  isProcessing: boolean;
  cardDetails: {
    cardNumber: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    holderName: string;
  };
  formatAmount: (amount: number) => string;
  onPayment: () => void;
}

/**
 * Renders payment button with validation and loading states
 * @returns {JSX.Element} Payment button UI component
 */
export function PaymentButton({
  selectedMethod,
  isProcessing,
  cardDetails,
  onPayment,
}: PaymentButtonProps) {
  /**
   * Check if payment button should be disabled
   * Validates card details when card payment method is selected
   */
  const isDisabled =
    !selectedMethod ||
    isProcessing ||
    (selectedMethod === "card" &&
      (!cardDetails.cardNumber ||
        !cardDetails.cvc ||
        !cardDetails.expMonth ||
        !cardDetails.expYear));

  return (
    <div className="bg-white p-6 border-t border-gray-100">
      <button
        onClick={onPayment}
        disabled={isDisabled}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 text-sm"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <span>Confirm your order</span>
        )}
      </button>

      {/* Security and Additional Info */}
      <div className="mt-4 space-y-2 text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
        <div className="text-center">
          <span>
            Payments are processed securely through PayMongo. Your card details
            are never stored on our servers.
          </span>
        </div>
      </div>
    </div>
  );
}

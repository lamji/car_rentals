/**
 * Payment header component displaying amount and branding
 * Shows the payment amount prominently with clean, modern styling
 */

interface PaymentHeaderProps {
  amount: number;
  formatAmount: (amount: number) => string;
}

/**
 * Renders payment header with amount display and branding
 * @returns {JSX.Element} Payment header UI component
 */
export function PaymentHeader({ amount, formatAmount }: PaymentHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Payment</h2>
          <p className="text-sm text-gray-500">
            Secure checkout powered by PayMongo
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <div className="text-2xl font-bold text-gray-900">
            {formatAmount(amount)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Success state component for PayMongo payment completion
 * Displays success message with celebration elements
 */

interface SuccessStateProps {
  className?: string;
}

/**
 * Renders success state with checkmark icon and celebration message
 * @returns {JSX.Element} Success state UI component
 */
export function SuccessState({ className = "" }: SuccessStateProps) {
  return (
    <div
      className={`max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl border border-green-100 ${className}`}
    >
      <div className="p-8 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs">✨</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Payment Successful!
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your payment has been processed successfully. Thank you for your
          transaction!
        </p>
      </div>
    </div>
  );
}

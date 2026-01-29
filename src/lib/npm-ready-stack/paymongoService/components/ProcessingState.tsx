/**
 * Processing state component for PayMongo payment processing
 * Displays animated loading indicator while payment is being processed
 */

interface ProcessingStateProps {
  className?: string;
}

/**
 * Renders processing state with animated spinner and processing message
 * @returns {JSX.Element} Processing state UI component
 */
export function ProcessingState({ className = "" }: ProcessingStateProps) {
  return (
    <div
      className={`max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-100 rounded-2xl shadow-xl border border-purple-100 ${className}`}
    >
      <div className="p-8 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <div className="absolute inset-0 rounded-full animate-ping bg-purple-400 opacity-20"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Processing Payment
        </h3>
        <p className="text-gray-600 text-sm">
          Please wait while we securely process your payment...
        </p>
      </div>
    </div>
  );
}

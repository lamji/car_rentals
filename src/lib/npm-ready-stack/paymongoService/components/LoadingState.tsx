/**
 * Loading state component for PayMongo payment initialization
 * Displays a loading spinner while setting up payment options
 */

interface LoadingStateProps {
  className?: string;
}

/**
 * Renders loading state with spinner and informative message
 * @returns {JSX.Element} Loading state UI component
 */
export function LoadingState({ className = "" }: LoadingStateProps) {
  return (
    <div
      className={`max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-100 ${className}`}
    >
      <div className="p-8 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Setting up payment
        </h3>
        <p className="text-gray-600 text-sm">
          Please wait while we prepare your payment options...
        </p>
      </div>
    </div>
  );
}

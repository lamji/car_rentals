/**
 * Error state component for PayMongo payment failures
 * Displays error message with retry functionality
 */

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

/**
 * Renders error state with error message and retry button
 * @returns {JSX.Element} Error state UI component
 */
export function ErrorState({ error, onRetry, className = "" }: ErrorStateProps) {
  return (
    <div
      className={`max-w-md mx-auto bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-xl border border-red-100 ${className}`}
    >
      <div className="p-8 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Payment Failed
        </h3>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{error}</p>
        <button
          onClick={onRetry}
          className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

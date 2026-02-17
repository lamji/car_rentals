import { Car } from "lucide-react";

/**
 * Renders the brand feature highlights for auth pages
 */
export function AuthFeatures() {
    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4" data-testid="auth-features-section">
            <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-blue-600">
                    <Car className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs text-gray-600">Wide Selection</p>
            </div>
            <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-green-600">
                    <svg
                        className="h-4 w-4 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <p className="text-xs text-gray-600">Easy Booking</p>
            </div>
            <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-purple-600">
                    <svg
                        className="h-4 w-4 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <p className="text-xs text-gray-600">24/7 Support</p>
            </div>
        </div>
    );
}

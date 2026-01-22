import { Car } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";

interface RentalOptionsProps {
  car: Car;
}

export function RentalOptions({ car }: RentalOptionsProps) {
  return (
    <div data-testid="rental-options-section" className="border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Choose Your Rental Plan</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div 
          data-testid="rental-option-daily" 
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-2xl"></div>
          <div className="relative">
            <div className="mb-4">
              <div className="text-sm font-medium text-blue-600 mb-1">DAILY</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(car.pricePerDay)}</div>
              <div className="text-xs text-gray-500">per day</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Standard rental
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                24-hour access
              </div>
            </div>
          </div>
        </div>

        <div 
          data-testid="rental-option-12hrs" 
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-green-300 hover:shadow-lg hover:shadow-green-100 cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-bl-2xl"></div>
          <div className="relative">
            <div className="mb-4">
              <div className="text-sm font-medium text-green-600 mb-1">HALF DAY</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(car.pricePer12Hours)}</div>
              <div className="text-xs text-gray-500">12 hours</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Short trips
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Best value
              </div>
            </div>
          </div>
        </div>

        <div 
          data-testid="rental-option-24hrs" 
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 cursor-pointer md:col-span-2 lg:col-span-1"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-bl-2xl"></div>
          <div className="relative">
            <div className="mb-4">
              <div className="text-sm font-medium text-purple-600 mb-1">FULL DAY</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(car.pricePer24Hours)}</div>
              <div className="text-xs text-gray-500">24 hours</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Extended trips
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Maximum flexibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

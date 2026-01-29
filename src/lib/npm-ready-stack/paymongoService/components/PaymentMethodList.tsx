import NextImage from "next/image";

/**
 * Payment method list component for selecting payment options
 * Clean, professional payment method selection with logos
 */

interface PaymentMethodListProps {
  availableMethods: string[];
  selectedMethod: string;
  onMethodSelect: (methodType: string) => void;
}

/**
 * Renders clean payment method selection grid
 * @returns {JSX.Element} Payment method list UI component
 */
export function PaymentMethodList({
  availableMethods,
  selectedMethod,
  onMethodSelect,
}: PaymentMethodListProps) {
  return (
    <div className="bg-white p-6 border-b border-gray-100">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Payment method</h3>

      {/* Payment Methods - Horizontal Line */}
      <div className="flex gap-2">
        {availableMethods.map((methodType) => (
          <button
            key={methodType}
            onClick={() => onMethodSelect(methodType)}
            className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
              selectedMethod === methodType
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center">
              {/* Payment Method Logo/Icon */}
              {methodType === "card" && (
                <>
                  <svg className="w-6 h-4 mb-1" viewBox="0 0 24 16" fill="none">
                    <rect
                      width="24"
                      height="16"
                      rx="2"
                      fill={selectedMethod === methodType ? "white" : "#1434CB"}
                    />
                    <path
                      d="M8.5 5.5h7v1h-7v-1zm0 2h5v1h-5v-1z"
                      fill={selectedMethod === methodType ? "#1434CB" : "white"}
                    />
                  </svg>
                  <span className="text-xs">Card</span>
                </>
              )}
              {methodType === "gcash" && (
                <>
                  <div
                    className={`w-12 h-8 rounded flex items-center justify-center mb-1 ${
                      selectedMethod === methodType ? "bg-white" : "bg-white"
                    }`}
                  >
                    <NextImage
                      src="/logo/gcash.png"
                      alt="GCash"
                      width={40}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs">GCash</span>
                </>
              )}
              {methodType === "paymaya" && (
                <>
                  <div
                    className={`w-12 h-8 rounded flex items-center justify-center mb-1 ${
                      selectedMethod === methodType ? "bg-white" : "bg-white"
                    }`}
                  >
                    <NextImage
                      src="/logo/paymaya.webp"
                      alt="PayMaya"
                      width={40}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs">PayMaya</span>
                </>
              )}
              {methodType === "grab_pay" && (
                <>
                  <div
                    className={`w-8 h-4 rounded flex items-center justify-center mb-1 ${
                      selectedMethod === methodType
                        ? "bg-white"
                        : "bg-green-100"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        selectedMethod === methodType
                          ? "text-green-600"
                          : "text-green-600"
                      }`}
                    >
                      GP
                    </span>
                  </div>
                  <span className="text-xs">GrabPay</span>
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

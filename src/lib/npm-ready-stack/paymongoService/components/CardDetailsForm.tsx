/**
 * Card details form component for credit/debit card payments
 * Collects card information with clean, structured layout matching modern checkout UX
 */

interface CardDetailsProps {
  cardNumber: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  holderName: string;
}

interface CardDetailsFormProps {
  cardDetails: CardDetailsProps;
  onCardDetailsChange: (details: CardDetailsProps) => void;
}

/**
 * Renders card details input form with validation and formatting
 * @returns {JSX.Element} Card details form UI component
 */
export function CardDetailsForm({
  cardDetails,
  onCardDetailsChange,
}: CardDetailsFormProps) {
  /**
   * Handle card number input with automatic formatting
   * Formats card number with spaces every 4 digits
   */
  const handleCardNumberChange = (value: string) => {
    const formattedValue = value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ");

    onCardDetailsChange({
      ...cardDetails,
      cardNumber: formattedValue,
    });
  };

  /**
   * Handle CVC input with numeric validation
   * Allows only numeric characters up to 4 digits
   */
  const handleCvcChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    onCardDetailsChange({
      ...cardDetails,
      cvc: numericValue,
    });
  };

  return (
    <div className="bg-white p-6 border-t border-gray-100">
      <div className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder name
          </label>
          <input
            type="text"
            placeholder="Simon Petersen"
            value={cardDetails.holderName}
            onChange={(e) =>
              onCardDetailsChange({
                ...cardDetails,
                holderName: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card number
          </label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            maxLength={19}
          />
        </div>

        {/* Date and CVC */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <select
              value={cardDetails.expMonth}
              onChange={(e) =>
                onCardDetailsChange({
                  ...cardDetails,
                  expMonth: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <select
              value={cardDetails.expYear}
              onChange={(e) =>
                onCardDetailsChange({
                  ...cardDetails,
                  expYear: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">YY</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <option key={year} value={year}>
                    {String(year).slice(-2)}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CCV
            </label>
            <input
              type="text"
              placeholder="000"
              value={cardDetails.cvc}
              onChange={(e) => handleCvcChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              maxLength={4}
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Credit Card payments may take up to 24h to be processed.
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Save my payment details for future purchases
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

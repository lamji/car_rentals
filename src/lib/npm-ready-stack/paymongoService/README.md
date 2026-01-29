# PayMongo Service Integration

Complete PayMongo payment integration for car rental bookings with React hooks, TypeScript support, and shadcn/ui components.

## 🚀 Quick Start

### 1. Environment Setup

Add your PayMongo API keys to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
```

### 2. Test the Integration

Visit the test page to see the complete payment flow:

```
http://localhost:3000/payment/test
```

### 3. Basic Usage

```typescript
import { usePayment, PaymentMethodSelector } from '@/lib/npm-ready-stack/paymongoService';

const PaymentPage = () => {
  const payment = usePayment({
    config: {
      publicKey: process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY!,
      secretKey: process.env.PAYMONGO_SECRET_KEY!,
      returnUrl: '/payment/success',
      cancelUrl: '/payment/cancel'
    },
    callbacks: {
      onSuccess: (paymentIntent) => {
        console.log('Payment successful:', paymentIntent);
        // Handle successful payment
      },
      onError: (error) => {
        console.error('Payment failed:', error);
        // Handle payment error
      }
    }
  });

  // Initialize payment
  await payment.initializePayment(
    { value: 750000, currency: 'PHP' }, // PHP 7,500.00
    { bookingId: 'booking_123', userId: 'user_456' }
  );

  return (
    <PaymentMethodSelector
      methods={payment.availableMethods}
      selectedMethod={payment.selectedMethod}
      baseAmount={750000}
      onSelectMethod={payment.selectPaymentMethod}
      onCalculateFees={payment.getFees}
    />
  );
};
```

## 📋 Features

### ✅ Payment Methods Supported
- **GCash** - 2% processing fee, PHP 1.00 - PHP 50,000.00
- **PayMaya** - 2% processing fee, PHP 1.00 - PHP 50,000.00  
- **GrabPay** - 2% processing fee, PHP 1.00 - PHP 25,000.00
- **Credit/Debit Cards** - 3.5% + PHP 15.00 fee, PHP 1.00 - PHP 100,000.00
- **Billease** - 2% processing fee, PHP 1,000.00 - PHP 40,000.00
- **Online Banking** - PHP 15.00 flat fee, PHP 1.00 - PHP 100,000.00

### ✅ Complete Type Safety
- Full TypeScript interfaces for all PayMongo APIs
- Comprehensive error handling with detailed error codes
- Payment method configuration types
- Validation utilities for forms and data

### ✅ React Integration
- `usePayment` hook for complete payment state management
- `PaymentMethodSelector` component with automatic fee calculation
- Loading states, error handling, and status updates
- Real-time payment status polling

### ✅ Car Rental Specific Features
- Booking metadata integration (booking ID, user ID, car ID, rental days)
- Service fee calculations (configurable percentage)
- Multi-day rental support with daily rate calculations
- Complete booking confirmation flow

## 🏗️ Architecture

```
src/lib/npm-ready-stack/paymongoService/
├── types/              # TypeScript type definitions
├── api/                # PayMongo API integration
├── hooks/              # React hooks for state management
├── components/         # UI components (shadcn/ui)
├── utils/              # Utility functions (formatting, validation)
└── examples/           # Usage examples and test implementations
```

## 🔄 Payment Flow

1. **Initialize Payment** - Create payment intent with amount and metadata
2. **Select Method** - User chooses from available payment methods
3. **Calculate Fees** - Automatic fee calculation based on method and amount
4. **Process Payment** - Handle payment through PayMongo API
5. **Handle Result** - Success/failure handling with callbacks

## 🎯 API Reference

### usePayment Hook

```typescript
const {
  // State
  paymentIntent,      // Current payment intent
  selectedMethod,     // Selected payment method
  availableMethods,   // Available payment methods for amount
  isLoading,          // Loading state
  error,              // Error message
  step,               // Current step in payment flow
  
  // Actions
  initializePayment,  // Initialize payment with amount
  selectPaymentMethod,// Select payment method
  processPayment,     // Process payment
  cancelPayment,      // Cancel payment
  resetPayment,       // Reset payment state
  
  // Utilities
  calculateTotal,     // Calculate total with fees
  getFees            // Get fees for method
} = usePayment(options);
```

### PaymentMethodSelector Component

```typescript
<PaymentMethodSelector
  methods={availableMethods}           // Available payment methods
  selectedMethod={selectedMethod}      // Currently selected method
  baseAmount={amountInCents}          // Base amount in cents
  currency="PHP"                      // Currency (PHP/USD)
  onSelectMethod={handleSelect}       // Method selection callback
  onCalculateFees={calculateFees}     // Fee calculation function
  disabled={isLoading}                // Disable interaction
/>
```

## 🛠️ Utility Functions

### Currency Formatting
```typescript
import { formatCurrency, toCents, fromCents } from '@/lib/npm-ready-stack/paymongoService';

formatCurrency(750000, 'PHP');  // "₱7,500.00"
toCents(75.50);                  // 7550
fromCents(750000);               // 7500.00
```

### Validation
```typescript
import { validateEmail, validateCardNumber, validateAmount } from '@/lib/npm-ready-stack/paymongoService';

validateEmail('user@example.com');     // { valid: true }
validateCardNumber('4111111111111111'); // { valid: true }
validateAmount(750000, 'PHP');         // { valid: true }
```

## 🧪 Testing

### Test Page
Visit `/payment/test` to test the complete payment flow with mock data.

### Environment Check
The test page automatically checks for proper API key configuration and displays status.

### Mock Data
Complete mock car rental booking data is provided for testing all payment scenarios.

## 🔐 Security Notes

- Never expose secret keys in client-side code
- Use environment variables for API key management
- Public keys are safe for client-side use
- Implement proper webhook verification in production

## 📱 Production Deployment

1. **Environment Variables**: Set production PayMongo keys
2. **Webhook Setup**: Configure webhook endpoints for payment status updates
3. **Error Handling**: Implement comprehensive error logging and monitoring
4. **Testing**: Test all payment methods with small amounts before going live

## 🆘 Troubleshooting

### Common Issues

**"Cannot find module" errors**: Ensure all shadcn/ui components are installed:
```bash
npx shadcn@latest add card button badge separator alert
```

**API Key errors**: Verify environment variables are properly set and accessible.

**Payment method limits**: Check amount is within supported limits for selected method.

### Debug Mode
Set `NODE_ENV=development` to see debug information on the test page.

## 📞 Support

For PayMongo API issues, refer to the [PayMongo Documentation](https://developers.paymongo.com/).

For integration issues, check the examples in `/examples/CarRentalPayment.tsx`.

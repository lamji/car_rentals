/**
 * Simplified PayMongo Service Component
 * A simplified interface for PayMongo integration with minimal configuration
 */

"use client";

import useBlHooks from "../hooks/useBlHooks";
import { CardDetailsForm } from "./CardDetailsForm";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { PaymentButton } from "./PaymentButton";
import { PaymentHeader } from "./PaymentHeader";
import { PaymentMethodList } from "./PaymentMethodList";
import { ProcessingState } from "./ProcessingState";
import { SuccessState } from "./SuccessState";

interface PayMongoServiceProps {
  method: string[];
  errorCallBack?: (error: unknown) => void;
  amount?: number;
  onSuccess?: (paymentIntent: unknown) => void;
  className?: string;
}

/**
 * Simplified PayMongo Service Component
 * Creates a payment intent and handles the complete payment flow
 */
export function PayMongoService({
  method,
  errorCallBack,
  amount = 100000,
  onSuccess,
  className = "",
}: PayMongoServiceProps) {
  // Use the custom hook for all business logic
  const {
    paymentStatus,
    isProcessing,
    availableMethods,
    selectedMethod,
    error,
    cardDetails,
    setCardDetails,
    handleMethodSelect,
    handlePayment,
    formatAmount,
    initializePayment,
  } = useBlHooks({
    method,
    amount,
    errorCallBack,
    onSuccess,
  });

  // Loading state
  if (paymentStatus === "loading") {
    return <LoadingState className={className} />;
  }

  // Error state
  if (paymentStatus === "error") {
    return (
      <ErrorState
        error={error}
        onRetry={initializePayment}
        className={className}
      />
    );
  }

  // Success state
  if (paymentStatus === "success") {
    return <SuccessState className={className} />;
  }

  // Processing state
  if (paymentStatus === "processing") {
    return <ProcessingState className={className} />;
  }

  // Payment method selection
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <PaymentHeader amount={amount} formatAmount={formatAmount} />

      <PaymentMethodList
        availableMethods={availableMethods}
        selectedMethod={selectedMethod}
        onMethodSelect={handleMethodSelect}
      />

      {selectedMethod === "card" && (
        <CardDetailsForm
          cardDetails={cardDetails}
          onCardDetailsChange={setCardDetails}
        />
      )}

      <PaymentButton
        amount={amount}
        selectedMethod={selectedMethod}
        isProcessing={isProcessing}
        cardDetails={cardDetails}
        formatAmount={formatAmount}
        onPayment={handlePayment}
      />
    </div>
  );
}

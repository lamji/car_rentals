/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

interface UseBlHooksProps {
  method: string[];
  amount: number;
  errorCallBack?: (error: any) => void;
  onSuccess?: (paymentIntent: any) => void;
}

export default function useBlHooks({
  method,
  amount,
  errorCallBack,
  onSuccess,
}: UseBlHooksProps) {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "loading" | "selecting" | "processing" | "success" | "error"
  >("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cvc: "",
    expMonth: "",
    expYear: "",
    holderName: "",
  });

  /**
   * Convert PayMongo API errors to user-friendly messages
   */
  const formatUserFriendlyError = (errorResponse: any): string => {
    if (!errorResponse?.errors || !Array.isArray(errorResponse.errors)) {
      return "Payment processing failed. Please try again.";
    }

    const errorMessages = errorResponse.errors.map((error: any) => {
      const { code, detail, source } = error;

      // Map common PayMongo error codes to user-friendly messages
      switch (code) {
        case "parameter_above_maximum":
          if (source?.attribute === "cvc") {
            return "CVC code is too long. Please enter 3-4 digits only.";
          }
          return "One of the values entered is too long. Please check your input.";

        case "parameter_below_minimum":
          if (source?.attribute === "cvc") {
            return "CVC code is too short. Please enter at least 3 digits.";
          }
          return "One of the values entered is too short. Please check your input.";

        case "parameter_required":
          if (source?.attribute === "card_number") {
            return "Card number is required.";
          }
          if (source?.attribute === "cvc") {
            return "CVC code is required.";
          }
          if (source?.attribute === "exp_month") {
            return "Expiry month is required.";
          }
          if (source?.attribute === "exp_year") {
            return "Expiry year is required.";
          }
          return `${source?.attribute || "Required field"} is missing.`;

        case "parameter_format_invalid":
          if (source?.attribute === "card_number") {
            return "Invalid card number format. Please check your card number.";
          }
          if (source?.attribute === "cvc") {
            return "Invalid CVC format. Please enter 3-4 digits only.";
          }
          if (source?.attribute === "exp_month") {
            return "Invalid expiry month. Please select a valid month (1-12).";
          }
          if (source?.attribute === "exp_year") {
            return "Invalid expiry year. Please select a valid year.";
          }
          return "Invalid format detected. Please check your input.";

        case "card_expired":
          return "Your card has expired. Please use a different card.";

        case "card_declined":
          return "Your card was declined. Please try a different payment method.";

        case "insufficient_funds":
          return "Insufficient funds. Please check your account balance or use a different card.";

        case "invalid_card":
          return "Invalid card details. Please check your card information.";

        case "processing_error":
          return "Payment processing error. Please try again in a few moments.";

        default:
          // Fallback to the original detail message, but make it more user-friendly
          return detail || "Payment error occurred. Please try again.";
      }
    });

    // Join multiple error messages with line breaks
    return errorMessages.join("\n");
  };

  /**
   * Create payment intent with PayMongo API
   */
  const initializePayment = async () => {
    setPaymentStatus("loading");

    try {
      const response = await fetch("/api/test-paymongo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentIntent(result.data);
        setAvailableMethods(method);
        setPaymentStatus("selecting");
      } else {
        setError(result.error || "Failed to initialize payment");
        setPaymentStatus("error");
        errorCallBack?.(result.error);
      }
    } catch (err) {
      const errorMsg = "Failed to initialize payment";
      setError(errorMsg);
      setPaymentStatus("error");
      errorCallBack?.(err);
    }
  };

  /**
   * Handle payment method selection
   */
  const handleMethodSelect = (methodType: string) => {
    setSelectedMethod(methodType);
  };

  /**
   * Process payment with selected method
   */
  const handlePayment = async () => {
    if (!paymentIntent || !selectedMethod) return;

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      const response = await fetch("/api/test-paymongo-attach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          paymentMethodType: selectedMethod,
          ...(selectedMethod === "card" && { cardDetails }),
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.requiresAction && result.nextAction?.redirect) {
          // Redirect to payment provider (GCash, PayMaya, etc.)
          window.location.href = result.nextAction.redirect.url;
        } else {
          setPaymentStatus("success");
          onSuccess?.(result.paymentIntent);
        }
      } else {
        // Format user-friendly error message
        const userFriendlyError = result.details
          ? formatUserFriendlyError(result.details)
          : result.error || "Payment failed";

        setError(userFriendlyError);
        setPaymentStatus("error");

        // Show alert to user
        alert(userFriendlyError);

        errorCallBack?.(result.error || "Payment failed");
      }
    } catch (err) {
      const errorMsg = "Payment processing failed";
      setError(errorMsg);
      setPaymentStatus("error");

      // Show alert to user
      alert(errorMsg);

      errorCallBack?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Format currency amount for display
   */
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount / 100);
  };

  /**
   * Initialize PayMongo payment intent on component mount
   */
  useEffect(() => {
    initializePayment();
  }, []);

  return {
    // State
    paymentStatus,
    isProcessing,
    paymentIntent,
    availableMethods,
    selectedMethod,
    error,
    cardDetails,
    setCardDetails,
    
    // Functions
    handleMethodSelect,
    handlePayment,
    formatAmount,
    initializePayment,
  };
}

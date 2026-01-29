/**
 * Car Rental Payment Example
 * Complete example showing PayMongo integration for car rental bookings
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import {
  DEFAULT_PAYMONGO_CONFIG,
  PaymentMethodSelector,
  formatCurrency,
  usePayment,
} from "../index";
import { PaymentMethodType } from "../types/paymentMethod";

interface CarRentalBooking {
  id: string;
  carId: string;
  carName: string;
  carImage: string;
  dailyRate: number;
  rentalDays: number;
  pickupDate: string;
  returnDate: string;
  userId: string;
}

interface CarRentalPaymentProps {
  booking: CarRentalBooking;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

/**
 * Car Rental Payment Component
 * Complete payment flow for car rental bookings
 */
export function CarRentalPayment({
  booking,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: CarRentalPaymentProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // PayMongo configuration
  const paymongoConfig = {
    publicKey: process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY || "",
    secretKey: process.env.PAYMONGO_SECRET_KEY || "",
    ...DEFAULT_PAYMONGO_CONFIG,
  };

  // Calculate amounts
  const baseAmount = booking.dailyRate * booking.rentalDays * 100; // Convert to cents
  const serviceFee = Math.round(baseAmount * 0.05); // 5% service fee
  const subtotal = baseAmount + serviceFee;

  // Payment hook with callbacks
  const {
    paymentIntent,
    selectedMethod,
    availableMethods,
    isLoading,
    error,
    step,
    initializePayment,
    selectPaymentMethod,
    processPayment,
    calculateTotal,
    getFees,
    resetPayment,
  } = usePayment({
    config: paymongoConfig,
    callbacks: {
      onSuccess: (paymentIntent) => {
        console.log("Payment successful:", paymentIntent);
        onPaymentSuccess(paymentIntent.id);
      },
      onError: (error) => {
        console.error("Payment error:", error);
        onPaymentError(error.message);
      },
      onCancel: () => {
        console.log("Payment canceled");
        resetPayment();
      },
      onProcessing: (paymentIntent) => {
        console.log("Payment processing:", paymentIntent);
      },
    },
  });

  // Initialize payment on component mount
  React.useEffect(() => {
    if (
      !isInitialized &&
      paymongoConfig.publicKey &&
      paymongoConfig.secretKey
    ) {
      initializePayment(
        { value: subtotal, currency: "PHP" },
        {
          bookingId: booking.id,
          userId: booking.userId,
          carId: booking.carId,
          rentalDays: booking.rentalDays,
        },
      );
      setIsInitialized(true);
    }
  }, [isInitialized, initializePayment, subtotal, booking, paymongoConfig]);

  // Handle payment method selection
  const handleMethodSelect = (methodType: PaymentMethodType) => {
    selectPaymentMethod(methodType);
  };

  // Handle payment processing
  const handlePayNow = async () => {
    if (!paymentIntent || !selectedMethod) return;

    // For this example, we'll simulate creating a payment method
    // In a real implementation, you'd collect payment method details from a form
    const mockPaymentMethodId = `pm_${selectedMethod}_${Date.now()}`;

    await processPayment(mockPaymentMethodId);
  };

  // Calculate total with selected method fees
  const totalWithFees = selectedMethod
    ? calculateTotal(subtotal, selectedMethod)
    : subtotal;
  const paymentFees = selectedMethod ? getFees(subtotal, selectedMethod) : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Booking Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

        <div className="flex items-center space-x-4 mb-4">
          <img
            src={booking.carImage}
            alt={booking.carName}
            className="w-20 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-medium">{booking.carName}</h3>
            <p className="text-sm text-gray-600">
              {booking.pickupDate} - {booking.returnDate}
            </p>
            <p className="text-sm text-gray-600">
              {booking.rentalDays} {booking.rentalDays === 1 ? "day" : "days"}
            </p>
          </div>
          <Badge variant="secondary">Booking #{booking.id.slice(-6)}</Badge>
        </div>

        <Separator className="my-4" />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Daily Rate × {booking.rentalDays} days</span>
            <span>{formatCurrency(baseAmount, "PHP")}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>{formatCurrency(serviceFee, "PHP")}</span>
          </div>
          {paymentFees > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment Processing Fee</span>
              <span>{formatCurrency(paymentFees, "PHP")}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(totalWithFees, "PHP")}</span>
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      {step === "select_method" && availableMethods.length > 0 && (
        <Card className="p-6">
          <PaymentMethodSelector
            methods={availableMethods}
            selectedMethod={selectedMethod}
            baseAmount={subtotal}
            currency="PHP"
            onSelectMethod={handleMethodSelect}
            onCalculateFees={getFees}
            disabled={isLoading}
          />
        </Card>
      )}

      {/* Payment Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel Booking
        </Button>

        <Button
          onClick={handlePayNow}
          disabled={!selectedMethod || isLoading || step !== "select_method"}
          className="flex-1"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            `Pay ${formatCurrency(totalWithFees, "PHP")}`
          )}
        </Button>
      </div>

      {/* Payment Status */}
      {step === "processing" && (
        <Card className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="font-medium mb-2">Processing Payment</h3>
          <p className="text-sm text-gray-600">
            Please wait while we process your payment...
          </p>
        </Card>
      )}

      {step === "completed" && (
        <Card className="p-6 text-center border-green-200 bg-green-50">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="font-medium text-green-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-sm text-green-700">
            Your car rental booking has been confirmed.
          </p>
        </Card>
      )}

      {step === "failed" && error && (
        <Card className="p-6 text-center border-red-200 bg-red-50">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
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
          <h3 className="font-medium text-red-900 mb-2">Payment Failed</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              resetPayment();
              setIsInitialized(false);
            }}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {!isInitialized && (
        <Card className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="font-medium mb-2">Initializing Payment</h3>
          <p className="text-sm text-gray-600">
            Setting up your payment options...
          </p>
        </Card>
      )}
    </div>
  );
}

// Example usage in a page component
export function ExampleUsage() {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const mockBooking: CarRentalBooking = {
    id: "booking_123456",
    carId: "car_789",
    carName: "Toyota Camry 2024",
    carImage: "/images/cars/toyota-camry.jpg",
    dailyRate: 250000, // PHP 2,500.00 in cents
    rentalDays: 3,
    pickupDate: "2024-02-01",
    returnDate: "2024-02-04",
    userId: "user_456",
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentStatus("success");
    setMessage(`Payment successful! Payment ID: ${paymentIntentId}`);

    // Here you would typically:
    // 1. Update booking status in database
    // 2. Send confirmation email
    // 3. Redirect to booking confirmation page
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus("error");
    setMessage(error);
  };

  const handleCancel = () => {
    // Handle booking cancellation
    console.log("Booking canceled");
  };

  if (paymentStatus === "success") {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <Button onClick={() => setPaymentStatus("idle")}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <CarRentalPayment
        booking={mockBooking}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onCancel={handleCancel}
      />
      {/* 
      <PayMongoService {{

        method:["gcash"],
        key: {
          secretKey: "sk_test_1234567890",
          publicKey: "pk_test_1234567890"
        },
        endpoints:{

        },
        redirect:{
          success: '/payment/success',
          cancel: '/payment/cancel'
        },
        callbackError: (err) => console.log(err)
      }} /> */}
    </>
  );
}

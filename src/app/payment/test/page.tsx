/**
 * PayMongo Payment Test Page
 * Simplified test page with only the PayMongo component
 */

"use client";

import { PayMongoService } from "@/lib/npm-ready-stack/paymongoService";
import { useState } from "react";

// Mock booking data for testing
const mockBooking = {
  dailyRate: 250000, // PHP 2,500.00 in cents
  rentalDays: 3,
};

export default function PaymentTestPage() {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  // Calculate amounts
  const baseAmount = mockBooking.dailyRate * mockBooking.rentalDays;
  const serviceFee = Math.round(baseAmount * 0.05); // 5% service fee
  const subtotal = baseAmount + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <PayMongoService
          method={["gcash", "paymaya", "grab_pay", "card"]}
          amount={subtotal}
          errorCallBack={(err: any) => {
            console.log("Payment Error:", err);
            setPaymentStatus("error");
            setMessage(err.message || "Payment failed");
          }}
          onSuccess={(paymentIntent: any) => {
            console.log("Payment Success:", paymentIntent);
            setPaymentStatus("success");
            setMessage(`Payment successful! ID: ${paymentIntent.id}`);
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  HelpCircle,
  Truck,
  UserCheck
} from "lucide-react";
import { useState } from "react";

/**
 * HowBookingWorksDialog component
 * Displays a floating question mark icon that opens a dialog
 * explaining the full booking process step by step
 */
export function HowBookingWorksDialog() {
  const [open, setOpen] = useState(false);

  const steps = [
    {
      icon: <Car className="h-6 w-6 text-blue-600" />,
      title: "1. Browse & Select a Car",
      description:
        "Our system automatically shows cars available within your current location radius. Explore vehicles near you, filter by category, check availability, and choose the perfect car for your needs.",
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "2. Car on Hold",
      description:
        "Once you select a car, the car is placed on hold for 2 minutes to prevent double booking. Complete your booking within this time, or the car will become available again for other users.",
      color: "bg-orange-50 border-orange-200",
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: "3. Complete Your Booking Details",
      description: (
        <div>
          Select your start and end dates with preferred times (minimum 12 hours). Then choose:
          <br /><br />
          • Pickup Method: Pick up from our garage for free, or have the car delivered to your location for a small fee
          <br /><br />
          • Driver Option: Some cars come with a professional driver, or choose self-drive to hit the road on your own
        </div>
      ),
      color: "bg-green-50 border-green-200",
    },
    {
      icon: <CreditCard className="h-6 w-6 text-pink-600" />,
      title: "4. Customer Information",
      description: (
        <div>
          Provide your personal details and complete the verification process. For self-drive rentals, you&apos;ll need:
          <br /><br />
          • Valid Driver&apos;s License ID (have screenshot ready to upload)
          <br />
          • LTO Portal verification (have screenshot ready to upload)
          <br />
          • Contact information and address
        </div>
      ),
      color: "bg-pink-50 border-pink-200",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
      title: "5. Review & Pay",
      description: (
        <div>
          Review your booking summary with a full price breakdown, then complete your down payment online.
          <br /><br />
          • Pay down payment to secure booking
          <br />
          • Wait for approval (refund sent immediately if disapproved)
          <br />
          • Expect a call or text from the car owner, or you can call the owner if needed or has questions
          <br />
          • Once approved: no cancellation or no refund if cancelled
        </div>
      ),
      color: "bg-emerald-50 border-emerald-200",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      title: "6. Confirmation & Enjoy!",
      description:
        "Receive your booking confirmation via email with the contract attached. Pick up or receive your car and enjoy your ride!",
      color: "bg-blue-50 border-blue-200",
    },
  ];

  const pricingInfo = [
    {
      icon: <Clock className="h-4 w-4 text-gray-600" />,
      label: "12-Hour Rate",
      detail: "For rentals up to 12 hours",
    },
    {
      icon: <Clock className="h-4 w-4 text-gray-600" />,
      label: "24-Hour Rate",
      detail: "For rentals from 12 to 24 hours",
    },
    {
      icon: <Clock className="h-4 w-4 text-gray-600" />,
      label: "Multi-Day",
      detail: "24-hour rate × number of days",
    },
    {
      icon: <Clock className="h-4 w-4 text-gray-600" />,
      label: "Excess Hours",
      detail: "Charged per hour beyond the package",
    },
    {
      icon: <Truck className="h-4 w-4 text-gray-600" />,
      label: "Delivery Fee",
      detail: "Based on distance (self-drive only)",
    },
    {
      icon: <UserCheck className="h-4 w-4 text-gray-600" />,
      label: "Driver Fee",
      detail: "Per day for cars with driver",
    },
  ];

  return (
    <>
      {/* Floating Question Mark Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-15 right-2 z-9999 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-200 active:scale-95"
        aria-label="How booking works"
      >
        <HelpCircle className="h-7 w-7" />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              How Booking Works
            </DialogTitle>
            <DialogDescription>
              Follow these simple steps to rent a car with us.
            </DialogDescription>
          </DialogHeader>

          {/* Steps */}
          <div className="space-y-3 mt-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${step.color}`}
              >
                <div className="shrink-0 mt-0.5">{step.icon}</div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Info */}
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">
              Pricing Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {pricingInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-gray-50 rounded-md border border-gray-100"
                >
                  <div className="shrink-0 mt-0.5">{info.icon}</div>
                  <div>
                    <div className="font-medium text-xs text-gray-900">
                      {info.label}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {info.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Tips */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-amber-900 mb-1">
              Tips
            </h4>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>- Minimum rental duration is 12 hours</li>
              <li>- Driver fee only applies after 12+ excess hours per day</li>
              <li>- Delivery is available for self-drive cars only</li>
              <li>- Blocked dates on the calendar are unavailable</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

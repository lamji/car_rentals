"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BookingSteps } from "@/components/booking/BookingSteps";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";
import { useFulfillmentValidation } from "@/hooks/useFulfillmentValidation";
import { usePricing } from "@/hooks/usePricing";

function makeReference() {
  return `BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { draft, addBooking, clearDraft } = useBooking();

  const car = useCar(draft.carId ?? "");
  const validation = useFulfillmentValidation(draft.fulfillment);

  const pricing = usePricing({
    startDate: draft.startDate ?? "",
    endDate: draft.endDate ?? "",
    pricePerDay: car?.pricePerDay ?? 0,
    deliveryFee: draft.fulfillment?.type === "delivery" ? 15 : 0,
  });

  const canConfirm = Boolean(car && draft.location && draft.startDate && draft.endDate && validation.valid);

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-lg font-semibold">No booking in progress</div>
            <Button asChild className="mt-4">
              <Link href="/">Start a search</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <BookingSteps activeIndex={4} />
            <div>
              <div className="text-xl font-semibold">Booking summary</div>
              <div className="text-sm text-muted-foreground">Review everything before confirming</div>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/cars/${encodeURIComponent(car.id)}/fulfillment`}>Back</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Car</div>
                <div className="text-lg font-semibold">{car.name} {car.year}</div>
                <div className="mt-2 text-sm text-muted-foreground">{car.seats} seats • {car.transmission}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Dates</div>
                <div className="text-base font-medium">{draft.startDate} → {draft.endDate}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Fulfillment</div>
                <div className="text-base font-medium">{draft.fulfillment?.type === "delivery" ? "Delivery" : "Pickup"}</div>
                {draft.fulfillment?.type === "delivery" ? (
                  <div className="mt-2 text-sm text-muted-foreground">Address: {draft.fulfillment.deliveryAddress}</div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground">Garage: {car.garageAddress}</div>
                )}
              </CardContent>
            </Card>

            {!validation.valid ? (
              <div className="text-sm text-destructive">{validation.reason}</div>
            ) : null}
          </div>

          <div className="space-y-4">
            <PriceBreakdown
              days={pricing.days}
              pricePerDay={car.pricePerDay}
              rentCost={pricing.rentCost}
              deliveryFee={pricing.deliveryFee}
              total={pricing.total}
            />

            <Button
              disabled={!canConfirm}
              className="w-full"
              onClick={() => {
                if (!canConfirm) return;

                const booking = {
                  reference: makeReference(),
                  createdAt: new Date().toISOString(),
                  carId: car.id,
                  location: draft.location!,
                  startDate: draft.startDate!,
                  endDate: draft.endDate!,
                  fulfillment: draft.fulfillment!,
                  pricing: {
                    days: pricing.days,
                    pricePerDay: car.pricePerDay,
                    rentCost: pricing.rentCost,
                    deliveryFee: pricing.deliveryFee,
                    total: pricing.total,
                  },
                };

                addBooking(booking);
                clearDraft();
                router.push(`/booking/success?ref=${encodeURIComponent(booking.reference)}`);
              }}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

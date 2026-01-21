"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { BookingSteps } from "@/components/booking/BookingSteps";
import { FulfillmentSelector } from "@/components/booking/FulfillmentSelector";
import { StickyBottomCTA } from "@/components/booking/StickyBottomCTA";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";
import { useFulfillmentValidation } from "@/hooks/useFulfillmentValidation";
import { usePricing } from "@/hooks/usePricing";

export default function FulfillmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { draft, patchDraft } = useBooking();

  const car = useCar(params.id);

  const pricing = usePricing({
    startDate: draft.startDate ?? "",
    endDate: draft.endDate ?? "",
    pricePerDay: car?.pricePerDay ?? 0,
    deliveryFee: draft.fulfillment?.type === "delivery" ? 15 : 0,
  });

  const validation = useFulfillmentValidation(draft.fulfillment);

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-lg font-semibold">Car not found</div>
            <Button asChild className="mt-4">
              <Link href="/cars">Back to results</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <BookingSteps activeIndex={3} />
            <div>
              <div className="text-xl font-semibold">Pickup or delivery</div>
              <div className="text-sm text-muted-foreground">Choose how you’ll get the car</div>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/cars/${encodeURIComponent(car.id)}?location=${encodeURIComponent(draft.location ?? "")}&start=${encodeURIComponent(draft.startDate ?? "")}&end=${encodeURIComponent(draft.endDate ?? "")}`}>Back</Link>
          </Button>
        </div>

        <FulfillmentSelector
          garageAddress={car.garageAddress}
          value={draft.fulfillment}
          onChange={(next) => patchDraft({ fulfillment: next })}
        />

        {!validation.valid ? (
          <div className="mt-3 text-sm text-destructive">{validation.reason}</div>
        ) : null}
      </div>

      <StickyBottomCTA
        label="Continue to Summary"
        total={pricing.total}
        disabled={!validation.valid}
        onClick={() => {
          router.push("/checkout");
        }}
      />
    </div>
  );
}

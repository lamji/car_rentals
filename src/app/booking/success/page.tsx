"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooking } from "@/hooks/useBooking";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const { bookings, latestBooking } = useBooking();

  const booking = bookings.find((b) => b.reference === ref) ?? latestBooking;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Booking confirmed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground">Booking reference</div>
              <div className="text-xl font-semibold">{booking?.reference ?? ref ?? "—"}</div>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/bookings">View booking</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}

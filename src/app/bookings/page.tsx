"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";

function BookingRow(props: { reference: string }) {
  const { bookings } = useBooking();
  const booking = bookings.find((b) => b.reference === props.reference);
  const car = useCar(booking?.carId ?? "");

  if (!booking) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Reference</div>
            <div className="text-lg font-semibold">{booking.reference}</div>
            <div className="mt-2 text-sm">
              {car ? `${car.name} ${car.year}` : booking.carId}
            </div>
            <div className="text-sm text-muted-foreground">{booking.startDate} → {booking.endDate}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-semibold">${booking.pricing.total}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BookingsPage() {
  const { bookings } = useBooking();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">My bookings</div>
            <div className="text-sm text-muted-foreground">Stored locally on this device</div>
          </div>
          <Button asChild variant="secondary">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {bookings.map((b) => (
            <BookingRow key={b.reference} reference={b.reference} />
          ))}

          {bookings.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No bookings yet</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/">Start a booking</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

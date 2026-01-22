"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { BookingSteps } from "@/components/booking/BookingSteps";
import { DateRangePicker } from "@/components/search/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LocationModal } from "@/components/location/LocationModal";
import { useBooking } from "@/hooks/useBooking";
import { useCar } from "@/hooks/useCar";

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { draft, patchDraft } = useBooking();

  const car = useCar(params.id);

  const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);
  const [location, setLocation] = React.useState<string>(draft.location ?? "");
  const [startDate, setStartDate] = React.useState<string>(draft.startDate ?? "");
  const [endDate, setEndDate] = React.useState<string>(draft.endDate ?? "");
  const [startTime, setStartTime] = React.useState<string>(draft.startTime ?? "10:00");
  const [duration, setDuration] = React.useState<"12hours" | "24hours">(draft.duration ?? "12hours");

  const [errors, setErrors] = React.useState<{ location?: string; dates?: string; time?: string; duration?: string }>({});

  const isSameDay = Boolean(startDate && endDate && startDate === endDate);

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

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 6);
    maxDate.setHours(0, 0, 0, 0);

    return date.getTime() < today.getTime() || date.getTime() > maxDate.getTime();
  };

  const validateAndContinue = () => {
    const nextErrors: { location?: string; dates?: string; time?: string; duration?: string } = {};

    if (!location.trim()) nextErrors.location = "Address is required";
    if (!startDate || !endDate) nextErrors.dates = "Pick-up and return dates are required";
    if (!startTime.trim()) nextErrors.time = "Start time is required";
    if (startDate && endDate && startDate === endDate && !duration) nextErrors.duration = "Select 12h or 24h";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    patchDraft({
      carId: car.id,
      location,
      startDate,
      endDate,
      startTime,
      duration: startDate === endDate ? duration : undefined,
    });

    router.push(`/cars/${encodeURIComponent(car.id)}/fulfillment`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <BookingSteps activeIndex={2} />
            <div>
              <div className="text-xl font-semibold">Booking details</div>
              <div className="text-sm text-muted-foreground">Add address first, then choose dates and time</div>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/cars/${encodeURIComponent(car.id)}`}>Back</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">Step 1 — Address</div>
                <div className={`rounded-lg border bg-card p-4 ${errors.location ? "border-destructive" : ""}`}>
                  {location ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">Your address</div>
                        <div className="font-medium">{location}</div>
                      </div>
                      <Button variant="outline" onClick={() => setIsLocationModalOpen(true)}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setIsLocationModalOpen(true)}>
                      Add address
                    </Button>
                  )}
                </div>
                {errors.location ? <p className="text-sm text-destructive">{errors.location}</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">Step 2 — Dates</div>
                <div className={errors.dates ? "border border-destructive rounded-md" : ""}>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    unavailableDates={car.availability.unavailableDates}
                    onChange={(next) => {
                      setStartDate(next.startDate);
                      setEndDate(next.endDate);
                      if (errors.dates) setErrors((prev) => ({ ...prev, dates: undefined }));
                    }}
                    disabled={disabledDays}
                  />
                </div>
                {errors.dates ? <p className="text-sm text-destructive">{errors.dates}</p> : null}
              </div>
            </CardContent>
          </Card>

          {isSameDay ? (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Step 3 — Duration (same-day only)</div>
                  <RadioGroup value={duration} onValueChange={(value) => setDuration(value as "12hours" | "24hours")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="12hours" id="12hours" />
                      <Label htmlFor="12hours" className="cursor-pointer">12 hours</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="24hours" id="24hours" />
                      <Label htmlFor="24hours" className="cursor-pointer">24 hours</Label>
                    </div>
                  </RadioGroup>
                  {errors.duration ? <p className="text-sm text-destructive">{errors.duration}</p> : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">Step {isSameDay ? "4" : "3"} — Start time</div>
                <div className={`rounded-lg border bg-card p-4 ${errors.time ? "border-destructive" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">Pick-up / Delivery time</div>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                      }}
                      className="rounded-md border bg-background px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                {errors.time ? <p className="text-sm text-destructive">{errors.time}</p> : null}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={validateAndContinue} className="min-w-40">
              Continue
            </Button>
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={(newLocation) => {
          setLocation(newLocation);
          if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
        }}
        initialData={{ region: location }}
      />
    </div>
  );
}

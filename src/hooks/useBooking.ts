"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Booking } from "@/lib/types";
import type { BookingDraft } from "@/lib/types/booking";
import { canUseDom, safeJsonParse } from "@/lib/storage";

const BOOKINGS_KEY = "car_rentals_bookings";
const DRAFT_KEY = "car_rentals_draft";

export function useBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [draft, setDraft] = useState<BookingDraft>({});

  useEffect(() => {
    if (!canUseDom()) return;
    const storedBookings = safeJsonParse<Booking[]>(localStorage.getItem(BOOKINGS_KEY)) ?? [];
    setBookings(storedBookings);

    const storedDraft = safeJsonParse<BookingDraft>(localStorage.getItem(DRAFT_KEY)) ?? {};
    setDraft(storedDraft);
  }, []);

  const persistDraft = useCallback((next: BookingDraft) => {
    setDraft(next);
    if (!canUseDom()) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  }, []);

  const patchDraft = useCallback(
    (patch: Partial<BookingDraft>) => {
      persistDraft({
        ...draft,
        ...patch,
      });
    },
    [draft, persistDraft]
  );

  const clearDraft = useCallback(() => {
    setDraft({});
    if (!canUseDom()) return;
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    const next = [booking, ...bookings];
    setBookings(next);
    if (!canUseDom()) return;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
  }, [bookings]);

  const latestBooking = useMemo(() => bookings[0] ?? null, [bookings]);

  return {
    bookings,
    latestBooking,
    draft,
    patchDraft,
    clearDraft,
    addBooking,
  };
}

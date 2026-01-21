"use client";

import Link from "next/link";
import { Car, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Car className="h-6 w-6" />
          Book a Ride
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/bookings" className="relative">
              <Calendar className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

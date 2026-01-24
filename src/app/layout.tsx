import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { GeolocationWrapper } from "@/components/providers/GeolocationWrapper";
import { GeolocationTest } from "@/components/debug/GeolocationTest";
import { LocationPermissionBanner } from "@/components/ui/LocationPermissionBanner";
import { MessengerAlertWrapper } from "@/components/ui/MessengerAlertWrapper";
import { GlobalLoaderOverlay } from "@/components/ui/GlobalLoaderOverlay";
import { AlertModal } from "@/components/ui/AlertModal";
import { ConfirmationModal } from "@/components/modal/ConfirmationModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book a Ride",
  description: "Search, book, and manage car rentals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <GeolocationWrapper>
            <LocationPermissionBanner />
            <Header />
            <GlobalLoaderOverlay />
            {children}
            <GeolocationTest />
            <MessengerAlertWrapper />
            <AlertModal />
            <ConfirmationModal />
          </GeolocationWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}

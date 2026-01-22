import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { GeolocationWrapper } from "@/components/providers/GeolocationWrapper";
import { GeolocationTest } from "@/components/debug/GeolocationTest";
import { LocationPermissionBanner } from "@/components/ui/LocationPermissionBanner";

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
            {children}
            <GeolocationTest />
          </GeolocationWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { LayoutContent } from "@/components/layout/LayoutContent";
import { GeolocationWrapper } from "@/components/providers/GeolocationWrapper";
import ReduxProvider from "@/components/providers/ReduxProvider";
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
  title: "Car Rentals - Book Your Perfect Ride",
  description: "Search, book, and manage car rentals with ease",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Car Rentals"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport = {
  themeColor: "#0C2C55",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
            <LayoutContent>
              {children}
            </LayoutContent>
          </GeolocationWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}

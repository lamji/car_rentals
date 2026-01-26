"use client";

import { useRouter } from "next/navigation";
import { Car, Calendar, User, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  state?: {
    location?: string;
  };
  setIsLocationModalOpen?: (open: boolean) => void;
  handleLocationChange?: (value: string) => void;
  handleClearLocation?: () => void;
}

export function Header({ 
  state = { location: "" },
  setIsLocationModalOpen = () => {},
  handleClearLocation = () => {},
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile Header */}
      <div className="sm:hidden">
        <div className="flex items-center px-2 py-4 gap-2">
          {/* Logo */}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 flex-shrink-0 bg-primary p-2 rounded-lg"
          >
            <Car className="h-7 w-7 sm:h-6 sm:w-6 text-primary-foreground" />
          </button>
          
          {/* Search Bar - takes remaining space */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <div
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full pl-10 pr-10 h-9 bg-gray-100 border border-black flex items-center cursor-pointer text-gray-900 placeholder-gray-500 rounded-md"
              >
                {state.location ? (
                  <span className="text-gray-900 truncate">{state.location}</span>
                ) : (
                  <span className="text-gray-500 truncate">Search location...</span>
                )}
              </div>
              {state.location && (
                <button
                  onClick={handleClearLocation}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 relative" 
              onClick={() => router.push('/bookings')}
            >
              <Calendar className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                3
              </Badge>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => router.push('/login')}
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block">
        <div className="flex w-full items-center justify-between px-4 py-3">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Car className="h-6 w-6" />
            <span>Book a Ride</span>
          </button>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative" 
              onClick={() => router.push('/bookings')}
            >
              <Calendar className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { Home, Calendar, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBottomNavigation } from "@/hooks/useBottomNavigation";
import { BottomNavigationProps } from "@/lib/types/navigation";
import { usePathname } from "next/navigation";

export function BottomNavigation({ className }: BottomNavigationProps) {
  const pathname = usePathname();
  const { navItems, handleNavClick, isActiveItem } = useBottomNavigation();

  // Hide bottom navigation on car detail pages and profile page
  const isCarDetailPage = /^\/cars\/[^\/]+$/.test(pathname);
  const isProfilePage = pathname === '/profile';
  
  if (isCarDetailPage || isProfilePage) {
    return null;
  }

  const getIcon = (itemId: string) => {
    switch (itemId) {
      case "home":
        return Home;
      case "bookings":
        return Calendar;
      case "profile":
        return User;
      case "login":
        return UserPlus;
      default:
        return Home;
    }
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg",
      "md:hidden", // Only show on mobile
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = getIcon(item.id);
          const isActive = isActiveItem(item.id);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-200",
                isActive && "text-primary bg-primary/10 hover:bg-primary/20"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive && "text-primary"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive && "text-primary"
              )}>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;

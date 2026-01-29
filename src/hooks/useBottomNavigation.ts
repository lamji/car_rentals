import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { NavItem } from "@/lib/types/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { setActiveItem } from "@/lib/slices/navigationSlice";
import { useAuth } from "@/hooks/useAuth";

export function useBottomNavigation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeItem = useAppSelector((state) => state.navigation.activeItem);
  const { isAuthenticated } = useAuth();
  
  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/",
    },
    {
      id: "bookings",
      label: "Bookings",
      href: "/bookings",
    },
    {
      id: isAuthenticated ? "profile" : "login",
      label: isAuthenticated ? "Profile" : "Login",
      href: isAuthenticated ? "/profile" : "/login",
    },
  ];

  const handleNavClick = useCallback((item: NavItem) => {
    // Update Redux state
    dispatch(setActiveItem(item.id));
    
    if (item.onClick) {
      item.onClick();
    } else {
      // Handle dynamic redirection for profile/login
      if (item.id === 'profile' || item.id === 'login') {
        if (isAuthenticated) {
          router.push('/profile');
        } else {
          router.push('/login');
        }
      } else if (item.href) {
        router.push(item.href);
      }
    }
  }, [router, dispatch, isAuthenticated]);

  const isActiveItem = useCallback((itemId: string) => {
    return activeItem === itemId;
  }, [activeItem]);

  return {
    navItems,
    handleNavClick,
    isActiveItem,
    activeItem,
  };
}

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '@/lib/store';
import { setActiveItem } from '@/lib/slices/navigationSlice';

export function useUrlBasedNavigation() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Map URL paths to navigation item IDs
    const pathToNavItem: Record<string, string> = {
      '/': 'home',
      '/home': 'home',
      '/bookings': 'bookings',
      '/profile': 'profile',
      '/login': 'login',
    };

    // Find the matching navigation item for current path
    const activeItem = pathToNavItem[pathname] || 'home';
    
    // Update Redux state
    dispatch(setActiveItem(activeItem));
  }, [pathname, dispatch]);
}

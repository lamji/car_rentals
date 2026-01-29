import { UserData } from '@/lib/data/user';

export interface UserProfile extends UserData {
  fullName: string;
  memberSince: string;
  totalBookings: number;
}

export interface ProfileStats {
  totalBookings: number;
  completedTrips: number;
  cancelledTrips: number;
  totalSpent: number;
}

export interface ProfileMenuItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
}

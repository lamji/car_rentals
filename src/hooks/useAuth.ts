import { mockUserData } from '@/lib/data/user';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export function useAuth() {
  const user = useSelector((state: RootState) => state.auth?.user) || null;
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated) || false;
  const isLoading = false;
  
  // Development override - simulate logged in user (set to false for real auth)
  const simulateAuth = false;
  const mockUser = simulateAuth ? {
    id: mockUserData.id,
    name: `${mockUserData.firstName} ${mockUserData.lastName}`,
    email: mockUserData.email,
    photo: mockUserData.profilePhoto
  } : null;
  
  const simulatedAuth = simulateAuth ? true : isAuthenticated;
  const displayUser = simulateAuth ? mockUser : user;
  
  return {
    user: displayUser,
    isAuthenticated: simulatedAuth,
    isLoading,
  };
}

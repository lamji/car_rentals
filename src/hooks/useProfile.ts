import { useMockApi } from '@/hooks/mock/useMockApi';
import { useConfirmation } from '@/hooks/useConfirmation';
import { mockUserData } from '@/lib/data/user';
import { showAlert } from '@/lib/slices/alertSlice';
import { useAppDispatch } from '@/lib/store';
import { UserProfile } from '@/lib/types/profile';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for managing user profile data and authentication actions
 * Provides user profile information, logout functionality, and account deletion
 * @returns {Object} Object containing userProfile, handleLogout, and handleDelete
 * @returns {UserProfile} returns.userProfile - User profile data with name, email, etc.
 * @returns {Function} returns.handleLogout - Function to handle user logout with confirmation
 * @returns {Function} returns.handleDelete - Function to handle account deletion with confirmation
 */
export function useProfile() {
  const { simulateApiCall } = useMockApi();
  const { showConfirmation } = useConfirmation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  /**
 * User profile data constructed from mock user data
 * Includes formatted full name, member since date, and booking count
 */
  const userProfile: UserProfile = {
    ...mockUserData,
    fullName: `${mockUserData.firstName} ${mockUserData.lastName}`,
    memberSince: new Date(mockUserData.dateJoined).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    }),
    totalBookings: 0, // This would come from bookings data
  };

  /**
 * Handles user logout process with confirmation dialog, mock API call, and user feedback
 * Shows confirmation dialog, simulates logout API, and displays appropriate alerts
 * @returns {void} No return value - handles side effects only
 */
  const handleLogout = () => {
    // Show confirmation dialog for logout
    showConfirmation({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          // Simulate API call for logout with 1 second delay
          const response = await simulateApiCall(
            { timeoutMs: 1000, loaderMessage: 'Logging out...' },
            () => ({
              success: true,
              message: 'Successfully logged out'
            })
          );

          // If logout is successful, show success alert and redirect
          if (response.success) {
            console.log('✅ useProfile: Dispatching success alert');
            dispatch(showAlert({
              type: 'success',
              title: 'Success',
              message: 'You have been logged out successfully',
              duration: 3000
            }));
            router.push('/');
          }
        } catch (error) {
          // If logout fails, show error alert
          dispatch(showAlert({
            type: 'error',
            title: 'Error',
            message: 'Failed to logout. Please try again.',
            duration: 5000
          }));
        }
      }
    });
  }

  /**
 * Handles account deletion process with confirmation dialog, mock API call, and user feedback
 * Shows confirmation dialog, simulates API deletion, and displays appropriate alerts
 * @returns {void} No return value - handles side effects only
 */
  const handleDelete = () => {
    // Show confirmation dialog for account deletion
    showConfirmation({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          // Simulate API call for account deletion with 1.5 second delay
          const response = await simulateApiCall(
            { timeoutMs: 1500, loaderMessage: 'Deleting account...' },
            () => ({
              success: true,
              message: 'Account successfully deleted'
            })
          );

          // If deletion is successful, show success alert and redirect
          if (response.success) {
            dispatch(showAlert({
              type: 'success',
              title: 'Success',
              message: 'Your account has been deleted successfully',
              duration: 3000
            }));
            router.push('/');
          }
        } catch (error) {
          // If deletion fails, show error alert
          dispatch(showAlert({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete account. Please try again.',
            duration: 5000
          }));
        }
      }
    });
  }
  return {
    userProfile,
    handleLogout,
    handleDelete,
  };
}

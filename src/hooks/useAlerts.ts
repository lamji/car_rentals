import { useDispatch } from 'react-redux';
import { showAlert, removeAlert, clearAllAlerts } from '@/lib/slices/alertSlice';
import type { AlertType } from '@/lib/slices/alertSlice';

export function useAlerts() {
  const dispatch = useDispatch();

  const showSuccessAlert = (title: string, message: string, duration?: number) => {
    dispatch(showAlert({
      type: 'success',
      title,
      message,
      duration: duration || 5000, // Default 5 seconds
    }));
  };

  const showErrorAlert = (title: string, message: string, duration?: number) => {
    dispatch(showAlert({
      type: 'error',
      title,
      message,
      duration: duration || 0, // No auto-dismiss for errors
    }));
  };

  const showWarningAlert = (title: string, message: string, duration?: number) => {
    dispatch(showAlert({
      type: 'warning',
      title,
      message,
      duration: duration || 4000, // Default 4 seconds
    }));
  };

  const showInfoAlert = (title: string, message: string, duration?: number) => {
    dispatch(showAlert({
      type: 'info',
      title,
      message,
      duration: duration || 3000, // Default 3 seconds
    }));
  };

  const showAlertWithAction = (
    type: AlertType,
    title: string,
    message: string,
    actionLabel: string,
    actionCallback: () => void,
    duration?: number
  ) => {
    dispatch(showAlert({
      type,
      title,
      message,
      duration: duration || 0, // No auto-dismiss for alerts with actions
      action: {
        label: actionLabel,
        onClick: actionCallback,
      },
    }));
  };

  const hideAlert = (id: string) => {
    dispatch(removeAlert(id));
  };

  const clearAlerts = () => {
    dispatch(clearAllAlerts());
  };

  return {
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
    showAlertWithAction,
    hideAlert,
    clearAlerts,
  };
}

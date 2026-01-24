import { store } from "./store";
import { openConfirmation } from "./slices/confirmationSlice";
import type { ConfirmationOptions } from "./slices/confirmationSlice";

/**
 * Global function to show a confirmation modal from anywhere in the app.
 * This can be called outside of React components.
 */
export function showConfirmation(options: ConfirmationOptions) {
  store.dispatch(openConfirmation(options));
}

/**
 * Predefined confirmation types for common use cases
 */
export const confirmations = {
  delete: (itemName: string, onConfirm?: () => void | Promise<void>) =>
    showConfirmation({
      title: "Delete Item",
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm,
    }),

  save: (itemName: string, onConfirm?: () => void | Promise<void>) =>
    showConfirmation({
      title: "Save Changes",
      message: `Do you want to save your changes to "${itemName}"?`,
      confirmText: "Save",
      cancelText: "Cancel",
      variant: "default",
      onConfirm,
    }),

  discard: (itemName: string, onConfirm?: () => void | Promise<void>) =>
    showConfirmation({
      title: "Discard Changes",
      message: `Are you sure you want to discard your changes to "${itemName}"?`,
      confirmText: "Discard",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm,
    }),

  logout: (onConfirm?: () => void | Promise<void>) =>
    showConfirmation({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "default",
      onConfirm,
    }),
};

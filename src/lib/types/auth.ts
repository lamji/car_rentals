export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShouldOpen?: () => void; // Callback to notify parent to open modal
}

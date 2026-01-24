export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShouldOpen?: () => void; // Callback to notify parent to open modal
}

export type ForgotPasswordStep = "email" | "otp" | "password";

export type UseForgotPasswordFlowArgs = {
  isOpen: boolean;
  onClose: () => void;
  onShouldOpen?: () => void;
};

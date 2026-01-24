import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConfirmationOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  isConfirming: boolean;
}

const initialState: ConfirmationState = {
  isOpen: false,
  options: null,
  isConfirming: false,
};

const confirmationSlice = createSlice({
  name: 'confirmation',
  initialState,
  reducers: {
    openConfirmation: (state, action: PayloadAction<ConfirmationOptions>) => {
      state.isOpen = true;
      state.options = action.payload;
    },
    closeConfirmation: (state) => {
      state.isOpen = false;
      state.options = null;
      state.isConfirming = false;
    },
    setConfirming: (state, action: PayloadAction<boolean>) => {
      state.isConfirming = action.payload;
    },
  },
});

export const { openConfirmation, closeConfirmation, setConfirming } = confirmationSlice.actions;
export default confirmationSlice.reducer;

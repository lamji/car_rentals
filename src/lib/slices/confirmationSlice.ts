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
  options: Omit<ConfirmationOptions, 'onConfirm' | 'onCancel'> | null;
  isConfirming: boolean;
}

// Module-level variable to store callbacks outside Redux (avoids serialization issues)
let _confirmationCallbacks: {
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
} = {};

export function getConfirmationCallbacks() {
  return _confirmationCallbacks;
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
      // Store only serializable options in Redux
      const { onConfirm, onCancel, ...serializableOptions } = action.payload;
      state.options = serializableOptions;
      // Store callbacks outside Redux (module-level)
      _confirmationCallbacks = { onConfirm, onCancel };
    },
    closeConfirmation: (state) => {
      state.isOpen = false;
      state.options = null;
      state.isConfirming = false;
      _confirmationCallbacks = {};
    },
    updateConfirmationMessage: (state, action: PayloadAction<string>) => {
      if (state.options) {
        state.options.message = action.payload;
      }
    },
    setConfirming: (state, action: PayloadAction<boolean>) => {
      state.isConfirming = action.payload;
    },
  },
});

export const { openConfirmation, closeConfirmation, updateConfirmationMessage, setConfirming } = confirmationSlice.actions;
export default confirmationSlice.reducer;

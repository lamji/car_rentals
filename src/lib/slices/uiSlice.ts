import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  isLocationModalOpen: boolean;
}

const initialState: UIState = {
  isLocationModalOpen: false,
};

/**
 * Redux slice for managing UI state
 * Handles location modal visibility and other UI-related state
 */
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Opens the location modal
     * @returns {void}
     */
    openLocationModal: (state) => {
      state.isLocationModalOpen = true;
    },
    /**
     * Closes the location modal
     * @returns {void}
     */
    closeLocationModal: (state) => {
      state.isLocationModalOpen = false;
    },
  },
});

export const { openLocationModal, closeLocationModal } = uiSlice.actions;
export default uiSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  activeItem: string;
}

const initialState: NavigationState = {
  activeItem: 'home',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveItem: (state, action: PayloadAction<string>) => {
      state.activeItem = action.payload;
    },
    resetNavigation: (state) => {
      state.activeItem = 'home';
    },
  },
});

export const { setActiveItem, resetNavigation } = navigationSlice.actions;
export default navigationSlice.reducer;

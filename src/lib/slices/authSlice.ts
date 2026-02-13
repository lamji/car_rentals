import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  guestToken: string | null
  guestId: string | null
}

const initialState: AuthState = {
  guestToken: null,
  guestId: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setGuestAuth: (state, action: PayloadAction<{ token: string; guestId: string }>) => {
      state.guestToken = action.payload.token
      state.guestId = action.payload.guestId
    },
    clearGuestAuth: (state) => {
      state.guestToken = null
      state.guestId = null
    },
  },
})

export const { setGuestAuth, clearGuestAuth } = authSlice.actions
export default authSlice.reducer

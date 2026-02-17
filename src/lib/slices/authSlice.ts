import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AuthRole = 'admin' | 'owner' | 'user' | 'cashier' | 'guest' | null

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Exclude<AuthRole, null>
  mustResetPassword?: boolean
  notificationId?: string | null
}

interface AuthState {
  guestToken: string | null
  guestId: string | null
  authToken: string | null
  user: AuthUser | null
  role: AuthRole
  isAuthenticated: boolean
}

const initialState: AuthState = {
  guestToken: null,
  guestId: null,
  authToken: null,
  user: null,
  role: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setGuestAuth: (state, action: PayloadAction<{ token: string; guestId: string }>) => {
      state.guestToken = action.payload.token
      state.guestId = action.payload.guestId
    },
    setAuthSession: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      state.authToken = action.payload.token
      state.user = action.payload.user
      state.role = action.payload.user.role
      state.isAuthenticated = true
    },
    clearAuthSession: (state) => {
      state.authToken = null
      state.user = null
      state.role = null
      state.isAuthenticated = false
    },
    clearGuestAuth: (state) => {
      state.guestToken = null
      state.guestId = null
    },
  },
})

export const { setGuestAuth, setAuthSession, clearAuthSession, clearGuestAuth } = authSlice.actions
export default authSlice.reducer

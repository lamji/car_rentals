import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GlobalLoaderState {
  isLoading: boolean
  message?: string
}

const initialState: GlobalLoaderState = {
  isLoading: false,
  message: undefined
}

const globalLoaderSlice = createSlice({
  name: 'globalLoader',
  initialState,
  reducers: {
    showLoader: (state, action: PayloadAction<string | undefined>) => {
      state.isLoading = true
      state.message = action.payload
    },
    hideLoader: (state) => {
      state.isLoading = false
      state.message = undefined
    }
  }
})

export const { showLoader, hideLoader } = globalLoaderSlice.actions
export default globalLoaderSlice.reducer

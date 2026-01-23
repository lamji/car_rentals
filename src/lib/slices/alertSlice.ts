import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  duration?: number // Auto-dismiss duration in ms (0 = no auto-dismiss)
  action?: {
    label: string
    onClick: () => void
  }
}

interface AlertState {
  alerts: Alert[]
}

const initialState: AlertState = {
  alerts: []
}

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    showAlert: (state, action: PayloadAction<Omit<Alert, 'id'>>) => {
      const alert: Alert = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...action.payload
      }
      state.alerts.push(alert)
      
      // Auto-dismiss if duration is set
      if (alert.duration && alert.duration > 0) {
        setTimeout(() => {
          // This will be handled by the component
        }, alert.duration)
      }
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload)
    },
    clearAllAlerts: (state) => {
      state.alerts = []
    }
  }
})

export const { showAlert, removeAlert, clearAllAlerts } = alertSlice.actions
export default alertSlice.reducer

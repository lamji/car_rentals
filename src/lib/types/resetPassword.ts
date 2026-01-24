export type SendResetPasswordArgs = {
  email: string
  timeoutMs?: number
  progressIntervalMs?: number
  isMock?: boolean // Add mock control variable
  statusCode?: number // Add HTTP status code for testing different responses
}

export type SendResetPasswordResponse = {
  success: boolean
  message: string
  otpCode?: string
  email: string
  timestamp: string
  expiresAt: string
  statusCode?: number // Add status code to response
}

export type VerifyResetPasswordOtpArgs = {
  email: string
  otp: string
  expectedOtp?: string
  timeoutMs?: number
  progressIntervalMs?: number
  isMock?: boolean
  statusCode?: number
}

export type VerifyResetPasswordOtpResponse = {
  success: boolean
  message: string
  email: string
  timestamp: string
  statusCode?: number
}

export type ResetPasswordArgs = {
  email: string
  otp: string
  newPassword: string
  timeoutMs?: number
  progressIntervalMs?: number
  isMock?: boolean
  statusCode?: number
}

export type ResetPasswordResponse = {
  success: boolean
  message: string
  email: string
  timestamp: string
  statusCode?: number
}

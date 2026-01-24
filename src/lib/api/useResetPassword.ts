import React from 'react'
import { useAppDispatch } from '@/lib/store'
import { hideLoader } from '@/lib/slices/globalLoaderSlice'
import { useMockPasswordReset } from '@/hooks/mock/useMockPasswordReset'
import { useMockApi } from '@/hooks/mock/useMockApi'
import {
  SendResetPasswordArgs,
  SendResetPasswordResponse,
  VerifyResetPasswordOtpArgs,
  VerifyResetPasswordOtpResponse,
  ResetPasswordArgs,
  ResetPasswordResponse,
} from '@/lib/types/resetPassword'

export function useResetPassword() {
  const dispatch = useAppDispatch()
  const {
    createMockResponse,
    createMockVerifyOtpResponse,
    createMockResetPasswordResponse,
    isValidEmail,
  } = useMockPasswordReset()
  const { simulateApiCall } = useMockApi()

  const sendResetPasswordOTP = React.useCallback(async (args: SendResetPasswordArgs): Promise<SendResetPasswordResponse> => {
    const { email, timeoutMs = 2000, progressIntervalMs = 400, isMock = true, statusCode = 200 } = args

    if (isMock) {
      // ============= MOCK/SIMULATION MODE =============
      
      // Handle invalid email case (400)
      if (statusCode === 400 || !isValidEmail(email)) {
        return createMockResponse(400, email)
      }

      // Simulate API call with progress
      const response = await simulateApiCall<SendResetPasswordResponse>(
        {
          timeoutMs,
          progressIntervalMs,
          loaderMessage: 'Sending password reset code...'
        },
        () => createMockResponse(statusCode, email)
      )

      return response

    } else {
      // ============= PRODUCTION MODE =============      
      try {
        // TODO: Replace with actual API call
        // Example:
        // const response = await fetch('/api/auth/reset-password', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ email }),
        // });
        // const data = await response.json();
        
        // Hide global loader
        dispatch(hideLoader())
        
        // Placeholder response for production mode
        const response: SendResetPasswordResponse = {
          success: true,
          message: `Password reset code sent to ${email}`,
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          statusCode: 200
        }

        return response
      } catch (error) {
        console.error('[Password Reset - Production] API Error:', error)
        
        // Hide global loader
        dispatch(hideLoader())
        
        const response: SendResetPasswordResponse = {
          success: false,
          message: 'Failed to send password reset code. Please try again.',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          statusCode: 500
        }
        return response
      }
    }
  }, [createMockResponse, isValidEmail, simulateApiCall])

  const verifyResetPasswordOTP = React.useCallback(async (args: VerifyResetPasswordOtpArgs): Promise<VerifyResetPasswordOtpResponse> => {
    const {
      email,
      otp,
      expectedOtp,
      timeoutMs = 1200,
      progressIntervalMs = 300,
      isMock = true,
      statusCode = 200,
    } = args

    if (isMock) {
      if (statusCode === 400 || !otp || otp.replace(/\D/g, '').length !== 6) {
        return createMockVerifyOtpResponse(400, email)
      }

      if (expectedOtp && otp !== expectedOtp) {
        return createMockVerifyOtpResponse(401, email)
      }

      const response = await simulateApiCall<VerifyResetPasswordOtpResponse>(
        {
          timeoutMs,
          progressIntervalMs,
          loaderMessage: 'Verifying code...'
        },
        () => createMockVerifyOtpResponse(statusCode, email)
      )

      return response
    }

    try {
      dispatch(hideLoader())

      const response: VerifyResetPasswordOtpResponse = {
        success: true,
        message: 'OTP verified successfully',
        email,
        timestamp: new Date().toISOString(),
        statusCode: 200,
      }

      return response
    } catch (error) {
      console.error('[Verify Reset OTP - Production] API Error:', error)
      dispatch(hideLoader())

      const response: VerifyResetPasswordOtpResponse = {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
        email,
        timestamp: new Date().toISOString(),
        statusCode: 500,
      }

      return response
    }
  }, [createMockVerifyOtpResponse, dispatch, simulateApiCall])

  const resetPassword = React.useCallback(async (args: ResetPasswordArgs): Promise<ResetPasswordResponse> => {
    const {
      email,
      otp,
      newPassword,
      timeoutMs = 1500,
      progressIntervalMs = 300,
      isMock = true,
      statusCode = 200,
    } = args

    if (isMock) {
      if (!newPassword || newPassword.length < 6) {
        return createMockResetPasswordResponse(400, email)
      }

      if (!otp || otp.replace(/\D/g, '').length !== 6) {
        return createMockResetPasswordResponse(401, email)
      }

      const response = await simulateApiCall<ResetPasswordResponse>(
        {
          timeoutMs,
          progressIntervalMs,
          loaderMessage: 'Resetting password...'
        },
        () => createMockResetPasswordResponse(statusCode, email)
      )

      return response
    }

    try {
      dispatch(hideLoader())

      const response: ResetPasswordResponse = {
        success: true,
        message: 'Password reset successfully',
        email,
        timestamp: new Date().toISOString(),
        statusCode: 200,
      }

      return response
    } catch (error) {
      console.error('[Reset Password - Production] API Error:', error)
      dispatch(hideLoader())

      const response: ResetPasswordResponse = {
        success: false,
        message: 'Failed to reset password. Please try again.',
        email,
        timestamp: new Date().toISOString(),
        statusCode: 500,
      }

      return response
    }
  }, [createMockResetPasswordResponse, dispatch, simulateApiCall])

  return { sendResetPasswordOTP, verifyResetPasswordOTP, resetPassword }
}
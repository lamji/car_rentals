import type {
  SendResetPasswordResponse,
  VerifyResetPasswordOtpResponse,
  ResetPasswordResponse,
} from '@/lib/api/useResetPassword';

export function useMockPasswordReset() {
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const createMockResponse = (statusCode: number, email: string): SendResetPasswordResponse => {
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    switch (statusCode) {
      case 400:
        return {
          success: false,
          message: 'Invalid email address format',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 400
        };

      case 401:
        return {
          success: false,
          message: 'Email address not found in our system',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 401
        };

      case 403:
        return {
          success: false,
          message: 'Account is temporarily locked. Please try again later.',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 403
        };

      case 404:
        return {
          success: false,
          message: 'Email address not found in our system',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 404
        };

      case 429:
        return {
          success: false,
          message: 'Too many reset requests. Please try again in 15 minutes.',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 429
        };

      case 500:
        return {
          success: false,
          message: 'Internal server error: Unable to send reset code at this time',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 500
        };

      case 502:
        return {
          success: false,
          message: 'Service temporarily unavailable. Please try again later.',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 502
        };

      case 503:
        return {
          success: false,
          message: 'Password reset service is temporarily unavailable. Please try again later.',
          email: email,
          timestamp: new Date().toISOString(),
          expiresAt: expiresAt,
          statusCode: 503
        };

      default:
        // Success case (2xx) or fallback
        if (statusCode >= 200 && statusCode < 300) {
          return {
            success: true,
            message: `Password reset code sent to ${email}`,
            otpCode: otpCode,
            email: email,
            timestamp: new Date().toISOString(),
            expiresAt: expiresAt,
            statusCode: statusCode
          };
        } else {
          return {
            success: false,
            message: `Unexpected error (Status: ${statusCode})`,
            email: email,
            timestamp: new Date().toISOString(),
            expiresAt: expiresAt,
            statusCode: statusCode
          };
        }
    }
  };

  const createMockVerifyOtpResponse = (statusCode: number, email: string): VerifyResetPasswordOtpResponse => {
    switch (statusCode) {
      case 400:
        return {
          success: false,
          message: 'Invalid OTP code',
          email,
          timestamp: new Date().toISOString(),
          statusCode: 400,
        };
      case 401:
        return {
          success: false,
          message: 'Incorrect OTP code',
          email,
          timestamp: new Date().toISOString(),
          statusCode: 401,
        };
      case 429:
        return {
          success: false,
          message: 'Too many attempts. Please try again later.',
          email,
          timestamp: new Date().toISOString(),
          statusCode: 429,
        };
      case 500:
      case 502:
      case 503:
        return {
          success: false,
          message: 'Service temporarily unavailable. Please try again later.',
          email,
          timestamp: new Date().toISOString(),
          statusCode,
        };
      default:
        if (statusCode >= 200 && statusCode < 300) {
          return {
            success: true,
            message: 'OTP verified successfully',
            email,
            timestamp: new Date().toISOString(),
            statusCode,
          };
        }

        return {
          success: false,
          message: `Unexpected error (Status: ${statusCode})`,
          email,
          timestamp: new Date().toISOString(),
          statusCode,
        };
    }
  };

  const createMockResetPasswordResponse = (statusCode: number, email: string): ResetPasswordResponse => {
    switch (statusCode) {
      case 400:
        return {
          success: false,
          message: 'Password must be at least 6 characters',
          email,
          timestamp: new Date().toISOString(),
          statusCode: 400,
        };
      case 401:
        return {
          success: false,
          message: 'Invalid or expired OTP code',
          email,
          timestamp: new Date().toISOString(),
          statusCode: 401,
        };
      case 429:
        return {
          success: false,
          message: 'Too many attempts. Please try again later.',
          email,
          timestamp: new Date().toISOString(),
          statusCode: 429,
        };
      case 500:
      case 502:
      case 503:
        return {
          success: false,
          message: 'Service temporarily unavailable. Please try again later.',
          email,
          timestamp: new Date().toISOString(),
          statusCode,
        };
      default:
        if (statusCode >= 200 && statusCode < 300) {
          return {
            success: true,
            message: 'Password reset successfully',
            email,
            timestamp: new Date().toISOString(),
            statusCode,
          };
        }

        return {
          success: false,
          message: `Unexpected error (Status: ${statusCode})`,
          email,
          timestamp: new Date().toISOString(),
          statusCode,
        };
    }
  };

  return {
    createMockResponse,
    createMockVerifyOtpResponse,
    createMockResetPasswordResponse,
    isValidEmail,
    generateOTP,
  };
}

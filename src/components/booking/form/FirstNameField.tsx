import { AlertCircle } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PersonalInfoData } from '@/hooks/usePersonalInfoForm'

interface FirstNameFieldProps {
  /** Register function from react-hook-form */
  register: UseFormRegister<PersonalInfoData>
  /** Form errors object */
  errors: FieldErrors<PersonalInfoData>
  /** Test ID for the field container */
  testId?: string
  /** Test ID for the input element */
  inputTestId?: string
  /** Test ID for the error message */
  errorTestId?: string
}

/**
 * Reusable first name input field with validation
 * Handles first name input with proper validation and error display
 */
export function FirstNameField({
  register,
  errors,
  testId = "first-name-field",
  inputTestId = "first-name-input",
  errorTestId = "first-name-error"
}: FirstNameFieldProps) {
  return (
    <div className="space-y-2" data-testid={testId}>
      <Label htmlFor="firstName" className="font-medium">
        First Name <span className="text-red-500">*</span>
      </Label>
      <Input
        id="firstName"
        data-testid={inputTestId}
        {...register('firstName', {
          required: 'First name is required',
          minLength: {
            value: 2,
            message: 'First name must be at least 2 characters'
          },
          pattern: {
            value: /^[a-zA-Z\s]+$/,
            message: 'First name can only contain letters'
          }
        })}
        placeholder="Enter your first name"
        className={`border-primary ${errors.firstName ? 'border-red-300' : ''}`}
      />
      {errors.firstName && (
        <p className="text-xs text-red-500 flex items-center gap-1" data-testid={errorTestId}>
          <AlertCircle className="h-3 w-3" />
          {errors.firstName.message}
        </p>
      )}
    </div>
  )
}

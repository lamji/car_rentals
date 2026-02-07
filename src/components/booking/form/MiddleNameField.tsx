import { AlertCircle } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PersonalInfoData } from '@/hooks/usePersonalInfoForm'

interface MiddleNameFieldProps {
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
 * Reusable middle name input field with validation
 * Handles middle name input with proper validation and error display
 */
export function MiddleNameField({
  register,
  errors,
  testId = "middle-name-field",
  inputTestId = "middle-name-input",
  errorTestId = "middle-name-error"
}: MiddleNameFieldProps) {
  return (
    <div className="space-y-2" data-testid={testId}>
      <Label htmlFor="middleName" className="font-medium">
        Middle Name <span className="text-red-500">*</span>
      </Label>
      <Input
        id="middleName"
        data-testid={inputTestId}
        {...register('middleName', {
          required: 'Middle name is required',
          pattern: {
            value: /^[a-zA-Z\s]+$/,
            message: 'Middle name can only contain letters'
          }
        })}
        placeholder="Enter your middle name"
        className={`border-primary ${errors.middleName ? 'border-red-300' : ''}`}
      />
      {errors.middleName && (
        <p className="text-xs text-red-500 flex items-center gap-1" data-testid={errorTestId}>
          <AlertCircle className="h-3 w-3" />
          {errors.middleName.message}
        </p>
      )}
    </div>
  )
}

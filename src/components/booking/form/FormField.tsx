import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PersonalInfoData } from '@/hooks/usePersonalInfoForm'
import { AlertCircle } from 'lucide-react'
import { FieldErrors, FieldPath, UseFormRegister } from 'react-hook-form'

interface FormFieldProps<T extends FieldPath<PersonalInfoData>> {
  /** Field name (key from PersonalInfoData) */
  name: T
  /** Field label */
  label: string
  /** Register function from react-hook-form */
  register: UseFormRegister<PersonalInfoData>
  /** Form errors object */
  errors: FieldErrors<PersonalInfoData>
  /** Placeholder text */
  placeholder?: string
  /** Whether the field is required */
  required?: boolean
  /** Input type */
  type?: string
  /** Additional validation rules */
  validation?: {
    minLength?: { value: number; message: string }
    maxLength?: { value: number; message: string }
    pattern?: { value: RegExp; message: string }
    min?: { value: number; message: string }
    max?: { value: number; message: string }
    [key: string]: unknown
  }
  /** Test ID for the field container */
  testId?: string
  /** Test ID for the input element */
  inputTestId?: string
  /** Test ID for the error message */
  errorTestId?: string
  /** Additional CSS classes for the field container */
  className?: string
}

/**
 * Generic reusable form field component
 * Handles any input field with proper validation and error display
 */
export function FormField<T extends FieldPath<PersonalInfoData>>({
  name,
  label,
  register,
  errors,
  placeholder,
  required = false,
  type = "text",
  validation = {},
  testId,
  inputTestId,
  errorTestId,
  className
}: FormFieldProps<T>) {
  // Generate default test IDs if not provided
  const fieldTestId = testId || `${name}-field`
  const fieldInputTestId = inputTestId || `${name}-input`
  const fieldErrorTestId = errorTestId || `${name}-error`

  return (
    <div className={`space-y-2 ${className || ''}`} data-testid={fieldTestId}>
      <Label htmlFor={name} className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        data-testid={fieldInputTestId}
        {...register(name, {
          required: required ? `${label} is required` : false,
          ...validation
        })}
        placeholder={placeholder}
        className={`border-primary ${errors[name] ? 'border-red-300' : ''}`}
      />
      {errors[name] && (
        <p className="text-xs text-red-500 flex items-center gap-1" data-testid={fieldErrorTestId}>
          <AlertCircle className="h-3 w-3" />
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  )
}

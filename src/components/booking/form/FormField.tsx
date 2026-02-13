import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PersonalInfoData } from '@/hooks/usePersonalInfoForm'
import { AlertCircle } from 'lucide-react'
import { FieldErrors, FieldPath, RegisterOptions, UseFormRegister } from 'react-hook-form'

interface FormFieldProps<T extends FieldPath<PersonalInfoData>> {
  /** Field name (key from PersonalInfoData) */
  name: T
  /** Field label */
  label: string
  /** React Hook Form register function */
  register: UseFormRegister<PersonalInfoData>
  /** Form errors object */
  errors: FieldErrors<PersonalInfoData>
  /** Placeholder text */
  placeholder?: string
  /** Whether the field is required */
  required?: boolean
  /** Input type */
  type?: 'text' | 'email' | 'tel' | 'number'
  /** Additional validation rules */
  validation?: RegisterOptions<PersonalInfoData, T>
  /** Test ID for the field container */
  testId?: string
  /** Test ID for the input element */
  inputTestId?: string
  /** Test ID for the error message */
  errorTestId?: string
  /** Additional CSS classes for the field container */
  className?: string
  /** onBlur handler for Redux persistence */
  onBlur?: (fieldName: T, value: string) => void
  /** Maximum character length for the input */
  maxLength?: number
  /** Input mode hint for mobile keyboards */
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
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
  className,
  onBlur,
  maxLength,
  inputMode
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
          ...validation,
          onBlur: (e) => {
            // Call the custom onBlur handler if provided
            if (onBlur) {
              onBlur(name, e.target.value)
            }
            // Call the original onBlur from register
            validation?.onBlur?.(e)
          }
        })}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
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

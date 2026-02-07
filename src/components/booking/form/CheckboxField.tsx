import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { PersonalInfoData } from '@/hooks/usePersonalInfoForm'
import { AlertCircle } from 'lucide-react'
import { FieldErrors } from 'react-hook-form'

interface CheckboxFieldProps {
  /** Field name (key from PersonalInfoData) */
  name: keyof PersonalInfoData
  /** Checkbox label */
  label: string
  /** Help text below the label */
  helpText?: string
  /** Current checked state */
  checked: boolean
  /** Change handler */
  onCheckedChange: (checked: boolean) => void
  /** Form errors object */
  errors: FieldErrors<PersonalInfoData>
  /** Whether the field is required */
  required?: boolean
  /** Test ID for the field container */
  testId?: string
  /** Test ID for the checkbox */
  checkboxTestId?: string
  /** Test ID for the error message */
  errorTestId?: string
  /** Additional CSS classes for the field container */
  className?: string
}

/**
 * Reusable checkbox field component
 * Handles checkbox with label, help text, and error display
 */
export function CheckboxField({
  name,
  label,
  helpText,
  checked,
  onCheckedChange,
  errors,
  required = false,
  testId,
  checkboxTestId,
  errorTestId,
  className
}: CheckboxFieldProps) {
  // Generate default test IDs if not provided
  const fieldTestId = testId || `${name}-field`
  const fieldCheckboxTestId = checkboxTestId || `${name}-checkbox`
  const fieldErrorTestId = errorTestId || `${name}-error`

  return (
    <div className={`space-y-2 ${className || ''}`} data-testid={fieldTestId}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={name}
          checked={checked}
          onCheckedChange={onCheckedChange}
          data-testid={fieldCheckboxTestId}
          className='border-primary text-primary'
        />
        <div className="flex-1">
          <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          {helpText && (
            <p className="text-xs text-gray-500 mt-1" data-testid={`${name}-help-text`}>
              {helpText}
            </p>
          )}
        </div>
      </div>
      {errors[name] && (
        <p className="text-xs text-red-500 flex items-center gap-1" data-testid={fieldErrorTestId}>
          <AlertCircle className="h-3 w-3" />
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  )
}
